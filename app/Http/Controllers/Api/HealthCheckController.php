<?php
/**
 * HealthCheckController
 * @author  bupind
 * @created 2026-05-22
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class HealthCheckController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'app'    => config('app.name'),
        ]);
    }
}
