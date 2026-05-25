<?php
/**
 * HandleInertiaRequests
 * @author  bupind
 * @created 2026-05-21
 */

namespace App\Http\Middleware;

use App\Models\Page;
use App\Models\SettingApp;
use App\Models\User;
use App\Services\Translations\TranslationService;
use Exception;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    public function rootView(Request $request): string
    {
        return $this->isFrontendRequest($request) ? 'frontend/app' : 'backend/app';
    }

    private function isFrontendRequest(Request $request): bool
    {
        return $request->routeIs('home', 'frontend.*')
               || (!$request->is('backend/*') && !$request->is('api/*'));
    }

    public function version(Request $request): ?string
    {
        if(app()->environment('local')) {
            return null;
        }
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        [
            $message,
            $author
        ] = str(Inspiring::quotes()->random())->explode('-');
        $user             = $request->user();
        $translationScope = $this->isFrontendRequest($request) ? 'frontend' : 'backend';
        $service          = app(TranslationService::class);
        return array_merge(parent::share($request), [
            'name'                       => config('app.name'),
            'quote'                      => [
                'message' => trim($message),
                'author'  => trim($author),
            ],
            'auth'                       => [
                'user'          => $user?->only([
                    'id',
                    'name',
                    'email',
                    'avatar'
                ]),
                'permissions'   => $user
                    ? $user->getAllPermissions()->pluck('name')->values()->all()
                    : [],
                'notifications' => fn() => $this->notificationsPayload($user),
            ],
            'flash'                      => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
            'setting'                    => fn() => Cache::remember('setting_app', 300, function() {
                try {
                    return SettingApp::settings();
                } catch(Exception) {
                    return null;
                }
            }),
            'translation_scope'          => $translationScope,
            'translation_default_locale' => fn() => $service->defaultLocale(),
            'translation_locales'        => fn() => $service->localeOptions(),
            // Ringan: jangan kirim dictionary besar lewat Inertia.
            // Frontend mengambil key yang dibutuhkan saja via /api/translations/resolve.
            'translations'               => fn() => [],
            'global_pages'               => fn() => $this->globalPagesPayload($request),
        ]);
    }

    private function notificationsPayload(?User $user): array
    {
        if($user === null || !Schema::hasTable('notifications')) {
            return [
                'unread_count' => 0,
                'items'        => [],
            ];
        }
        try {
            return [
                'unread_count' => $user->unreadNotifications()->count(),
                'items'        => $user->notifications()
                    ->latest()
                    ->limit(10)
                    ->get()
                    ->map(fn($notification): array => [
                        'id'         => $notification->id,
                        'type'       => $notification->type,
                        'data'       => $this->notificationData($notification->data),
                        'read_at'    => $notification->read_at?->toISOString(),
                        'created_at' => $notification->created_at?->toISOString(),
                    ])
                    ->values()
                    ->all(),
            ];
        } catch(Exception) {
            return [
                'unread_count' => 0,
                'items'        => [],
            ];
        }
    }

    private function notificationData(mixed $data): array
    {
        if(is_array($data)) {
            return $data;
        }
        if(is_string($data)) {
            $decoded = json_decode($data, true);
            if(is_array($decoded)) {
                return $decoded;
            }
        }
        return [];
    }

    private function globalPagesPayload(Request $request): array
    {
        if(!$this->isFrontendRequest($request) || !Schema::hasTable('pages')) {
            return [
                'header' => [],
                'footer' => [],
            ];
        }
        try {
            return Cache::remember('global_pages_frontend_v1', 300, function() {
                $pages = Page::query()
                    ->published()
                    ->where('slug', '!=', 'contact')
                    ->whereIn('placement', [
                        'header',
                        'footer',
                        'both'
                    ])
                    ->orderBy('sort_order')
                    ->orderBy('title')
                    ->get([
                        'id',
                        'title',
                        'slug',
                        'placement',
                        'sort_order'
                    ]);
                $mapPage = fn(Page $page): array => [
                    'id'                 => $page->id,
                    'title'              => $page->title_text,
                    'title_translations' => $page->title,
                    'slug'               => $page->slug,
                    'url'                => $page->url,
                    'placement'          => $page->placement,
                ];
                return [
                    'header' => $pages
                        ->filter(fn(Page $page) => in_array($page->placement, [
                            'header',
                            'both'
                        ], true))
                        ->map($mapPage)
                        ->values()
                        ->all(),
                    'footer' => $pages
                        ->filter(fn(Page $page) => in_array($page->placement, [
                            'footer',
                            'both'
                        ], true))
                        ->map($mapPage)
                        ->values()
                        ->all(),
                ];
            });
        } catch(Exception) {
            return [
                'header' => [],
                'footer' => [],
            ];
        }
    }
}
