<?php
/**
 * ExternalTransactionService
 * @author  bupind
 * @created 2026-05-20
 */

namespace App\Services\Integration;

use App\Services\Payments\XenditClient;
use App\Services\Queue\BaseQueueService;
use App\Services\Queue\Handlers\SendExternalTransactionTask;
use App\Support\Queues\QueueName;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Str;

class ExternalTransactionService
{
    public function __construct(
        protected BaseQueueService $queueService,
        protected XenditClient $xenditClient,
    )
    {
    }

    public function queueDispatch(array $payload, ?string $idempotencyKey = null): void
    {
        $this->queueService->dispatchTask(SendExternalTransactionTask::class, [
            'payload'         => $payload,
            'idempotency_key' => $idempotencyKey ?? (string)Str::uuid(),
        ], QueueName::TRANSACTION);
    }

    public function sendNow(array $payload, ?string $idempotencyKey = null): Response
    {
        return $this->xenditClient->createInvoice($payload, $idempotencyKey ?? (string)Str::uuid());
    }
}
