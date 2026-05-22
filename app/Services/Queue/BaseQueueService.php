<?php
/**
 * BaseQueueService
 * @author  bupind
 * @created 2026-05-21
 */

namespace App\Services\Queue;

use App\Jobs\RunQueueTaskJob;
use App\Support\Queues\QueueName;
use Illuminate\Bus\Batch;
use Illuminate\Bus\PendingBatch;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Str;

class BaseQueueService
{
    public function dispatchTask(
        string $handlerClass,
        array  $payload,
        string $queueName = QueueName::DEFAULT,
    ): void
    {
        RunQueueTaskJob::dispatch($handlerClass, $payload, $queueName);
    }

    public function onBatchFinished(Batch $batch): bool
    {
        return $batch->finished();
    }

    public function dispatchImport(
        string $handlerClass,
        array  $ids,
        int    $chunkSize = 1000,
        array  $context = [],
    ): PendingBatch
    {
        return $this->dispatchChunkedIds(
            handlerClass: $handlerClass,
            ids         : $ids,
            chunkSize   : $chunkSize,
            context     : $context,
            queueName   : QueueName::IMPORT,
            batchName   : 'import-' . Str::uuid(),
        );
    }

    public function dispatchChunkedIds(
        string  $handlerClass,
        array   $ids,
        int     $chunkSize = 1000,
        array   $context = [],
        string  $queueName = QueueName::DEFAULT,
        ?string $batchName = null,
    ): PendingBatch
    {
        $jobs = [];
        foreach(array_chunk($ids, $chunkSize) as $chunk) {
            $jobs[] = new RunQueueTaskJob($handlerClass, [
                'chunk'   => array_values($chunk),
                'context' => $context,
            ], $queueName);
        }
        return Bus::batch($jobs)
            ->name($batchName ?? sprintf('%s-%s', class_basename($handlerClass), Str::uuid()))
            ->allowFailures()
            ->dispatch();
    }

    public function dispatchExport(
        string $handlerClass,
        array  $ids,
        int    $chunkSize = 1000,
        array  $context = [],
    ): PendingBatch
    {
        return $this->dispatchChunkedIds(
            handlerClass: $handlerClass,
            ids         : $ids,
            chunkSize   : $chunkSize,
            context     : $context,
            queueName   : QueueName::EXPORT,
            batchName   : 'export-' . Str::uuid(),
        );
    }
}
