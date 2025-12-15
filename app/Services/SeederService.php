<?php

namespace App\Services;

use App\Models\Menu;
use App\Models\User;
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
        if($name === 'menu') {
            return new class () {
                public function add(array $data, $parent = null): void
                {
                    $lookup = [];
                    if(isset($data['key'])) {
                        $lookup['key'] = $data['key'];
                    } else {
                        $lookup['parent_id'] = $parent?->id;
                        $lookup['text']      = $data['text'] ?? null;
                        $lookup['header']    = $data['header'] ?? null;
                    }
                    if(isset($data['order'])) {
                        $parent_id = $parent?->id;
                        $newOrder  = $data['order'];
                        $menu      = Menu::where($lookup)->first();
                        if($menu) {
                            $oldOrder = $menu->order;
                            if($newOrder != $oldOrder) {
                                if($newOrder < $oldOrder) {
                                    Menu::where('parent_id', $parent_id)
                                        ->where('order', '>=', $newOrder)
                                        ->where('order', '<', $oldOrder)
                                        ->increment('order');
                                } else {
                                    Menu::where('parent_id', $parent_id)
                                        ->where('order', '<=', $newOrder)
                                        ->where('order', '>', $oldOrder)
                                        ->decrement('order');
                                }
                            }
                        } else {
                            Menu::where('parent_id', $parent_id)
                                ->where('order', '>=', $newOrder)
                                ->increment('order');
                        }
                    }
                    $menu = Menu::updateOrCreate(
                        $lookup,
                        [
                            'parent_id' => $parent?->id,
                            'text'      => $data['text'] ?? null,
                            'header'    => $data['header'] ?? null,
                            'route'     => $data['route'] ?? null,
                            'url'       => $data['url'] ?? null,
                            'can'       => $data['can'] ?? null,
                            'role'      => $data['role'] ?? null,
                            'icon'      => $data['icon'] ?? null,
                            'order'     => $data['order'] ?? Menu::where('parent_id', $parent?->id)->max('order') + 1,
                        ]
                    );
                    if(isset($data['submenu']) && is_array($data['submenu'])) {
                        foreach($data['submenu'] as $submenu) {
                            $this->add($submenu, $menu);
                        }
                    }
                }
            };
        }
        throw new \Exception("Property {$name} not found on SeederService");
    }
}
