<?php
/**
 * Menu
 * @author  bupind
 * @created 2026-05-19
 */

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    use UsesUuid;

    protected $fillable = [
        'title',
        'translation_key',
        'scope',
        'location',
        'icon',
        'route',
        'parent_id',
        'order',
        'permission_name',
    ];

    public function children(): HasMany
    {
        return $this->hasMany(Menu::class, 'parent_id')
            ->with('children')
            ->orderBy('order');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'parent_id');
    }

    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeForUser($query, $user)
    {
        return $query->where(function($q) use ($user) {
            $q->whereNull('permission_name')
                ->orWhereIn('permission_name', $user->getAllPermissions()->pluck('name'));
        });
    }
}
