<?php

namespace App\Http\Controllers\Backend;

use App\Models\Page;
use App\Support\Slugs\GeneratesUniqueSlug;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

class PageController extends BaseCrudController
{
    use GeneratesUniqueSlug;

    protected bool    $useTransactions   = true;
    protected bool    $modal             = false;
    protected ?string $resourceRouteName = 'pages';
    protected ?string $resourceLabel     = 'Pages';
    protected ?string $resourceTitle     = 'Pages';
    protected ?string $permissionPrefix  = 'pages';
    protected ?string $formComponentName = 'backend/crud/Form';
    protected ?string $slugSourceColumn  = 'title';
    protected array   $with              = ['media'];
    protected string  $orderBy           = 'sort_order';
    protected string  $orderDirection    = 'asc';
    protected array   $searchableColumns = [
        'title',
        'slug',
        'excerpt',
        'content',
    ];
    protected array   $sortableColumns   = [
        'sort_order',
        'title',
        'slug',
        'template',
        'placement',
        'is_published',
        'created_at',
    ];
    protected array   $tableColumns      = [
        'title',
        'slug',
        [
            'key'   => 'media_url',
            'label' => 'Image',
            'type'  => 'media',
        ],
        [
            'key'   => 'url',
            'label' => 'URL',
            'type'  => 'text',
        ],
        [
            'key'   => 'template',
            'label' => 'Template',
            'type'  => 'text',
        ],
        [
            'key'   => 'placement',
            'label' => 'Placement',
            'type'  => 'text',
        ],
        [
            'key'   => 'sort_order',
            'label' => 'Order',
            'type'  => 'number',
        ],
        [
            'key'   => 'is_published',
            'label' => 'Published',
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
            'name'  => 'slug',
            'label' => 'Slug',
            'help'  => 'Optional. Leave blank to generate from title. Public URL: /pages/{slug}. Contact uses the dedicated /contact form, not a dynamic page.',
        ],
        [
            'name'  => 'media_id',
            'label' => 'Featured Image / Media',
            'type'  => 'media',
            'help'  => 'Optional. Choose or upload an image from the file library. Stored as media_id.',
        ],
        [
            'name'    => 'template',
            'label'   => 'Template',
            'type'    => 'select',
            'default' => 'default',
            'options' => [
                [
                    'value' => 'default',
                    'label' => 'Default'
                ],
                [
                    'value' => 'privacy',
                    'label' => 'Privacy Policy'
                ],
                [
                    'value' => 'about',
                    'label' => 'About Us'
                ],
                [
                    'value' => 'faqs',
                    'label' => 'FAQs'
                ],
            ],
        ],
        [
            'name'    => 'placement',
            'label'   => 'Show In Menu',
            'type'    => 'select',
            'default' => 'none',
            'options' => [
                [
                    'value' => 'none',
                    'label' => 'None'
                ],
                [
                    'value' => 'header',
                    'label' => 'Header'
                ],
                [
                    'value' => 'footer',
                    'label' => 'Footer'
                ],
                [
                    'value' => 'both',
                    'label' => 'Header & Footer'
                ],
            ],
        ],
        [
            'name'  => 'excerpt',
            'label' => 'Excerpt',
            'type'  => 'textarea',
        ],
        [
            'name'  => 'content',
            'label' => 'Content',
            'type'  => 'textarea',
            'help'  => 'HTML is supported. Use headings, paragraphs, lists, and links as needed.',
            'rows'  => 12,
        ],
        [
            'name'  => 'meta_title',
            'label' => 'SEO Title',
        ],
        [
            'name'  => 'meta_description',
            'label' => 'SEO Description',
            'type'  => 'textarea',
        ],
        [
            'name'  => 'meta_keywords',
            'label' => 'SEO Keywords',
        ],
        [
            'name'    => 'sort_order',
            'label'   => 'Order',
            'type'    => 'number',
            'default' => 0,
        ],
        [
            'name'    => 'is_published',
            'label'   => 'Published',
            'type'    => 'checkbox',
            'default' => true,
        ],
    ];

    protected function modelClass(): string
    {
        return Page::class;
    }

    protected function beforeStore(array $validated, Request $request): array
    {
        $validated['slug'] = $this->normalizeSlugValue($validated['slug'] ?? '', $validated['title'] ?? 'page');
        return $this->applyGeneratedSlug($validated);
    }

    private function normalizeSlugValue(string $slug, string $title): string
    {
        $slug = trim($slug);
        return $slug !== '' ? $slug : $title;
    }

    protected function beforeUpdate(array $validated, Request $request, Model $record): array
    {
        $validated['slug'] = $this->normalizeSlugValue($validated['slug'] ?? '', $validated['title'] ?? 'page');
        return $this->applyGeneratedSlug($validated, $record);
    }

    protected function afterStore(Model $record, array $validated, Request $request): void
    {
        Cache::forget('global_pages_frontend_v1');
    }

    protected function afterUpdate(Model $record, array $validated, Request $request): void
    {
        Cache::forget('global_pages_frontend_v1');
    }

    protected function afterDestroy(Model $record): void
    {
        Cache::forget('global_pages_frontend_v1');
    }

    protected function rules(?Model $record = null): array
    {
        $ignoreId = $record?->getKey();
        return [
            'title'            => [
                'required',
                'string',
                'max:255'
            ],
            'media_id'         => [
                'nullable',
                'uuid',
                'exists:media,id'
            ],
            'slug'             => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('pages', 'slug')->ignore($ignoreId),
            ],
            'template'         => [
                'required',
                'string',
                Rule::in([
                    'default',
                    'privacy',
                    'about',
                    'faqs'
                ])
            ],
            'placement'        => [
                'required',
                'string',
                Rule::in([
                    'none',
                    'header',
                    'footer',
                    'both'
                ])
            ],
            'excerpt'          => [
                'nullable',
                'string'
            ],
            'content'          => [
                'nullable',
                'string'
            ],
            'meta_title'       => [
                'nullable',
                'string',
                'max:255'
            ],
            'meta_description' => [
                'nullable',
                'string'
            ],
            'meta_keywords'    => [
                'nullable',
                'string',
                'max:255'
            ],
            'sort_order'       => [
                'required',
                'integer',
                'min:0'
            ],
            'is_published'     => [
                'required',
                'boolean'
            ],
        ];
    }
}
