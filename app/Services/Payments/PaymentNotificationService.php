<?php

namespace App\Services\Payments;

use App\Models\NotificationTemplate;
use App\Models\PaymentTransaction;
use App\Services\Communication\EmailService;
use App\Services\Communication\WhatsAppService;
use App\Services\Notifications\NotificationTemplateService;
use App\Support\Notifications\ServiceTemplate;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Arr;

class PaymentNotificationService
{
    public function __construct(
        protected EmailService $emailService,
        protected WhatsAppService $whatsAppService,
        protected NotificationTemplateService $templateService,
    )
    {
    }

    public function notifyInvoiceCreated(array $payload, Response $response): void
    {
        $invoice = $response->json();
        if(!is_array($invoice)) {
            return;
        }

        $variables = ServiceTemplate::variables(array_replace_recursive($payload, $invoice));
        $this->notify('payment_created', $payload, $variables);
    }

    public function notifyTransactionStatus(PaymentTransaction $transaction, string $status): void
    {
        $status = strtoupper($status);
        $templateKey = match ($status) {
            'PAID', 'SETTLED', 'SUCCEEDED' => 'payment_paid',
            'EXPIRED'                      => 'payment_expired',
            default                        => null,
        };

        if($templateKey === null) {
            return;
        }

        $payload = array_replace_recursive(
            (array)($transaction->request_payload ?? []),
            (array)($transaction->response_payload ?? []),
            (array)($transaction->webhook_payload ?? []),
            [
                'external_id' => $transaction->external_id,
                'invoice_id'  => $transaction->invoice_id,
                'amount'      => $transaction->amount,
                'currency'    => $transaction->currency,
                'invoice_url' => $transaction->invoice_url,
                'status'      => $status,
            ],
        );

        $this->notify($templateKey, $payload, ServiceTemplate::variables($payload));
    }

    public function invoiceDescription(array $payload): ?string
    {
        if(array_key_exists('description', $payload) && trim((string)$payload['description']) !== '') {
            return null;
        }

        $description = $this->templateService->body(
            NotificationTemplate::CHANNEL_PAYMENT_GATEWAY,
            NotificationTemplate::EVENT_INVOICE_DESCRIPTION,
            $payload,
        );

        return trim($description) === '' ? null : $description;
    }

    private function notify(string $templateKey, array $payload, array $variables): void
    {
        if(array_key_exists('notify_user', $payload) && filter_var($payload['notify_user'], FILTER_VALIDATE_BOOL) === false) {
            return;
        }

        $email = $this->emailRecipient($payload);
        if($email !== null) {
            $this->emailService->queueTemplate($templateKey, $email, $variables, [
                'provider' => 'xendit',
                'source'   => 'payment_gateway',
            ]);
        }

        $phone = $this->whatsappRecipient($payload);
        if($phone !== null) {
            $this->whatsAppService->queueTemplateMessage($templateKey, $phone, $variables, [
                'provider' => 'xendit',
                'source'   => 'payment_gateway',
            ]);
        }
    }

    private function emailRecipient(array $payload): ?string
    {
        $email = trim((string)(
            $payload['notify_email']
            ?? $payload['payer_email']
            ?? $payload['email']
            ?? Arr::get($payload, 'customer.email')
            ?? ''
        ));

        return $email === '' ? null : $email;
    }

    private function whatsappRecipient(array $payload): ?string
    {
        $phone = trim((string)(
            $payload['notify_phone']
            ?? $payload['whatsapp_to']
            ?? $payload['phone']
            ?? Arr::get($payload, 'customer.mobile_number')
            ?? ''
        ));

        return $phone === '' ? null : $phone;
    }
}
