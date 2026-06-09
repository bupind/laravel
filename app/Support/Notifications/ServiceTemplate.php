<?php

namespace App\Support\Notifications;

class ServiceTemplate
{
    public static function render(?string $template, array $variables = []): string
    {
        $message = (string)($template ?? '');
        foreach($variables as $key => $value) {
            if(is_array($value) || is_object($value)) {
                continue;
            }
            $message = str_replace('{' . $key . '}', (string)($value ?? ''), $message);
        }

        return $message;
    }

    public static function variables(array $payload = [], array $extra = []): array
    {
        $amount   = $payload['amount'] ?? $payload['paid_amount'] ?? $payload['total'] ?? null;
        $currency = strtoupper((string)($payload['currency'] ?? 'IDR'));

        return array_merge([
            'app_name'    => config('app.name', 'Laravel'),
            'name'        => (string)($payload['name'] ?? $payload['customer_name'] ?? $payload['given_names'] ?? 'Pelanggan'),
            'external_id' => (string)($payload['external_id'] ?? $payload['reference_id'] ?? ''),
            'invoice_id'  => (string)($payload['invoice_id'] ?? $payload['id'] ?? ''),
            'amount'      => $amount === null ? '' : self::formatAmount($amount),
            'currency'    => $currency,
            'description' => (string)($payload['description'] ?? ''),
            'invoice_url' => (string)($payload['invoice_url'] ?? ''),
            'status'      => strtoupper((string)($payload['status'] ?? '')),
            'email'       => (string)($payload['payer_email'] ?? $payload['email'] ?? ''),
            'phone'       => (string)($payload['phone'] ?? $payload['mobile_number'] ?? ''),
        ], $extra);
    }

    private static function formatAmount(mixed $amount): string
    {
        if(!is_numeric($amount)) {
            return (string)$amount;
        }

        return number_format((float)$amount, 0, ',', '.');
    }
}
