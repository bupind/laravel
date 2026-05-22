<?php
/**
 * DatabaseNotification
 * @author  bupind
 * @created 2026-05-22
 */

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DatabaseNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $status,
        private readonly string $title,
        private readonly string $message,
        private readonly array  $meta = [],
    )
    {
    }

    public static function make(string $status, string $title, string $message, array $meta = []): self
    {
        return new self($status, $title, $message, $meta);
    }

    public static function success(string $title, string $message, array $meta = []): self
    {
        return self::make('success', $title, $message, $meta);
    }

    public static function error(string $title, string $message, array $meta = []): self
    {
        return self::make('error', $title, $message, $meta);
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'status'  => $this->status,
            'title'   => $this->title,
            'message' => $this->message,
            'meta'    => $this->meta,
        ];
    }
}
