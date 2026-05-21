<?php

namespace App\Http\Middleware;

use App\Models\SettingApp;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    public function rootView(Request $request): string
    {
        if ($request->routeIs('home', 'frontend.*')) {
            return 'frontend/app';
        }

        return 'backend/app';
    }

    public function version(Request $request): ?string
    {
        if (app()->environment('local')) {
            return null;
        }

        return parent::version($request);
    }

    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user?->only(['id', 'name', 'email', 'avatar']),
                // Share all permission names for the logged-in user
                'permissions' => $user
                    ? $user->getAllPermissions()->pluck('name')->values()->all()
                    : [],
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'setting' => fn () => Cache::remember('setting_app', 300, fn () => SettingApp::first()),
        ]);
    }
}
