<?php

namespace App\Services\Communication;

use App\Services\Queue\BaseQueueService;
use App\Services\Queue\Handlers\SendWhatsAppTask;
use App\Support\Queues\QueueName;

class WhatsAppService
{
    public function __construct(
        protected BaseQueueService $queueService,
    ) {
    }

    public function queueWelcomeMessage(string $phoneNumber, string $name): void
    {
        $this->queueMessage(
            to: $phoneNumber,
            message: sprintf('Halo %s, selamat datang.', $name),
        );
    }

    public function queueMessage(string $to, string $message, array $meta = []): void
    {
        $this->queueService->dispatchTask(SendWhatsAppTask::class, [
            'to' => $to,
            'message' => $message,
            'meta' => $meta,
        ], QueueName::WHATSAPP);
    }
}

