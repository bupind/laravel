<?php

namespace Database\Seeders;

use App\Models\Roles;
use App\Services\SeederService;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(SeederService $seeder): void
    {
        $seeder->user->add(
            name    : 'Super User',
            email   : 'superuser@gmail.com',
            phone   : '085460003030',
            password: 'password',
            roleName: Roles::ROLE_SUPERUSER,
        );
        $seeder->user->add(
            name    : 'Administrator',
            email   : 'administrator@gmail.com',
            phone   : '085460003030',
            password: 'password',
            roleName: Roles::ROLE_ADMINISTRATOR,
        );
    }
}
