<?php

/*
|--------------------------------------------------------------------------
| Frontend Routes
|--------------------------------------------------------------------------
| Rute publik yang dapat diakses semua pengunjung.
| Auth routes (login, register, dll.) dipisahkan ke backend/auth.php.
*/

use App\Http\Controllers\Frontend\HomeController;
use App\Http\Controllers\Frontend\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/products', ProductController::class)->name('frontend.products');

require __DIR__ . '/backend/auth.php';
