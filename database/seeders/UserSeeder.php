<?php

namespace Database\Seeders;

use App\Models\User;
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
            name    : 'Super Admin',
            email   : 'superadmin@gmail.com',
            phone   : '085460003030',
            password: 'password',
            roleName: User::ROLE_SUPERUSER,
        );
    }
}
