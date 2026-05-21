<?php

namespace App\Jobs;

use App\Contracts\Queue\QueueTaskHandler;
use App\Jobs\Base\BaseQueueJob;
use InvalidArgumentException;

class RunQueueTaskJob extends BaseQueueJob
{
    public function __construct(
        public string $handlerClass,
        public array  $payload = [],
        ?string       $queueName = null,
    )
    {
        if($queueName) {
            $this->onQueue($queueName);
        }
    }

    public function handle(): void
    {
        $handler = app($this->handlerClass);
        if(!($handler instanceof QueueTaskHandler)) {
            throw new InvalidArgumentException(sprintf(
                'Queue handler [%s] must implement [%s].',
                $this->handlerClass,
                QueueTaskHandler::class,
            ));
        }
        $handler->handle($this->payload);
    }
}

