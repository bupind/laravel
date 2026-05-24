<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactMessage extends Model
{
    use UsesUuid;

    public const STATUS_NEW      = 'new';
    public const STATUS_READ     = 'read';
    public const STATUS_REPLIED  = 'replied';
    public const STATUS_ARCHIVED = 'archived';
    protected $fillable = [
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'status',
        'read_at',
        'replied_at',
        'replied_by',
        'reply_subject',
        'reply_message',
        'meta',
    ];
    protected $casts = [
        'read_at'    => 'datetime',
        'replied_at' => 'datetime',
        'meta'       => 'array',
    ];

    public function repliedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'replied_by');
    }

    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereNull('read_at')->where('status', self::STATUS_NEW);
    }

    public function markAsRead(): void
    {
        if($this->read_at === null) {
            $this->forceFill([
                'read_at' => now(),
                'status'  => self::STATUS_READ,
            ])->save();
        }
    }
}
