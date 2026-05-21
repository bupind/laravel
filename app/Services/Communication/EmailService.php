<?php

namespace App\Services\Communication;

use App\Services\Queue\BaseQueueService;
use App\Services\Queue\Handlers\SendEmailTask;
use App\Support\Queues\QueueName;

class EmailService
{
    public function __construct(
        protected BaseQueueService $queueService,
    )
    {
    }

    public function queueWelcomeMessage(string $email, string $name): void
    {
        $this->queueNotification(
            to     : $email,
            subject: 'Welcome',
            message: sprintf('Hello %s, welcome to our platform.', $name),
        );
    }

    public function queueNotification(
        string $to,
        string $subject,
        string $message,
        array  $meta = [],
    ): void
    {
        $this->queueService->dispatchTask(SendEmailTask::class, [
            'to'      => $to,
            'subject' => $subject,
            'message' => $message,
            'meta'    => $meta,
        ], QueueName::EMAIL);
    }
}

