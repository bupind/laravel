<?php

namespace App\Services\Files;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class FileLibraryService
{
    public function paginateForUser(
        User $user,
        int $perPage = 20,
        ?string $search = null,
        ?int $folderId = null,
    ): LengthAwarePaginator {
        return $user
            ->media()
            ->where('collection_name', 'files')
            ->when($search, function ($query, $searchTerm) {
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'like', '%' . $searchTerm . '%')
                        ->orWhere('file_name', 'like', '%' . $searchTerm . '%');
                });
            })
            ->when($folderId, function ($query, $value) {
                $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(custom_properties, '$.folder_id')) = ?", [(string) $value]);
            }, function ($query) {
                $query->where(function ($q) {
                    $q->whereNull('custom_properties->folder_id')
                        ->orWhereRaw("JSON_EXTRACT(custom_properties, '$.folder_id') IS NULL");
                });
            })
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }
}

