<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $categorySlug = trim((string) $request->string('category'));
        $tagSlug = trim((string) $request->string('tag'));
        $perPage = min(24, max(6, (int) $request->integer('per_page', 12)));

        $blogs = Blog::query()
            ->select([
                'id',
                'category_id',
                'image_media_id',
                'title',
                'slug',
                'excerpt',
                'status',
                'published_at',
                'created_at',
            ])
            ->with([
                'category:id,name,slug',
                'tags:id,name,slug',
                'imageMedia',
            ])
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($builder) use ($search) {
                    $builder->where('title', 'like', '%' . $search . '%')
                        ->orWhere('excerpt', 'like', '%' . $search . '%');
                });
            })
            ->when($categorySlug !== '', function ($query) use ($categorySlug) {
                $query->whereHas('category', fn ($builder) => $builder->where('slug', $categorySlug));
            })
            ->when($tagSlug !== '', function ($query) use ($tagSlug) {
                $query->whereHas('tags', fn ($builder) => $builder->where('slug', $tagSlug));
            })
            ->orderByDesc('published_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('frontend/blogs/index', [
            'blogs' => $blogs,
            'categories' => Category::query()
                ->select(['id', 'name', 'slug'])
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
            'tags' => Tag::query()
                ->select(['id', 'name', 'slug'])
                ->where('is_active', true)
                ->orderBy('name')
                ->limit(60)
                ->get(),
            'filters' => [
                'search' => $search,
                'category' => $categorySlug,
                'tag' => $tagSlug,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function show(Blog $blog): Response
    {
        abort_unless(
            $blog->status === 'published'
                && $blog->published_at !== null
                && $blog->published_at->lte(now()),
            404,
        );

        $blog->load([
            'category:id,name,slug',
            'tags:id,name,slug',
            'imageMedia',
        ]);

        $relatedBlogs = Blog::query()
            ->select([
                'id',
                'category_id',
                'image_media_id',
                'title',
                'slug',
                'excerpt',
                'published_at',
            ])
            ->with(['category:id,name,slug', 'imageMedia'])
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->whereKeyNot($blog->getKey())
            ->when($blog->category_id, fn ($query) => $query->where('category_id', $blog->category_id))
            ->orderByDesc('published_at')
            ->limit(4)
            ->get();

        return Inertia::render('frontend/blogs/show', [
            'blog' => $blog,
            'relatedBlogs' => $relatedBlogs,
        ]);
    }
}

