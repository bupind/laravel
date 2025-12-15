<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\SeederService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(SeederService $seeder): void
    {
        $seeder->menu->add([
            'text'  => 'Dashboard',
            'route' => 'dashboard',
            'can'   => 'view_dashboard',
            'icon'  => 'fas fa-fw fa-home',
        ]);
        $seeder->menu->add([
            'header' => 'Administration',
            'role'   => [
                User::ROLE_SUPERUSER,
                User::ROLE_ADMINISTRATOR,
            ]
        ]);
        $seeder->menu->add([
            'text'  => 'Users',
            'route' => 'user.index',
            'icon'  => 'fas fa-fw fa-users',
            'role'  => [
                User::ROLE_SUPERUSER,
                User::ROLE_ADMINISTRATOR,
            ]
        ]);
        $seeder->menu->add([
            'text'  => 'Roles',
            'route' => 'role.index',
            'icon'  => 'fas fa-fw fa-user-shield',
            'role'  => User::ROLE_SUPERUSER,
        ]);
        $seeder->menu->add([
            'text'  => 'Permissions',
            'route' => 'permission.index',
            'icon'  => 'fas fa-fw fa-key',
            'role'  => User::ROLE_SUPERUSER,
        ]);
        $seeder->menu->add([
            'text'  => 'Menu',
            'route' => 'menu.index',
            'icon'  => 'fas fa-fw fa-bars',
            'role'  => User::ROLE_SUPERUSER,
        ]);
        Cache::forget('menus');
    }
}
