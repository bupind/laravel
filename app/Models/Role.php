<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    use HasUuids;

    // SpatieRole inherits from Model which already defines $incrementing.
    // We set these directly to avoid trait property conflicts.
    public    $incrementing = false;
    protected $keyType      = 'string';
}
