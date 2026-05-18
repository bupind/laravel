<?php

use App\Http\Controllers\Api\HealthCheckController;
use App\Http\Controllers\Api\BlogController as ApiBlogController;
use App\Http\Controllers\Api\CategoryController as ApiCategoryController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\TagController as ApiTagController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('health', HealthCheckController::class)->name('api.health');
Route::get('permissions', [PermissionController::class, 'index'])->name('api.permissions');
Route::get('categories', [ApiCategoryController::class, 'index'])->name('api.categories.index');
Route::get('tags', [ApiTagController::class, 'index'])->name('api.tags.index');
Route::get('blogs', [ApiBlogController::class, 'index'])->name('api.blogs.index');
Route::get('blogs/{blog:slug}', [ApiBlogController::class, 'show'])->name('api.blogs.show');

Route::get('me', function (Request $request) {
    return response()->json([
        'user' => $request->user(),
    ]);
})->middleware('auth:sanctum')->name('api.me');
