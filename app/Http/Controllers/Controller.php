<?php

namespace App\Http\Controllers;
abstract class Controller
{
    protected function flashMessage(string $key, array $replacements = []): array
    {
        return [
            'key'          => $key,
            'replacements' => $replacements,
        ];
    }
}
