<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentTransaction extends Model
{
    use UsesUuid;

    public const PROVIDER_XENDIT = 'xendit';

    protected $fillable = [
        'provider',
        'mode',
        'external_id',
        'invoice_id',
        'idempotency_key',
        'status',
        'amount',
        'currency',
        'description',
        'payer_email',
        'invoice_url',
        'success_redirect_url',
        'failure_redirect_url',
        'paid_at',
        'expires_at',
        'xendit_created_at',
        'xendit_updated_at',
        'request_payload',
        'response_payload',
        'webhook_payload',
    ];

    protected $casts = [
        'amount'             => 'decimal:2',
        'paid_at'            => 'datetime',
        'expires_at'         => 'datetime',
        'xendit_created_at'  => 'datetime',
        'xendit_updated_at'  => 'datetime',
        'request_payload'    => 'array',
        'response_payload'   => 'array',
        'webhook_payload'    => 'array',
    ];

    public function webhookEvents(): HasMany
    {
        return $this->hasMany(XenditWebhookEvent::class);
    }
}
