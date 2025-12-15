<?php

namespace App\Http\Middleware;

use Auth;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckExpirationPassword
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if(Auth::check()) {
            $user = Auth::user();
            if($user->password_changed_at) {
                $passwordChangedAt = strtotime($user->password_changed_at);
                $expirationDate    = strtotime('+60 days', $passwordChangedAt);
                $currentTime       = time();
                if($currentTime > $expirationDate) {
                    auth()->guard('web')->logout();
                    return redirect()->route('password.expired')->with('status', $user->email);
                }
            }
        }
        return $next($request);
    }
}
