<?php
/**
 * SecurityHeaders
 * @author  bupind
 * @created 2026-05-22
 */

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    private array $always = [
        'X-Content-Type-Options' => 'nosniff',
        'X-Frame-Options'        => 'SAMEORIGIN',
        'Referrer-Policy'        => 'strict-origin-when-cross-origin',
        'Permissions-Policy'     => 'camera=(), microphone=(), geolocation=()',
        'X-XSS-Protection'       => '0',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        foreach($this->always as $header => $value) {
            $response->headers->set($header, $value);
        }
        if(app()->environment('production') && $request->isSecure()) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
        }
        $csp = app()->environment('local')
            ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.bunny.net; font-src https://fonts.bunny.net; img-src 'self' data: blob:; connect-src 'self' ws: wss:;"
            : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.bunny.net; font-src https://fonts.bunny.net; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none';";
        $response->headers->set('Content-Security-Policy', $csp);
        return $response;
    }
}
