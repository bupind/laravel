<?php
/**
 * EmailService
 * @author  bupind
 * @created 2026-05-21
 */

namespace App\Services\Communication;

use App\Services\Notifications\NotificationTemplateService;
use App\Services\Queue\BaseQueueService;
use App\Services\Queue\Handlers\SendEmailTask;
use App\Support\Queues\QueueName;

class EmailService
{
    public function __construct(
        protected BaseQueueService $queueService,
        protected NotificationTemplateService $templateService,
    )
    {
    }

    public function queueWelcomeMessage(string $email, string $name): void
    {
        $this->queueTemplate(
            templateKey: 'welcome',
            to         : $email,
            variables  : ['name' => $name],
        );
    }

    public function queueTemplate(
        string $templateKey,
        string $to,
        array  $variables = [],
        array  $meta = [],
    ): void
    {
        $template = $this->templateService->email($templateKey, $variables);

        $this->queueNotification($to, $template['subject'], $template['body'], [
            ...$meta,
            'template' => $templateKey,
        ]);
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
