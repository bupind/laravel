<?php

use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Middleware\CheckExpirationPassword;
use App\Http\Middleware\HomeAuth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/
Route::get('/', function() {
    return view('auth.login');
})->middleware(HomeAuth::class)->name('public');
Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function() {
    Route::get('/dashboard', function() {
        return view('dashboard');
    })->middleware(CheckExpirationPassword::class)->name('dashboard');
});
Route::get('/password/expired', function() {
    return view('auth.password-expired');
})->name('password.expired');
Route::post('/reset-password', [
    NewPasswordController::class,
    'store'
])->name('password.update');
