<?php

namespace App\Http\Controllers\Backend;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends BaseCrudController
{
    protected bool   $useTransactions   = true;
    protected bool    $searchPrefix      = true;
    protected ?string $resourceRouteName = 'products';
    protected ?string $resourceLabel     = 'Products';
    protected ?string $resourceTitle     = 'Products';
    protected string  $orderBy           = 'created_at';
    protected array   $with              = ['media'];
    protected array   $searchableColumns = [
        'name',
        'sku',
        'description',
    ];
    protected array   $sortableColumns   = [
        'name',
        'sku',
        'price',
        'stock',
        'status',
        'created_at',
    ];
    protected array   $tableColumns      = [
        'name',
        'sku',
        [
            'key'   => 'image_url',
            'label' => 'Image',
            'type'  => 'media'
        ],
        [
            'key'   => 'price',
            'label' => 'Price',
            'type'  => 'number'
        ],
        [
            'key'   => 'stock',
            'label' => 'Stock',
            'type'  => 'number'
        ],
        'status',
        [
            'key'   => 'created_at',
            'label' => 'Created At',
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
            'name'     => 'sku',
            'label'    => 'SKU',
            'required' => true
        ],
        [
            'name'  => 'media_id',
            'label' => 'Image',
            'type'  => 'media'
        ],
        [
            'name'  => 'description',
            'label' => 'Description',
            'type'  => 'textarea'
        ],
        [
            'name'    => 'price',
            'label'   => 'Price',
            'type'    => 'number',
            'default' => 0
        ],
        [
            'name'    => 'stock',
            'label'   => 'Stock',
            'type'    => 'number',
            'default' => 0
        ],
        [
            'name'    => 'status',
            'label'   => 'Status',
            'type'    => 'select',
            'default' => Product::STATUS_DRAFT,
            'options' => [
                [
                    'value' => Product::STATUS_DRAFT,
                    'label' => 'Draft'
                ],
                [
                    'value' => Product::STATUS_ACTIVE,
                    'label' => 'Active'
                ],
                [
                    'value' => Product::STATUS_INACTIVE,
                    'label' => 'Inactive'
                ],
            ],
        ],
    ];

    protected function modelClass(): string
    {
        return Product::class;
    }

    protected function rules(?Model $record = null): array
    {
        return [
            'name'        => [
                'required',
                'string',
                'max:255',
            ],
            'sku'         => [
                'required',
                'string',
                'max:100',
                Rule::unique('products', 'sku')->ignore($record?->getKey()),
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'media_id'    => [
                'nullable',
                'uuid',
                'exists:media,id',
            ],
            'price'       => [
                'required',
                'numeric',
                'min:0',
            ],
            'stock'       => [
                'required',
                'integer',
                'min:0',
            ],
            'status'      => [
                'required',
                Rule::in(Product::statuses()),
            ],
        ];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if($request->filled('status')) {
            $query->where('status', (string)$request->string('status'));
        }
    }
}
