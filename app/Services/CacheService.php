<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Service untuk cache settings, menus, permissions, dan dashboard
 */
class CacheService
{
    public const CACHE_PREFIX = 'app:';
    public const SETTINGS_CACHE_TTL = 3600; // 1 hour
    public const MENU_CACHE_TTL = 3600;
    public const PERMISSION_CACHE_TTL = 3600;
    public const DASHBOARD_CACHE_TTL = 300; // 5 minutes

    // Cache keys
    public const SETTINGS_KEY = 'settings:all';
    public const MENU_KEY = 'menu:main';
    public const PERMISSIONS_KEY = 'permissions:all';
    public const DASHBOARD_KEY = 'dashboard:';

    /**
     * Get application settings
     */
    public static function getSettings(): array
    {
        return Cache::remember(
            self::cacheKey(self::SETTINGS_KEY),
            self::SETTINGS_CACHE_TTL,
            function () {
                return DB::table('setting_apps')
                    ->pluck('value', 'key')
                    ->all();
            }
        );
    }

    /**
     * Get single setting
     */
    public static function getSetting(string $key, $default = null)
    {
        $settings = self::getSettings();
        return $settings[$key] ?? $default;
    }

    /**
     * Update setting dan clear cache
     */
    public static function updateSetting(string $key, $value): bool
    {
        $result = DB::table('setting_apps')
            ->updateOrInsert(['key' => $key], ['value' => $value]);

        self::clearSettingsCache();
        return true;
    }

    /**
     * Get navigation menu
     */
    public static function getMenu(string $slug = 'main'): array
    {
        return Cache::remember(
            self::cacheKey(self::MENU_KEY . ':' . $slug),
            self::MENU_CACHE_TTL,
            function () use ($slug) {
                return DB::table('menus')
                    ->where('slug', $slug)
                    ->with('items')
                    ->first()?->toArray() ?? [];
            }
        );
    }

    /**
     * Get permissions list
     */
    public static function getPermissions(): array
    {
        return Cache::remember(
            self::cacheKey(self::PERMISSIONS_KEY),
            self::PERMISSION_CACHE_TTL,
            function () {
                return DB::table('permissions')
                    ->get()
                    ->groupBy('resource')
                    ->map(fn($items) => $items->pluck('name'))
                    ->all();
            }
        );
    }

    /**
     * Get all roles
     */
    public static function getRoles(): array
    {
        return Cache::remember(
            self::cacheKey('roles:all'),
            self::PERMISSION_CACHE_TTL,
            function () {
                return DB::table('roles')
                    ->select('id', 'name', 'display_name')
                    ->get()
                    ->all();
            }
        );
    }

    /**
     * Get dashboard data
     */
    public static function getDashboardData(int $userId): array
    {
        return Cache::remember(
            self::cacheKey(self::DASHBOARD_KEY . $userId),
            self::DASHBOARD_CACHE_TTL,
            function () {
                return [
                    'stats' => self::getStats(),
                    'recent_activities' => self::getRecentActivities(),
                    'charts' => self::getChartData(),
                ];
            }
        );
    }

    /**
     * Get dashboard stats
     */
    private static function getStats(): array
    {
        return [
            'total_users' => DB::table('users')->count(),
            'total_roles' => DB::table('roles')->count(),
            'total_permissions' => DB::table('permissions')->count(),
            'active_users' => DB::table('users')
                ->where('updated_at', '>=', now()->subDays(30))
                ->count(),
        ];
    }

    /**
     * Get recent activities
     */
    private static function getRecentActivities(): array
    {
        return DB::table('activities')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->all();
    }

    /**
     * Get chart data
     */
    private static function getChartData(): array
    {
        return [
            'users_by_month' => DB::table('users')
                ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
                ->groupBy('month')
                ->limit(12)
                ->get()
                ->all(),
        ];
    }

    /**
     * Clear settings cache
     */
    public static function clearSettingsCache(): void
    {
        Cache::forget(self::cacheKey(self::SETTINGS_KEY));
    }

    /**
     * Clear menu cache
     */
    public static function clearMenuCache(): void
    {
        Cache::tags(['menu'])->flush();
    }

    /**
     * Clear permissions cache
     */
    public static function clearPermissionsCache(): void
    {
        Cache::tags(['permissions'])->flush();
    }

    /**
     * Clear dashboard cache untuk user
     */
    public static function clearDashboardCache(?int $userId = null): void
    {
        if ($userId) {
            Cache::forget(self::cacheKey(self::DASHBOARD_KEY . $userId));
        } else {
            Cache::tags(['dashboard'])->flush();
        }
    }

    /**
     * Clear all app cache
     */
    public static function clearAllCache(): void
    {
        Cache::tags(['app'])->flush();
        self::clearSettingsCache();
        self::clearMenuCache();
        self::clearPermissionsCache();
        self::clearDashboardCache();
    }

    /**
     * Helper untuk generate cache key
     */
    private static function cacheKey(string $key): string
    {
        return self::CACHE_PREFIX . $key;
    }
}
