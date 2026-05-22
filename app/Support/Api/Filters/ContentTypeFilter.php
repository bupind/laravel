<?php

namespace App\Support\Api\Filters;

use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentTypeFilter
{
    public const TYPE_APPLICATION_JSON    = 'application/json';
    public const TYPE_MULTIPART_FORM_DATA = 'multipart/form-data';

    public function validate(Request $request, string $action, array $config): ?JsonResponse
    {
        $expected      = $config['contentType'] ?? self::TYPE_APPLICATION_JSON;
        $expectedTypes = is_array($expected) ? $expected : [$expected];
        $actual        = strtolower((string)$request->header('Content-Type', ''));
        foreach($expectedTypes as $contentType) {
            if($this->matches($request, $actual, (string)$contentType)) {
                return null;
            }
        }
        return ApiResponse::make(
            'Unsupported Media Type',
            'Invalid request content type.',
            41501,
            415,
            [
                'ExpectedContentType' => array_values($expectedTypes),
                'ActualContentType'   => $actual !== '' ? $actual : null,
                'Action'              => $action,
            ],
        );
    }

    private function matches(Request $request, string $actual, string $expected): bool
    {
        $expected = strtolower($expected);
        return match ($expected) {
            self::TYPE_APPLICATION_JSON    => $request->isJson(),
            self::TYPE_MULTIPART_FORM_DATA => str_starts_with($actual, self::TYPE_MULTIPART_FORM_DATA),
            default                        => str_starts_with($actual, $expected),
        };
    }
}
