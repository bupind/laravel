<?php

namespace App\Http\Controllers\Backend;

use App\Models\NotificationTemplate;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NotificationTemplateController extends BaseCrudController
{
    protected bool $modal = false;
    protected ?string $resourceRouteName = 'notification-templates';
    protected ?string $resourceLabel = 'Notification Templates';
    protected ?string $resourceTitle = 'Notification Templates';
    protected ?string $permissionPrefix = 'notification-templates';
    protected string $orderBy = 'channel';
    protected string $orderDirection = 'asc';
    protected array $searchableColumns = [
        'channel',
        'event',
        'name',
        'subject',
        'body',
    ];
    protected array $sortableColumns = [
        'channel',
        'event',
        'name',
        'subject',
        'is_active',
        'updated_at',
    ];
    protected array $tableColumns = [
        'channel',
        'event',
        'name',
        'subject',
        [
            'key'  => 'is_active',
            'type' => 'checkbox',
        ],
        [
            'key'  => 'updated_at',
            'type' => 'datetime',
        ],
    ];
    protected array $formFields = [
        [
            'name'     => 'channel',
            'label'    => 'Channel',
            'type'     => 'select',
            'required' => true,
            'options'  => [
                ['value' => NotificationTemplate::CHANNEL_EMAIL, 'label' => 'Email'],
                ['value' => NotificationTemplate::CHANNEL_WHATSAPP, 'label' => 'WhatsApp'],
                ['value' => NotificationTemplate::CHANNEL_PAYMENT_GATEWAY, 'label' => 'Payment Gateway'],
            ],
        ],
        [
            'name'        => 'event',
            'label'       => 'Event',
            'required'    => true,
            'placeholder' => 'payment_created',
        ],
        [
            'name'     => 'name',
            'label'    => 'Name',
            'required' => true,
        ],
        [
            'name'        => 'subject',
            'label'       => 'Subject',
            'placeholder' => 'Hanya dipakai untuk email',
        ],
        [
            'name'     => 'body',
            'label'    => 'Body',
            'type'     => 'textarea',
            'required' => true,
            'rows'     => 10,
        ],
        [
            'name'        => 'variables',
            'label'       => 'Variables',
            'type'        => 'textarea',
            'placeholder' => 'app_name, name, external_id, amount, currency, invoice_url, status',
            'rows'        => 3,
        ],
        [
            'name'    => 'is_active',
            'label'   => 'Active',
            'type'    => 'checkbox',
            'default' => true,
        ],
        [
            'name'  => 'description',
            'label' => 'Description',
            'type'  => 'textarea',
            'rows'  => 3,
        ],
    ];

    protected function modelClass(): string
    {
        return NotificationTemplate::class;
    }

    protected function rules(?Model $record = null): array
    {
        return [
            'channel'     => [
                'required',
                'string',
                Rule::in(NotificationTemplate::channels()),
            ],
            'event'       => [
                'required',
                'string',
                'max:100',
                'regex:/^[A-Za-z0-9_.-]+$/',
                Rule::unique('notification_templates', 'event')
                    ->where(fn($query) => $query->where('channel', request('channel')))
                    ->ignore($record?->getKey()),
            ],
            'name'        => [
                'required',
                'string',
                'max:255',
            ],
            'subject'     => [
                'nullable',
                'string',
                'max:255',
            ],
            'body'        => [
                'required',
                'string',
            ],
            'variables'   => [
                'nullable',
                'string',
            ],
            'is_active'   => [
                'nullable',
                'boolean',
            ],
            'description' => [
                'nullable',
                'string',
            ],
        ];
    }

    protected function beforeStore(array $validated, Request $request): array
    {
        return parent::beforeStore($this->normalizePayload($validated), $request);
    }

    protected function beforeUpdate(array $validated, Request $request, Model $record): array
    {
        return parent::beforeUpdate($this->normalizePayload($validated), $request, $record);
    }

    private function normalizePayload(array $validated): array
    {
        $validated['subject'] = $this->nullableTrim($validated['subject'] ?? null);
        $validated['variables'] = $this->nullableTrim($validated['variables'] ?? null);
        $validated['description'] = $this->nullableTrim($validated['description'] ?? null);
        $validated['is_active'] = filter_var($validated['is_active'] ?? false, FILTER_VALIDATE_BOOL);

        return $validated;
    }

    private function nullableTrim(mixed $value): ?string
    {
        $value = trim((string)($value ?? ''));

        return $value === '' ? null : $value;
    }
}
