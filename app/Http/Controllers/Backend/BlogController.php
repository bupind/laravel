<?php

namespace App\Http\Controllers\Backend;

use App\Models\Blog;
use App\Models\Category;
use App\Models\Tag;
use App\Support\Slugs\GeneratesUniqueSlug;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class BlogController extends BaseCrudController
{
    use GeneratesUniqueSlug;

    protected bool $modal = false;
    protected int $perPage = 25;
    protected array $perPageOptions = [25, 50, 100];
    protected array $sortableColumns = ['id', 'title', 'status', 'published_at', 'created_at'];
    protected array $searchableColumns = ['title', 'slug', 'excerpt'];
    protected array $select = [
        'id',
        'user_id',
        'category_id',
        'image_media_id',
        'title',
        'slug',
        'excerpt',
        'status',
        'is_featured',
        'published_at',
        'created_at',
    ];
    protected array $with = [
        'category:id,name',
        'tags:id,name',
        'imageMedia',
    ];
    protected array $exportColumns = [
        'id',
        'title',
        'slug',
        'status',
        'is_featured',
        'published_at',
        'created_at',
    ];
    protected bool $searchPrefix = true;

    protected function modelClass(): string
    {
        return Blog::class;
    }

    protected function routeName(): string
    {
        return 'blogs';
    }

    protected function indexComponent(): string
    {
        return 'backend/blogs/Index';
    }

    protected function formComponent(): string
    {
        return 'backend/blogs/Form';
    }

    protected function rules(?Model $record = null): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'slug' => [
                'nullable',
                'string',
                'max:220',
                Rule::unique('blogs', 'slug')->ignore($record?->getKey()),
            ],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'image_media_id' => ['nullable', 'integer', 'exists:media,id'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'is_featured' => ['required', 'boolean'],
            'published_at' => ['nullable', 'date'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
        ];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        $status = (string) $request->string('status');
        if ($status !== '' && in_array($status, ['draft', 'published', 'archived'], true)) {
            $query->where('status', $status);
        }

        $categoryId = $request->integer('category_id');
        if ($categoryId > 0) {
            $query->where('category_id', $categoryId);
        }

        $tagId = $request->integer('tag_id');
        if ($tagId > 0) {
            $query->whereHas('tags', fn (Builder $builder) => $builder->where('tags.id', $tagId));
        }
    }

    protected function additionalIndexProps(Request $request): array
    {
        return [
            'categories' => Category::query()
                ->select(['id', 'name'])
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
            'tags' => Tag::query()
                ->select(['id', 'name'])
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
        ];
    }

    protected function additionalFormProps(Request $request, ?Model $record = null): array
    {
        return [
            'blog' => $record?->loadMissing(['tags:id,name', 'imageMedia', 'category:id,name']),
            'categories' => Category::query()
                ->select(['id', 'name'])
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
            'tags' => Tag::query()
                ->select(['id', 'name'])
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
        ];
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());
        $validated['slug'] = $this->resolveUniqueSlug(Blog::class, (string) ($validated['slug'] ?? $validated['title']));
        $validated['user_id'] = (int) $request->user()->getKey();
        $validated['published_at'] = $validated['status'] === 'published'
            ? ($validated['published_at'] ?? now())
            : null;

        $tagIds = $validated['tag_ids'] ?? [];
        unset($validated['tag_ids']);

        DB::transaction(function () use ($validated, $tagIds): void {
            /** @var Blog $blog */
            $blog = new Blog();
            $blog->fill($validated);
            $blog->save();
            $blog->tags()->sync($tagIds);
        });

        return redirect()
            ->route($this->routeName() . '.index')
            ->with('success', $this->flashMessage('notifications.blog.created'));
    }

    public function update(Request $request, mixed $record): RedirectResponse
    {
        /** @var Blog $blog */
        $blog = $this->resolveRecord($record);
        $validated = $request->validate($this->rules($blog));
        $validated['slug'] = $this->resolveUniqueSlug(Blog::class, (string) ($validated['slug'] ?? $validated['title']), (int) $blog->getKey());
        $validated['published_at'] = $validated['status'] === 'published'
            ? ($validated['published_at'] ?? now())
            : null;

        $tagIds = $validated['tag_ids'] ?? [];
        unset($validated['tag_ids']);

        DB::transaction(function () use ($blog, $validated, $tagIds): void {
            $blog->fill($validated);
            $blog->save();
            $blog->tags()->sync($tagIds);
        });

        return redirect()
            ->route($this->routeName() . '.index')
            ->with('success', $this->flashMessage('notifications.blog.updated'));
    }

    protected function deleteSuccessMessage(): string
    {
        return 'notifications.blog.deleted';
    }
}

