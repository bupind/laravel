<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Roles extends SpatieRole
{
    const ROLE_SUPERUSER = 'superuser';
    const ROLE_ADMINISTRATOR = 'administrator';
    protected $table = "roles";
    protected $fillable = [
        'name',
        'guard_name'
    ];
    protected $appends = ['permission_names'];


    public function getPermissionNamesAttribute()
    {
        return $this->permissions->pluck('name')->toArray();
    }
}
