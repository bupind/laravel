<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Page extends Model
{
    use UsesUuid;

    public const PLACEMENTS = [
        'none'   => 'None',
        'header' => 'Header',
        'footer' => 'Footer',
        'both'   => 'Header & Footer',
    ];
    protected $fillable = [
        'title',
        'slug',
        'media_id',
        'excerpt',
        'content',
        'template',
        'placement',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'sort_order',
        'is_published',
    ];
    protected $casts = [
        'sort_order'   => 'integer',
        'is_published' => 'boolean',
    ];
    protected $appends = [
        'url',
        'media_url',
    ];

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'media_id');
    }

    public function getMediaUrlAttribute(): ?string
    {
        return $this->media?->getFullUrl();
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    public function scopeInPlacement(Builder $query, string $placement): Builder
    {
        return $query->whereIn('placement', [
            $placement,
            'both'
        ]);
    }

    public function getUrlAttribute(): string
    {
        return '/pages/' . $this->slug;
    }
}
