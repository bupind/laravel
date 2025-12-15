<?php

namespace App\Repositories;

use App\Traits\BaseDatatable;
use App\Traits\BaseRepository;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Str;

class RoleRepository
{
    use BaseRepository;
    use BaseDatatable;
    private $permissionRepository;

    public function __construct(Role $model, PermissionRepository $permissionRepository)
    {
        $this->model = $model;
        $this->permissionRepository = $permissionRepository;
        $this->with = ['permissions'];
    }

    public function customTables($table)
    {
        $table->name->label('Role');
        $table->add('permissions', function ($model) {
            return $model->permissions->map(function ($permission) {
                return badge(str_replace('_', ' ', $permission->name), 'info');
            })->join(' ');
        })->label('Permissions')->searchable(false);
    }

    public function prepareDatatable($query, $data)
    {
        $query = $query->where('name', '!=', 'superadmin');
        return $data;
    }

    public function syncPermissions($id, array $permissions)
    {
        $role = $this->getById($id);
        $role->syncPermissions($permissions);
    }

    public function beforeAction($data, $method)
    {
        if ($method === 'delete') {
            if (Str::lower($data['name']) === 'superadmin') {
                return [
                    'error' => 1,
                    'message' => 'The superadmin role cannot be deleted.',
                ];
            }
        }

        return [
            'error' => 0,
            'data' => $data,
        ];
    }

    public function getRolePermissionsData($id)
    {
        $item = $this->getById($id);
        $permissions = $this->permissionRepository->getAll();
        $itemPermissions = $item->permissions->pluck('name')->toArray();

        return compact('item', 'permissions', 'itemPermissions');
    }
}
