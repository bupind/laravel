<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->count(1000)->create();
//        $this->call(RoleSeeder::class);
//        $this->call(PermissionSeeder::class);
//        $this->call(UserSeeder::class);
//        $this->call(MenuSeeder::class);
    }
}
