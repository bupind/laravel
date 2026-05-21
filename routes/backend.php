<?php

use App\Http\Controllers\Backend\AuditLogController;
use App\Http\Controllers\Backend\BackupController;
use App\Http\Controllers\Backend\DashboardController;
use App\Http\Controllers\Backend\FileLibraryController;
use App\Http\Controllers\Backend\MediaFolderController;
use App\Http\Controllers\Backend\MenuController;
use App\Http\Controllers\Backend\PermissionController;
use App\Http\Controllers\Backend\RoleController;
use App\Http\Controllers\Backend\SettingAppController;
use App\Http\Controllers\Backend\TranslationController;
use App\Http\Controllers\Backend\UserController;
use App\Http\Controllers\Backend\UserFileController;
use Illuminate\Support\Facades\Route;

Route::prefix('backend')->group(function () {
    Route::middleware(['auth'])->group(function () {
        Route::get('/files/library', [
            FileLibraryController::class,
            'index',
        ])->name('files.library');
        Route::get('/files/library/folders', [
            FileLibraryController::class,
            'folders',
        ])->name('files.library.folders');
        Route::post('/files', [
            UserFileController::class,
            'store',
        ])->name('files.store');
    });
    Route::middleware([
        'auth',
        'menu.permission',
    ])->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
        Route::resource('roles', RoleController::class)->except('show');
        Route::resource('menus', MenuController::class);
        Route::post('menus/reorder', [
            MenuController::class,
            'reorder',
        ])->name('menus.reorder');
        Route::get('permissions/export', [
            PermissionController::class,
            'export',
        ])->name('permissions.export');
        Route::delete('permissions/modules/{module}', [
            PermissionController::class,
            'destroyModule',
        ])->name('permissions.destroy-module');
        Route::post('permissions/bulk', [PermissionController::class, 'storeBulk'])->name('permissions.bulk');
        Route::resource('permissions', PermissionController::class)->except('show');
        Route::get('users/export', [
            UserController::class,
            'export',
        ])->name('users.export');
        Route::put('/users/{user}/reset-password', [
            UserController::class,
            'resetPassword',
        ])->name('users.reset-password');
        Route::resource('users', UserController::class)->except('show');
        Route::get('/settingsapp', [
            SettingAppController::class,
            'edit',
        ])->name('setting.edit');
        Route::post('/settingsapp', [
            SettingAppController::class,
            'update',
        ])->name('setting.update');
        Route::get('/translations', [
            TranslationController::class,
            'edit',
        ])->name('translations.edit');
        Route::put('/translations', [
            TranslationController::class,
            'update',
        ])->name('translations.update');
        // Audit Logs
        Route::get('/audit-logs', [
            AuditLogController::class,
            'index',
        ])->name('audit-logs.index');
        Route::get('/audit-logs/export', [
            AuditLogController::class,
            'export',
        ])->name('audit-logs.export');
        Route::delete('/audit-logs/delete-all', [
            AuditLogController::class,
            'destroyAll',
        ])->name('audit-logs.destroy-all');
        // Backup
        Route::get('/backup', [
            BackupController::class,
            'index',
        ])->name('backup.index');
        Route::post('/backup/run', [
            BackupController::class,
            'run',
        ])->name('backup.run');
        Route::get('/backup/download/{file}', [
            BackupController::class,
            'download',
        ])->name('backup.download');
        Route::delete('/backup/delete/{file}', [
            BackupController::class,
            'delete',
        ])->name('backup.delete');
        // File Library
        Route::get('/files', [
            UserFileController::class,
            'index',
        ])->name('files.index');
        Route::delete('/files/{id}', [
            UserFileController::class,
            'destroy',
        ])->name('files.destroy');
        // Media Folders
        Route::resource('media', MediaFolderController::class);
    });
    require __DIR__.'/backend/settings.php';
    require __DIR__.'/backend/auth.php';
});
