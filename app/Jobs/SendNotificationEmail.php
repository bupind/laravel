<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Queue job contoh untuk mengirim email notification
 */
class SendNotificationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public int $timeout = 60;
    public int $retries = 3;
    public int $backoff = 10; // seconds

    public function __construct(
        private array $data,
        private string $notificationType = 'general'
    ) {
    }

    public function handle(): void
    {
        try {
            // Prepare email
            $email = $this->data['email'] ?? null;
            if (!$email) {
                return;
            }

            // Send email (implement your mailable)
            // Mail::to($email)->send(new NotificationMail($this->data));

            Log::info("Email notification sent", [
                'email' => $email,
                'type' => $this->notificationType,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to send notification email", [
                'error' => $e->getMessage(),
                'data' => $this->data,
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("SendNotificationEmail job failed permanently", [
            'exception' => $exception->getMessage(),
            'data' => $this->data,
        ]);
    }
}
