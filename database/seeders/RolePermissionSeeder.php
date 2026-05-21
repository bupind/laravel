<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Support\Permissions\PermissionCatalog;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $superuser = Role::firstOrCreate(['name' => 'superuser']);
        foreach(PermissionCatalog::grouped() as $group => $permissions) {
            foreach($permissions as $name) {
                $permission = Permission::firstOrCreate(['name' => $name]);
                $permission->forceFill(['group' => $group])->save();
            }
        }
        $superuser->syncPermissions(Permission::query()->pluck('name')->all());
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
