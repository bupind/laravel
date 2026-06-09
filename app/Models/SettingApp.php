<?php
/**
 * SettingApp
 * @author  bupind
 * @created 2026-05-19
 */

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SettingApp extends Model
{
    use UsesUuid;

    public const WHATSAPP_DEFAULTS = [
        'provider'        => 'wwebjs',
        'endpoint'        => null,
        'token'           => null,
        'qr_endpoint'     => null,
        'status_endpoint' => null,
        'test_recipient'  => null,
        'timeout'         => 20,
        'retry'           => 3,
        'retry_sleep_ms'  => 300,
    ];
    public const EMAIL_DEFAULTS = [
        'driver'         => 'gmail',
        'host'           => 'smtp.gmail.com',
        'port'           => 587,
        'encryption'     => 'tls',
        'username'       => null,
        'password'       => null,
        'from_name'      => null,
        'from_address'   => null,
        'test_recipient' => null,
    ];
    public const PAYMENT_GATEWAY_DEFAULTS = [
        'provider'             => 'xendit',
        'mode'                 => 'sandbox',
        'base_url'             => 'https://api.xendit.co',
        'invoice_endpoint'     => '/v2/invoices',
        'secret_key'           => null,
        'public_key'           => null,
        'webhook_token'        => null,
        'success_redirect_url' => null,
        'failure_redirect_url' => null,
        'currency'             => 'IDR',
        'invoice_duration'     => 86400,
        'should_send_email'    => false,
        'timeout'              => 20,
        'retry'                => 3,
        'retry_sleep_ms'       => 300,
    ];
    public const AVAILABLE_LOCALES = [
        ['code' => 'id', 'label' => 'Bahasa Indonesia'],
        ['code' => 'en', 'label' => 'English'],
        ['code' => 'ar', 'label' => 'Arabic (العربية)'],
        ['code' => 'zh', 'label' => 'Chinese Simplified (简体中文)'],
        ['code' => 'zh-tw', 'label' => 'Chinese Traditional (繁體中文)'],
        ['code' => 'fr', 'label' => 'French (Français)'],
        ['code' => 'de', 'label' => 'German (Deutsch)'],
        ['code' => 'hi', 'label' => 'Hindi (हिन्दी)'],
        ['code' => 'ja', 'label' => 'Japanese (日本語)'],
        ['code' => 'ko', 'label' => 'Korean (한국어)'],
        ['code' => 'ms', 'label' => 'Malay (Bahasa Melayu)'],
        ['code' => 'pt', 'label' => 'Portuguese (Português)'],
        ['code' => 'ru', 'label' => 'Russian (Русский)'],
        ['code' => 'es', 'label' => 'Spanish (Español)'],
        ['code' => 'th', 'label' => 'Thai (ภาษาไทย)'],
        ['code' => 'tr', 'label' => 'Turkish (Türkçe)'],
        ['code' => 'vi', 'label' => 'Vietnamese (Tiếng Việt)'],
    ];

    public const TRANSLATION_DEFAULTS = [
        'default_locale' => 'id',
        'locales'        => [
            [
                'code'  => 'id',
                'label' => 'Bahasa Indonesia',
            ],
            [
                'code'  => 'en',
                'label' => 'English',
            ],
        ],
    ];
    public const DEFAULTS = [
        'app_name'        => null,
        'description'     => null,
        'logo'            => null,
        'favicon'         => null,
        'color'           => '#0ea5e9',
        'seo'             => [
            'title'       => null,
            'description' => null,
            'keywords'    => null,
        ],
        'whatsapp'        => self::WHATSAPP_DEFAULTS,
        'email'           => self::EMAIL_DEFAULTS,
        'payment_gateway' => self::PAYMENT_GATEWAY_DEFAULTS,
        'translations'    => self::TRANSLATION_DEFAULTS,
    ];
    public const RESERVED_KEYS = [
        'app_name',
        'description',
        'logo',
        'favicon',
        'color',
        'seo',
        'whatsapp',
        'email',
        'payment_gateway',
        'translations',
    ];
    public const FIELD_TYPES = [
        'app_name'        => 'text',
        'description'     => 'textarea',
        'logo'            => 'file',
        'favicon'         => 'file',
        'color'           => 'color',
        'seo'             => 'json',
        'whatsapp'        => 'whatsapp',
        'email'           => 'email_service',
        'payment_gateway' => 'payment_gateway',
        'translations'    => 'translations',
    ];
    protected $table    = 'settingapp';
    protected $fillable = [
        'key',
        'value'
    ];

    public static function settings(): array
    {
        $settings                  = static::query()
            ->orderBy('key')
            ->pluck('value', 'key')
            ->map(fn($value) => static::decodeValue($value))
            ->all();
        $defaults                  = self::DEFAULTS;
        $defaults['app_name']      = config('app.name', 'Laravel');
        $merged                    = array_replace_recursive($defaults, $settings);
        $merged['whatsapp']        = static::normalizeWhatsappConfig($merged['whatsapp'] ?? []);
        $merged['email']           = static::normalizeEmailConfig($merged['email'] ?? []);
        $merged['payment_gateway'] = static::normalizePaymentGatewayConfig($merged['payment_gateway'] ?? []);
        $merged['translations']    = static::normalizeTranslationsConfig($merged['translations'] ?? []);
        return $merged;
    }

    public static function decodeValue(mixed $value): mixed
    {
        if($value === null || $value === '') {
            return $value;
        }
        if(!is_string($value)) {
            return $value;
        }
        $trimmed = trim($value);
        if(!str_starts_with($trimmed, '{') && !str_starts_with($trimmed, '[')) {
            return $value;
        }
        $decoded = json_decode($trimmed, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }

    public static function normalizeWhatsappConfig(mixed $value): array
    {
        if(is_string($value)) {
            $value = static::decodeValue($value);
        }
        if(!is_array($value)) {
            $value = [];
        }
        // Legacy providers key migration
        if(isset($value['providers']) && is_array($value['providers'])) {
            $provider       = trim((string)($value['provider'] ?? 'wwebjs'));
            $providerConfig = $value['providers'][$provider] ?? [];
            if(is_array($providerConfig)) {
                $value['endpoint'] ??= $providerConfig['endpoint'] ?? null;
                $value['token']    ??= $providerConfig['token'] ?? null;
            }
            unset($value['providers']);
        }
        $config                    = array_replace_recursive(self::WHATSAPP_DEFAULTS, $value);
        $provider                  = trim((string)($config['provider'] ?? 'wwebjs'));
        $config['provider']        = $provider !== '' ? $provider : 'wwebjs';
        $config['endpoint']        = static::nullableString($config['endpoint'] ?? null);
        $config['token']           = static::nullableString($config['token'] ?? null);
        $config['qr_endpoint']     = static::nullableString($config['qr_endpoint'] ?? null);
        $config['status_endpoint'] = static::nullableString($config['status_endpoint'] ?? null);
        $config['test_recipient']  = static::nullableString($config['test_recipient'] ?? null);
        $config['timeout']         = max(1, (int)($config['timeout'] ?? self::WHATSAPP_DEFAULTS['timeout']));
        $config['retry']           = max(0, (int)($config['retry'] ?? self::WHATSAPP_DEFAULTS['retry']));
        $config['retry_sleep_ms']  = max(0, (int)($config['retry_sleep_ms'] ?? self::WHATSAPP_DEFAULTS['retry_sleep_ms']));
        unset($config['templates']);
        return $config;
    }

    public static function nullableString(mixed $value): ?string
    {
        $value = trim((string)($value ?? ''));
        return $value === '' ? null : $value;
    }

    public static function normalizeEmailConfig(mixed $value): array
    {
        if(is_string($value)) {
            $value = static::decodeValue($value);
        }
        if(!is_array($value)) {
            $value = [];
        }
        $rawEncryption        = array_key_exists('encryption', $value) ? $value['encryption'] : self::EMAIL_DEFAULTS['encryption'];
        $config               = array_replace_recursive(self::EMAIL_DEFAULTS, $value);
        $config['driver']     = static::nullableString($config['driver'] ?? null) ?? 'gmail';
        $config['host']       = static::nullableString($config['host'] ?? null) ?? 'smtp.gmail.com';
        $config['port']       = max(1, (int)($config['port'] ?? 587));
        $config['encryption'] = static::nullableString($rawEncryption);
        if(($config['driver'] ?? 'gmail') === 'gmail' && $config['encryption'] === null) {
            $config['encryption'] = 'tls';
        }
        $config['username']       = static::nullableString($config['username'] ?? null);
        $config['password']       = static::nullableString($config['password'] ?? null);
        $config['from_name']      = static::nullableString($config['from_name'] ?? null);
        $config['from_address']   = static::nullableString($config['from_address'] ?? null);
        $config['test_recipient'] = static::nullableString($config['test_recipient'] ?? null);
        unset($config['templates']);
        return $config;
    }

    public static function normalizePaymentGatewayConfig(mixed $value): array
    {
        if(is_string($value)) {
            $value = static::decodeValue($value);
        }
        if(!is_array($value)) {
            $value = [];
        }

        if(isset($value['token']) && !isset($value['secret_key'])) {
            $value['secret_key'] = $value['token'];
        }
        if(isset($value['endpoint']) && !isset($value['base_url'])) {
            $value['base_url'] = $value['endpoint'];
        }

        $config                          = array_replace_recursive(self::PAYMENT_GATEWAY_DEFAULTS, $value);
        $config['provider']              = 'xendit';
        $mode                            = strtolower(trim((string)($config['mode'] ?? 'sandbox')));
        $config['mode']                  = in_array($mode, ['sandbox', 'production'], true) ? $mode : 'sandbox';
        $config['base_url']              = rtrim(static::nullableString($config['base_url'] ?? null) ?? self::PAYMENT_GATEWAY_DEFAULTS['base_url'], '/');
        $config['invoice_endpoint']      = '/' . ltrim(static::nullableString($config['invoice_endpoint'] ?? null) ?? self::PAYMENT_GATEWAY_DEFAULTS['invoice_endpoint'], '/');
        $config['secret_key']            = static::nullableString($config['secret_key'] ?? null);
        $config['public_key']            = static::nullableString($config['public_key'] ?? null);
        $config['webhook_token']         = static::nullableString($config['webhook_token'] ?? null);
        $config['success_redirect_url']  = static::nullableString($config['success_redirect_url'] ?? null);
        $config['failure_redirect_url']  = static::nullableString($config['failure_redirect_url'] ?? null);
        $config['currency']              = strtoupper(static::nullableString($config['currency'] ?? null) ?? 'IDR');
        $config['invoice_duration']      = max(60, (int)($config['invoice_duration'] ?? self::PAYMENT_GATEWAY_DEFAULTS['invoice_duration']));
        $config['should_send_email']     = filter_var($config['should_send_email'] ?? false, FILTER_VALIDATE_BOOL);
        $config['timeout']               = max(1, (int)($config['timeout'] ?? self::PAYMENT_GATEWAY_DEFAULTS['timeout']));
        $config['retry']                 = max(0, (int)($config['retry'] ?? self::PAYMENT_GATEWAY_DEFAULTS['retry']));
        $config['retry_sleep_ms']        = max(0, (int)($config['retry_sleep_ms'] ?? self::PAYMENT_GATEWAY_DEFAULTS['retry_sleep_ms']));
        unset($config['endpoint'], $config['token'], $config['templates']);

        return $config;
    }

    public static function normalizeTranslationsConfig(mixed $value): array
    {
        if(is_string($value)) {
            $value = static::decodeValue($value);
        }
        if(!is_array($value)) {
            $value = [];
        }
        $config  = array_replace_recursive(self::TRANSLATION_DEFAULTS, $value);
        $locales = [];
        foreach(($config['locales'] ?? []) as $locale) {
            if(is_string($locale)) {
                $code  = str_replace('_', '-', strtolower(trim($locale)));
                $label = strtoupper($code);
            } elseif(is_array($locale)) {
                $code  = str_replace('_', '-', strtolower(trim((string)($locale['code'] ?? ''))));
                $label = trim((string)($locale['label'] ?? strtoupper($code)));
            } else {
                continue;
            }
            if($code === '' || !preg_match('/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/', $code)) {
                continue;
            }
            $locales[$code] = [
                'code'  => $code,
                'label' => $label !== '' ? $label : strtoupper($code),
            ];
        }
        if($locales === []) {
            foreach(self::TRANSLATION_DEFAULTS['locales'] as $locale) {
                $locales[$locale['code']] = $locale;
            }
        }
        $defaultLocale = str_replace('_', '-', strtolower(trim((string)($config['default_locale'] ?? ''))));
        if(!array_key_exists($defaultLocale, $locales)) {
            $defaultLocale = array_key_first($locales);
        }
        return [
            'default_locale' => $defaultLocale,
            'locales'        => array_values($locales),
        ];
    }

    public static function formRows(): array
    {
        $rows = static::rows()
            ->mapWithKeys(fn(SettingApp $row) => [
                $row->key => (string)($row->value ?? ''),
            ])
            ->all();
        foreach(self::DEFAULTS as $key => $value) {
            $rows[$key] ??= static::encodeValue($key === 'app_name' ? config('app.name', 'Laravel') : $value) ?? '';
        }
        return collect($rows)
            ->map(fn(string $value, string $key) => [
                'key'       => $key,
                'value'     => $value,
                'type'      => self::FIELD_TYPES[$key] ?? 'text',
                'is_system' => in_array($key, self::RESERVED_KEYS, true),
            ])
            ->sortByDesc('is_system')
            ->sortBy(fn(array $row) => array_search($row['key'], self::RESERVED_KEYS, true) === false
                ? 999
                : array_search($row['key'], self::RESERVED_KEYS, true))
            ->values()
            ->all();
    }

    public static function rows(): Collection
    {
        return static::query()->orderBy('key')->get([
            'id',
            'key',
            'value'
        ]);
    }

    public static function encodeValue(mixed $value): ?string
    {
        if($value === null) {
            return null;
        }
        if(is_array($value) || is_object($value)) {
            return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }
        return (string)$value;
    }

    public static function setMany(array $values): void
    {
        foreach($values as $key => $value) {
            static::setValue((string)$key, $value);
        }
    }

    public static function setValue(string $key, mixed $value): self
    {
        if($key === 'whatsapp') {
            $value = static::normalizeWhatsappConfig($value);
        } elseif($key === 'email') {
            $value = static::normalizeEmailConfig($value);
        } elseif($key === 'payment_gateway') {
            $value = static::normalizePaymentGatewayConfig($value);
        } elseif($key === 'translations') {
            $value = static::normalizeTranslationsConfig($value);
        }
        $setting = static::query()->updateOrCreate(
            ['key' => $key],
            ['value' => static::encodeValue($value)],
        );
        if($key === 'translations') {
            $version = (int)Cache::get('translations:version', 1);
            Cache::forever('translations:version', $version + 1);
        }
        return $setting;
    }

    public static function deleteKeys(array $keys): void
    {
        if($keys === []) {
            return;
        }
        static::query()->whereIn('key', $keys)->delete();
    }
}
