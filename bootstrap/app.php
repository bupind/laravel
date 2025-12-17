<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        commands: __DIR__ . '/../routes/console.php',

        using   : function() {
            Route::middleware('api')->prefix('api')->group(base_path('routes/api.php'));
            Route::middleware('web')->namespace("App\Http\Controllers")->group(base_path('routes/web.php'));
            Route::middleware([
                'web',
                'auth:sanctum',
                config('jetstream.auth_session'),
                'verified',
            ])
                ->namespace("App\Http\Controllers")
                ->prefix('backend')
                ->group(base_path('routes/backend.php'));
        }
    )
    ->withMiddleware(function(Middleware $middleware) {
    })
    ->withExceptions(function(Exceptions $exceptions) {
        //
    })->create();
