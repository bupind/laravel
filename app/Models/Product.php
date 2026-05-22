<?php
/**
 * Product
 * @author  bupind
 * @created 2026-05-20
 */

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use UsesUuid;

    public const STATUS_DRAFT    = 'draft';
    public const STATUS_ACTIVE   = 'active';
    public const STATUS_INACTIVE = 'inactive';
    protected $fillable = [
        'name',
        'sku',
        'media_id',
        'description',
        'price',
        'stock',
        'status',
    ];
    protected $casts    = [
        'price' => 'decimal:2',
        'stock' => 'integer',
    ];
    protected $appends  = [
        'image_url',
    ];

    public static function statuses(): array
    {
        return [
            self::STATUS_DRAFT,
            self::STATUS_ACTIVE,
            self::STATUS_INACTIVE,
        ];
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->media?->getFullUrl();
    }
}
