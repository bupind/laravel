<?php

use App\Http\Controllers\Backend\UnitController;
use Illuminate\Support\Facades\Route;

Route::get('users/datatable', [\App\Http\Controllers\Backend\UsersController::class, 'datatable'])->name('users.datatable');
Route::get('users/export/{format?}', [\App\Http\Controllers\Backend\UsersController::class, 'export'])->name('users.export');
Route::post('users/bulk', [\App\Http\Controllers\Backend\UsersController::class, 'bulk'])->name('users.bulk');
Route::resource('users', \App\Http\Controllers\Backend\UsersController::class);

Route::post('destroy_users', [\App\Http\Controllers\Backend\UsersController::class, 'destroy_users']);
Route::get('get_user_permission', [\App\Http\Controllers\Backend\UsersController::class, 'get_user_permission']);
Route::get('get_user_countries', [\App\Http\Controllers\Backend\UsersController::class, 'get_user_countries']);
Route::get('get_user_standards', [\App\Http\Controllers\Backend\UsersController::class, 'get_user_standards']);
Route::post('save_user_permissions', [\App\Http\Controllers\Backend\UsersController::class, 'save_user_permissions']);
Route::post('save_user_countries', [\App\Http\Controllers\Backend\UsersController::class, 'save_user_countries']);
Route::post('save_user_standards', [\App\Http\Controllers\Backend\UsersController::class, 'save_user_standards']);
Route::get('reset_pass/{id}', [\App\Http\Controllers\Backend\UsersController::class, 'reset_pass']);


Route::get('unit/datatable', [UnitController::class, 'datatable'])->name('unit.datatable');
Route::get('unit/export/{format?}', [UnitController::class, 'export'])->name('unit.export');
Route::post('unit/bulk', [UnitController::class, 'bulk'])->name('unit.bulk');
Route::get('unit/import', [UnitController::class, 'import'])->name('unit.import');
Route::post('unit/import', [UnitController::class, 'importStore'])->name('unit.import.store');
Route::resource('unit', UnitController::class);


Route::get('roles/datatable', [\App\Http\Controllers\Backend\RolesController::class, 'datatable'])->name('roles.datatable');
Route::get('roles/export/{format?}', [\App\Http\Controllers\Backend\RolesController::class, 'export'])->name('roles.export');
Route::post('roles/bulk', [\App\Http\Controllers\Backend\RolesController::class, 'bulk'])->name('roles.bulk');
Route::resource('roles', \App\Http\Controllers\Backend\RolesController::class);

Route::get('permissions/datatable', [\App\Http\Controllers\Backend\PermissionsController::class, 'datatable'])->name('permissions.datatable');
Route::get('permissions/export/{format?}', [\App\Http\Controllers\Backend\PermissionsController::class, 'export'])->name('permissions.export');
Route::post('permissions/bulk', [\App\Http\Controllers\Backend\PermissionsController::class, 'bulk'])->name('permissions.bulk');
Route::resource('permissions', \App\Http\Controllers\Backend\PermissionsController::class);
// Room
Route::get('room/datatable', [\App\Http\Controllers\Backend\RoomController::class, 'datatable'])->name('room.datatable');
Route::get('room/export/{format?}', [\App\Http\Controllers\Backend\RoomController::class, 'export'])->name('room.export');
Route::post('room/bulk', [\App\Http\Controllers\Backend\RoomController::class, 'bulk'])->name('room.bulk');
Route::resource('room', \App\Http\Controllers\Backend\RoomController::class);
