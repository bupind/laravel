<?php

namespace App\Support\Permissions;
class PermissionCatalog
{
    private const MODULES = [
        'Access'        => [
            'access'    => ['view'],
            'dashboard' => ['view'],
        ],
        'Users'         => [
            'users' => [
                'view',
                'create',
                'update',
                'delete',
                'reset',
            ],
        ],
        'Roles'         => [
            'roles' => [
                'view',
                'create',
                'update',
                'delete',
            ],
        ],
        'Permissions'   => [
            'permission' => [
                'view',
                'create',
                'update',
                'delete',
            ],
        ],
        'Media'         => [
            'media' => [
                'view',
                'create',
                'update',
                'delete',
            ],
        ],
        'Settings'      => [
            'settings'     => [
                'view',
                'update',
            ],
            'translations' => [
                'view',
                'update',
            ],
        ],
        'Menus'         => [
            'menus' => [
                'view',
                'create',
                'update',
                'delete',
            ],
        ],
        'Activity Logs' => [
            'activity-logs' => [
                'view',
                'delete',
            ],
        ],
    ];

    public static function all(): array
    {
        $permissions = [];
        foreach(self::MODULES as $group => $modules) {
            foreach($modules as $module => $actions) {
                foreach($actions as $action) {
                    $permissions[] = "{$module}-{$action}";
                }
            }
        }
        return array_unique($permissions);
    }

    public static function grouped(): array
    {
        $result = [];
        foreach(self::MODULES as $group => $modules) {
            $result[$group] = [];
            foreach($modules as $module => $actions) {
                foreach($actions as $action) {
                    $result[$group][] = "{$module}-{$action}";
                }
            }
        }
        return $result;
    }

    public static function byModule(): array
    {
        $result = [];
        foreach(self::MODULES as $group => $modules) {
            foreach($modules as $module => $actions) {
                $result[$module] = [
                    'group'       => $group,
                    'permissions' => array_map(fn($a) => "{$module}-{$a}", $actions),
                    'actions'     => $actions,
                ];
            }
        }
        return $result;
    }

    public static function groups(): array
    {
        return array_keys(self::MODULES);
    }

    public static function isValid(string $permission): bool
    {
        return in_array($permission, self::all(), true);
    }

    public static function allActions(): array
    {
        $actions = [];
        foreach(self::MODULES as $modules) {
            foreach($modules as $module_actions) {
                $actions = array_merge($actions, $module_actions);
            }
        }
        return array_values(array_unique($actions));
    }
}
