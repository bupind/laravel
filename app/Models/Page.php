<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Page extends Model
{
    use UsesUuid;

    public const STATUS_ACTIVE   = 'active';
    public const STATUS_INACTIVE = 'inactive';

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
        'placement',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'sort_order',
        'status',
    ];
    protected $casts = [
        'title'            => 'array',
        'excerpt'          => 'array',
        'content'          => 'array',
        'meta_title'       => 'array',
        'meta_description' => 'array',
        'meta_keywords'    => 'array',
        'sort_order'       => 'integer',
    ];
    protected $appends = [
        'url',
        'media_url',
        'title_text',
        'excerpt_text',
    ];

    public static function statuses(): array
    {
        return [
            self::STATUS_ACTIVE,
            self::STATUS_INACTIVE,
        ];
    }

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
        return $query->where('status', self::STATUS_ACTIVE);
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

    public function getTitleTextAttribute(): string
    {
        return $this->localized('title');
    }

    public function getExcerptTextAttribute(): ?string
    {
        $value = $this->localized('excerpt');
        return $value !== '' ? $value : null;
    }

    public function localized(string $attribute, ?string $locale = null): string
    {
        $values = $this->getAttribute($attribute);
        if(!is_array($values)) {
            return trim((string)($values ?? ''));
        }

        $locale ??= app(\App\Services\Translations\TranslationService::class)->defaultLocale();
        $locale = str_replace('_', '-', strtolower(trim($locale)));
        $fallbackLocale = app(\App\Services\Translations\TranslationService::class)->defaultLocale();

        $baseLocale = explode('-', $locale)[0] ?? $locale;
        $value = $values[$locale] ?? $values[$baseLocale] ?? $values[$fallbackLocale] ?? null;
        if($value === null) {
            $value = collect($values)->first(fn($item) => trim((string)$item) !== '');
        }

        return trim((string)($value ?? ''));
    }
}
