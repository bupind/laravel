<?php

use App\Http\Controllers\UnitController;
use Illuminate\Support\Facades\Route;



Route::get('users/datatable', [\App\Http\Controllers\UsersController::class, 'datatable'])->name('users.datatable');
Route::get('users/export/{format?}', [\App\Http\Controllers\UsersController::class, 'export'])->name('users.export');
Route::post('users/bulk', [\App\Http\Controllers\UsersController::class, 'bulk'])->name('users.bulk');
Route::resource('users', \App\Http\Controllers\UsersController::class);

Route::post('destroy_users', [\App\Http\Controllers\UsersController::class, 'destroy_users']);
Route::get('get_user_permission', [\App\Http\Controllers\UsersController::class, 'get_user_permission']);
Route::get('get_user_countries', [\App\Http\Controllers\UsersController::class, 'get_user_countries']);
Route::get('get_user_standards', [\App\Http\Controllers\UsersController::class, 'get_user_standards']);
Route::post('save_user_permissions', [\App\Http\Controllers\UsersController::class, 'save_user_permissions']);
Route::post('save_user_countries', [\App\Http\Controllers\UsersController::class, 'save_user_countries']);
Route::post('save_user_standards', [\App\Http\Controllers\UsersController::class, 'save_user_standards']);
Route::get('reset_pass/{id}', [\App\Http\Controllers\UsersController::class, 'reset_pass']);


Route::get('unit/datatable', [\App\Http\Controllers\UnitController::class, 'datatable'])->name('unit.datatable');
Route::get('unit/export/{format?}', [\App\Http\Controllers\UnitController::class, 'export'])->name('unit.export');
Route::post('unit/bulk', [\App\Http\Controllers\UnitController::class, 'bulk'])->name('unit.bulk');
Route::resource('unit', \App\Http\Controllers\UnitController::class);


Route::get('roles/datatable', [\App\Http\Controllers\RolesController::class, 'datatable'])->name('roles.datatable');
Route::get('roles/export/{format?}', [\App\Http\Controllers\RolesController::class, 'export'])->name('roles.export');
Route::post('roles/bulk', [\App\Http\Controllers\RolesController::class, 'bulk'])->name('roles.bulk');
Route::resource('roles', \App\Http\Controllers\RolesController::class);

Route::get('permissions/datatable', [\App\Http\Controllers\PermissionsController::class, 'datatable'])->name('permissions.datatable');
Route::get('permissions/export/{format?}', [\App\Http\Controllers\PermissionsController::class, 'export'])->name('permissions.export');
Route::post('permissions/bulk', [\App\Http\Controllers\PermissionsController::class, 'bulk'])->name('permissions.bulk');
Route::resource('permissions', \App\Http\Controllers\PermissionsController::class);
