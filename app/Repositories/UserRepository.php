<?php

namespace App\Repositories;

use App\Models\User;
use App\Traits\BaseDatatable;
use App\Traits\BaseRepository;
use App\Traits\LogsActivity;

class UserRepository
{
    use BaseRepository, BaseDatatable, LogsActivity;

    private $roleRepository;

    public function __construct(User $model, RoleRepository $roleRepository)
    {
        $this->model          = $model;
        $this->roleRepository = $roleRepository;
        $this->with           = ['roles'];
        $this->datatableColumns();
    }

    private function datatableColumns()
    {
        $this->addColumn('name');
        $this->addColumn('email');
        $this->addColumn('roles', fn($model) => $model->roles->pluck('name')->join(', '));
    }
}
