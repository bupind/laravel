<?php

namespace Database\Seeders;

use DB;
use Illuminate\Database\Seeder;

class BackendTablesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // base tables
        \Crud\Backend\Auth\Database\Menu::truncate();
        \Crud\Backend\Auth\Database\Menu::insert(
            [
                [
                    "parent_id"  => 0,
                    "order"      => 1,
                    "title"      => "Dashboard",
                    "icon"       => "icon-speedometer",
                    "uri"        => "/",
                    "permission" => null
                ],
                [
                    "parent_id"  => 0,
                    "order"      => 2,
                    "title"      => "Manage",
                    "icon"       => "icon-settings",
                    "uri"        => "",
                    "permission" => null
                ],
                [
                    "parent_id"  => 2,
                    "order"      => 1,
                    "title"      => "Users",
                    "icon"       => "icon-people",
                    "uri"        => "auth/users",
                    "permission" => null
                ],
                [
                    "parent_id"  => 2,
                    "order"      => 2,
                    "title"      => "Roles",
                    "icon"       => "icon-user-following",
                    "uri"        => "auth/roles",
                    "permission" => null
                ],
                [
                    "parent_id"  => 2,
                    "order"      => 3,
                    "title"      => "Permissions",
                    "icon"       => "icon-key",
                    "uri"        => "auth/permissions",
                    "permission" => null
                ],
                [
                    "parent_id"  => 2,
                    "order"      => 4,
                    "title"      => "Menu",
                    "icon"       => "icon-list",
                    "uri"        => "auth/menu",
                    "permission" => null
                ],
                [
                    "parent_id"  => 2,
                    "order"      => 5,
                    "title"      => "Audit Log",
                    "icon"       => "icon-notebook",
                    "uri"        => "audit",
                    "permission" => null
                ],
                [
                    "parent_id"  => 2,
                    "order"      => 6,
                    "title"      => "Operation Log",
                    "icon"       => "icon-shuffle",
                    "uri"        => "logs",
                    "permission" => null
                ],
                [
                    "parent_id"  => 0,
                    "order"      => 3,
                    "title"      => "Settings",
                    "icon"       => "icon-equalizer",
                    "uri"        => "settings",
                    "permission" => null
                ],
                [
                    "parent_id"  => 0,
                    "order"      => 4,
                    "title"      => "Scaffold",
                    "icon"       => "icon-wrench",
                    "uri"        => "scaffold",
                    "permission" => null
                ],
                [
                    "parent_id"  => 0,
                    "order"      => 7,
                    "title"      => "Log viewer",
                    "icon"       => "icon-exclamation-triangle",
                    "uri"        => "logs",
                    "permission" => null
                ],
                [
                    "parent_id"  => 0,
                    "order"      => 8,
                    "title"      => "Log viewer",
                    "icon"       => "icon-exclamation-triangle",
                    "uri"        => "logs",
                    "permission" => null
                ]
            ]
        );
        \Crud\Backend\Auth\Database\Permission::truncate();
        \Crud\Backend\Auth\Database\Permission::insert(
            [
                [
                    "name"        => "All permission",
                    "slug"        => "*",
                    "http_method" => "",
                    "http_path"   => "*"
                ],
                [
                    "name"        => "Dashboard",
                    "slug"        => "dashboard",
                    "http_method" => "GET",
                    "http_path"   => "/"
                ],
                [
                    "name"        => "Login",
                    "slug"        => "auth.login",
                    "http_method" => "",
                    "http_path"   => "/auth/login\r\n/auth/logout"
                ],
                [
                    "name"        => "User setting",
                    "slug"        => "auth.setting",
                    "http_method" => "GET,PUT",
                    "http_path"   => "/auth/setting"
                ],
                [
                    "name"        => "Auth management",
                    "slug"        => "auth.management",
                    "http_method" => "",
                    "http_path"   => "/auth/roles\r\n/auth/permissions\r\n/auth/menu\r\n/auth/logs\r\n/auth/setting"
                ],
                [
                    "name"        => "Logs",
                    "slug"        => "log-viewer",
                    "http_method" => "",
                    "http_path"   => "/logs*"
                ]
            ]
        );
        \Crud\Backend\Auth\Database\Role::truncate();
        \Crud\Backend\Auth\Database\Role::insert(
            [
                [
                    "name" => "Superuser",
                    "slug" => "superuser"
                ]
            ]
        );
        // pivot tables
        DB::table('backend_role_menu')->truncate();
        DB::table('backend_role_menu')->insert(
            [
                [
                    "role_id" => 1,
                    "menu_id" => 2
                ]
            ]
        );
        DB::table('backend_role_permissions')->truncate();
        DB::table('backend_role_permissions')->insert(
            [
                [
                    "role_id"       => 1,
                    "permission_id" => 1
                ]
            ]
        );
        // finish
    }
}
