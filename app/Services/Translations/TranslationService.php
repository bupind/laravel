<?php

namespace App\Services\Translations;

use App\Models\Translation;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class TranslationService
{
    private const DEFAULT_LOCALE = 'id';
    private const FALLBACK_LOCALES = [
        'id',
        'en',
    ];
    private const LOCALE_LABELS = [
        'ar' => 'Arabic',
        'en' => 'English',
        'id' => 'Bahasa Indonesia',
    ];

    /**
     * Ambil semua bahasa yang dibutuhkan Inertia/React.
     */
    public function getDictionaries(string $scope = 'backend', ?array $namespaces = null, ?array $locales = null): array
    {
        $locales      = $locales === null ? $this->locales() : $this->normalizeLocales($locales);
        $dictionaries = [];
        foreach($locales as $locale) {
            $dictionaries[$locale] = $this->getMessages($locale, $scope, $namespaces);
        }
        return $dictionaries;
    }

    public function locales(): array
    {
        $version = (int)Cache::get('translations:version', 1);
        return Cache::rememberForever("translations:v{$version}:locales", function() {
            $locales = self::FALLBACK_LOCALES;
            if(Schema::hasTable('translations')) {
                $locales = array_merge(
                    $locales,
                    Translation::query()
                        ->distinct()
                        ->orderBy('locale')
                        ->pluck('locale')
                        ->all(),
                );
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
        foreach(array_reverse(self::FALLBACK_LOCALES) as $fallbackLocale) {
            if(!in_array($fallbackLocale, $locales, true)) {
                array_unshift($locales, $fallbackLocale);
            }
        }
        return $locales;
    }

    /**
     * Ambil translation untuk 1 locale + scope. Scope common selalu ikut.
     * Return format flat: buttons.save => Simpan.
     */
    public function getMessages(string $locale = 'id', string $scope = 'backend', ?array $namespaces = null): array
    {
        $locale       = $this->normalizeLocale($locale);
        $scope        = $this->normalizeScope($scope);
        $namespaces   = $this->normalizeNamespaces($namespaces);
        $namespaceKey = $namespaces === null ? 'all' : implode(',', $namespaces);
        $version      = (int)Cache::get('translations:version', 1);
        $cacheKey     = "translations:v{$version}:messages:{$locale}:{$scope}:{$namespaceKey}";
        return Cache::rememberForever($cacheKey, function() use ($locale, $scope, $namespaces) {
            $query = Translation::query()
                ->where('locale', $locale)
                ->where('is_active', true)
                ->whereIn('scope', [
                    'common',
                    $scope
                ])
                ->orderByRaw("CASE WHEN scope = 'common' THEN 0 ELSE 1 END")
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
                $messages["{$translation->namespace}.{$translation->key}"] = $translation->value;
            }
            return $messages;
        });
    }

    private function normalizeLocale(string $locale): string
    {
        $locale = str_replace('_', '-', strtolower(trim($locale)));
        return in_array($locale, $this->locales(), true) ? $locale : self::DEFAULT_LOCALE;
    }

    private function normalizeScope(string $scope): string
    {
        $scope   = strtolower(trim($scope));
        $allowed = [
            'common',
            'backend',
            'frontend',
            'api',
            'mobile'
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

    public function localeOptions(): array
    {
        return array_map(fn(string $locale) => [
            'code'  => $locale,
            'label' => self::LOCALE_LABELS[$locale] ?? strtoupper($locale),
        ], $this->locales());
    }

    public function translate(string $fullKey, string $locale = 'id', string $scope = 'backend', array $replace = []): string
    {
        $messages = $this->getMessages($locale, $scope);
        $text     = $messages[$fullKey] ?? $fullKey;
        foreach($replace as $key => $value) {
            $text = str_replace(':' . $key, (string)$value, $text);
            $text = str_replace('{' . $key . '}', (string)$value, $text);
        }
        return $text;
    }

    public function flush(?string $locale = null, ?string $scope = null, ?string $namespace = null): void
    {
        $version = (int)Cache::get('translations:version', 1);
        Cache::forever('translations:version', $version + 1);
    }
}
