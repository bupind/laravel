<?php
/**
 * WhatsAppService
 * @author  bupind
 * @created 2026-05-20
 */

namespace App\Services\Communication;

use App\Models\NotificationTemplate;
use App\Services\Notifications\NotificationTemplateService;
use App\Services\Queue\BaseQueueService;
use App\Services\Queue\Handlers\SendWhatsAppTask;
use App\Support\Queues\QueueName;

class WhatsAppService
{
    public function __construct(
        protected BaseQueueService $queueService,
        protected NotificationTemplateService $templateService,
    )
    {
    }

    public function queueWelcomeMessage(string $phoneNumber, string $name): void
    {
        $this->queueTemplateMessage(
            templateKey: 'welcome',
            to         : $phoneNumber,
            variables  : ['name' => $name],
        );
    }

    public function queueTemplateMessage(
        string $templateKey,
        string $to,
        array  $variables = [],
        array  $meta = [],
    ): void
    {
        $message = $this->templateService->body(NotificationTemplate::CHANNEL_WHATSAPP, $templateKey, $variables);

        $this->queueMessage($to, $message, [
            ...$meta,
            'template' => $templateKey,
        ]);
    }

    public function queueMessage(string $to, string $message, array $meta = []): void
    {
        $this->queueService->dispatchTask(SendWhatsAppTask::class, [
            'to'      => $to,
            'message' => $message,
            'meta'    => $meta,
        ], QueueName::WHATSAPP);
    }
}
