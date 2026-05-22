<?php

use App\Http\Middleware\AuthenticateApiClient;
use App\Http\Middleware\CheckMenuPermission;
use App\Http\Middleware\CompressHtmlResponse;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\ShareMenus;
use App\Services\Translations\TranslationService;
use App\Support\Api\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
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
        $inertiaErrorProps = function(Request $request, int $status, string $message): array {
            $context = $request->is('backend/*') ? 'backend' : 'frontend';
            return [
                'message'           => $message,
                'translation_scope' => $context,
                'translations'      => app(TranslationService::class)->getDictionaries($context),
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
            $context   = $request->is('backend/*') ? 'backend' : 'frontend';
            $component = "{$context}/errors/{$status}";
            return Inertia::render($component, $inertiaErrorProps($request, $status, $message))
                ->toResponse($request)
                ->setStatusCode($status);
        });
    })->create();
