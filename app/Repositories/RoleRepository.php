<?php

namespace App\Repositories;

use App\Models\Permissions;
use App\Models\Roles;
use App\Models\User;
use App\Traits\BaseDatatable;
use App\Traits\BaseRepository;
use App\Traits\LogsActivity;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RoleRepository
{
    use BaseRepository, BaseDatatable, LogsActivity;

    public function __construct(Roles $model)
    {
        $this->model = $model;
        $this->datatableColumns();
    }

    /**
     * Datatable Columns
     */
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
        $role = Roles::updateOrCreate(
            ['id' => $data['id'] ?? null],
            [
                'name'       => $data['name'],
                'guard_name' => 'web',
            ]
        );
        if(isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }
        return $role;
    }

    public function syncPermissions($id, array $permissions)
    {
        $role = $this->getById($id);
        $role->syncPermissions($permissions);
    }

    public function getById($id)
    {
        $role = Roles::with('permissions')->findOrFail($id);
        $role->permissions = $role->permissions
            ->pluck('name')
            ->toArray();
        return $role;
    }

    public function update($id, $data)
    {
        return rescue(function() use ($id, $data) {
            DB::beginTransaction();
            $record = $this->getById($id);
            $data   = $this->prepareSaveData($data, 'update', $record);
            $record->update($data);
            DB::commit();
            return $record;
        }, function(\Exception $e) {
            DB::rollBack();
            throw $e;
        });
    }

    protected function prepareSaveData(array $data, string $action, $record = null): array
    {
        $data['guard_name'] = 'web';
        return $data;
    }

    public function beforeAction($data, $method)
    {
        if($method === 'delete') {
            if(Str::lower($data['name']) === User::ROLE_SUPERUSER) {
                return [
                    'error'   => 1,
                    'message' => User::ROLE_SUPERUSER . ' role cannot be deleted.',
                ];
            }
        }
        return [
            'error' => 0,
            'data'  => $data,
        ];
    }
}
