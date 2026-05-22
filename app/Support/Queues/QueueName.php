<?php
/**
 * QueueName
 * @author  bupind
 * @created 2026-05-17
 */

namespace App\Support\Queues;
final class QueueName
{
    public const DEFAULT     = 'default';
    public const IMPORT      = 'imports';
    public const EXPORT      = 'exports';
    public const EMAIL       = 'emails';
    public const WHATSAPP    = 'whatsapp';
    public const TRANSACTION = 'transactions';
    public const INTEGRATION = 'integrations';
}
