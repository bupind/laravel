<?php
/**
 * Translation
 * @author  bupind
 * @created 2026-05-19
 */

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Model;

class Translation extends Model
{
    use UsesUuid;

    protected $fillable = [
        'locale',
        'scope',
        'namespace',
        'key',
        'value',
        'is_active',
    ];
    protected $casts    = [
        'is_active' => 'boolean',
    ];

    public static function splitFullKey(string $fullKey): array
    {
        $fullKey = trim($fullKey);
        if(!str_contains($fullKey, '.')) {
            return [
                'common',
                $fullKey,
            ];
        }
        [
            $namespace,
            $key
        ] = explode('.', $fullKey, 2);
        return [
            $namespace,
            $key,
        ];
    }

    public function getFullKeyAttribute(): string
    {
        return "{$this->namespace}.{$this->key}";
    }
}
