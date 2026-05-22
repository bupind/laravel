<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * SecurityHeaders
 *
 * Tambahkan HTTP security headers pada setiap response.
 *
 * Daftarkan di bootstrap/app.php:
 *   $middleware->web(append: [SecurityHeaders::class, ...]);
 *   $middleware->api(append: [SecurityHeaders::class, ...]);
 */
class SecurityHeaders
{
    /**
     * Header yang selalu dikirim (web + api).
     */
    private array $always = [
        'X-Content-Type-Options'  => 'nosniff',
        'X-Frame-Options'         => 'SAMEORIGIN',
        'Referrer-Policy'         => 'strict-origin-when-cross-origin',
        'Permissions-Policy'      => 'camera=(), microphone=(), geolocation=()',
        'X-XSS-Protection'        => '0', // Deprecated; CSP lebih aman
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        foreach ($this->always as $header => $value) {
            $response->headers->set($header, $value);
        }

        // HSTS hanya di production dan hanya untuk HTTPS
        if (app()->environment('production') && $request->isSecure()) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
        }

        // Content-Security-Policy — sesuaikan dengan kebutuhan app
        // Izinkan font bunny.net dan Vite HMR di local
        $csp = app()->environment('local')
            ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.bunny.net; font-src https://fonts.bunny.net; img-src 'self' data: blob:; connect-src 'self' ws: wss:;"
            : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.bunny.net; font-src https://fonts.bunny.net; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none';";

        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}
