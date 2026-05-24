<?php
/**
 * TranslationService
 * @author  bupind
 * @created 2026-05-21
 */

namespace App\Services\Translations;

use App\Models\SettingApp;
use App\Models\Translation;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Throwable;

class TranslationService
{
    public function getDictionaries(string $scope = 'backend', ?array $namespaces = null, ?array $locales = null): array
    {
        $locales      = $locales === null ? [$this->defaultLocale()] : $this->normalizeLocales($locales);
        $dictionaries = [];
        foreach($locales as $locale) {
            $dictionaries[$locale] = $this->getMessages($locale, $scope, $namespaces);
        }
        return $dictionaries;
    }

    public function defaultLocale(): string
    {
        $options = $this->localeOptionsFromSettings();
        if($options !== []) {
            $config = $this->translationConfig();
            return $config['default_locale'] ?? ($options[0]['code'] ?? 'id');
        }
        return $this->locales()[0] ?? 'id';
    }

    private function localeOptionsFromSettings(): array
    {
        try {
            if(!Schema::hasTable('settingapp') || !SettingApp::query()->where('key', 'translations')->exists()) {
                return [];
            }
        } catch(Throwable) {
            return [];
        }
        $config  = $this->translationConfig();
        $options = [];
        foreach(($config['locales'] ?? []) as $locale) {
            $code = str_replace('_', '-', strtolower(trim((string)($locale['code'] ?? ''))));
            if($code === '' || !preg_match('/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/', $code)) {
                continue;
            }
            $options[$code] = [
                'code'  => $code,
                'label' => trim((string)($locale['label'] ?? '')) ?: strtoupper($code),
            ];
        }
        return array_values($options);
    }

    private function translationConfig(): array
    {
        try {
            if(!Schema::hasTable('settingapp')) {
                return SettingApp::TRANSLATION_DEFAULTS;
            }
            $stored = SettingApp::query()->where('key', 'translations')->value('value');
            if($stored === null) {
                return SettingApp::TRANSLATION_DEFAULTS;
            }
            return SettingApp::normalizeTranslationsConfig($stored);
        } catch(Throwable) {
            return SettingApp::TRANSLATION_DEFAULTS;
        }
    }

    public function locales(): array
    {
        $version = (int)Cache::get('translations:version', 1);
        return Cache::rememberForever("translations:v{$version}:configured-locales", function() {
            $options = $this->localeOptionsFromSettings();
            if($options !== []) {
                return array_values(array_unique(array_column($options, 'code')));
            }
            $locales = [];
            if(Schema::hasTable('translations')) {
                $locales = Translation::query()
                    ->where('is_active', true)
                    ->distinct()
                    ->orderBy('locale')
                    ->pluck('locale')
                    ->all();
            }
            return $this->normalizeLocales($locales);
        });
    }

    public function normalizeLocales(array $locales): array
    {
        $locales = array_values(array_filter(array_unique(array_map(
            fn($locale) => str_replace('_', '-', strtolower(trim((string)$locale))),
            $locales,
        )), fn(string $locale) => preg_match('/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/', $locale)));
        if($locales === []) {
            $locales[] = 'id';
        }
        return $locales;
    }

    public function getMessages(string $locale = 'id', string $scope = 'backend', ?array $namespaces = null): array
    {
        $locale       = $this->normalizeLocale($locale);
        $scope        = $this->normalizeScope($scope);
        $namespaces   = $this->normalizeNamespaces($namespaces);
        $namespaceKey = $namespaces === null ? 'all' : implode(',', $namespaces);
        $version      = (int)Cache::get('translations:version', 1);
        $cacheKey     = "translations:v{$version}:messages:{$locale}:{$scope}:{$namespaceKey}";
        return Cache::rememberForever($cacheKey, function() use ($locale, $scope, $namespaces) {
            $scopes = $this->fallbackScopes($scope);
            $query  = Translation::query()
                ->where('locale', $locale)
                ->where('is_active', true)
                ->whereIn('scope', $scopes)
                ->orderByRaw($this->scopeOrderSql($scopes))
                ->orderBy('namespace')
                ->orderBy('key');
            if($namespaces !== null) {
                $query->whereIn('namespace', $namespaces);
            }
            $messages = [];
            foreach($query->get([
                'scope',
                'namespace',
                'key',
                'value'
            ]) as $translation) {
                $fullKey = "{$translation->namespace}.{$translation->key}";
                if(!array_key_exists($fullKey, $messages) && $translation->value !== '') {
                    $messages[$fullKey] = $translation->value;
                }
            }
            return $messages;
        });
    }

