<?php

use App\Http\Controllers\Api\HealthCheckController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
// Health check
Route::get('health', HealthCheckController::class)->name('api.health');
// Authenticated
Route::middleware('auth:sanctum')->group(function() {
    Route::get('me', function(Request $request) {
        return response()->json(['user' => $request->user()->load('roles')]);
    })->name('api.me');
});
