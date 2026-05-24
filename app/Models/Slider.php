<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Slider extends Model
{
    use UsesUuid;

    protected $fillable = [
        'title',
        'title_accent',
        'description',
        'media_id',
        'external_image_url',
        'button_label',
        'button_url',
        'sort_order',
        'is_active',
    ];
    protected $casts    = [
        'sort_order' => 'integer',
        'is_active'  => 'boolean',
    ];
    protected $appends  = [
        'image_url',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
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