    public function normalizeLocale(string $locale): string
    {
        $locale = str_replace('_', '-', strtolower(trim($locale)));
        return in_array($locale, $this->locales(), true) ? $locale : $this->defaultLocale();
    }

    private function normalizeScope(string $scope): string
    {
        $scope   = strtolower(trim($scope));
        $allowed = [
            'global',
            'common',
            'backend',
            'frontend',
            'api',
            'mobile',
            'auth',
            'validation',
        ];
        return in_array($scope, $allowed, true) ? $scope : 'backend';
    }

    private function normalizeNamespaces(?array $namespaces): ?array
    {
        if($namespaces === null) {
            return null;
        }
        $namespaces = array_values(array_filter(array_unique(array_map(
            fn($namespace) => trim((string)$namespace),
            $namespaces,
        ))));
        return $namespaces === [] ? null : $namespaces;
    }

    public function fallbackScopes(string $scope): array
    {
        $scope = $this->normalizeScope($scope);
        return match ($scope) {
            'frontend' => [
                'frontend',
                'global',
                'common',
                'auth',
                'validation',
                'api'
            ],
            'backend'  => [
                'backend',
                'global',
                'common',
                'auth',
                'validation',
                'api'
            ],
            'api'      => [
                'api',
                'global',
                'common',
                'auth',
                'validation'
            ],
            'mobile'   => [
                'mobile',
                'api',
                'global',
                'common',
                'auth',
                'validation'
            ],
            'auth'     => [
                'auth',
                'global',
                'common',
                'validation',
                'api'
            ],
            default    => [
                $scope,
                'global',
                'common'
            ],
        };
    }

    private function scopeOrderSql(array $scopes): string
    {
        $cases = [];
        foreach(array_values($scopes) as $index => $scope) {
            $safeScope = str_replace("'", "''", $scope);
            $cases[]   = "WHEN scope = '{$safeScope}' THEN {$index}";
        }
        return 'CASE ' . implode(' ', $cases) . ' ELSE 999 END';
    }

    public function localeOptions(): array
    {
        $options = $this->localeOptionsFromSettings();
        if($options !== []) {
            return $options;
        }
        return array_map(fn(string $locale) => [
            'code'  => $locale,
            'label' => strtoupper($locale),
        ], $this->locales());
    }

    public function saveLocaleOptions(array $locales, ?string $defaultLocale = null): array
    {
        $normalized = [];
        foreach($locales as $locale) {
            if(is_string($locale)) {
                $code  = $locale;
                $label = strtoupper($locale);
            } else {
                $code  = (string)($locale['code'] ?? '');
                $label = (string)($locale['label'] ?? '');
            }
            $code = str_replace('_', '-', strtolower(trim($code)));
            if($code === '' || !preg_match('/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/', $code)) {
                continue;
            }
            $normalized[$code] = [
                'code'  => $code,
                'label' => trim($label) !== '' ? trim($label) : strtoupper($code),
            ];
        }
        if($normalized === []) {
            $normalized['id'] = [
                'code'  => 'id',
                'label' => 'Bahasa Indonesia',
            ];
        }
        $defaultLocale = str_replace('_', '-', strtolower(trim((string)$defaultLocale)));
        if(!array_key_exists($defaultLocale, $normalized)) {
            $defaultLocale = array_key_first($normalized);
        }
        SettingApp::setValue('translations', [
            'default_locale' => $defaultLocale,
            'locales'        => array_values($normalized),
        ]);
        $this->flush();
        return array_values($normalized);
    }

    public function flush(?string $locale = null, ?string $scope = null, ?string $namespace = null): void
    {
        $version = (int)Cache::get('translations:version', 1);
        Cache::forever('translations:version', $version + 1);
    }

