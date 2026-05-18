<?php

namespace App\Contracts\Queue;

interface QueueTaskHandler
{
    public function handle(array $payload): void;
}

