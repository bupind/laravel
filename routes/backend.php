<?php

/*
|--------------------------------------------------------------------------
| Backend Routes
|--------------------------------------------------------------------------
| Semua rute admin/backend berada di prefix /backend.
|
| Middleware yang digunakan:
|  - auth            → user harus login
|  - menu.permission → user harus punya izin sesuai menu yang dikonfigurasi
|
| File upload tidak memerlukan menu.permission karena dipanggil dari widget
| internal (misal: FileLibraryPicker) yang sudah dilindungi oleh form/page
| yang membutuhkan permission tersendiri.
*/

use App\Http\Controllers\Backend\ApiClientController;
use App\Http\Controllers\Backend\AuditLogController;
use App\Http\Controllers\Backend\DashboardController;
use App\Http\Controllers\Backend\FileLibraryController;
use App\Http\Controllers\Backend\MediaFolderController;
use App\Http\Controllers\Backend\MenuController;
use App\Http\Controllers\Backend\PermissionController;
use App\Http\Controllers\Backend\ProductController;
use App\Http\Controllers\Backend\RoleController;
use App\Http\Controllers\Backend\SettingAppController;
use App\Http\Controllers\Backend\TranslationController;
use App\Http\Controllers\Backend\UserController;
use App\Http\Controllers\Backend\UserFileController;
use Illuminate\Support\Facades\Route;

Route::prefix('backend')->name('backend.')->group(function () {

    // ─── File Upload (auth only, no menu.permission) ───────────────────────
    Route::middleware('auth')->group(function () {
        // File library browser (dipakai oleh widget FileLibraryPicker)
        Route::controller(FileLibraryController::class)
            ->prefix('files/library')
            ->name('files.library.')
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('/folders', 'folders')->name('folders');
            });

        // Upload file baru
        Route::post('files', [UserFileController::class, 'store'])->name('files.store');
    });

    // ─── Protected Admin Routes ────────────────────────────────────────────
    Route::middleware(['auth', 'menu.permission'])->group(function () {

        // Dashboard
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        // Roles
        Route::resource('roles', RoleController::class)->except('show');

        // Menus
        Route::post('menus/reorder', [MenuController::class, 'reorder'])->name('menus.reorder');
        Route::resource('menus', MenuController::class);

        // API Clients
        Route::resource('api-clients', ApiClientController::class)->except('show');

        // Products
        Route::resource('products', ProductController::class)->except('show');

        // Permissions
        Route::controller(PermissionController::class)
            ->prefix('permissions')
            ->name('permissions.')
            ->group(function () {
                Route::get('export', 'export')->name('export');
                Route::delete('modules/{module}', 'destroyModule')->name('destroy-module');
                Route::post('bulk', 'storeBulk')->name('bulk');
            });
        Route::resource('permissions', PermissionController::class)->except('show');

        // Users
        Route::controller(UserController::class)
            ->prefix('users')
            ->name('users.')
            ->group(function () {
                Route::get('export', 'export')->name('export');
                Route::put('{user}/reset-password', 'resetPassword')->name('reset-password');
            });
        Route::resource('users', UserController::class)->except('show');

        // App Settings
        Route::controller(SettingAppController::class)
            ->prefix('settingsapp')
            ->name('setting.')
            ->group(function () {
                Route::get('/', 'edit')->name('edit');
                Route::post('/', 'update')->name('update');
            });

        // Translations
        Route::controller(TranslationController::class)
            ->prefix('translations')
            ->name('translations.')
            ->group(function () {
                Route::get('/', 'edit')->name('edit');
                Route::put('/', 'update')->name('update');
                Route::post('sync', 'sync')->name('sync');
            });

        // Audit Logs
        Route::controller(AuditLogController::class)
            ->prefix('audit-logs')
            ->name('audit-logs.')
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('export', 'export')->name('export');
                Route::delete('delete-all', 'destroyAll')->name('destroy-all');
            });

        // File Manager (index & delete — upload sudah di grup auth-only di atas)
        Route::controller(UserFileController::class)
            ->prefix('files')
            ->name('files.')
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::delete('{id}', 'destroy')->name('destroy');
            });

        // Media Folders
        Route::resource('media', MediaFolderController::class);
    });

    // Settings sub-routes (profile, password, appearance)
    require __DIR__ . '/backend/settings.php';
});
