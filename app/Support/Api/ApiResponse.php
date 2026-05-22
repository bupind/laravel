<?php
/**
 * ApiResponse
 * @author  bupind
 * @created 2026-05-18
 */

namespace App\Support\Api;

use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

class ApiResponse
{
    public static function make(
        string $name,
        string $message,
        int    $code,
        int    $status,
        mixed  $data = [],
        ?float $requestTime = null,
        array  $extra = [],
    ): JsonResponse
    {
        $pagination  = null;
        $requestTime ??= self::requestTime();
        if($data instanceof LengthAwarePaginator) {
            $pagination = [
                'CurrentPage' => $data->currentPage(),
                'PerPage'     => $data->perPage(),
                'From'        => $data->firstItem(),
                'To'          => $data->lastItem(),
                'Total'       => $data->total(),
                'LastPage'    => $data->lastPage(),
                'HasMore'     => $data->hasMorePages(),
            ];
            $data       = $data->items();
        } elseif($data instanceof Paginator) {
            $pagination = [
                'CurrentPage' => $data->currentPage(),
                'PerPage'     => $data->perPage(),
                'HasMore'     => $data->hasMorePages(),
            ];
            $data       = $data->items();
        }
        $payload = array_merge([
            'Name'        => $name,
            'Message'     => $message,
            'Code'        => $code,
            'Status'      => $status,
            'RequestTime' => $requestTime,
            'Data'        => $data,
        ], $extra);
        if($pagination !== null) {
            $payload['Pagination'] = $pagination;
        }
        return response()->json($payload, $status);
    }

    private static function requestTime(): float
    {
        $start = defined('LARAVEL_START') ? LARAVEL_START : ($_SERVER['REQUEST_TIME_FLOAT'] ?? microtime(true));
        return round(microtime(true) - (float)$start, 4);
    }
}
