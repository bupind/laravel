<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Blog extends Model
{
    protected $appends = [
        'image_url',
        'tag_ids',
    ];

    protected $fillable = [
        'user_id',
        'category_id',
        'image_media_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'status',
        'is_featured',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'blog_tag')->withTimestamps();
    }

    public function imageMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'image_media_id');
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->imageMedia?->getFullUrl();
    }

    public function getTagIdsAttribute(): array
    {
        if ($this->relationLoaded('tags')) {
            return $this->tags->pluck('id')->all();
        }

        return $this->tags()->pluck('tags.id')->all();
    }
}
