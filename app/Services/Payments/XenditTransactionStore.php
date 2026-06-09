<?php

namespace App\Services\Payments;

use App\Models\PaymentTransaction;
use App\Models\XenditWebhookEvent;
use Carbon\CarbonImmutable;
use Illuminate\Http\Client\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class XenditTransactionStore
{
    public function recordInvoiceResponse(
        array $config,
        array $requestPayload,
        Response $response,
        ?string $idempotencyKey = null,
    ): PaymentTransaction {
        $responsePayload = $this->responsePayload($response);
        $externalId      = $this->stringValue($responsePayload['external_id'] ?? $requestPayload['external_id'] ?? null)
            ?? (string)Str::uuid();

        return PaymentTransaction::query()->updateOrCreate(
            [
                'provider'    => PaymentTransaction::PROVIDER_XENDIT,
                'external_id' => $externalId,
            ],
            $this->invoiceAttributes($config, $requestPayload, $responsePayload, $idempotencyKey)
        );
    }

    public function recordWebhook(Request $request, bool $callbackTokenValid, array $config = []): XenditWebhookEvent
    {
        $payload     = $request->json()->all();
        $payload     = is_array($payload) && $payload !== [] ? $payload : $request->all();
        $rawPayload  = $request->getContent();
        $invoiceData = $this->invoiceData($payload);
        $eventId     = $this->stringValue(
            $payload['event_id']
            ?? $payload['webhook_id']
            ?? $payload['callback_id']
            ?? null
        );

        return DB::transaction(function() use ($request, $payload, $rawPayload, $invoiceData, $eventId, $callbackTokenValid, $config) {
            $event = $eventId
                ? XenditWebhookEvent::query()->firstOrNew(['event_id' => $eventId])
                : new XenditWebhookEvent();

            $event->fill([
                'event'                => $this->stringValue($payload['event'] ?? $payload['type'] ?? 'invoice.status'),
                'invoice_id'           => $this->invoiceId($invoiceData),
                'external_id'          => $this->externalId($invoiceData),
                'status'               => $this->status($invoiceData),
                'payload_hash'         => hash('sha256', $rawPayload !== '' ? $rawPayload : json_encode($payload)),
                'callback_token_valid' => $callbackTokenValid,
                'headers'              => $this->safeHeaders($request),
                'payload'              => $payload,
                'received_at'          => $event->received_at ?? now(),
            ]);

            if(!$callbackTokenValid) {
                $event->processing_error = 'Invalid Xendit callback token.';
                $event->save();
                return $event;
            }

            try {
                $transaction = $this->upsertFromWebhook($invoiceData, $payload, $config);
                $event->payment_transaction_id = $transaction?->getKey();
                $event->processed_at           = now();
                $event->processing_error       = null;
            } catch(Throwable $exception) {
                $event->processing_error = $exception->getMessage();
            }

            $event->save();

            return $event;
        });
    }

    private function invoiceAttributes(array $config, array $requestPayload, array $responsePayload, ?string $idempotencyKey): array
    {
        $merged = array_replace_recursive($requestPayload, $responsePayload);
        $status = $this->status($merged) ?? ($responsePayload === [] ? 'REQUEST_FAILED' : 'PENDING');

        return [
            'mode'                 => $this->stringValue($config['mode'] ?? null) ?? 'sandbox',
            'invoice_id'           => $this->invoiceId($merged),
            'idempotency_key'      => $this->stringValue($idempotencyKey),
            'status'               => $status,
            'amount'               => $this->amount($merged),
            'currency'             => $this->stringValue($merged['currency'] ?? null) ?? 'IDR',
            'description'          => $this->stringValue($merged['description'] ?? null),
            'payer_email'          => $this->stringValue($merged['payer_email'] ?? Arr::get($merged, 'customer.email')),
            'invoice_url'          => $this->stringValue($merged['invoice_url'] ?? null),
            'success_redirect_url' => $this->stringValue($merged['success_redirect_url'] ?? null),
            'failure_redirect_url' => $this->stringValue($merged['failure_redirect_url'] ?? null),
            'paid_at'              => $this->paidAt($merged),
            'expires_at'           => $this->date($merged['expiry_date'] ?? $merged['expires_at'] ?? null),
            'xendit_created_at'    => $this->date($merged['created'] ?? $merged['created_at'] ?? null),
            'xendit_updated_at'    => $this->date($merged['updated'] ?? $merged['updated_at'] ?? null),
            'request_payload'      => $requestPayload,
            'response_payload'     => $responsePayload,
        ];
    }

    private function upsertFromWebhook(array $invoiceData, array $payload, array $config): ?PaymentTransaction
    {
        $invoiceId  = $this->invoiceId($invoiceData);
        $externalId = $this->externalId($invoiceData);

        $query = PaymentTransaction::query()->where('provider', PaymentTransaction::PROVIDER_XENDIT);
        $transaction = $invoiceId
            ? (clone $query)->where('invoice_id', $invoiceId)->first()
            : null;
        $transaction ??= $externalId
            ? (clone $query)->where('external_id', $externalId)->first()
            : null;

        if(!$transaction && !$externalId && !$invoiceId) {
            return null;
        }

        $transaction ??= new PaymentTransaction([
            'provider'    => PaymentTransaction::PROVIDER_XENDIT,
            'external_id' => $externalId ?? $invoiceId ?? (string)Str::uuid(),
        ]);

        $attributes = $this->nonNull([
            'invoice_id'           => $invoiceId,
            'status'               => $this->status($invoiceData),
            'amount'               => $this->amount($invoiceData),
            'currency'             => $this->stringValue($invoiceData['currency'] ?? null),
            'description'          => $this->stringValue($invoiceData['description'] ?? null),
            'payer_email'          => $this->stringValue($invoiceData['payer_email'] ?? Arr::get($invoiceData, 'customer.email')),
            'invoice_url'          => $this->stringValue($invoiceData['invoice_url'] ?? null),
            'success_redirect_url' => $this->stringValue($invoiceData['success_redirect_url'] ?? null),
            'failure_redirect_url' => $this->stringValue($invoiceData['failure_redirect_url'] ?? null),
            'paid_at'              => $this->paidAt($invoiceData),
            'expires_at'           => $this->date($invoiceData['expiry_date'] ?? $invoiceData['expires_at'] ?? null),
            'xendit_created_at'    => $this->date($invoiceData['created'] ?? $invoiceData['created_at'] ?? null),
            'xendit_updated_at'    => $this->date($invoiceData['updated'] ?? $invoiceData['updated_at'] ?? null),
            'webhook_payload'      => $payload,
        ]);

        if(!$transaction->exists) {
            $attributes['mode']     = $this->stringValue($config['mode'] ?? null) ?? 'production';
            $attributes['amount']   ??= 0;
            $attributes['currency'] ??= 'IDR';
            $attributes['status']   ??= 'PENDING';
        }

        $transaction->fill($attributes);
        $transaction->save();

        return $transaction;
    }

    private function responsePayload(Response $response): array
    {
        $json = $response->json();
        if(is_array($json)) {
            return $json;
        }

        return [
            'raw'    => $response->body(),
            'status' => $response->status(),
        ];
    }

    private function invoiceData(array $payload): array
    {
        if($this->looksLikeInvoice($payload)) {
            return $payload;
        }

        $data = $payload['data'] ?? [];
        if(is_array($data) && $this->looksLikeInvoice($data)) {
            return $data;
        }

        $nestedData = is_array($data) ? ($data['data'] ?? []) : [];
        if(is_array($nestedData) && $this->looksLikeInvoice($nestedData)) {
            return $nestedData;
        }

        foreach($payload as $value) {
            if(is_array($value) && isset($value['value']) && is_array($value['value'])) {
                $candidate = $value['value']['data'] ?? $value['value'];
                if(is_array($candidate) && $this->looksLikeInvoice($candidate)) {
                    return $candidate;
                }
            }
        }

        return $payload;
    }

    private function looksLikeInvoice(array $payload): bool
    {
        return isset($payload['external_id'])
            || isset($payload['invoice_id'])
            || isset($payload['invoice_url'])
            || (isset($payload['id']) && isset($payload['status']));
    }

    private function invoiceId(array $payload): ?string
    {
        return $this->stringValue($payload['id'] ?? $payload['invoice_id'] ?? null);
    }

    private function externalId(array $payload): ?string
    {
        return $this->stringValue($payload['external_id'] ?? $payload['reference_id'] ?? null);
    }

    private function status(array $payload): ?string
    {
        $status = $this->stringValue($payload['status'] ?? $payload['invoice_status'] ?? null);
        return $status === null ? null : strtoupper($status);
    }

    private function amount(array $payload): float
    {
        $value = $payload['amount']
            ?? $payload['paid_amount']
            ?? $payload['adjusted_received_amount']
            ?? $payload['total_amount']
            ?? 0;

        return is_numeric($value) ? (float)$value : 0.0;
    }

    private function paidAt(array $payload): ?CarbonImmutable
    {
        $paidAt = $payload['paid_at'] ?? $payload['paid_timestamp'] ?? null;
        if($paidAt !== null) {
            return $this->date($paidAt);
        }

        return in_array($this->status($payload), ['PAID', 'SETTLED', 'SUCCEEDED'], true)
            ? now()->toImmutable()
            : null;
    }

    private function date(mixed $value): ?CarbonImmutable
    {
        if($value === null || $value === '') {
            return null;
        }

        try {
            return CarbonImmutable::parse($value);
        } catch(Throwable) {
            return null;
        }
    }

    private function stringValue(mixed $value): ?string
    {
        $value = trim((string)($value ?? ''));
        return $value === '' ? null : $value;
    }

    private function nonNull(array $attributes): array
    {
        return array_filter($attributes, fn(mixed $value) => $value !== null);
    }

    private function safeHeaders(Request $request): array
    {
        return collect($request->headers->all())
            ->except(['authorization', 'cookie', 'x-callback-token'])
            ->map(fn(array $values) => implode(', ', $values))
            ->all();
    }
}
