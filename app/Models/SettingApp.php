<?php
/**
 * SettingApp
 * @author  bupind
 * @created 2026-05-19
 */

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class SettingApp extends Model
{
    use UsesUuid;

    public const DEFAULTS      = [
        'nama_app'  => null,
        'deskripsi' => null,
        'logo'      => null,
        'favicon'   => null,
        'warna'     => '#0ea5e9',
        'seo'       => [
            'title'       => null,
            'description' => null,
            'keywords'    => null,
        ],
    ];
    public const RESERVED_KEYS = [
        'nama_app',
        'deskripsi',
        'logo',
        'favicon',
        'warna',
        'seo',
    ];
    public const FIELD_TYPES   = [
        'nama_app'  => 'text',
        'deskripsi' => 'textarea',
        'logo'      => 'file',
        'favicon'   => 'file',
        'warna'     => 'color',
        'seo'       => 'json',
    ];
    protected $table    = 'settingapp';
    protected $fillable = [
        'key',
        'value',
    ];

    public static function settings(): array
    {
        $settings             = static::query()
            ->orderBy('key')
            ->pluck('value', 'key')
            ->map(fn($value) => static::decodeValue($value))
            ->all();
        $defaults             = self::DEFAULTS;
        $defaults['nama_app'] = config('app.name', 'Laravel');
        return array_replace_recursive($defaults, $settings);
    }

    public static function decodeValue(mixed $value): mixed
    {
        if($value === null || $value === '') {
            return $value;
        }
        if(!is_string($value)) {
            return $value;
        }
        $trimmed = trim($value);
        if(!str_starts_with($trimmed, '{') && !str_starts_with($trimmed, '[')) {
            return $value;
        }
        $decoded = json_decode($trimmed, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }

    public static function formRows(): array
    {
        $rows = static::rows()
            ->mapWithKeys(fn(SettingApp $row) => [
                $row->key => (string)($row->value ?? ''),
            ])
            ->all();
        foreach(self::DEFAULTS as $key => $value) {
            $rows[$key] ??= static::encodeValue($key === 'nama_app' ? config('app.name', 'Laravel') : $value) ?? '';
        }
        return collect($rows)
            ->map(fn(string $value, string $key) => [
                'key'       => $key,
                'value'     => $value,
                'type'      => self::FIELD_TYPES[$key] ?? 'text',
                'is_system' => in_array($key, self::RESERVED_KEYS, true),
            ])
            ->sortByDesc('is_system')
            ->sortBy(fn(array $row) => array_search($row['key'], self::RESERVED_KEYS, true) === false
                ? 999
                : array_search($row['key'], self::RESERVED_KEYS, true))
            ->values()
            ->all();
    }

    public static function rows(): Collection
    {
        return static::query()->orderBy('key')->get([
            'id',
            'key',
            'value',
        ]);
    }

    public static function encodeValue(mixed $value): ?string
    {
        if($value === null) {
            return null;
        }
        if(is_array($value) || is_object($value)) {
            return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }
        return (string)$value;
    }

    public static function setMany(array $values): void
    {
        foreach($values as $key => $value) {
            static::setValue((string)$key, $value);
        }
    }

    public static function setValue(string $key, mixed $value): self
    {
        return static::query()->updateOrCreate(
            ['key' => $key],
            ['value' => static::encodeValue($value)],
        );
    }

    public static function deleteKeys(array $keys): void
    {
        if($keys === []) {
            return;
        }
        static::query()->whereIn('key', $keys)->delete();
    }
}
