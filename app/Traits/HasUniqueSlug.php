<?php
/**
 * HasUniqueSlug
 * @author  bahtiar
 * @created 5/20/2026
 */

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * HasUniqueSlug
 *
 * Tambahkan trait ini ke BaseCrudController (atau controller turunan)
 * untuk mengaktifkan fitur auto-slug.
 *
 * Konfigurasi di controller:
 *   protected ?string $slugSourceColumn = 'name';
 *   protected string  $slugColumn       = 'slug'; // opsional, default 'slug'
 */
trait HasUniqueSlug
{
    /**
     * Generate slug unik dari $source.
     * Jika slug sudah ada, tambahkan suffix numerik: -2, -3, dsb.
     *
     * @param class-string<Model> $modelClass
     * @param string              $source    Nilai asli (misal: judul artikel)
     * @param string|null         $excludeId ID record yang sedang di-update (agar tidak konflik sendiri)
     */
    protected function resolveUniqueSlug(string $modelClass, string $source, ?string $excludeId = null): string
    {
        $base   = Str::slug($source);
        $slug   = $base;
        $column = $this->slugColumn ?? 'slug';
        $i      = 2;
        while(true) {
            $query = $modelClass::where($column, $slug);
            if($excludeId !== null) {
                $query->where((new $modelClass())->getKeyName(), '!=', $excludeId);
            }
            if(!$query->exists()) {
                break;
            }
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }
}
