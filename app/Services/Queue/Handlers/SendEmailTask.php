<?php
/**
 * SendEmailTask
 * @author  bupind
 * @created 2026-05-19
 */

namespace App\Services\Queue\Handlers;

use App\Contracts\Queue\QueueTaskHandler;
use App\Models\SettingApp;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;

class SendEmailTask implements QueueTaskHandler
{
    public function handle(array $payload): void
    {
        $to      = (string)($payload['to'] ?? '');
        $subject = (string)($payload['subject'] ?? 'Notification');
        $message = (string)($payload['message'] ?? '');
        if($to === '' || $message === '') {
            return;
        }
        // Terapkan SMTP config dari database
        $this->applyMailConfig();
        Mail::raw($message, function($mail) use ($to, $subject): void {
            $mail->to($to)->subject($subject);
        });
    }

    private function applyMailConfig(): void
    {
        $storedConfig = SettingApp::query()->where('key', 'email')->value('value');
        if($storedConfig === null) {
            return;
        }
        $config = SettingApp::normalizeEmailConfig($storedConfig);
        $host     = (string)($config['host'] ?? '');
        $username = (string)($config['username'] ?? '');
        $password = (string)($config['password'] ?? '');
        if($host === '' || $username === '' || $password === '') {
            return; // Gunakan config .env default
        }
        Config::set('mail.mailer', 'smtp');
        Config::set('mail.mailers.smtp.host', $host);
        Config::set('mail.mailers.smtp.port', (int)($config['port'] ?? 587));
        Config::set('mail.mailers.smtp.encryption', (string)($config['encryption'] ?? 'tls') ?: null);
        Config::set('mail.mailers.smtp.username', $username);
        Config::set('mail.mailers.smtp.password', $password);
        Config::set('mail.from.address', (string)($config['from_address'] ?? $username));
        Config::set('mail.from.name', (string)($config['from_name'] ?? config('app.name')));
        app()->forgetInstance('mailer');
        app()->forgetInstance('swift.mailer');
        app()->forgetInstance('swift.transport');
    }
}
