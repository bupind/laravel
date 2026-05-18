<?php

namespace App\Http\Controllers\Backend;

use App\Models\Category;
use App\Models\Blog;
use App\Support\Slugs\GeneratesUniqueSlug;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends BaseCrudController
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
        return Category::class;
    }

    protected function routeName(): string
    {
        return 'categories';
    }

    protected function indexComponent(): string
    {
        return 'backend/categories/Index';
    }

    protected function formComponent(): string
    {
        return 'backend/categories/Form';
    }

    protected function rules(?Model $record = null): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => [
                'nullable',
                'string',
                'max:150',
                Rule::unique('categories', 'slug')->ignore($record?->getKey()),
            ],
            'description' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    protected function beforeStore(array $validated, Request $request): array
    {
        $slugSeed = (string) ($validated['slug'] ?? $validated['name']);
        $validated['slug'] = $this->resolveUniqueSlug(Category::class, $slugSeed);

        return $validated;
    }

    protected function beforeUpdate(array $validated, Request $request, Model $record): array
    {
        $slugSeed = (string) ($validated['slug'] ?? $validated['name']);
        $validated['slug'] = $this->resolveUniqueSlug(Category::class, $slugSeed, (int) $record->getKey());

        return $validated;
    }

    protected function applyFilters(\Illuminate\Database\Eloquent\Builder $query, Request $request): void
    {
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }
    }

    protected function additionalFormProps(Request $request, ?Model $record = null): array
    {
        return [
            'category' => $record,
        ];
    }

    public function destroy(mixed $record): \Illuminate\Http\RedirectResponse
    {
        $category = $this->resolveRecord($record);

        $hasBlog = Blog::query()->where('category_id', $category->getKey())->exists();
        if ($hasBlog) {
            return redirect()
                ->route($this->routeName() . '.index')
                ->with('error', $this->flashMessage('notifications.category.in_use'));
        }

        return parent::destroy($category);
    }
}

