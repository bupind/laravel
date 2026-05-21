<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function(Blueprint $table) {
            $table->index('name', 'users_name_idx');
            $table->index('created_at', 'users_created_at_idx');
        });
        Schema::table('permissions', function(Blueprint $table) {
            $table->index('group', 'permissions_group_idx');
            $table->index('created_at', 'permissions_created_at_idx');
        });
        Schema::table('menus', function(Blueprint $table) {
            $table->index([
                'parent_id',
                'order'
            ], 'menus_parent_order_idx');
        });
        $activityTable = config('activitylog.table_name', 'activity_log');
        Schema::table($activityTable, function(Blueprint $table) {
            $table->index('created_at', 'activity_log_created_at_idx');
        });
    }

    public function down(): void
    {
        Schema::table('users', function(Blueprint $table) {
            $table->dropIndex('users_name_idx');
            $table->dropIndex('users_created_at_idx');
        });
        Schema::table('permissions', function(Blueprint $table) {
            $table->dropIndex('permissions_group_idx');
            $table->dropIndex('permissions_created_at_idx');
        });
        Schema::table('menus', function(Blueprint $table) {
            $table->dropIndex('menus_parent_order_idx');
        });
        $activityTable = config('activitylog.table_name', 'activity_log');
        Schema::table($activityTable, function(Blueprint $table) {
            $table->dropIndex('activity_log_created_at_idx');
        });
    }
};
