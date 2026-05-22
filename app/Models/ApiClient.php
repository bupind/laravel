<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ApiClient extends Model
{
    use UsesUuid;

    protected $fillable = [
        'name',
        'client_key',
        'client_secret',
        'description',
        'allowed_ips',
        'is_active',
        'expires_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'allowed_ips'          => 'array',
        'is_active'            => 'boolean',
        'expires_at'           => 'datetime',
        'last_used_at'         => 'datetime',
        'last_response_status' => 'integer',
        'total_requests'       => 'integer',
    ];

    // Never expose client_secret in JSON responses
    protected $hidden = ['client_secret'];

    public static function generateClientKey(): string
    {
        return 'ck_' . Str::random(40);
    }

    public static function generateClientSecret(): string
    {
        return Str::random(64);
    }

    /**
     * Look up an active, non-expired client by key, then verify the secret
     * with a constant-time comparison to prevent timing attacks.
     */
    public static function findForCredentials(string $clientKey, string $clientSecret): ?self
    {
        /** @var self|null $client */
        $client = self::query()
            ->where('client_key', $clientKey)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();

        if ($client === null) {
            // Run hash_equals against a dummy value to prevent timing differences
            hash_equals(hash('sha256', 'dummy'), hash('sha256', $clientSecret));
            return null;
        }

        if (! hash_equals((string) $client->client_secret, $clientSecret)) {
            return null;
        }

        return $client;
    }

    public function allowsIp(?string $ip): bool
    {
        $allowedIps = $this->allowed_ips ?? [];

        if ($allowedIps === [] || $ip === null) {
            return true;
        }

        return in_array($ip, $allowedIps, true);
    }

    /**
     * Record usage without touching updated_at on the model instance
     * (avoids triggering observers or extra events).
     */
    public function recordUsage(Request $request, ?int $status = null): void
    {
        self::query()
            ->whereKey($this->getKey())
            ->update([
                'last_used_at'         => now(),
                'last_request_path'    => $request->path(),
                'last_request_ip'      => $request->ip(),
                'last_response_status' => $status,
                'total_requests'       => DB::raw('total_requests + 1'),
                'updated_at'           => now(),
            ]);
    }
}
