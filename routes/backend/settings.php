<?php

/*
|--------------------------------------------------------------------------
| User Settings Routes
|--------------------------------------------------------------------------
| Profile, password, dan appearance settings.
| Semua rute ini berada di dalam prefix /backend (dari backend.php).
| Middleware 'auth' diwarisi dari group di backend.php — tidak perlu
| diulang di sini, namun ditulis eksplisit agar mudah dibaca.
*/

use App\Http\Controllers\Backend\Settings\PasswordController;
use App\Http\Controllers\Backend\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')
    ->prefix('settings')
    ->name('settings.')
    ->group(function () {
        // Redirect /settings → /settings/profile
        Route::redirect('/', 'profile');

        // Profile
        Route::controller(ProfileController::class)->group(function () {
            Route::get('profile', 'edit')->name('profile.edit');
            Route::patch('profile', 'update')->name('profile.update');
            Route::delete('profile', 'destroy')->name('profile.destroy');
        });

        // Password
        Route::controller(PasswordController::class)->group(function () {
            Route::get('password', 'edit')->name('password.edit');
            Route::put('password', 'update')->name('password.update');
        });

        // Appearance (no controller needed — rendered directly)
        Route::get('appearance', fn () => Inertia::render('backend/settings/appearance'))
            ->name('appearance');
    });
