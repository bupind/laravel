<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(100, max(10, (int) $request->integer('per_page', 20)));
        $search = trim((string) $request->string('search'));

        $query = Tag::query()
            ->select(['id', 'name', 'slug', 'description', 'is_active', 'created_at'])
            ->withCount('blogs')
            ->orderBy('name');

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', $search . '%')
                    ->orWhere('slug', 'like', $search . '%');
            });
        }

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        return response()->json($query->paginate($perPage)->withQueryString());
    }
}

