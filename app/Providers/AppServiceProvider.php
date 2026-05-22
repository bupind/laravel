<?php
/**
 * AppServiceProvider
 * @author  bupind
 * @created 2026-05-21
 */

namespace App\Providers;

use App\Models\Menu;
use App\Models\Permission;
use App\Models\Role;
use App\Models\SettingApp;
use App\Models\User;
use App\Observers\GlobalActivityLogger;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void { }

    public function boot(): void
    {
        $this->configureRateLimiting();
        $this->configureGates();
        $this->configureObservers();
        $this->configureCacheInvalidation();
    }

    private function configureRateLimiting(): void
    {
        RateLimiter::for('api', function(Request $request) {
            $limit     = (int)config('app.api_rate_limit', 60);
            $clientKey = $request->header('X-Client-Key');
            $bucket    = $clientKey ? 'client:' . $clientKey : 'ip:' . $request->ip();
            return Limit::perMinute($limit)->by($bucket);
        });
    }

    private function configureGates(): void
    {
        Gate::before(function(User $user, string $ability): ?bool {
            return $user->hasRole('superuser') ? true : null;
        });
    }

    private function configureObservers(): void
    {
        User::observe(GlobalActivityLogger::class);
        Role::observe(GlobalActivityLogger::class);
        Permission::observe(GlobalActivityLogger::class);
        Menu::observe(GlobalActivityLogger::class);
        SettingApp::observe(GlobalActivityLogger::class);
    }

    private function configureCacheInvalidation(): void
    {
        SettingApp::saved(fn() => Cache::forget('setting_app'));
        SettingApp::deleted(fn() => Cache::forget('setting_app'));
        $clearMenuCache = fn() => Cache::flush();
        Menu::saved($clearMenuCache);
        Menu::deleted($clearMenuCache);
    }
}
