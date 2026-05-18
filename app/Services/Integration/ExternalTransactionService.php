<?php

namespace App\Services\Integration;

use App\Services\Queue\BaseQueueService;
use App\Services\Queue\Handlers\SendExternalTransactionTask;
use App\Support\Queues\QueueName;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ExternalTransactionService
{
    public function __construct(
        protected BaseQueueService $queueService,
    ) {
    }

    public function queueDispatch(array $payload, ?string $idempotencyKey = null): void
    {
        $this->queueService->dispatchTask(SendExternalTransactionTask::class, [
            'payload' => $payload,
            'idempotency_key' => $idempotencyKey ?? (string) Str::uuid(),
        ], QueueName::TRANSACTION);
    }

    public function sendNow(array $payload, ?string $idempotencyKey = null): Response
    {
        $config = config('services.transaction_bridge');

        return Http::withToken($config['token'] ?? '')
            ->timeout((int) ($config['timeout'] ?? 20))
            ->retry((int) ($config['retry'] ?? 3), (int) ($config['retry_sleep_ms'] ?? 300))
            ->acceptJson()
            ->post($config['endpoint'], [
                'idempotency_key' => $idempotencyKey ?? (string) Str::uuid(),
                'payload' => $payload,
            ]);
    }
}

