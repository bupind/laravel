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

    public const STATUS_ACTIVE   = 'active';
    public const STATUS_INACTIVE = 'inactive';

    protected $fillable = [
        'locale',
        'scope',
        'namespace',
        'key',
        'value',
        'status',
    ];

    public static function statuses(): array
    {
        return [
            self::STATUS_ACTIVE,
            self::STATUS_INACTIVE,
        ];
    }

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
