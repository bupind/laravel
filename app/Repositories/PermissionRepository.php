<?php

namespace App\Repositories;

use App\Traits\BaseDatatable;
use App\Traits\BaseRepository;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Str;

class PermissionRepository
{
    use BaseRepository;
    use BaseDatatable;
    public function __construct(Permission $model)
    {
        $this->model = $model;
        $this->with = ['roles'];
    }

    public function customTables($table)
    {
        $table->name->label('Permission');
        $table->add('roles', function ($model) {
            return $model->roles->map(function ($role) {
                $color = $role->name === 'admin' ? 'danger' : 'primary';
                return badge($role->name, $color);
            })->join(' ');
        })->label('Roles')->searchable(false);
    }
}
