<?php
/**
 * SendExternalTransactionTask
 * @author  bupind
 * @created 2026-05-21
 */

namespace App\Services\Queue\Handlers;

use App\Contracts\Queue\QueueTaskHandler;
use App\Services\Payments\XenditClient;

class SendExternalTransactionTask implements QueueTaskHandler
{
    public function handle(array $payload): void
    {
        app(XenditClient::class)
            ->createInvoice((array)($payload['payload'] ?? []), (string)($payload['idempotency_key'] ?? ''))
            ->throw();
    }
}
