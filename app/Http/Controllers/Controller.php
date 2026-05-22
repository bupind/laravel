<?php
/**
 * Controller
 * @author  bupind
 * @created 2026-05-21
 */

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
