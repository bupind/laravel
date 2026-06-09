<?php

namespace App\Support\Payments;

use Illuminate\Support\Str;
use InvalidArgumentException;

class XenditPaymentGateway
{
    public const DEFAULT_BASE_URL = 'https://api.xendit.co';
    public const DEFAULT_INVOICE_ENDPOINT = '/v2/invoices';

    public static function normalizeConfig(array $config): array
    {
        $config['provider']              = 'xendit';
        $mode                            = strtolower(trim((string)($config['mode'] ?? 'sandbox')));
        $config['mode']                  = in_array($mode, ['sandbox', 'production'], true)
            ? $mode
            : 'sandbox';
        $config['base_url']              = rtrim((string)($config['base_url'] ?? self::DEFAULT_BASE_URL), '/');
        $config['invoice_endpoint']      = '/' . ltrim((string)($config['invoice_endpoint'] ?? self::DEFAULT_INVOICE_ENDPOINT), '/');
        $config['currency']              = strtoupper((string)($config['currency'] ?? 'IDR'));
        $config['invoice_duration']      = max(60, (int)($config['invoice_duration'] ?? 86400));
        $config['should_send_email']     = filter_var($config['should_send_email'] ?? false, FILTER_VALIDATE_BOOL);
        $config['timeout']               = max(1, (int)($config['timeout'] ?? 20));
        $config['retry']                 = max(0, (int)($config['retry'] ?? 3));
        $config['retry_sleep_ms']        = max(0, (int)($config['retry_sleep_ms'] ?? 300));
        $config['success_redirect_url']  = self::nullableString($config['success_redirect_url'] ?? null);
        $config['failure_redirect_url']  = self::nullableString($config['failure_redirect_url'] ?? null);
        $config['secret_key']            = self::nullableString($config['secret_key'] ?? null);
        $config['public_key']            = self::nullableString($config['public_key'] ?? null);
        $config['webhook_token']         = self::nullableString($config['webhook_token'] ?? null);

        return $config;
    }

    public static function invoiceUrl(array $config): string
    {
        $config = self::normalizeConfig($config);
        return $config['base_url'] . $config['invoice_endpoint'];
    }

    public static function invoiceDetailUrl(array $config, string $invoiceId): string
    {
        $config = self::normalizeConfig($config);
        return $config['base_url'] . $config['invoice_endpoint'] . '/' . rawurlencode($invoiceId);
    }

    public static function expireInvoiceUrl(array $config, string $invoiceId): string
    {
        return self::invoiceDetailUrl($config, $invoiceId) . '/expire!';
    }

    public static function buildInvoicePayload(array $payload, array $config, ?string $idempotencyKey = null): array
    {
        $config     = self::normalizeConfig($config);
        $externalId = self::nullableString($payload['external_id'] ?? $payload['reference_id'] ?? $payload['idempotency_key'] ?? $idempotencyKey)
            ?? (string)Str::uuid();
        $amount = $payload['amount'] ?? $payload['total'] ?? null;

        if(!is_numeric($amount) || (float)$amount <= 0) {
            throw new InvalidArgumentException('Xendit invoice amount harus angka lebih dari 0.');
        }

        $invoice = [
            'external_id'       => $externalId,
            'amount'            => self::normalizeAmount($amount, $config['currency']),
            'description'       => self::nullableString($payload['description'] ?? $payload['message'] ?? 'Payment'),
            'currency'          => $config['currency'],
            'invoice_duration'  => $payload['invoice_duration'] ?? $config['invoice_duration'],
            'should_send_email' => array_key_exists('should_send_email', $payload)
                ? filter_var($payload['should_send_email'], FILTER_VALIDATE_BOOL)
                : $config['should_send_email'],
        ];

        foreach([
                    'payer_email',
                    'customer',
                    'customer_notification_preference',
                    'payment_methods',
                    'fees',
                    'items',
                    'metadata',
                    'reminder_time',
                    'locale',
                ] as $key) {
            if(array_key_exists($key, $payload) && $payload[$key] !== null && $payload[$key] !== '') {
                $invoice[$key] = $payload[$key];
            }
        }

        $successUrl = self::nullableString($payload['success_redirect_url'] ?? null) ?? $config['success_redirect_url'];
        $failureUrl = self::nullableString($payload['failure_redirect_url'] ?? null) ?? $config['failure_redirect_url'];
        if($successUrl !== null) {
            $invoice['success_redirect_url'] = $successUrl;
        }
        if($failureUrl !== null) {
            $invoice['failure_redirect_url'] = $failureUrl;
        }

        return array_filter($invoice, static fn($value) => $value !== null);
    }

    private static function normalizeAmount(mixed $amount, string $currency): int|float
    {
        $number = (float)$amount;
        return in_array(strtoupper($currency), ['IDR', 'VND'], true)
            ? (int)round($number)
            : round($number, 2);
    }

    private static function nullableString(mixed $value): ?string
    {
        $value = trim((string)($value ?? ''));
        return $value === '' ? null : $value;
    }
}
