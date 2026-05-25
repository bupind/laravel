<?php

namespace App\Http\Controllers\Backend;

use App\Models\Slider;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class SliderController extends BaseCrudController
{
    protected bool    $useTransactions   = true;
    protected ?string $resourceRouteName = 'sliders';
    protected ?string $resourceLabel     = 'Sliders';
    protected ?string $resourceTitle     = 'Sliders';
    protected string  $orderBy           = 'sort_order';
    protected string  $orderDirection    = 'asc';
    protected array   $with              = ['media'];
    protected array   $searchableColumns = [
        'title',
        'title_accent',
        'description',
    ];
    protected array   $sortableColumns   = [
        'sort_order',
        'title',
        'status',
        'created_at',
    ];
    protected array   $tableColumns      = [
        [
            'key'   => 'image_url',
            'label' => 'Image',
            'type'  => 'media',
        ],
        'title',
        'title_accent',
        'button_label',
        'button_url',
        [
            'key'   => 'sort_order',
            'label' => 'Order',
            'type'  => 'number',
        ],
        [
            'key'   => 'status',
            'label' => 'Status',
            'type'  => 'select',
        ],
    ];
    protected array   $formFields        = [
        [
            'name'     => 'title',
            'label'    => 'Title',
            'required' => true,
        ],
        [
            'name'  => 'title_accent',
            'label' => 'Accent Title',
        ],
        [
            'name'  => 'description',
            'label' => 'Description',
            'type'  => 'textarea',
        ],
        [
            'name'  => 'media_id',
            'label' => 'Image',
            'type'  => 'media',
            'help'  => 'Optional. Used before external image URL when selected.',
        ],
        [
            'name'  => 'external_image_url',
            'label' => 'External Image URL',
            'type'  => 'text',
        ],
        [
            'name'  => 'button_label',
            'label' => 'Button Label',
        ],
        [
            'name'  => 'button_url',
            'label' => 'Button URL',
        ],
        [
            'name'    => 'sort_order',
            'label'   => 'Order',
            'type'    => 'number',
            'default' => 0,
        ],
        [
            'name'    => 'status',
            'label'   => 'Status',
            'type'    => 'select',
            'default' => Slider::STATUS_ACTIVE,
            'options' => [
                [
                    'value' => Slider::STATUS_ACTIVE,
                    'label' => 'Active',
                ],
                [
                    'value' => Slider::STATUS_INACTIVE,
                    'label' => 'Inactive',
                ],
            ],
        ],
    ];

    protected function modelClass(): string
    {
        return Slider::class;
    }

    protected function rules(?Model $record = null): array
    {
        return [
            'title'              => [
                'required',
                'string',
                'max:255',
            ],
            'title_accent'       => [
                'nullable',
                'string',
                'max:255',
            ],
            'description'        => [
                'nullable',
                'string',
            ],
            'media_id'           => [
                'nullable',
                'uuid',
                'exists:media,id',
            ],
            'external_image_url' => [
                'nullable',
                'url',
                'max:255',
            ],
            'button_label'       => [
                'nullable',
                'string',
                'max:100',
            ],
            'button_url'         => [
                'nullable',
                'string',
                'max:255',
            ],
            'sort_order'         => [
                'required',
                'integer',
                'min:0',
            ],
            'status'             => [
                'required',
                'string',
                Rule::in(Slider::statuses()),
            ],
        ];
    }
}
