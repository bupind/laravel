<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('menus', function(Blueprint $table) {
            $table->string('translation_key')->nullable()->after('title');
        });
        $translationKeys = [
            'Dashboard'    => 'menus.dashboard',
            'Access'       => 'menus.access',
            'Permissions'  => 'menus.permissions',
            'Users'        => 'menus.users',
            'Roles'        => 'menus.roles',
            'Settings'     => 'menus.settings',
            'Menu Manager' => 'menus.menu_manager',
            'App Settings' => 'menus.app_settings',
            'Translations' => 'menus.translations',
            'Backup'       => 'menus.backup',
            'Utilities'    => 'menus.utilities',
            'Audit Logs'   => 'menus.audit_logs',
            'File Manager' => 'menus.file_manager',
        ];
        foreach($translationKeys as $title => $translationKey) {
            DB::table('menus')
                ->where('title', $title)
                ->whereNull('translation_key')
                ->update(['translation_key' => $translationKey]);
        }
    }

    public function down(): void
    {
        Schema::table('menus', function(Blueprint $table) {
            $table->dropColumn('translation_key');
        });
    }
};
