<?php

namespace App\Http\Controllers\Backend;

use App\Models\Page;
use App\Services\Translations\TranslationService;
use App\Support\Slugs\GeneratesUniqueSlug;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

class PageController extends BaseCrudController
{
    use GeneratesUniqueSlug;

    protected bool    $useTransactions   = true;
    protected bool    $modal             = true;
    protected ?string $resourceRouteName = 'pages';
    protected ?string $resourceLabel     = 'Pages';
    protected string  $modalSize         = 'xl';
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
        'title',
        'slug',
        'status',
        'created_at',
    ];
    protected array   $tableColumns      = [
        [
            'key'   => 'title_text',
            'label' => 'Title',
            'type'  => 'text',
        ],
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
            'key'   => 'status',
            'label' => 'Status',
            'type'  => 'select',
        ],
    ];
    protected array   $formFields        = [
        [
            'name'     => 'title',
            'label'    => 'Title',
            'type'     => 'translatable',
            'required' => true,
            'col'      => 12,
        ],
        [
            'name'  => 'slug',
            'label' => 'Slug',
            'help'  => 'Optional. Leave blank to generate from title. Public URL: /pages/{slug}. Contact uses the dedicated /contact form, not a dynamic page.',
            'col'   => 6,
        ],
        [
            'name'  => 'media_id',
            'label' => 'Featured Image / Media',
            'type'  => 'media',
            'help'  => 'Optional. Choose or upload an image from the file library. Stored as media_id.',
            'col'   => 6,
        ],
        [
            'name'  => 'excerpt',
            'label' => 'Excerpt',
            'type'  => 'translatable',
            'rows'  => 3,
            'col'   => 12,
        ],
        [
            'name'    => 'content',
            'label'   => 'Content',
            'type'    => 'translatable',
            'wysiwyg' => true,
            'rows'    => 10,
            'help'    => 'Rich text editor. Supports headings, bold, lists, links, and more.',
            'col'     => 12,
        ],
        [
            'name'  => 'meta_title',
            'label' => 'SEO Title',
            'type'  => 'translatable',
            'col'   => 6,
        ],
        [
            'name'  => 'meta_description',
            'label' => 'SEO Description',
            'type'  => 'translatable',
            'col'   => 6,
        ],
        [
            'name'  => 'meta_keywords',
            'label' => 'SEO Keywords',
            'col'   => 6,
        ],
        [
            'name'    => 'status',
            'label'   => 'Status',
            'type'    => 'select',
            'default' => Page::STATUS_ACTIVE,
            'col'     => 6,
            'options' => [
                [
                    'value' => Page::STATUS_ACTIVE,
                    'label' => 'Active'
                ],
                [
                    'value' => Page::STATUS_INACTIVE,
                    'label' => 'Inactive'
                ],
            ],
        ],
    ];

    protected function resolvedFormFields(): array
    {
        $locales = app(TranslationService::class)->localeOptions();
        return array_map(function(array $field) use ($locales): array {
            if(($field['type'] ?? null) === 'translatable') {
                $field['locales'] = $locales;
            }
            return $field;
        }, parent::resolvedFormFields());
    }

    protected function modelClass(): string
    {
        return Page::class;
    }

    protected function beforeStore(array $validated, Request $request): array
    {
        $validated         = $this->normalizeTranslatablePayload($validated);
        $validated['slug'] = $this->normalizeSlugValue($validated['slug'] ?? '', $this->defaultLocaleValue($validated['title'] ?? [], 'page'));
        return $this->applyGeneratedSlug($validated);
    }

    private function normalizeSlugValue(string $slug, string $title): string
    {
        $slug = trim($slug);
        return $slug !== '' ? $slug : $title;
    }

    protected function beforeUpdate(array $validated, Request $request, Model $record): array
    {
        $validated         = $this->normalizeTranslatablePayload($validated);
        $validated['slug'] = $this->normalizeSlugValue($validated['slug'] ?? '', $this->defaultLocaleValue($validated['title'] ?? [], 'page'));
        return $this->applyGeneratedSlug($validated, $record);
    }

    private function normalizeTranslatablePayload(array $validated): array
    {
        foreach([
                    'title',
                    'excerpt',
                    'content',
                    'meta_title',
                    'meta_description',
                    'meta_keywords',
                ] as $field) {
            $validated[$field] = $this->onlyActiveLocaleValues($validated[$field] ?? []);
        }
        return $validated;
    }

    private function onlyActiveLocaleValues(mixed $value): array
    {
        $values     = is_array($value) ? $value : [];
        $normalized = [];
        foreach(app(TranslationService::class)->localeOptions() as $locale) {
            $code              = $locale['code'];
            $normalized[$code] = trim((string)($values[$code] ?? ''));
        }
        return $normalized;
    }

    private function defaultLocaleValue(mixed $values, string $fallback): string
    {
        if(!is_array($values)) {
            $value = trim((string)$values);
            return $value !== '' ? $value : $fallback;
        }
        $defaultLocale = app(TranslationService::class)->defaultLocale();
        $value         = trim((string)($values[$defaultLocale] ?? ''));
        if($value !== '') {
            return $value;
        }
        foreach($values as $candidate) {
            $candidate = trim((string)$candidate);
            if($candidate !== '') {
                return $candidate;
            }
        }
        return $fallback;
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
                'array'
            ],
            ...$this->localeValueRules('title', true, 255),
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
            'excerpt'          => [
                'nullable',
                'array'
            ],
            ...$this->localeValueRules('excerpt'),
            'content'          => [
                'nullable',
                'array'
            ],
            ...$this->localeValueRules('content'),
            'meta_title'       => [
                'nullable',
                'array'
            ],
            ...$this->localeValueRules('meta_title', false, 255),
            'meta_description' => [
                'nullable',
                'array'
            ],
            ...$this->localeValueRules('meta_description'),
            'meta_keywords'    => [
                'nullable',
                'array'
            ],
            ...$this->localeValueRules('meta_keywords', false, 255),
            'status'           => [
                'required',
                'string',
                Rule::in(Page::statuses()),
            ],
        ];
    }

    private function localeValueRules(string $field, bool $required = false, ?int $max = null): array
    {
        $rules = [];
        foreach(app(TranslationService::class)->locales() as $locale) {
            $fieldRules = [
                $required ? 'required' : 'nullable',
                'string'
            ];
            if($max !== null) {
                $fieldRules[] = "max:{$max}";
            }
            $rules["{$field}.{$locale}"] = $fieldRules;
        }
        return $rules;
    }
}
