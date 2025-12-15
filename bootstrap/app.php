<?php

use App\Http\Middleware\CheckExpirationPassword;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))

    ->withRouting(
        // web: __DIR__.'/../routes/web.php',
        // api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        // health: '/up',
        using: function(){

            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')->namespace("App\Http\Controllers")
                ->group(base_path('routes/web.php'));
            //Admin
            Route::middleware(['web', 'auth:sanctum', config('jetstream.auth_session'), 'verified',])
                ->namespace("App\Http\Controllers")
                ->prefix('admin')
                ->group(base_path('routes/admin.php'));

        }
    )
    ->withMiddleware(function (Middleware $middleware) {
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
