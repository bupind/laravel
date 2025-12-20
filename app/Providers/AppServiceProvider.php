<?php

namespace App\Providers;

use App\Models\Roles;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::before(function($user, $ability) {
            return $user->hasRole(Roles::ROLE_SUPERUSER) ? true : null;
        });
    }
}
