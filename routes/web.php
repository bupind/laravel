<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Middleware\CheckExpirationPassword;
use Illuminate\Support\Facades\Route;

Route::get('/', function() {
    return view('welcome');
})->name('home');

Route::get('/login', function() {
    return view('auth.login');
})->middleware('guest')
    ->name('login');

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function() {
    Route::get('/dashboard', function() {
        return view('dashboard');
    })->middleware(CheckExpirationPassword::class)
        ->name('dashboard');
});
Route::get('/password/expired', function() {
    return view('auth.password-expired');
})->name('password.expired');
Route::post('/reset-password', [
    NewPasswordController::class,
    'store'
])->name('password.update');
