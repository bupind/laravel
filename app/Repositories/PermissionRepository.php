<?php

namespace App\Repositories;

use App\Models\Permissions;
use App\Traits\BaseDatatable;
use App\Traits\BaseRepository;
use App\Traits\LogsActivity;
use Spatie\Permission\Models\Permission;

class PermissionRepository
{
    use BaseRepository, BaseDatatable, LogsActivity;

    public function __construct(Permissions $model)
    {
        $this->model = $model;
        $this->datatableColumns();
    }

    private function datatableColumns(): void
    {
        $this->addColumn('name');
        $this->addColumn('guard_name');
        $this->addColumn('created_at', fn($row) => $row->created_at->format('d-m-Y'));
    }

    public function formRules(): array
    {
        return [
            [
                'name'  => 'name',
                'label' => 'Permission Name',
                'type'  => 'text',
                'col'   => 'col-12',
            ],
        ];
    }

    public function store(array $data)
    {
        return Permission::updateOrCreate(
            ['id' => $data['id'] ?? null],
            [
                'name'       => $data['name'],
                'guard_name' => 'web',
            ]
        );
    }
}
