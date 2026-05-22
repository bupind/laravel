<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Ziggy Route Exposure
    |--------------------------------------------------------------------------
    |
    | Jangan expose seluruh route Laravel ke browser. Route API tidak dikirim
    | ke JavaScript. API tetap diamankan lewat middleware api.client / sanctum.
    |
    */

    'groups' => [
        'frontend' => [
            'home',
            'frontend.*',
            'login',
            'register',
            'password.request',
            'password.email',
            'password.reset',
            'password.store',
            'verification.*',
            'dashboard',
            'logout',
        ],

        'backend' => [
            'home',
            'login',
            'register',
            'dashboard',
            'logout',
            'roles.*',
            'menus.*',
            'api-clients.*',
            'products.*',
            'permissions.*',
            'users.*',
            'setting.*',
            'translations.*',
            'audit-logs.*',
            'backup.*',
            'files.*',
            'media.*',
            'profile.*',
            'password.*',
            'verification.*',
            'appearance',
        ],
    ],

    'except' => [
        'api.*',
        'sanctum.*',
        'ignition.*',
        'debugbar.*',
        'telescope.*',
        'horizon.*',
        'storage.*',
    ],
];
