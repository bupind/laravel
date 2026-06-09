<?php

namespace App\Support;

class WwebjsEndpoint
{
    public static function resolve(array $config, string $type = 'send'): string
    {
        $explicit = match ($type) {
            'qr'     => (string)($config['qr_endpoint'] ?? ''),
            'status' => (string)($config['status_endpoint'] ?? ''),
            default  => '',
        };

        if($explicit !== '') {
            return trim($explicit);
        }

        $endpoint = rtrim(trim((string)($config['endpoint'] ?? '')), '/');
        if($endpoint === '') {
            return '';
        }

        $target = match ($type) {
            'status'  => '/api/status',
            'logout'  => '/api/logout',
            'restart' => '/api/restart',
            'qr'      => '/api/qr',
            default   => '/api/send',
        };

        $derived = preg_replace('~/api/(sendText|send|qr|status|logout|restart)$~', $target, $endpoint, 1, $count);
        if(is_string($derived) && $count > 0) {
            return $derived;
        }

        if(preg_match('~/api$~', $endpoint) === 1) {
            return $endpoint . substr($target, 4);
        }

        return $endpoint . $target;
    }
}
