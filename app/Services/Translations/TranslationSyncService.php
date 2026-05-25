<?php
/**
 * TranslationSyncService
 * @author  bupind
 * @created 2026-05-19
 */

namespace App\Services\Translations;

use App\Models\Menu;
use App\Models\Translation;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class TranslationSyncService
{
    private const DEFAULT_SCOPES    = [
        'global',
        'common',
        'backend',
        'frontend',
        'api',
        'mobile',
        'auth',
        'validation',
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
        'menus',
        'pagination',
        'placeholders',
        'theme',
    ];

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
                    'value'     => $this->defaultValue($item['full_key'], $locale),
                    'status'    => Translation::STATUS_ACTIVE,
                ]);
            }
        }
        $consolidated = $this->consolidateDuplicateScopes($sourceKeys, $dryRun);
        $repaired     = $this->repairKnownDefaultTranslations($dryRun);
        $existing = Translation::query()->get([
            'id',
            'locale',
            'scope',
            'namespace',
            'key',
            'value'
        ]);
        $unused   = $existing->filter(
            fn(Translation $translation) => !$fullKeys->contains("{$translation->namespace}.{$translation->key}")
        );
        $deleted  = $deleteUnused ? $unused->count() : 0;
        if($deleteUnused && !$dryRun && $unused->isNotEmpty()) {
            Translation::query()->whereIn('id', $unused->pluck('id')->all())->delete();
        }
        app(TranslationService::class)->flush();
        return [
            'scanned'      => $fullKeys->count(),
            'added'        => $added,
            'deleted'      => $deleted + $consolidated['deleted'],
            'consolidated' => $consolidated['moved'],
            'repaired'     => $repaired,
            'kept'         => max(0, $existing->count() - $deleted - $consolidated['deleted']),
            'dry_run'      => $dryRun,
        ];
    }

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
            ->unique(fn(array $item) => $item['full_key'])
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
            $scope = 'global';
        }
        if(in_array($namespace, ['auth'], true)) {
            $scope = 'auth';
        }
        if(in_array($namespace, ['validation'], true)) {
            $scope = 'validation';
        }
        if(in_array($namespace, ['errors'], true)) {
            $scope = 'api';
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
                   && in_array($translation->scope, app(TranslationService::class)->fallbackScopes($scope), true);
        });
    }

    private function defaultValue(string $fullKey, string $locale = 'id'): string
    {
        $defaults = $this->knownDefaultTranslations();
        $locale = str_replace('_', '-', strtolower(trim($locale)));
        if(isset($defaults[$locale][$fullKey])) {
            return $defaults[$locale][$fullKey];
        }
        $lastSegment = Str::of($fullKey)->afterLast('.');
        return $lastSegment
            ->replaceMatches('/([a-z])([A-Z])/', '$1 $2')
            ->replace([
                '_',
                '-',
            ], ' ')
            ->headline()
            ->toString();
    }

    private function knownDefaultTranslations(): array
    {
        return [
            'id' => [
                'pages.products.category'     => 'Katalog Produk',
                'pages.products.title'        => 'Produk',
                'pages.products.search'       => 'Cari nama, SKU...',
                'pages.products.empty'        => 'Product aktif belum tersedia.',
                'pages.products.summary'      => ':total product aktif',
                'pages.products.filterActive' => 'Filter:',
                'pages.products.results'      => 'hasil',
                'pages.products.notFound'     => 'Tidak ada product yang cocok.',
                'buttons.search'              => 'Cari',
                'columns.product'             => 'Produk',
                'columns.price'               => 'Harga',
                'columns.stock'               => 'Stok',
            ],
            'en' => [
                'pages.products.category'     => 'Product Catalog',
                'pages.products.title'        => 'Products',
                'pages.products.search'       => 'Search name, SKU...',
                'pages.products.empty'        => 'No active products available.',
                'pages.products.summary'      => ':total active products',
                'pages.products.filterActive' => 'Filter:',
                'pages.products.results'      => 'results',
                'pages.products.notFound'     => 'No matching products.',
                'buttons.search'              => 'Search',
                'columns.product'             => 'Product',
                'columns.price'               => 'Price',
                'columns.stock'               => 'Stock',
            ],
        ];
    }

    private function consolidateDuplicateScopes(array $sourceKeys, bool $dryRun = false): array
    {
        $canonical = collect($sourceKeys)
            ->keyBy('full_key')
            ->map(fn(array $item) => $item['scope'])
            ->all();
        if($canonical === []) {
            return [
                'moved'   => 0,
                'deleted' => 0
            ];
        }
        $rows = Translation::query()
            ->whereIn('namespace', collect(array_keys($canonical))
                ->map(fn(string $fullKey) => Translation::splitFullKey($fullKey)[0])->unique()->all())
            ->get([
                'id',
                'locale',
                'scope',
                'namespace',
                'key',
                'value',
                'status'
            ]);
        $moved   = 0;
        $deleted = 0;
        foreach($rows->groupBy(fn(Translation $row) => "{$row->locale}|{$row->namespace}.{$row->key}") as $items) {
            $first   = $items->first();
            $fullKey = "{$first->namespace}.{$first->key}";
            if(!isset($canonical[$fullKey])) {
                continue;
            }
            $targetScope = $canonical[$fullKey];
            if($items->count() <= 1 && $first->scope === $targetScope) {
                continue;
            }
            $preferred = $items->firstWhere('scope', $targetScope)
                         ?? $items->firstWhere('scope', 'global')
                            ?? $items->firstWhere('scope', 'common')
                               ?? $items->firstWhere('scope', 'api')
                                  ?? $items->firstWhere('scope', 'backend')
                                     ?? $items->firstWhere('scope', 'frontend')
                                        ?? $first;
            $moved++;
            $deleteIds = $items->pluck('id')->all();
            $deleted   += count($deleteIds);
            if($dryRun) {
                continue;
            }
            Translation::query()->whereIn('id', $deleteIds)->delete();
            Translation::query()->updateOrCreate(
                [
                    'locale'    => $preferred->locale,
                    'scope'     => $targetScope,
                    'namespace' => $preferred->namespace,
                    'key'       => $preferred->key,
                ],
                [
                    'value'     => $preferred->value,
                    'status'    => $preferred->status,
                ],
            );
        }
        return [
            'moved'   => $moved,
            'deleted' => $deleted
        ];
    }

    private function repairKnownDefaultTranslations(bool $dryRun = false): int
    {
        $updated = 0;
        $service = app(TranslationService::class);
        foreach($this->knownDefaultTranslations() as $locale => $translations) {
            foreach($translations as $fullKey => $value) {
                [
                    $namespace,
                    $key
                ] = Translation::splitFullKey($fullKey);
                $scope   = $this->normalizeItem($fullKey, 'global')['scope'];
                $updated += $this->repairOneDefaultTranslation($locale, $scope, $namespace, $key, $value, $dryRun, $service);
            }
        }
        foreach($this->knownScopedDefaultTranslations() as $locale => $scopedTranslations) {
            foreach($scopedTranslations as $scope => $translations) {
                foreach($translations as $fullKey => $value) {
                    [
                        $namespace,
                        $key
                    ] = Translation::splitFullKey($fullKey);
                    $updated += $this->repairOneDefaultTranslation($locale, $scope, $namespace, $key, $value, $dryRun, $service);
                }
            }
        }
        return $updated;
    }

    private function repairOneDefaultTranslation(string $locale, string $scope, string $namespace, string $key, string $value, bool $dryRun, TranslationService $service): int
    {
        // Bersihkan row lama pada fallback scope untuk key yang sama.
        // Ini mencegah row global/common stale seperti "Title" atau "Description" menang dari value spesifik modul.
        $staleRows = Translation::query()
            ->where('locale', $locale)
            ->where('namespace', $namespace)
            ->where('key', $key)
            ->whereIn('scope', $service->fallbackScopes($scope))
            ->get([
                'id',
                'scope',
                'value'
            ]);
        $needsRepair = $staleRows->count() !== 1
                       || $staleRows->first()?->scope !== $scope
                       || $staleRows->first()?->value !== $value;
        if(!$needsRepair) {
            return 0;
        }
        if(!$dryRun) {
            if($staleRows->isNotEmpty()) {
                Translation::query()->whereIn('id', $staleRows->pluck('id')->all())->delete();
            }
            Translation::query()->updateOrCreate(
                [
                    'locale'    => $locale,
                    'scope'     => $scope,
                    'namespace' => $namespace,
                    'key'       => $key,
                ],
                [
                    'value'     => $value,
                    'status'    => Translation::STATUS_ACTIVE,
                ],
            );
        }
        return 1;
    }

    private function knownScopedDefaultTranslations(): array
    {
        return [
            'id' => [
                'backend' => [
                    'pages.permissions.title'           => 'Manajemen Permission',
                    'pages.permissions.description'     => 'Kelola modul permission, grup, dan privilege akses.',
                    'pages.roles.title'                 => 'Manajemen Role',
                    'pages.roles.description'           => 'Kelola role pengguna dan permission yang diberikan.',
                    'pages.users.title'                 => 'Manajemen User',
                    'pages.users.description'           => 'Kelola data user, akses, dan role di dalam sistem.',
                    'pages.auditLogs.title'             => 'Log Aktivitas',
                    'pages.auditLogs.description'       => 'Pantau :total aktivitas dan event audit sistem.',
                    'pages.menus.title'                 => 'Manajemen Menu',
                    'pages.menus.description'           => 'Atur urutan menu backend, frontend, dan submenu aplikasi.',
                    'pages.pages.title'                 => 'Halaman Global',
                    'pages.pages.description'           => 'Kelola halaman konten global seperti Privacy Policy, About Us, dan FAQ.',
                    'pages.products.title'              => 'Produk',
                    'pages.products.description'        => 'Kelola katalog produk, harga, stok, gambar, dan status publikasi.',
                    'pages.services.title'              => 'Layanan',
                    'pages.services.description'        => 'Kelola daftar layanan, ikon, gambar, dan urutan tampil.',
                    'pages.sliders.title'               => 'Slider',
                    'pages.sliders.description'         => 'Kelola banner slider, teks promosi, dan gambar halaman utama.',
                    'pages.api-clients.title'           => 'API Client Credentials',
                    'pages.api-clients.description'     => 'Kelola client API, token akses, scope, dan status integrasi.',
                    'pages.contactMessages.title'       => 'Pesan Contact',
                    'pages.contactMessages.description' => 'Kelola pesan dari form contact frontend dan balas melalui email.',
                    'settings.translations.title'       => 'Translations',
                    'settings.translations.description' => 'Kelola value translate untuk semua locale aktif.',
                    'pages.settingapp.title'            => 'Setting Aplikasi',
                    'pages.settingapp.description'      => 'Konfigurasi identitas aplikasi, warna tema, logo, layanan, dan metadata SEO.',
                ],
            ],
            'en' => [
                'backend' => [
                    'pages.permissions.title'           => 'Permission Management',
                    'pages.permissions.description'     => 'Manage permission modules, groups, and access privileges.',
                    'pages.roles.title'                 => 'Role Management',
                    'pages.roles.description'           => 'Manage user roles and assigned permissions.',
                    'pages.users.title'                 => 'User Management',
                    'pages.users.description'           => 'Manage users, access, and assigned roles.',
                    'pages.auditLogs.title'             => 'Activity Logs',
                    'pages.auditLogs.description'       => 'Review :total system activities and audit events.',
                    'pages.menus.title'                 => 'Menu Management',
                    'pages.menus.description'           => 'Arrange backend, frontend, and submenu navigation.',
                    'pages.pages.title'                 => 'Global Pages',
                    'pages.pages.description'           => 'Manage global content pages such as Privacy Policy, About Us, and FAQs.',
                    'pages.products.title'              => 'Products',
                    'pages.products.description'        => 'Manage product catalog, prices, stock, images, and publication status.',
                    'pages.services.title'              => 'Services',
                    'pages.services.description'        => 'Manage service list, icons, images, and display order.',
                    'pages.sliders.title'               => 'Sliders',
                    'pages.sliders.description'         => 'Manage homepage slider banners, promotional text, and images.',
                    'pages.api-clients.title'           => 'API Client Credentials',
                    'pages.api-clients.description'     => 'Manage API clients, access tokens, scopes, and integration status.',
                    'pages.contactMessages.title'       => 'Contact Messages',
                    'pages.contactMessages.description' => 'Manage frontend contact form messages and reply by email.',
                    'settings.translations.title'       => 'Translations',
                    'settings.translations.description' => 'Update translation values for every active locale.',
                    'pages.settingapp.title'            => 'Application Settings',
                    'pages.settingapp.description'      => 'Configure application identity, theme color, logo, services, and SEO metadata.',
                ],
            ],
        ];
    }
}
