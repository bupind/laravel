<?php

namespace App\Policies;

use App\Models\MediaFolder;
use App\Models\User;

class MediaFolderPolicy
{
    public function viewAny(User $user): bool
    {
        return false;
    }

    public function view(User $user, MediaFolder $mediaFolder): bool
    {
        return false;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, MediaFolder $mediaFolder): bool
    {
        return false;
    }

    public function delete(User $user, MediaFolder $folder): bool
    {
        return $user->id === $folder->user_id;
    }

    public function restore(User $user, MediaFolder $mediaFolder): bool
    {
        return false;
    }

    public function forceDelete(User $user, MediaFolder $mediaFolder): bool
    {
        return false;
    }
}
