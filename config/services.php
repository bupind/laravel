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
        'enabled'              => env('PAYMENT_GATEWAY_ENABLED', false),
        'provider'             => 'xendit',
        'mode'                 => env('PAYMENT_GATEWAY_MODE', 'sandbox'),
        'base_url'             => env('XENDIT_BASE_URL', 'https://api.xendit.co'),
        'invoice_endpoint'     => env('XENDIT_INVOICE_ENDPOINT', '/v2/invoices'),
        'secret_key'           => env('XENDIT_SECRET_KEY', env('PAYMENT_GATEWAY_TOKEN')),
        'public_key'           => env('XENDIT_PUBLIC_KEY'),
        'webhook_token'        => env('XENDIT_WEBHOOK_TOKEN'),
        'success_redirect_url' => env('XENDIT_SUCCESS_REDIRECT_URL'),
        'failure_redirect_url' => env('XENDIT_FAILURE_REDIRECT_URL'),
        'currency'             => env('XENDIT_CURRENCY', 'IDR'),
        'invoice_duration'     => env('XENDIT_INVOICE_DURATION', 86400),
        'should_send_email'    => env('XENDIT_SHOULD_SEND_EMAIL', false),
        'timeout'              => env('PAYMENT_GATEWAY_TIMEOUT', 20),
        'retry'                => env('PAYMENT_GATEWAY_RETRY', 3),
        'retry_sleep_ms'       => env('PAYMENT_GATEWAY_RETRY_SLEEP_MS', 300),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel'              => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
];
