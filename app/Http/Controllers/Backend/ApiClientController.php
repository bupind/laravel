<?php

namespace App\Http\Controllers\Backend;

use App\Models\ApiClient;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Throwable;

class ApiClientController extends BaseCrudController
{
    protected ?string $resourceRouteName = 'api-clients';
    protected ?string $resourceLabel     = 'API Clients';
    protected ?string $resourceTitle     = 'API Client Credentials';
    protected string  $orderBy           = 'created_at';
    protected array   $searchableColumns = [
        'name',
        'client_key',
        'description',
    ];
    protected array   $sortableColumns   = [
        'name',
        'client_key',
        'is_active',
        'expires_at',
        'last_used_at',
        'total_requests',
        'created_at',
    ];
    protected array   $tableColumns      = [
        'name',
        'client_key',
        'client_secret',
        [
            'key'   => 'is_active',
            'label' => 'Active',
            'type'  => 'checkbox'
        ],
        [
            'key'   => 'last_used_at',
            'label' => 'Last Used',
            'type'  => 'datetime'
        ],
        [
            'key'   => 'last_request_ip',
            'label' => 'Last IP'
        ],
        [
            'key'   => 'last_response_status',
            'label' => 'Last Status',
            'type'  => 'number'
        ],
        [
            'key'   => 'total_requests',
            'label' => 'Requests',
            'type'  => 'number'
        ],
        [
            'key'   => 'expires_at',
            'label' => 'Expires At',
            'type'  => 'datetime'
        ],
    ];
    protected array   $formFields        = [
        [
            'name'     => 'name',
            'label'    => 'Name',
            'required' => true
        ],
        [
            'name'        => 'client_key',
            'label'       => 'Client Key',
            'placeholder' => 'Kosongkan untuk generate otomatis'
        ],
        [
            'name'        => 'client_secret',
            'label'       => 'Client Secret',
            'placeholder' => 'Isi untuk membuat/mengganti secret'
        ],
        [
            'name'  => 'description',
            'label' => 'Description',
            'type'  => 'textarea'
        ],
        [
            'name'        => 'allowed_ips',
            'label'       => 'Allowed IPs',
            'type'        => 'textarea',
            'placeholder' => 'Satu IP per baris atau pisahkan dengan koma'
        ],
        [
            'name'    => 'is_active',
            'label'   => 'Active',
            'type'    => 'checkbox',
            'default' => true
        ],
        [
            'name'  => 'expires_at',
            'label' => 'Expires At',
            'type'  => 'datetime'
        ],
    ];

    protected function modelClass(): string
    {
        return ApiClient::class;
    }

    protected function userCan(string $action): bool
    {
        return parent::userCan($action) || $this->userCanFallbackSettings();
    }

    private function userCanFallbackSettings(): bool
    {
        $user = request()->user();
        if($user === null) {
            return false;
        }
        try {
            return method_exists($user, 'can') && $user->can('settings-view');
        } catch(Throwable) {
            return false;
        }
    }

    protected function rules(?Model $record = null): array
    {
        return [
            'name'          => [
                'required',
                'string',
                'max:255',
            ],
            'client_key'    => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('api_clients', 'client_key')->ignore($record?->getKey()),
            ],
            'client_secret' => [
                $record === null ? 'required' : 'nullable',
                'string',
                'max:255',
            ],
            'description'   => [
                'nullable',
                'string',
            ],
            'allowed_ips'   => [
                'nullable',
            ],
            'is_active'     => [
                'boolean',
            ],
            'expires_at'    => [
                'nullable',
                'date',
            ],
        ];
    }

    protected function beforeStore(array $validated, Request $request): array
    {
        $validated               = $this->normalizeCredentialPayload($validated);
        $validated['created_by'] = $request->user()?->getKey();
        $validated['updated_by'] = $request->user()?->getKey();
        return parent::beforeStore($validated, $request);
    }

    private function normalizeCredentialPayload(array $validated): array
    {
        if(empty($validated['client_key'])) {
            $validated['client_key'] = ApiClient::generateClientKey();
        }
        if(array_key_exists('allowed_ips', $validated)) {
            $validated['allowed_ips'] = $this->normalizeAllowedIps($validated['allowed_ips']);
        }
        return $validated;
    }

    private function normalizeAllowedIps(mixed $value): ?array
    {
        return $this->normalizeList($value);
    }

    private function normalizeList(mixed $value): ?array
    {
        if(is_array($value)) {
            $items = $value;
        } else {
            $items = preg_split('/[\r\n,]+/', (string)$value) ?: [];
        }
        $items = collect($items)
            ->map(fn(mixed $item) => trim((string)$item))
            ->filter()
            ->unique()
            ->values()
            ->all();
        return $items === [] ? null : $items;
    }

    protected function beforeUpdate(array $validated, Request $request, Model $record): array
    {
        if(array_key_exists('client_secret', $validated) && blank($validated['client_secret'])) {
            unset($validated['client_secret']);
        }
        $validated               = $this->normalizeCredentialPayload($validated);
        $validated['updated_by'] = $request->user()?->getKey();
        return parent::beforeUpdate($validated, $request, $record);
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }
    }
}
