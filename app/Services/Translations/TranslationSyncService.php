<?php

namespace App\Services\Translations;

use App\Models\Menu;
use App\Models\Translation;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class TranslationSyncService
{
    private const DEFAULT_SCOPES    = [
        'common',
        'backend',
        'frontend',
        'api',
        'mobile',
    ];
    private const KNOWN_NAMESPACES  = [
        'auth',
        'buttons',
        'columns',
        'datatable',
        'dialog',
        'errors',
        'filePicker',
        'form',
        'hints',
        'labels',
        'language',
        'menus',
        'navigation',
        'notifications',
        'pages',
        'pagination',
        'placeholders',
        'settings',
        'theme',
    ];
    private const COMMON_NAMESPACES = [
        'buttons',
        'columns',
        'datatable',
        'dialog',
        'filePicker',
        'form',
        'hints',
        'labels',
        'language',
        'navigation',
        'notifications',
        'pagination',
        'placeholders',
        'theme',
    ];

    /**
     * @return array{scanned:int, added:int, deleted:int, kept:int, dry_run:bool}
     */
    public function sync(bool $deleteUnused = true, bool $dryRun = false): array
    {
        $sourceKeys = $this->scanSourceKeys();
        $existing   = Translation::query()
            ->get([
                'id',
                'locale',
                'scope',
                'namespace',
                'key',
                'value',
            ]);
        $fullKeys   = collect($sourceKeys)
            ->map(fn(array $item) => $item['full_key'])
            ->unique()
            ->values();
        $added      = 0;
        foreach($sourceKeys as $item) {
            foreach(app(TranslationService::class)->locales() as $locale) {
                if($this->hasAvailableTranslation($existing, $item['full_key'], $item['scope'], $locale)) {
                    continue;
                }
                $added++;
                if($dryRun) {
                    continue;
                }
                Translation::query()->create([
                    'locale'    => $locale,
                    'scope'     => $item['scope'],
                    'namespace' => $item['namespace'],
                    'key'       => $item['key'],
                    'value'     => $this->defaultValue($item['key']),
                    'is_active' => true,
                ]);
            }
        }
        $unused  = $existing->filter(
            fn(Translation $translation) => !$fullKeys->contains("{$translation->namespace}.{$translation->key}")
        );
        $deleted = $deleteUnused ? $unused->count() : 0;
        if($deleteUnused && !$dryRun && $unused->isNotEmpty()) {
            Translation::query()->whereIn('id', $unused->pluck('id')->all())->delete();
        }
        app(TranslationService::class)->flush();
        return [
            'scanned' => $fullKeys->count(),
            'added'   => $added,
            'deleted' => $deleted,
            'kept'    => max(0, $existing->count() - $deleted),
            'dry_run' => $dryRun,
        ];
    }

    /**
     * @return array<int, array{full_key:string, scope:string, namespace:string, key:string}>
     */
    public function scanSourceKeys(): array
    {
        $items = [];
        foreach($this->sourceFiles() as $file) {
            $path  = $file->getPathname();
            $scope = $this->scopeFromPath($path);
            foreach($this->extractKeys((string)File::get($path)) as $fullKey) {
                $items[] = $this->normalizeItem($fullKey, $scope);
            }
        }
        foreach($this->menuTranslationKeys() as $menuTranslation) {
            $items[] = $this->normalizeItem($menuTranslation['full_key'], $menuTranslation['scope']);
        }
        return collect($items)
            ->unique(fn(array $item) => "{$item['scope']}|{$item['full_key']}")
            ->values()
            ->all();
    }

    private function sourceFiles(): array
    {
        $paths = [
            resource_path('js'),
            app_path(),
            base_path('routes'),
            database_path('seeders'),
        ];
        return collect($paths)
            ->filter(fn(string $path) => File::exists($path))
            ->flatMap(fn(string $path) => File::allFiles($path))
            ->filter(function($file): bool {
                $path = str_replace('\\', '/', $file->getPathname());
                if(!preg_match('/\.(php|ts|tsx)$/', $path)) {
                    return false;
                }
                return !str_ends_with($path, 'database/seeders/TranslationSeeder.php');
            })
            ->values()
            ->all();
    }

    private function scopeFromPath(string $path): string
    {
        $path = str_replace('\\', '/', $path);
        if(str_contains($path, '/resources/js/pages/frontend/')) {
            return 'frontend';
        }
        if(str_contains($path, '/app/Http/Controllers/Api/') || str_ends_with($path, '/routes/api.php')) {
            return 'api';
        }
        return 'backend';
    }

    private function extractKeys(string $contents): array
    {
        $contents = $this->stripComments($contents);
        preg_match_all('/[\'"`]([A-Za-z][A-Za-z0-9_-]*(?:\.[A-Za-z0-9_-]+)+)[\'"`]/', $contents, $matches);
        return collect($matches[1] ?? [])
            ->filter(fn(string $key) => $this->isTranslationKey($key))
            ->unique()
            ->values()
            ->all();
    }

    private function stripComments(string $contents): string
    {
        $contents = preg_replace('#/\*.*?\*/#s', '', $contents) ?? $contents;
        $contents = preg_replace('#^\s*//.*$#m', '', $contents) ?? $contents;
        return preg_replace('#^\s*\*.*$#m', '', $contents) ?? $contents;
    }

    private function isTranslationKey(string $fullKey): bool
    {
        [$namespace] = Translation::splitFullKey($fullKey);
        return in_array($namespace, $this->allowedNamespaces(), true);
    }

    private function allowedNamespaces(): array
    {
        static $namespaces = null;
        if($namespaces !== null) {
            return $namespaces;
        }
        $existing   = Schema::hasTable('translations')
            ? Translation::query()->distinct()->pluck('namespace')->all()
            : [];
        $namespaces = array_values(array_unique(array_merge(self::KNOWN_NAMESPACES, $existing)));
        return $namespaces;
    }

    private function normalizeItem(string $fullKey, string $scope): array
    {
        [
            $namespace,
            $key
        ] = Translation::splitFullKey($fullKey);
        if(in_array($namespace, self::COMMON_NAMESPACES, true)) {
            $scope = 'common';
        }
        return [
            'full_key'  => "{$namespace}.{$key}",
            'scope'     => in_array($scope, self::DEFAULT_SCOPES, true) ? $scope : 'backend',
            'namespace' => $namespace,
            'key'       => $key,
        ];
    }

    private function menuTranslationKeys(): array
    {
        $keys = [];
        if(Schema::hasTable('menus') && class_exists(Menu::class)) {
            $keys = Menu::query()
                ->whereNotNull('translation_key')
                ->get([
                    'translation_key',
                    'scope',
                ])
                ->map(fn(Menu $menu) => [
                    'full_key' => $menu->translation_key,
                    'scope'    => in_array($menu->scope, self::DEFAULT_SCOPES, true) ? $menu->scope : 'backend',
                ])
                ->filter(fn(array $item) => $item['full_key'])
                ->values()
                ->all();
        }
        return array_values(array_filter($keys, fn(array $item) => $this->isTranslationKey($item['full_key'])));
    }

    private function hasAvailableTranslation($existing, string $fullKey, string $scope, string $locale): bool
    {
        return $existing->contains(function(Translation $translation) use ($fullKey, $scope, $locale): bool {
            $translationFullKey = "{$translation->namespace}.{$translation->key}";
            return $translation->locale === $locale
                   && $translationFullKey === $fullKey
                   && in_array($translation->scope, [
                    'common',
                    $scope,
                ], true);
        });
    }

    private function defaultValue(string $key): string
    {
        $lastSegment = Str::of($key)->afterLast('.');
        return $lastSegment
            ->replaceMatches('/([a-z])([A-Z])/', '$1 $2')
            ->replace([
                '_',
                '-',
            ], ' ')
            ->headline()
            ->toString();
    }
}
