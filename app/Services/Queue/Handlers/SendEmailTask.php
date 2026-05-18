<?php

namespace App\Services\Queue\Handlers;

use App\Contracts\Queue\QueueTaskHandler;
use Illuminate\Support\Facades\Mail;

class SendEmailTask implements QueueTaskHandler
{
    public function handle(array $payload): void
    {
        $to = (string) ($payload['to'] ?? '');
        $subject = (string) ($payload['subject'] ?? 'Notification');
        $message = (string) ($payload['message'] ?? '');

        if ($to === '' || $message === '') {
            return;
        }

        Mail::raw($message, function ($mail) use ($to, $subject): void {
            $mail->to($to)->subject($subject);
        });
    }
}

