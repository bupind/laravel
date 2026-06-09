<?php

namespace App\Services\Notifications;

use App\Models\NotificationTemplate;
use App\Support\Notifications\ServiceTemplate;

class NotificationTemplateService
{
    public function email(string $event, array $variables = []): array
    {
        $template = $this->template(NotificationTemplate::CHANNEL_EMAIL, $event);

        return [
            'subject' => ServiceTemplate::render((string)($template['subject'] ?? 'Notification'), $this->variables($variables)),
            'body'    => ServiceTemplate::render((string)($template['body'] ?? ''), $this->variables($variables)),
        ];
    }

    public function body(string $channel, string $event, array $variables = []): string
    {
        $template = $this->template($channel, $event);

        return ServiceTemplate::render((string)($template['body'] ?? ''), $this->variables($variables));
    }

    public function variables(array $payload = [], array $extra = []): array
    {
        return ServiceTemplate::variables($payload, $extra);
    }

    private function template(string $channel, string $event): array
    {
        $template = NotificationTemplate::query()
            ->where('channel', $channel)
            ->where('event', $event)
            ->where('is_active', true)
            ->first();

        if($template instanceof NotificationTemplate) {
            return $template->toArray();
        }

        return NotificationTemplate::defaultFor($channel, $event) ?? [
            'subject' => 'Notification',
            'body'    => '',
        ];
    }
}
