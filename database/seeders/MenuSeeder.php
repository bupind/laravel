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
        $this->menu([
            'title'           => 'Dashboard',
            'translation_key' => 'menus.dashboard',
            'scope'           => 'backend',
            'icon'            => 'Home',
            'route'           => '/dashboard',
            'order'           => 1,
            'permission_name' => 'dashboard-view',
        ]);
        $access = $this->menu([
            'title'           => 'Access',
            'translation_key' => 'menus.access',
            'scope'           => 'backend',
            'icon'            => 'Contact',
            'route'           => '#',
            'order'           => 2,
            'permission_name' => 'access-view',
        ]);
        $this->menu([
            'title'           => 'Permissions',
            'translation_key' => 'menus.permissions',
            'scope'           => 'backend',
            'icon'            => 'AlertOctagon',
            'route'           => '/permissions',
            'order'           => 2,
            'permission_name' => 'permission-view',
            'parent_id'       => $access->id,
        ]);
        $this->menu([
            'title'           => 'Users',
            'translation_key' => 'menus.users',
            'scope'           => 'backend',
            'icon'            => 'Users',
            'route'           => '/users',
            'order'           => 3,
            'permission_name' => 'users-view',
            'parent_id'       => $access->id,
        ]);
        $this->menu([
            'title'           => 'Roles',
            'translation_key' => 'menus.roles',
            'scope'           => 'backend',
            'icon'            => 'AlertTriangle',
            'route'           => '/roles',
            'order'           => 4,
            'permission_name' => 'roles-view',
            'parent_id'       => $access->id,
        ]);
        $this->menu([
            'title'           => 'Products',
            'translation_key' => 'menus.products',
            'scope'           => 'backend',
            'icon'            => 'Boxes',
            'route'           => '/products',
            'order'           => 3,
            'permission_name' => 'products-view',
        ]);
        $content = $this->menu([
            'title'           => 'Content',
            'translation_key' => 'menus.content',
            'scope'           => 'backend',
            'icon'            => 'Layers',
            'route'           => '#',
            'order'           => 4,
            'permission_name' => 'content-view',
        ]);
        $this->menu([
            'title'           => 'Sliders',
            'translation_key' => 'menus.sliders',
            'scope'           => 'backend',
            'icon'            => 'Sliders',
            'route'           => '/sliders',
            'order'           => 1,
            'permission_name' => 'sliders-view',
            'parent_id'       => $content->id,
        ]);
        $this->menu([
            'title'           => 'Services',
            'translation_key' => 'menus.services',
            'scope'           => 'backend',
            'icon'            => 'Briefcase',
            'route'           => '/services',
            'order'           => 2,
            'permission_name' => 'services-view',
            'parent_id'       => $content->id,
        ]);
        $this->menu([
            'title'           => 'Pages',
            'translation_key' => 'menus.pages',
            'scope'           => 'backend',
            'icon'            => 'FileText',
            'route'           => '/pages',
            'order'           => 3,
            'permission_name' => 'pages-view',
            'parent_id'       => $content->id,
        ]);
        $this->menu([
            'title'           => 'Contact Messages',
            'translation_key' => 'menus.contact_messages',
            'scope'           => 'backend',
            'icon'            => 'MessagesSquare',
            'route'           => '/contact-messages',
            'order'           => 4,
            'permission_name' => 'contact-messages-view',
            'parent_id'       => $content->id,
        ]);
        $this->menu([
            'title'           => 'Home',
            'translation_key' => 'menus.home',
            'scope'           => 'frontend',
            'icon'            => 'Home',
            'route'           => '/',
            'order'           => 1,
        ]);
        $this->menu([
            'title'           => 'Products',
            'translation_key' => 'menus.products',
            'scope'           => 'frontend',
            'icon'            => 'Boxes',
            'route'           => '/products',
            'order'           => 2,
        ]);
        $this->menu([
            'title'           => 'Contact',
            'translation_key' => 'menus.contact',
            'scope'           => 'frontend',
            'icon'            => 'Mail',
            'route'           => '/contact',
            'order'           => 3,
        ]);
        $settings = $this->menu([
            'title'           => 'Settings',
            'translation_key' => 'menus.settings',
            'scope'           => 'backend',
            'icon'            => 'Settings',
            'route'           => '#',
            'order'           => 5,
            'permission_name' => 'settings-view',
        ]);
        $this->menu([
            'title'           => 'Menu Manager',
            'translation_key' => 'menus.menu_manager',
            'scope'           => 'backend',
            'icon'            => 'Menu',
            'route'           => '/menus',
            'order'           => 1,
            'permission_name' => 'menus-view',
            'parent_id'       => $settings->id,
        ]);
        $this->menu([
            'title'           => 'App Settings',
            'translation_key' => 'menus.app_settings',
            'scope'           => 'backend',
            'icon'            => 'AtSign',
            'route'           => '/settingsapp',
            'order'           => 2,
            'permission_name' => 'settings-view',
            'parent_id'       => $settings->id,
        ]);
        $this->menu([
            'title'           => 'Translations',
            'translation_key' => 'menus.translations',
            'scope'           => 'backend',
            'icon'            => 'Globe',
            'route'           => '/translations',
            'order'           => 3,
            'permission_name' => 'translations-view',
            'parent_id'       => $settings->id,
        ]);
        $this->menu([
            'title'           => 'API Clients',
            'translation_key' => 'menus.api_clients',
            'scope'           => 'backend',
            'icon'            => 'KeyRound',
            'route'           => '/api-clients',
            'order'           => 4,
            'permission_name' => 'api-clients-view',
            'parent_id'       => $settings->id,
        ]);
        $utilities = $this->menu([
            'title'           => 'Utilities',
            'translation_key' => 'menus.utilities',
            'scope'           => 'backend',
            'icon'            => 'CreditCard',
            'route'           => '#',
            'order'           => 6,
            'permission_name' => 'utilities-view',
        ]);
        $this->menu([
            'title'           => 'Audit Logs',
            'translation_key' => 'menus.audit_logs',
            'scope'           => 'backend',
            'icon'            => 'Activity',
            'route'           => '/audit-logs',
            'order'           => 2,
            'permission_name' => 'activity-logs-view',
            'parent_id'       => $utilities->id,
        ]);
        $this->menu([
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

    private function menu(array $attributes): Menu
    {
        return Menu::query()->updateOrCreate(
            [
                'scope'           => $attributes['scope'],
                'translation_key' => $attributes['translation_key'],
            ],
            $attributes,
        );
    }
}
