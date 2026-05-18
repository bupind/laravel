<?php

namespace App\Services\Queue\Handlers;

use App\Contracts\Queue\QueueTaskHandler;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendWhatsAppTask implements QueueTaskHandler
{
    public function handle(array $payload): void
    {
        $config = config('services.whatsapp');
        $endpoint = (string) ($config['endpoint'] ?? '');
        $token = (string) ($config['token'] ?? '');

        if ($endpoint === '' || $token === '') {
            Log::warning('WhatsApp service is not configured.');

            return;
        }

        $to = (string) ($payload['to'] ?? '');
        $message = (string) ($payload['message'] ?? '');

        if ($to === '' || $message === '') {
            return;
        }

        Http::withToken($token)
            ->timeout((int) ($config['timeout'] ?? 20))
            ->retry((int) ($config['retry'] ?? 3), (int) ($config['retry_sleep_ms'] ?? 300))
            ->acceptJson()
            ->post($endpoint, [
                'to' => $to,
                'message' => $message,
                'meta' => $payload['meta'] ?? [],
            ])
            ->throw();
    }
}

