<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use UsesUuid;

    protected $fillable = [
        'title',
        'description',
        'icon',
        'link_url',
        'sort_order',
        'is_active',
    ];
    protected $casts    = [
        'sort_order' => 'integer',
        'is_active'  => 'boolean',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
