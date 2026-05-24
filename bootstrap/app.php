<?php

use App\Http\Middleware\AuthenticateApiClient;
use App\Http\Middleware\CheckMenuPermission;
use App\Http\Middleware\CompressHtmlResponse;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\ShareMenus;
use App\Models\Menu;
use App\Models\SettingApp;
use App\Services\Translations\TranslationService;
use App\Support\Api\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web     : __DIR__ . '/../routes/web.php',
        api     : __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health  : '/up',
    )
    ->withCommands()
    ->withMiddleware(function(Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            ShareMenus::class,
            CompressHtmlResponse::class,
        ]);
        $middleware->alias([
            'menu.permission' => CheckMenuPermission::class,
            'api.client'      => AuthenticateApiClient::class,
        ]);
    })
    ->withExceptions(function(Exceptions $exceptions) {
        $isFrontendRequest = fn(Request $request): bool => $request->routeIs('home', 'frontend.*')
            || (!$request->is('backend/*') && !$request->is('api/*'));

        $settingPayload = function(): ?array {
            if(!Schema::hasTable('settingapp')) {
                return null;
            }

            try {
                return Cache::remember('setting_app', 300, fn() => SettingApp::settings());
            } catch(\Throwable) {
                return null;
            }
        };

        $authPayload = function(Request $request): array {
            $user = $request->user();

            return [
                'user'        => $user?->only([
                    'id',
                    'name',
                    'email',
                    'avatar',
                ]),
                'permissions' => $user
                    ? $user->getAllPermissions()->pluck('name')->values()->all()
                    : [],
                'notifications' => [
                    'unread_count' => 0,
                    'items'        => [],
                ],
            ];
        };

        $menusPayload = function(Request $request, string $context): array {
            $user = $request->user();

            if($context === 'backend' && !$user) {
                return [];
            }

            if(!Schema::hasTable('menus')) {
                return [];
            }

            $normalizeRoute = function(?string $route, string $scope): ?string {
                if($route === null || trim($route) === '' || $route === '#') {
                    return $route;
                }

                $route = '/' . ltrim(trim($route), '/');

                if($scope !== 'backend' || str_starts_with($route, '/backend') || str_starts_with($route, '/api')) {
                    return $route;
                }

                return '/backend' . $route;
            };

            $permissionKey = $user
                ? $user->getAllPermissions()->pluck('name')->sort()->implode(',')
                : 'guest';
            $cacheKey = "menus_v5_{$context}_" . md5($permissionKey);

            try {
                return Cache::remember($cacheKey, 180, function() use ($user, $context, $normalizeRoute) {
                    $allMenus = Menu::where('scope', $context)->orderBy('order')->get();
                    $indexed  = $allMenus->keyBy('id');

                    $buildTree = function($parentId = null) use (&$buildTree, $indexed, $user, $context, $normalizeRoute) {
                        return $indexed
                            ->filter(fn($menu) => $menu->parent_id === $parentId)
                            ->map(function($menu) use (&$buildTree, $context, $normalizeRoute, $user) {
                                $route = $normalizeRoute($menu->route, $context);
                                $children = $buildTree($menu->id)->values()->all();
                                $canSeeSelf = !$menu->permission_name || ($user && $user->can($menu->permission_name));

                                if(!$canSeeSelf && $children === []) {
                                    return null;
                                }

                                if(!$canSeeSelf) {
                                    $route = '#';
                                }

                                return [
                                    'id'              => $menu->id,
                                    'title'           => $menu->title,
                                    'translation_key' => $menu->translation_key,
                                    'scope'           => $menu->scope,
                                    'icon'            => $menu->icon,
                                    'route'           => $route,
                                    'parent_id'       => $menu->parent_id,
                                    'order'           => $menu->order,
                                    'permission_name' => $menu->permission_name,
                                    'children'        => $children,
                                ];
                            })
                            ->filter()
                            ->filter(fn($menu) => $menu['route'] || $menu['children'] !== [])
                            ->values();
                    };

                    return $buildTree()->all();
                });
            } catch(\Throwable) {
                return [];
            }
        };

        $inertiaErrorProps = function(Request $request, int $status, string $message) use (
            $authPayload,
            $isFrontendRequest,
            $menusPayload,
            $settingPayload
        ): array {
            $context = $isFrontendRequest($request) ? 'frontend' : 'backend';
            $service = app(TranslationService::class);

            return [
                'message'           => $message,
                'name'              => config('app.name'),
                'auth'              => $authPayload($request),
                'setting'           => $settingPayload(),
                'menus'             => $menusPayload($request, $context),
                'translation_scope' => $context,
                'translation_locales' => $service->localeOptions(),
                'translations'      => $service->getDictionaries($context),
            ];
        };
        $handledStatuses = [
            400,
            401,
            403,
            404,
            500,
        ];
        $messages = [
            400 => 'Bad request.',
            401 => 'Authorization required.',
            403 => 'Forbidden.',
            404 => 'Not found.',
            500 => 'Internal server error.',
        ];
        $names = [
            400 => 'Bad Request',
            401 => 'Authorization Required',
            403 => 'Forbidden',
            404 => 'Not Found',
            500 => 'Internal Server Error',
        ];
        $exceptions->shouldRenderJsonWhen(
            fn(Request $request, \Throwable $e): bool => $request->is('api/*') || $request->expectsJson()
        );
        $exceptions->render(function(AuthenticationException $e, Request $request) use ($inertiaErrorProps, $messages, $names) {
            if($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::make($names[401], $messages[401], 40101, 401);
            }
            if($request->is('backend/*')) {
                return redirect()->guest(route('login'));
            }
            $context   = $request->is('backend/*') ? 'backend' : 'frontend';
            $component = "{$context}/errors/401";
            return Inertia::render($component, $inertiaErrorProps($request, 401, $messages[401]))
                ->toResponse($request)
                ->setStatusCode(401);
        });
        $exceptions->respond(function(Response $response, \Throwable $e, Request $request) use ($inertiaErrorProps, $handledStatuses, $messages, $names) {
            $status = $response->getStatusCode();
            if(!in_array($status, $handledStatuses, true)) {
                return $response;
            }
            $message = $status === 500
                ? $messages[500]
                : ($e->getMessage() !== '' ? $e->getMessage() : $messages[$status]);
            if($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::make(
                    $names[$status],
                    $message,
                    ($status * 100) + 1,
                    $status,
                );
            }
            if($status === 401 && $request->is('backend/*') && !$request->user()) {
                return redirect()->guest(route('login'));
            }
            $context   = $request->is('backend/*') ? 'backend' : 'frontend';
            $component = "{$context}/errors/{$status}";
            return Inertia::render($component, $inertiaErrorProps($request, $status, $message))
                ->toResponse($request)
                ->setStatusCode($status);
        });
    })->create();
