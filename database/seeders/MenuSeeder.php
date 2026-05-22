<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        Menu::create([
            'title'           => 'Dashboard',
            'translation_key' => 'menus.dashboard',
            'scope'           => 'backend',
            'icon'            => 'Home',
            'route'           => '/dashboard',
            'order'           => 1,
            'permission_name' => 'dashboard-view',
        ]);
        $access = Menu::create([
            'title'           => 'Access',
            'translation_key' => 'menus.access',
            'scope'           => 'backend',
            'icon'            => 'Contact',
            'route'           => '#',
            'order'           => 2,
            'permission_name' => 'access-view',
        ]);
        Menu::create([
            'title'           => 'Permissions',
            'translation_key' => 'menus.permissions',
            'scope'           => 'backend',
            'icon'            => 'AlertOctagon',
            'route'           => '/permissions',
            'order'           => 2,
            'permission_name' => 'permission-view',
            'parent_id'       => $access->id,
        ]);
        Menu::create([
            'title'           => 'Users',
            'translation_key' => 'menus.users',
            'scope'           => 'backend',
            'icon'            => 'Users',
            'route'           => '/users',
            'order'           => 3,
            'permission_name' => 'users-view',
            'parent_id'       => $access->id,
        ]);
        Menu::create([
            'title'           => 'Roles',
            'translation_key' => 'menus.roles',
            'scope'           => 'backend',
            'icon'            => 'AlertTriangle',
            'route'           => '/roles',
            'order'           => 4,
            'permission_name' => 'roles-view',
            'parent_id'       => $access->id,
        ]);
        Menu::create([
            'title'           => 'Products',
            'translation_key' => 'menus.products',
            'scope'           => 'backend',
            'icon'            => 'Boxes',
            'route'           => '/products',
            'order'           => 3,
            'permission_name' => 'products-view',
        ]);
        Menu::create([
            'title'           => 'Home',
            'translation_key' => 'menus.home',
            'scope'           => 'frontend',
            'icon'            => 'Home',
            'route'           => '/',
            'order'           => 1,
        ]);
        Menu::create([
            'title'           => 'Products',
            'translation_key' => 'menus.products',
            'scope'           => 'frontend',
            'icon'            => 'Boxes',
            'route'           => '/products',
            'order'           => 2,
        ]);
        $settings = Menu::create([
            'title'           => 'Settings',
            'translation_key' => 'menus.settings',
            'scope'           => 'backend',
            'icon'            => 'Settings',
            'route'           => '#',
            'order'           => 4,
            'permission_name' => 'settings-view',
        ]);
        Menu::create([
            'title'           => 'Menu Manager',
            'translation_key' => 'menus.menu_manager',
            'scope'           => 'backend',
            'icon'            => 'Menu',
            'route'           => '/menus',
            'order'           => 1,
            'permission_name' => 'menu-view',
            'parent_id'       => $settings->id,
        ]);
        Menu::create([
            'title'           => 'App Settings',
            'translation_key' => 'menus.app_settings',
            'scope'           => 'backend',
            'icon'            => 'AtSign',
            'route'           => '/settingsapp',
            'order'           => 2,
            'permission_name' => 'app-settings-view',
            'parent_id'       => $settings->id,
        ]);
        Menu::create([
            'title'           => 'Translations',
            'translation_key' => 'menus.translations',
            'scope'           => 'backend',
            'icon'            => 'Globe',
            'route'           => '/translations',
            'order'           => 3,
            'permission_name' => 'translations-view',
            'parent_id'       => $settings->id,
        ]);
        Menu::create([
            'title'           => 'API Clients',
            'translation_key' => 'menus.api_clients',
            'scope'           => 'backend',
            'icon'            => 'KeyRound',
            'route'           => '/api-clients',
            'order'           => 4,
            'permission_name' => 'api-clients-view',
            'parent_id'       => $settings->id,
        ]);
        $utilities = Menu::create([
            'title'           => 'Utilities',
            'translation_key' => 'menus.utilities',
            'scope'           => 'backend',
            'icon'            => 'CreditCard',
            'route'           => '#',
            'order'           => 5,
            'permission_name' => 'utilities-view',
        ]);
        Menu::create([
            'title'           => 'Audit Logs',
            'translation_key' => 'menus.audit_logs',
            'scope'           => 'backend',
            'icon'            => 'Activity',
            'route'           => '/audit-logs',
            'order'           => 2,
            'permission_name' => 'log-view',
            'parent_id'       => $utilities->id,
        ]);
        Menu::create([
            'title'           => 'File Manager',
            'translation_key' => 'menus.file_manager',
            'scope'           => 'backend',
            'icon'            => 'Folder',
            'route'           => '/files',
            'order'           => 3,
            'permission_name' => 'filemanager-view',
            'parent_id'       => $utilities->id,
        ]);
        $permissions = Menu::pluck('permission_name')->unique()->filter();
        foreach($permissions as $permName) {
            Permission::firstOrCreate(['name' => $permName]);
        }
    }
}
