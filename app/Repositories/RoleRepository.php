<?php

namespace App\Repositories;

use App\Models\Permissions;
use App\Models\Roles;
use App\Traits\BaseDatatable;
use App\Traits\BaseRepository;
use App\Traits\LogsActivity;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class RoleRepository
{
    use BaseRepository, BaseDatatable, LogsActivity;

    public function __construct(Roles $model)
    {
        $this->model = $model;
        $this->datatableColumns();
    }

    private function datatableColumns(): void
    {
        $this->addColumn('name');
        $this->addColumn('permissions', function($row) {
            return $row->permissions
                ->pluck('name')
                ->map(fn($p) => e($p))
                ->implode(' ');
        });
        $this->addColumn('created_at', fn($row) => $row->created_at->format('d-m-Y'));
    }

    public function formRules(): array
    {
        return [
            [
                'name'  => 'name',
                'label' => 'Role Name',
                'type'  => 'text',
            ],
            [
                'name'    => 'permissions',
                'label'   => 'Permissions',
                'type'    => 'checkbox',
                'col'     => 'col-12',
                'options' => Permissions::pluck('name', 'name')->toArray(),
            ],
        ];
    }

    public function store(array $data)
    {
        $permissions = $data['permissions'] ?? null;
        unset($data['permissions']);
        $role = Roles::updateOrCreate(
            ['id' => $data['id'] ?? null],
            [
                'name'       => $data['name'] ?? 'default_name',
                'guard_name' => 'web',
            ]
        );
        if(!empty($permissions) && is_array($permissions)) {
            $role->syncPermissions($permissions);
        }
        return $role;
    }

    public function getById($id)
    {
        $role              = Roles::with('permissions')->findOrFail($id);
        $role->permissions = $role->permissions
            ->pluck('name')
            ->toArray();
        return $role;
    }

    public function update($id, array $data)
    {
        return DB::transaction(function() use ($id, $data) {
            $role        = Roles::with('permissions')->findOrFail($id);
            $permissions = $data['permissions'] ?? null;
            unset($data['permissions']);
            $role->update([
                'name'       => $data['name'] ?? $role->name,
                'guard_name' => 'web',
            ]);
            if(!empty($permissions)) {
                $role->syncPermissions($permissions);
            }
            return $role;
        });
    }

    public function delete($id)
    {
        return DB::transaction(function() use ($id) {
            $role = Role::findOrFail($id);
            $role->delete();
            return $role;
        });
    }

    public function beforeAction($data, $method)
    {
        if($method === 'delete') {
            if(Str::lower($data['name']) === Roles::ROLE_SUPERUSER) {
                return [
                    'error'   => 1,
                    'message' => Roles::ROLE_SUPERUSER . ' role cannot be deleted.',
                ];
            }
        }
        return [
            'error' => 0,
            'data'  => $data,
        ];
    }
}
