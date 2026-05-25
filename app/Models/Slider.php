<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Slider extends Model
{
    use UsesUuid;

    public const STATUS_ACTIVE   = 'active';
    public const STATUS_INACTIVE = 'inactive';

    protected $fillable = [
        'title',
        'title_accent',
        'description',
        'media_id',
        'external_image_url',
        'button_label',
        'button_url',
        'sort_order',
        'status',
    ];
    protected $casts    = [
        'sort_order' => 'integer',
    ];
    protected $appends  = [
        'image_url',
    ];

    public static function statuses(): array
    {
        return [
            self::STATUS_ACTIVE,
            self::STATUS_INACTIVE,
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->media?->getFullUrl() ?: $this->external_image_url;
    }
}
