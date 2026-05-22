<?php
/**
 * SendExternalTransactionTask
 * @author  bupind
 * @created 2026-05-21
 */

namespace App\Services\Queue\Handlers;

use App\Contracts\Queue\QueueTaskHandler;
use Illuminate\Support\Facades\Http;

class SendExternalTransactionTask implements QueueTaskHandler
{
    public function handle(array $payload): void
    {
        $config   = config('services.transaction_bridge');
        $endpoint = (string)($config['endpoint'] ?? '');
        if($endpoint === '') {
            return;
        }
        Http::withToken((string)($config['token'] ?? ''))
            ->timeout((int)($config['timeout'] ?? 20))
            ->retry((int)($config['retry'] ?? 3), (int)($config['retry_sleep_ms'] ?? 300))
            ->acceptJson()
            ->post($endpoint, [
                'idempotency_key' => $payload['idempotency_key'] ?? null,
                'payload'         => $payload['payload'] ?? [],
            ])
            ->throw();
    }
}
