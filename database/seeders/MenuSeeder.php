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
            'icon'            => 'Home',
            'route'           => '/dashboard',
            'order'           => 1,
            'permission_name' => 'dashboard-view',
        ]);
        $access = Menu::create([
            'title'           => 'Access',
            'translation_key' => 'menus.access',
            'icon'            => 'Contact',
            'route'           => '#',
            'order'           => 2,
            'permission_name' => 'access-view',
        ]);
        Menu::create([
            'title'           => 'Permissions',
            'translation_key' => 'menus.permissions',
            'icon'            => 'AlertOctagon',
            'route'           => '/permissions',
            'order'           => 2,
            'permission_name' => 'permission-view',
            'parent_id'       => $access->id,
        ]);
        Menu::create([
            'title'           => 'Users',
            'translation_key' => 'menus.users',
            'icon'            => 'Users',
            'route'           => '/users',
            'order'           => 3,
            'permission_name' => 'users-view',
            'parent_id'       => $access->id,
        ]);
        Menu::create([
            'title'           => 'Roles',
            'translation_key' => 'menus.roles',
            'icon'            => 'AlertTriangle',
            'route'           => '/roles',
            'order'           => 4,
            'permission_name' => 'roles-view',
            'parent_id'       => $access->id,
        ]);
        $settings = Menu::create([
            'title'           => 'Settings',
            'translation_key' => 'menus.settings',
            'icon'            => 'Settings',
            'route'           => '#',
            'order'           => 4,
            'permission_name' => 'settings-view',
        ]);
        Menu::create([
            'title'           => 'Menu Manager',
            'translation_key' => 'menus.menu_manager',
            'icon'            => 'Menu',
            'route'           => '/menus',
            'order'           => 1,
            'permission_name' => 'menu-view',
            'parent_id'       => $settings->id,
        ]);
        Menu::create([
            'title'           => 'App Settings',
            'translation_key' => 'menus.app_settings',
            'icon'            => 'AtSign',
            'route'           => '/settingsapp',
            'order'           => 2,
            'permission_name' => 'app-settings-view',
            'parent_id'       => $settings->id,
        ]);
        Menu::create([
            'title'           => 'Translations',
            'translation_key' => 'menus.translations',
            'icon'            => 'Globe',
            'route'           => '/translations',
            'order'           => 3,
            'permission_name' => 'translations-view',
            'parent_id'       => $settings->id,
        ]);
        Menu::create([
            'title'           => 'Backup',
            'translation_key' => 'menus.backup',
            'icon'            => 'Inbox',
            'route'           => '/backup',
            'order'           => 4,
            'permission_name' => 'backup-view',
            'parent_id'       => $settings->id,
        ]);
        $utilities = Menu::create([
            'title'           => 'Utilities',
            'translation_key' => 'menus.utilities',
            'icon'            => 'CreditCard',
            'route'           => '#',
            'order'           => 5,
            'permission_name' => 'utilities-view',
        ]);
        Menu::create([
            'title'           => 'Audit Logs',
            'translation_key' => 'menus.audit_logs',
            'icon'            => 'Activity',
            'route'           => '/audit-logs',
            'order'           => 2,
            'permission_name' => 'log-view',
            'parent_id'       => $utilities->id,
        ]);
        Menu::create([
            'title'           => 'File Manager',
            'translation_key' => 'menus.file_manager',
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
