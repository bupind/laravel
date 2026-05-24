<?php

namespace App\Http\Controllers\Backend;

use App\Models\Service;
use Illuminate\Database\Eloquent\Model;

class ServiceController extends BaseCrudController
{
    protected bool    $useTransactions   = true;
    protected ?string $resourceRouteName = 'services';
    protected ?string $resourceLabel     = 'Services';
    protected ?string $resourceTitle     = 'Services';
    protected string  $orderBy           = 'sort_order';
    protected string  $orderDirection    = 'asc';
    protected array   $searchableColumns = [
        'title',
        'description',
    ];
    protected array   $sortableColumns   = [
        'sort_order',
        'title',
        'is_active',
        'created_at',
    ];
    protected array   $tableColumns      = [
        'title',
        'icon',
        'link_url',
        [
            'key'   => 'sort_order',
            'label' => 'Order',
            'type'  => 'number',
        ],
        [
            'key'   => 'is_active',
            'label' => 'Active',
            'type'  => 'checkbox',
        ],
    ];
    protected array   $formFields        = [
        [
            'name'     => 'title',
            'label'    => 'Title',
            'required' => true,
        ],
        [
            'name'  => 'description',
            'label' => 'Description',
            'type'  => 'textarea',
        ],
        [
            'name'    => 'icon',
            'label'   => 'Icon',
            'type'    => 'text',
            'default' => '',
            'help'    => 'Isi nama icon Lucide yang tersedia, misalnya ShieldCheck, Network, atau Star.',
        ],
        [
            'name'  => 'link_url',
            'label' => 'Link URL',
        ],
        [
            'name'    => 'sort_order',
            'label'   => 'Order',
            'type'    => 'number',
            'default' => 0,
        ],
        [
            'name'    => 'is_active',
            'label'   => 'Active',
            'type'    => 'checkbox',
            'default' => true,
        ],
    ];

    protected function modelClass(): string
    {
        return Service::class;
    }

    protected function rules(?Model $record = null): array
    {
        return [
            'title'       => [
                'required',
                'string',
                'max:255',
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'icon'        => [
                'nullable',
                'string',
                'max:100',
            ],
            'link_url'    => [
                'nullable',
                'string',
                'max:255',
            ],
            'sort_order'  => [
                'required',
                'integer',
                'min:0',
            ],
            'is_active'   => [
                'required',
                'boolean',
            ],
        ];
    }
}
