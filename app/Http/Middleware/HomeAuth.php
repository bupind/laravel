<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class HomeAuth
{
    public function handle(Request $request, Closure $next, ...$guards)
    {
        return $next($request);
    }
}
