<?php

namespace App\Models;
use App\Models\Permissions;
use Illuminate\Database\Eloquent\Model;
class Roles extends Model
{
    protected $table="roles";
    protected $fillable = [
        'name',
        'guard_name'
    ];

    public function permissions()
    {
        return $this->belongsToMany(Permissions::class, 'role_has_permissions', 'role_id', 'permission_id');
    }

}
