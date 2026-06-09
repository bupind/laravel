<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class XenditWebhookEvent extends Model
{
    use UsesUuid;

    protected $fillable = [
        'payment_transaction_id',
        'event_id',
        'event',
        'invoice_id',
        'external_id',
        'status',
        'payload_hash',
        'callback_token_valid',
        'headers',
        'payload',
        'received_at',
        'processed_at',
        'processing_error',
    ];

    protected $casts = [
        'callback_token_valid' => 'boolean',
        'headers'              => 'array',
        'payload'              => 'array',
        'received_at'          => 'datetime',
        'processed_at'         => 'datetime',
    ];

    public function paymentTransaction(): BelongsTo
    {
        return $this->belongsTo(PaymentTransaction::class);
    }
}
