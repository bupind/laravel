<?php

use App\Http\Controllers\Frontend\HomeController;
use App\Http\Controllers\Frontend\BlogController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/blogs', [BlogController::class, 'index'])->name('frontend.blogs.index');
Route::get('/blogs/{blog:slug}', [BlogController::class, 'show'])->name('frontend.blogs.show');
