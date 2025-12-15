<?php

namespace Database\Seeders;

use App\Models\User;
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
                User::ROLE_ADMINISTRATOR,
                User::ROLE_SUPERUSER
            ],
        );
        $seeder->permission->add(
            category   : 'users',
            permissions: [
                'crud',
                'login_as'
            ],
            assignTo   : [User::ROLE_SUPERUSER],
        );
    }
}
