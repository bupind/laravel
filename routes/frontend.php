<?php

/*
|--------------------------------------------------------------------------
| Frontend Routes
|--------------------------------------------------------------------------
| Rute publik yang dapat diakses semua pengunjung.
| Auth routes (login, register, dll.) dipisahkan ke backend/auth.php.
*/

use App\Http\Controllers\Frontend\ContactController;
use App\Http\Controllers\Frontend\HomeController;
use App\Http\Controllers\Frontend\PageController;
use App\Http\Controllers\Frontend\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/products', ProductController::class)->name('frontend.products');
Route::get('/contact', [ContactController::class, 'create'])->name('frontend.contact');
Route::post('/contact', [ContactController::class, 'store'])->name('frontend.contact.store');
Route::get('/pages/{page:slug}', [PageController::class, 'show'])->name('frontend.pages.show');

require __DIR__ . '/backend/auth.php';