    public function translate(string $fullKey, string $locale = 'id', string $scope = 'backend', array $replace = []): string
    {
        $resolved = $this->resolveKeys($locale, $scope, [$fullKey]);
        $text     = $resolved['messages'][$fullKey] ?? $fullKey;
        foreach($replace as $key => $value) {
            $text = str_replace(':' . $key, (string)$value, $text);
            $text = str_replace('{' . $key . '}', (string)$value, $text);
        }
        return $text;
    }

    public function resolveKeys(string $locale = 'id', string $scope = 'frontend', array $keys = [], ?string $fallbackLocale = null): array
    {
        $locale         = $this->normalizeLocale($locale);
        $fallbackLocale = $this->normalizeLocale($fallbackLocale ?: $this->defaultLocale());
        $scope          = $this->normalizeScope($scope);
        $keys           = $this->normalizeFullKeys($keys);
        if($keys === []) {
            return [
                'locale'          => $locale,
                'fallback_locale' => $fallbackLocale,
                'scope'           => $scope,
                'fallback_scopes' => $this->fallbackScopes($scope),
                'messages'        => [],
                'sources'         => [],
            ];
        }
        $version  = (int)Cache::get('translations:version', 1);
        $hash     = md5(implode('|', $keys));
        $cacheKey = "translations:v{$version}:resolve:{$locale}:{$fallbackLocale}:{$scope}:{$hash}";
        return Cache::rememberForever($cacheKey, function() use ($locale, $fallbackLocale, $scope, $keys) {
            $pairs      = $this->splitFullKeys($keys);
            $namespaces = array_values(array_unique(array_column($pairs, 'namespace')));
            $rowKeys    = array_values(array_unique(array_column($pairs, 'key')));
            $fullSet    = array_fill_keys($keys, true);
            $scopes     = $this->fallbackScopes($scope);
            $locales    = array_values(array_unique([
                $locale,
                $fallbackLocale
            ]));
            $rows = Translation::query()
                ->where('is_active', true)
                ->whereIn('locale', $locales)
                ->whereIn('scope', $scopes)
                ->whereIn('namespace', $namespaces)
                ->whereIn('key', $rowKeys)
                ->get([
                    'locale',
                    'scope',
                    'namespace',
                    'key',
                    'value'
                ]);
            $candidates = [];
            foreach($rows as $row) {
                $fullKey = "{$row->namespace}.{$row->key}";
                if(!isset($fullSet[$fullKey]) || $row->value === '') {
                    continue;
                }
                $localeRank = $row->locale === $locale ? 0 : 1000;
                $scopeRank  = array_search($row->scope, $scopes, true);
                $scopeRank  = $scopeRank === false ? 999 : $scopeRank;
                $rank       = $localeRank + $scopeRank;
                if(!isset($candidates[$fullKey]) || $rank < $candidates[$fullKey]['rank']) {
                    $candidates[$fullKey] = [
                        'rank'   => $rank,
                        'value'  => $row->value,
                        'source' => $row->scope,
                        'locale' => $row->locale,
                    ];
                }
            }
            $messages = [];
            $sources  = [];
            foreach($keys as $key) {
                if(isset($candidates[$key])) {
                    $messages[$key] = $candidates[$key]['value'];
                    $sources[$key]  = [
                        'scope'  => $candidates[$key]['source'],
                        'locale' => $candidates[$key]['locale'],
                    ];
                }
            }
            return [
                'locale'          => $locale,
                'fallback_locale' => $fallbackLocale,
                'scope'           => $scope,
                'fallback_scopes' => $scopes,
                'messages'        => $messages,
                'sources'         => $sources,
            ];
        });
    }

    private function normalizeFullKeys(array $keys): array
    {
        $keys = array_map(
            fn($key) => trim((string)$key),
            $keys,
        );
        return array_values(array_filter(array_unique($keys), fn(string $key) => $key !== '' && str_contains($key, '.')));
    }

    private function splitFullKeys(array $keys): array
    {
        return array_map(function(string $fullKey): array {
            [
                $namespace,
                $key
            ] = explode('.', $fullKey, 2);
            return [
                'namespace' => $namespace,
                'key'       => $key,
            ];
        }, $keys);
    }
}
