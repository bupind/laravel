<?php
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Tips keamanan:
|  - Ziggy TIDAK di-share ke rute api/* (lihat HandleInertiaRequests).
|  - Semua rute api.client di-throttle secara terpisah.
|  - Gunakan header X-Client-Key + X-Client-Secret (bukan query string).
|  - Jangan pernah expose seluruh model user — filter field di controller.
*/

use App\Http\Controllers\Api\HealthCheckController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TranslationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:120,1')->group(function() {
    Route::get('health', HealthCheckController::class)->name('api.health');
    Route::get('translations', TranslationController::class)->name('api.translations');
    Route::post('translations/resolve', [TranslationController::class, 'resolve'])->name('api.translations.resolve');
});
Route::middleware([
    'api.client',
    'throttle:api'
])
    ->controller(ProductController::class)
    ->prefix('products')
    ->name('api.products.')
    ->group(function() {
        Route::get('form/{product?}', 'form')->name('form');
        Route::post('list-filter', 'listFilter')->name('list-filter');
        Route::patch('{product}/change-status', 'changeStatus')->name('change-status');
    });
Route::middleware([
    'api.client',
    'throttle:api'
])
    ->apiResource('products', ProductController::class)
    ->names('api.products');
Route::middleware('auth:sanctum')->group(function() {
    Route::get('me', function(Request $request) {
        return response()->json([
            'user' => array_merge(
                $request->user()->only([
                    'id',
                    'name',
                    'email',
                    'avatar'
                ]),
                ['roles' => $request->user()->roles->pluck('name')],
            ),
        ]);
    })->name('api.me');
});
