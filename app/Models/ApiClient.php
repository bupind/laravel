<?php
/**
 * ApiClient
 * @author  bupind
 * @created 2026-05-20
 */

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ApiClient extends Model
{
    use UsesUuid;

    public const STATUS_ACTIVE   = 'active';
    public const STATUS_INACTIVE = 'inactive';

    protected $fillable = [
        'name',
        'client_key',
        'client_secret',
        'description',
        'allowed_ips',
        'status',
        'expires_at',
        'created_by',
        'updated_by',
    ];
    protected $casts    = [
        'allowed_ips'          => 'array',
        'expires_at'           => 'datetime',
        'last_used_at'         => 'datetime',
        'last_response_status' => 'integer',
        'total_requests'       => 'integer',
    ];
    protected $hidden   = ['client_secret'];

    public static function statuses(): array
    {
        return [
            self::STATUS_ACTIVE,
            self::STATUS_INACTIVE,
        ];
    }

    public static function generateClientKey(): string
    {
        return 'ck_' . Str::random(40);
    }

    public static function generateClientSecret(): string
    {
        return Str::random(64);
    }

    public static function findForCredentials(string $clientKey, string $clientSecret): ?self
    {
        $client = self::query()
            ->where('client_key', $clientKey)
            ->where('status', self::STATUS_ACTIVE)
            ->where(function($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();
        if($client === null) {
            hash_equals(hash('sha256', 'dummy'), hash('sha256', $clientSecret));
            return null;
        }
        if(!hash_equals((string)$client->client_secret, $clientSecret)) {
            return null;
        }
        return $client;
    }

    public function allowsIp(?string $ip): bool
    {
        $allowedIps = $this->allowed_ips ?? [];
        if($allowedIps === [] || $ip === null) {
            return true;
        }
        return in_array($ip, $allowedIps, true);
    }

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
