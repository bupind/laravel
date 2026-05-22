<?php

namespace App\Http\Middleware;

use App\Models\SettingApp;
use App\Services\Translations\TranslationService;
use Exception;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
            || (! $request->is('backend/*') && ! $request->is('api/*'));
    }

    public function version(Request $request): ?string
    {
        // Disable asset version in local to prevent unnecessary reloads
        if (app()->environment('local')) {
            return null;
        }

        return parent::version($request);
    }

    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user             = $request->user();
        $translationScope = $this->isFrontendRequest($request) ? 'frontend' : 'backend';
        $service          = app(TranslationService::class);

        return array_merge(parent::share($request), [
            'name'  => config('app.name'),
            'quote' => [
                'message' => trim($message),
                'author'  => trim($author),
            ],

            // Only share safe, minimal user fields — never tokens or sensitive data
            'auth' => [
                'user' => $user?->only(['id', 'name', 'email', 'avatar']),
                'permissions' => $user
                    ? $user->getAllPermissions()->pluck('name')->values()->all()
                    : [],
            ],

            'flash' => [
                'success' => session('success'),
                'error'   => session('error'),
            ],

            // Lazy-load setting via cache (avoid DB on every request)
            'setting' => fn () => Cache::remember('setting_app', 300, function () {
                try {
                    return SettingApp::settings();
                } catch (Exception) {
                    return null;
                }
            }),

            'translation_scope'   => $translationScope,
            'translation_locales' => fn () => $service->localeOptions(),
            'translations'        => fn () => $service->getDictionaries($translationScope),
        ]);
    }
}
