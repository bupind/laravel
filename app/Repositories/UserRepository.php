<?php

namespace App\Repositories;

use App\Constants\DataConstant;
use App\Models\Roles;
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
        $rolesOptions = Roles::pluck('name', 'name')->toArray();
        $this->addColumns([
            [
                'name'   => 'name',
                'filter' => DataConstant::FILTER_LIKE,
            ],
            [
                'name'         => 'roles_label',
                'label'        => 'Roles',
                'filter'       => DataConstant::FILTER_SELECT,
                'options'      => $rolesOptions,
                'filter_field' => 'roles.name',
            ],
        ]);
    }

    public function formRules(): array
    {
        return [
            [
                'name'  => 'name',
                'label' => 'Name',
                'type'  => DataConstant::TYPE_TEXT,
                'col'   => 'col-6',
            ],
            [
                'name'  => 'password',
                'label' => 'Password',
                'type'  => DataConstant::TYPE_PASSWORD
            ],
        ];
    }
}
