<?php

namespace App\Http\Controllers\Backend;

use App\Models\Tag;
use App\Support\Slugs\GeneratesUniqueSlug;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TagController extends BaseCrudController
{
    use GeneratesUniqueSlug;

    protected int $perPage = 25;
    protected array $perPageOptions = [25, 50, 100];
    protected array $sortableColumns = ['id', 'name', 'slug', 'is_active', 'created_at'];
    protected array $searchableColumns = ['name', 'slug'];
    protected array $select = ['id', 'name', 'slug', 'description', 'is_active', 'created_at'];
    protected array $withCount = ['blogs'];
    protected array $exportColumns = ['id', 'name', 'slug', 'is_active', 'created_at'];
    protected array $exportColumnLabels = [
        'is_active' => 'active',
    ];
    protected bool $searchPrefix = true;

    protected function modelClass(): string
    {
        return Tag::class;
    }

    protected function routeName(): string
    {
        return 'tags';
    }

    protected function indexComponent(): string
    {
        return 'backend/tags/Index';
    }

    protected function formComponent(): string
    {
        return 'backend/tags/Form';
    }

    protected function rules(?Model $record = null): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => [
                'nullable',
                'string',
                'max:150',
                Rule::unique('tags', 'slug')->ignore($record?->getKey()),
            ],
            'description' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    protected function beforeStore(array $validated, Request $request): array
    {
        $slugSeed = (string) ($validated['slug'] ?? $validated['name']);
        $validated['slug'] = $this->resolveUniqueSlug(Tag::class, $slugSeed);

        return $validated;
    }

    protected function beforeUpdate(array $validated, Request $request, Model $record): array
    {
        $slugSeed = (string) ($validated['slug'] ?? $validated['name']);
        $validated['slug'] = $this->resolveUniqueSlug(Tag::class, $slugSeed, (int) $record->getKey());

        return $validated;
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }
    }

    protected function additionalFormProps(Request $request, ?Model $record = null): array
    {
        return [
            'tag' => $record,
        ];
    }
}

