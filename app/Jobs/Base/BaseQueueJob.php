<?php

namespace App\Jobs\Base;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

abstract class BaseQueueJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int   $tries   = 5;
    public int   $timeout = 180;
    public array $backoff = [
        10,
        30,
        60,
        120,
        300
    ];

    public function failed(Throwable $exception): void
    {
        Log::error('Queue job failed.', [
            'job'     => static::class,
            'queue'   => $this->queue,
            'message' => $exception->getMessage(),
        ]);
    }
}

