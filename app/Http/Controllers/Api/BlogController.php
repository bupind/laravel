<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(100, max(10, (int) $request->integer('per_page', 20)));
        $search = trim((string) $request->string('search'));

        $query = Blog::query()
            ->select([
                'id',
                'category_id',
                'image_media_id',
                'title',
                'slug',
                'excerpt',
                'status',
                'is_featured',
                'published_at',
                'created_at',
            ])
            ->with([
                'category:id,name,slug',
                'tags:id,name,slug',
                'imageMedia',
            ])
            ->whereIn('status', ['draft', 'published', 'archived'])
            ->orderByDesc('id');

        if ($request->boolean('published_only')) {
            $query->where('status', 'published')
                ->whereNotNull('published_at')
                ->where('published_at', '<=', now());
        }

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', '%' . $search . '%')
                    ->orWhere('slug', 'like', '%' . $search . '%')
                    ->orWhere('excerpt', 'like', '%' . $search . '%');
            });
        }

        $status = (string) $request->string('status');
        if ($status !== '') {
            $query->where('status', $status);
        }

        $categoryId = $request->integer('category_id');
        if ($categoryId > 0) {
            $query->where('category_id', $categoryId);
        }

        $tagId = $request->integer('tag_id');
        if ($tagId > 0) {
            $query->whereHas('tags', fn ($builder) => $builder->where('tags.id', $tagId));
        }

        return response()->json($query->paginate($perPage)->withQueryString());
    }

    public function show(Blog $blog): JsonResponse
    {
        $blog->load([
            'category:id,name,slug',
            'tags:id,name,slug',
            'imageMedia',
        ]);

        return response()->json([
            'data' => $blog,
        ]);
    }
}

