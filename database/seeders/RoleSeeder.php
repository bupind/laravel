<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\SeederService;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(SeederService $seeder): void
    {
        $seeder->role->add(User::ROLE_SUPERUSER);
        $seeder->role->add(User::ROLE_ADMINISTRATOR);
    }
}
