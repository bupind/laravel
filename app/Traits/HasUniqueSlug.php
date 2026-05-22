<?php
/**
 * HasUniqueSlug
 * @author  bupind
 * @created 2026-05-22
 */

namespace App\Traits;

use Illuminate\Support\Str;

trait HasUniqueSlug
{
    protected function resolveUniqueSlug(string $modelClass, string $source, ?string $excludeId = null): string
    {
        $base   = Str::slug($source);
        $slug   = $base;
        $column = $this->slugColumn ?? 'slug';
        $i      = 2;
        while(true) {
            $query = $modelClass::where($column, $slug);
            if($excludeId !== null) {
                $query->where((new $modelClass)->getKeyName(), '!=', $excludeId);
            }
            if(!$query->exists()) {
                break;
            }
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }
}
