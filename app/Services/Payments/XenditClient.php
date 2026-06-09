<?php

namespace App\Services\Payments;

use App\Models\SettingApp;
use App\Support\Payments\XenditPaymentGateway;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;

class XenditClient
{
    public function __construct(
        protected XenditTransactionStore $transactionStore,
        protected PaymentNotificationService $paymentNotificationService,
    )
    {
    }

    public function createInvoice(array $payload, ?string $idempotencyKey = null): Response
    {
        $config = $this->config();
        $description = $this->paymentNotificationService->invoiceDescription($payload);
        if($description !== null) {
            $payload['description'] = $description;
        }

        $body   = XenditPaymentGateway::buildInvoicePayload($payload, $config, $idempotencyKey);

        $response = $this->http($config)->post(XenditPaymentGateway::invoiceUrl($config), $body);
        $this->transactionStore->recordInvoiceResponse($config, $body, $response, $idempotencyKey);
        if($response->successful()) {
            $this->paymentNotificationService->notifyInvoiceCreated($payload, $response);
        }

        return $response;
    }

    public function getInvoice(string $invoiceId): Response
    {
        $config = $this->config();
        return $this->http($config)->get(XenditPaymentGateway::invoiceDetailUrl($config, $invoiceId));
    }

    public function expireInvoice(string $invoiceId): Response
    {
        $config = $this->config();
        return $this->http($config)->post(XenditPaymentGateway::expireInvoiceUrl($config, $invoiceId));
    }

    public function config(): array
    {
        return $this->resolveConfig(requireEnabled: true, requireSecret: true);
    }

    public function webhookConfig(): array
    {
        return $this->resolveConfig(requireEnabled: false, requireSecret: false);
    }

    private function resolveConfig(bool $requireEnabled, bool $requireSecret): array
    {
        $storedConfig = SettingApp::query()->where('key', 'payment_gateway')->value('value');
        $settingConfig = $storedConfig === null ? [] : SettingApp::normalizePaymentGatewayConfig($storedConfig);
        $config = XenditPaymentGateway::normalizeConfig(array_replace_recursive(
            (array)config('services.payment_gateway', []),
            $settingConfig,
        ));
        if($requireEnabled && !filter_var($config['enabled'] ?? false, FILTER_VALIDATE_BOOL)) {
            throw new InvalidArgumentException('Payment gateway Xendit belum aktif.');
        }
        if($requireSecret && ($config['secret_key'] ?? null) === null) {
            throw new InvalidArgumentException('Xendit secret key belum diisi.');
        }

        return $config;
    }

    private function http(array $config): PendingRequest
    {
        return Http::withBasicAuth((string)$config['secret_key'], '')
            ->timeout((int)$config['timeout'])
            ->retry((int)$config['retry'], (int)$config['retry_sleep_ms'])
            ->acceptJson()
            ->asJson();
    }
}
