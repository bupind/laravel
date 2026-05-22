<?php

use App\Services\Translations\TranslationService;

if(!function_exists('trans_db')) {
    function trans_db(string $key, array $replace = [], ?string $locale = null, string $scope = 'backend'): string
    {
        return app(TranslationService::class)->translate(
            $key,
            $locale ?: app()->getLocale(),
            $scope,
            $replace,
        );
    }
}
