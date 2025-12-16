<?php

use App\Http\Controllers\UnitController;
use Illuminate\Support\Facades\Route;

Route::resource('roles', 'RolesController');
Route::post('destroy_roles', 'RolesController@destroy_roles');

Route::resource('permissions', 'PermissionsController');
Route::post('destroy_permissions', 'PermissionsController@destroy_permissions');


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
