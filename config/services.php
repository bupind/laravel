<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    */
    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key'    => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'whatsapp' => [
        'enabled'         => env('WHATSAPP_ENABLED', true),
        'provider'        => env('WHATSAPP_PROVIDER', 'wwebjs'),
        'endpoint'        => env('WHATSAPP_ENDPOINT'),
        'token'           => env('WHATSAPP_TOKEN'),
        'qr_endpoint'     => env('WHATSAPP_QR_ENDPOINT'),
        'status_endpoint' => env('WHATSAPP_STATUS_ENDPOINT'),
        'test_recipient'  => env('WHATSAPP_TEST_RECIPIENT'),
        'timeout'         => env('WHATSAPP_TIMEOUT', 20),
        'retry'           => env('WHATSAPP_RETRY', 3),
        'retry_sleep_ms'  => env('WHATSAPP_RETRY_SLEEP_MS', 300),
    ],

    'email' => [
        'enabled' => env('EMAIL_ENABLED', true),
    ],

    'payment_gateway' => [
        'enabled'  => env('PAYMENT_GATEWAY_ENABLED', false),
        'provider' => env('PAYMENT_GATEWAY_PROVIDER'),
        'endpoint' => env('PAYMENT_GATEWAY_ENDPOINT'),
        'token'    => env('PAYMENT_GATEWAY_TOKEN'),
        'mode'     => env('PAYMENT_GATEWAY_MODE', 'sandbox'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel'              => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
];
