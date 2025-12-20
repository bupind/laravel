<?php

namespace Database\Seeders;

use App\Models\Roles;
use App\Services\SeederService;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(SeederService $seeder): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $seeder->permission->add(
            category   : 'dashboard',
            permissions: ['read'],
            assignTo   : [
                Roles::ROLE_ADMINISTRATOR,
                Roles::ROLE_SUPERUSER
            ],
        );
        $seeder->permission->add(
            category   : 'users',
            permissions: [
                'crud',
                'login_as'
            ],
            assignTo   : [Roles::ROLE_SUPERUSER],
        );
    }
}
