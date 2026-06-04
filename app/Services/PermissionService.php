<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

/**
 * Permission helper service
 */
class PermissionService
{
    public const CACHE_TTL = 3600; // 1 hour
    public const PERMISSION_CACHE_KEY = 'permissions:';
    public const ROLE_CACHE_KEY = 'roles:';

    /**
     * Check if user has permission
     */
    public static function hasPermission(string $permission): bool
    {
        if (!Auth::check()) {
            return false;
        }

        $user = Auth::user();
        
        // Super admin bypass
        if (method_exists($user, 'hasRole') && $user->hasRole('super_admin')) {
            return true;
        }

        return Cache::remember(
            self::PERMISSION_CACHE_KEY . $user->id . ':' . $permission,
            self::CACHE_TTL,
            function () use ($user, $permission) {
                return $user->permissions()
                    ->where('name', $permission)
                    ->exists();
            }
        );
    }

    /**
     * Check if user has all permissions
     */
    public static function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!self::hasPermission($permission)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if user has any permission
     */
    public static function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (self::hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get all user permissions
     */
    public static function getUserPermissions(): array
    {
        if (!Auth::check()) {
            return [];
        }

        $user = Auth::user();

        return Cache::remember(
            self::PERMISSION_CACHE_KEY . $user->id . ':all',
            self::CACHE_TTL,
            function () use ($user) {
                return $user->permissions()
                    ->pluck('name')
                    ->all();
            }
        );
    }

    /**
     * Get user permissions untuk frontend
     */
    public static function getUserPermissionsForFrontend(): array
    {
        $permissions = self::getUserPermissions();

        return [
            'view' => in_array('view', $permissions),
            'create' => in_array('create', $permissions),
            'update' => in_array('update', $permissions),
            'delete' => in_array('delete', $permissions),
            'export' => in_array('export', $permissions),
            'import' => in_array('import', $permissions),
        ];
    }

    /**
     * Clear user permission cache
     */
    public static function clearUserCache(int $userId): void
    {
        Cache::tags(['permissions'])->flush();
        Cache::forget(self::PERMISSION_CACHE_KEY . $userId . ':all');
    }

    /**
     * Clear all permission cache
     */
    public static function clearAllCache(): void
    {
        Cache::tags(['permissions'])->flush();
    }

    /**
     * Get resource permissions dengan context
     */
    public static function getResourcePermissions(string $resource): array
    {
        if (!Auth::check()) {
            return [
                'view' => false,
                'create' => false,
                'update' => false,
                'delete' => false,
                'export' => false,
            ];
        }

        $user = Auth::user();
        $permissions = self::getUserPermissions();

        return [
            'view' => in_array("{$resource}.view", $permissions),
            'create' => in_array("{$resource}.create", $permissions),
            'update' => in_array("{$resource}.update", $permissions),
            'delete' => in_array("{$resource}.delete", $permissions),
            'export' => in_array("{$resource}.export", $permissions),
        ];
    }
}
