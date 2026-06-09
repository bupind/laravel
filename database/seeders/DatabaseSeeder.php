<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            SettingAppSeeder::class,
            NotificationTemplateSeeder::class,
            TranslationSeeder::class,
            PageSeeder::class,
        ]);
        $user = User::factory()->create([
            'name'     => 'Superuser',
            'email'    => 'superuser@mail.com',
            'password' => Hash::make('password'),
        ]);
        $user->assignRole('superuser');
        $this->call([
            MenuSeeder::class,
        ]);
    }
}
