<?php

namespace App\Services;

use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class SeederService
{
    public function __get($name)
    {
        if($name === 'role') {
            return new class () {
                public function add(string $name): Role
                {
                    return Role::updateOrCreate(['name' => $name]);
                }
            };
        }
        if($name === 'user') {
            return new class () {
                public function add(string $name, string $email, string $phone, string $password, string $roleName, bool $isActive = true): User
                {
                    $user = User::updateOrCreate(
                        ['email' => $email],
                        [
                            'phone_number'        => $phone,
                            'password_changed_at' => now(),
                            'name'                => $name,
                            'address'             => 'Indonesia',
                            'password'            => Hash::make($password),
                        ],
                    );
                    $role = Role::where('name', $roleName)->first();
                    if($role) {
                        $user->syncRoles([$role->name]);
                    }
                    return $user;
                }
            };
        }
        if($name === 'permission') {
            return new class () {
                protected $actions = [
                    'add',
                    'view',
                    'edit',
                    'show',
                    'delete'
                ];

                public function add(string $category, array $permissions, array $assignTo = []): void
                {
                    foreach($permissions as $permission) {
                        if($permission === 'crud') {
                            foreach($this->actions as $action) {
                                $perm = "{$category}_{$action}";
                                $this->createPermission($perm, $assignTo);
                            }
                        } else {
                            $perm = "{$category}_{$permission}";
                            $this->createPermission($perm, $assignTo);
                        }
                    }
                }

                protected function createPermission(string $name, array $roles = [])
                {
                    $permission = Permission::firstOrCreate(['name' => $name]);
                    foreach($roles as $roleName) {
                        $role = Role::where('name', $roleName)->first();
                        if($role && !$role->hasPermissionTo($permission)) {
                            $role->givePermissionTo($permission);
                        }
                    }
                }
            };
        }
        throw new Exception("Property {$name} not found on SeederService");
    }
}
