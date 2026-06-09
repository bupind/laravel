<?php
/**
 * SendWhatsAppTask
 * @author  bupind
 * @created 2026-05-20
 */

namespace App\Services\Queue\Handlers;

use App\Contracts\Queue\QueueTaskHandler;
use App\Models\SettingApp;
use App\Support\WwebjsEndpoint;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendWhatsAppTask implements QueueTaskHandler
{
    public function handle(array $payload): void
    {
        $to      = (string)($payload['to'] ?? '');
        $message = (string)($payload['message'] ?? '');
        if($to === '' || $message === '') {
            return;
        }
        $storedConfig  = SettingApp::query()->where('key', 'whatsapp')->value('value');
        $settingConfig = $storedConfig === null ? [] : SettingApp::normalizeWhatsappConfig($storedConfig);
        $config        = SettingApp::normalizeWhatsappConfig(array_replace_recursive((array)config('services.whatsapp', []), $settingConfig));
        $provider      = (string)($config['provider'] ?? 'wwebjs');
        $endpoint      = $provider === 'wwebjs'
            ? WwebjsEndpoint::resolve($config, 'send')
            : (string)($config['endpoint'] ?? '');
        $token         = (string)($config['token'] ?? '');
        if($endpoint === '') {
            Log::warning('WhatsApp service endpoint is not configured.', [
                'provider' => $provider,
            ]);
            return;
        }
        $request = Http::timeout((int)($config['timeout'] ?? 20))
            ->retry((int)($config['retry'] ?? 3), (int)($config['retry_sleep_ms'] ?? 300))
            ->acceptJson()
            ->asJson();
        if($token !== '') {
            $request = $request->withToken($token);
        }
        $request
            ->post($endpoint, [
                'provider' => $provider,
                'to'       => $to,
                'message'  => $message,
                'meta'     => $payload['meta'] ?? [],
            ])
            ->throw();
    }
}
