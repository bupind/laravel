<?php
/**
 * QueueTaskHandler
 * @author  bupind
 * @created 2026-05-16
 */

namespace App\Contracts\Queue;
interface QueueTaskHandler
{
    public function handle(array $payload): void;
}
