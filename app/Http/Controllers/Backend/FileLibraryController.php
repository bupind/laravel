<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Services\Files\FileLibraryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FileLibraryController extends Controller
{
    public function __construct(
        protected FileLibraryService $fileLibraryService,
    )
    {
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search'    => [
                'nullable',
                'string',
                'max:100'
            ],
            'folder_id' => [
                'nullable',
                'string',
                'uuid',
                Rule::exists('media_folders', 'id')
                    ->where(fn ($query) => $query->where('user_id', $request->user()->id)),
            ],
            'per_page'  => [
                'nullable',
                'integer',
                'min:10',
                'max:100'
            ],
        ]);
        $perPage   = (int)($validated['per_page'] ?? 20);
        $search    = isset($validated['search']) ? trim((string)$validated['search']) : null;
        $folderId  = $validated['folder_id'] ?? null;
        $paginator = $this->fileLibraryService->paginateForUser(
            user    : $request->user(),
            perPage : $perPage,
            search  : $search !== '' ? $search : null,
            folderId: $folderId,
        );
        return response()->json([
            'data' => collect($paginator->items())->map(fn($media) => [
                'id'         => $media->id,
                'name'       => $media->name,
                'file_name'  => $media->file_name,
                'mime_type'  => $media->mime_type,
                'size'       => $media->humanReadableSize,
                'url'        => $media->getFullUrl(),
                'created_at' => $media->created_at?->toDateTimeString(),
            ])->values(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }

    public function folders(Request $request): JsonResponse
    {
        $folders = $request->user()
            ->mediaFolders()
            ->select([
                'id',
                'name',
                'parent_id'
            ])
            ->orderBy('name')
            ->get();
        return response()->json([
            'data' => $folders,
        ]);
    }
}
