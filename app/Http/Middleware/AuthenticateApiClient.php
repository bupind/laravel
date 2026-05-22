<?php

namespace App\Http\Middleware;

use App\Models\ApiClient;
use App\Support\Api\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiClient
{
    public function handle(Request $request, Closure $next): Response
    {
        $clientKey    = (string) $request->header('X-Client-Key', '');
        $clientSecret = (string) $request->header('X-Client-Secret', '');

        if ($clientKey === '' || $clientSecret === '') {
            return ApiResponse::make('Unauthorized', 'Missing API credentials.', 40101, 401);
        }

        // Rate-limit per key to slow brute-force attempts
        $rateLimitKey = 'api_auth:' . sha1($clientKey . '|' . $request->ip());
        if (RateLimiter::tooManyAttempts($rateLimitKey, 20)) {
            return ApiResponse::make('Too Many Requests', 'Too many authentication attempts.', 42901, 429);
        }

        $client = ApiClient::findForCredentials($clientKey, $clientSecret);

        if ($client === null || ! $client->allowsIp($request->ip())) {
            RateLimiter::hit($rateLimitKey, 60);

            // Return same message for invalid key and invalid IP to avoid enumeration
            return ApiResponse::make('Unauthorized', 'Invalid API credentials.', 40102, 401);
        }

        RateLimiter::clear($rateLimitKey);

        $request->attributes->set('api_client', $client);

        $response = $next($request);

        $client->recordUsage($request, $response->getStatusCode());

        return $response;
    }
}
