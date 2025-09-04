<?php
return [
//    'title'                     => 'Admin',
//    'name'                      => 'Super Admin',
//    'logo'                      => '<b>Super</b> Admin',
//    'logo-mini'                 => '<b>OA</b>',
    'bootstrap'                 => base_path('bootstrap/backend.php'),
    'route'                     => [
        'prefix'     => env('BACKEND_ROUTE_PREFIX', 'backend'),
        'namespace'  => 'App\\Http\\Controllers\\Backend',
        'middleware' => ['web', 'backend'],
    ],
    'directory'                 => app_path('Http/Controllers/Backend'),
    'https'                     => env('ADMIN_HTTPS', true),
    'auth'                      => [
        'controller'        => \App\Http\Controllers\Backend\AuthController::class,
        'guard'             => 'backend',
        'guards'            => [
            'backend' => [
                'driver'   => 'session',
                'provider' => 'backend',
            ],
        ],
        'providers'         => [
            'backend' => [
                'driver' => 'eloquent',
                'model'  => Crud\Backend\Auth\Database\Administrator::class,
            ],
        ],
        'remember'          => true,
        'redirect_to'       => 'auth/login',
        'throttle_logins'   => true,
        'throttle_attempts' => 5,
        'throttle_timeout'  => 900,
        'excepts'           => [
            'auth/login',
            'auth/logout',
        ],
    ],
    'upload'                    => [
        'disk'      => 'backend',
        'directory' => [
            'image' => 'images',
            'file'  => 'files',
        ],
    ],
    'database'                  => [
        'connection'             => '',
        'users_table'            => 'backend_users',
        'users_model'            => Crud\Backend\Auth\Database\Administrator::class,
        'roles_table'            => 'backend_roles',
        'roles_model'            => Crud\Backend\Auth\Database\Role::class,
        'permissions_table'      => 'backend_permissions',
        'permissions_model'      => Crud\Backend\Auth\Database\Permission::class,
        'menu_table'             => 'backend_menu',
        'menu_model'             => Crud\Backend\Auth\Database\Menu::class,
        'operation_log_table'    => 'backend_operation_log',
        'user_permissions_table' => 'backend_user_permissions',
        'role_users_table'       => 'backend_role_users',
        'role_permissions_table' => 'backend_role_permissions',
        'role_menu_table'        => 'backend_role_menu',
        'settings_table'         => 'settings',
    ],
    'operation_log'             => [
        'enable'          => env('APP_ENABLE_LOG', false),
        'allowed_methods' => ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'],
        'except'          => [
            env('BACKEND_ROUTE_PREFIX', 'backend') . '/auth/logs*',
        ],
        'filter_input'    => [
            'token'             => '*****-filtered-out-*****',
            'password'          => '*****-filtered-out-*****',
            'password_remember' => '*****-filtered-out-*****',
        ],
    ],
    'check_route_permission'    => true,
    'check_menu_roles'          => true,
    'default_avatar'            => '/vendor/crud/backend-crud/gfx/user.svg',
    'map_provider'              => 'openstreetmaps',
    'skin'                      => 'your-custom-skin-class',
    'layout'                    => ['sidebar-mini', 'sidebar-collapse'],
    'login_background_image'    => '',
    'show_version'              => false,
    'show_environment'          => false,
    'menu_bind_permission'      => true,
    'enable_default_breadcrumb' => true,
    'minify_assets'             => [
        'excepts' => [
        ],
    ],
    'enable_menu_search'        => false,
    'enable_user_panel'         => false,
    'top_alert'                 => '',
    'grid_action_class'         => \Crud\Backend\Grid\Displayers\Actions\Actions::class
];
