<?php
/**
 * GeneratesUniqueSlug
 * @author  bupind
 * @created 2026-05-18
 */

namespace App\Support\Slugs;

use Illuminate\Support\Str;

trait GeneratesUniqueSlug
{
    protected function resolveUniqueSlug(
        string          $modelClass,
        string          $value,
        string|int|null $ignoreId = null,
    ): string
    {
        $base   = Str::slug($value);
        $base   = $base !== '' ? $base : 'item';
        $slug   = $base;
        $suffix = 1;
        while($this->slugExists($modelClass, $slug, $ignoreId)) {
            $slug = $base . '-' . $suffix;
            $suffix++;
        }
        return $slug;
    }

    protected function slugExists(string $modelClass, string $slug, string|int|null $ignoreId = null): bool
    {
        $model = new $modelClass;
        $query = $model->newQuery()->where('slug', $slug);
        if($ignoreId !== null) {
            $query->whereKeyNot($ignoreId);
        }
        return $query->exists();
    }
}
