<?php

namespace App\Support\Slugs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

trait GeneratesUniqueSlug
{
    protected function resolveUniqueSlug(
        string $modelClass,
        string $value,
        ?int $ignoreId = null,
    ): string {
        $base = Str::slug($value);
        $base = $base !== '' ? $base : 'item';
        $slug = $base;
        $suffix = 1;

        while ($this->slugExists($modelClass, $slug, $ignoreId)) {
            $slug = $base . '-' . $suffix;
            $suffix++;
        }

        return $slug;
    }

    protected function slugExists(string $modelClass, string $slug, ?int $ignoreId = null): bool
    {
        /** @var Model $model */
        $model = new $modelClass();
        $query = $model->newQuery()->where('slug', $slug);

        if ($ignoreId !== null) {
            $query->whereKeyNot($ignoreId);
        }

        return $query->exists();
    }
}

