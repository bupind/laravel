<?php

namespace App\Repositories;

use App\Constants\DataConstant;
use App\Models\Roles;
use App\Models\User;
use App\Traits\BaseDatatable;
use App\Traits\BaseRepository;
use App\Traits\LogsActivity;
use Illuminate\Support\Facades\Hash;

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
        $rolesOptions = Roles::pluck('name', 'id')->toArray();
        return [
            [
                'name'  => 'name',
                'label' => 'Name',
                'type'  => DataConstant::TYPE_TEXT,
                'col'   => 'col-6',
            ],
            [
                'name'  => 'email',
                'label' => 'Email',
                'type'  => DataConstant::TYPE_EMAIL,
                'col'   => 'col-6',
            ],
            [
                'name'  => 'password',
                'label' => 'Password',
                'type'  => DataConstant::TYPE_PASSWORD,
            ],
            [
                'name'  => 'phone_number',
                'label' => 'Phone Number',
                'type'  => DataConstant::TYPE_TEXT,
                'col'   => 'col-6',
            ],
            [
                'name'  => 'address',
                'label' => 'Address',
                'type'  => DataConstant::TYPE_TEXTAREA,
                'col'   => 'col-12',
            ],
            [
                'name'     => 'roles',
                'label'    => 'Roles',
                'type'     => DataConstant::TYPE_SELECT,
                'col'      => 'col-6',
                'multiple' => true,
                'options'  => $rolesOptions,
            ],
            [
                'name'  => 'profile_photo',
                'label' => 'Profile Photo',
                'type'  => DataConstant::TYPE_FILE,
                'col'   => 'col-6',
            ],
        ];
    }

    public function formFields($item = null, string $scenario = 'default'): array
    {
        $fields = $this->baseFormFields($item, $scenario);
        if($item && $item->relationLoaded('roles')) {
            foreach($fields as &$field) {
                if($field['name'] === 'roles') {
                    $field['value'] = $item->roles->pluck('id')->toArray();
                }
            }
        }
        return $fields;
    }

    public function store(array $data)
    {
        $roles = $data['roles'] ?? [];
        unset($data['roles']);
        $user = User::create([
            'name'                => $data['name'],
            'email'               => $data['email'],
            'phone_number'        => $data['phone_number'],
            'address'             => $data['address'] ?? null,
            'password'            => Hash::make($data['password']),
            'password_changed_at' => now(),
        ]);
        if(!empty($roles)) {
            $roleModels = Roles::whereIn('id', $roles)->get();
            $user->syncRoles($roleModels);
        }
        return $user;
    }

    public function update($id, array $data)
    {
        return $this->wrapTransaction(function() use ($id, $data) {
            $user  = $this->getById($id);
            $roles = $data['roles'] ?? [];
            $data  = $this->prepareSaveData($data, 'update', $user);
            $user->update($data);
            if(!empty($roles)) {
                $roleModels = Roles::whereIn('id', $roles)->get();
                $user->syncRoles($roleModels);
            } else {
                $user->syncRoles([]);
            }
            return $user;
        });
    }

    protected function prepareSaveData(array $data, string $method, $record = null): array
    {
        if(empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password']            = Hash::make($data['password']);
            $data['password_changed_at'] = now();
        }
        unset($data['roles']);
        return $data;
    }
}
