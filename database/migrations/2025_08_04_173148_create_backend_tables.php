<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBackendTables extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function getConnection()
    {
        return config('backend.database.connection') ?: config('database.default');
    }

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create(config('backend.database.users_table'), function(Blueprint $table) {
            $table->increments('id');
            $table->string('username', 190)->unique();
            $table->string('password', 60);
            $table->string('name');
            $table->string('avatar')->nullable();
            $table->string('remember_token', 100)->nullable();
            $table->timestamps();
        });
        Schema::create(config('backend.database.roles_table'), function(Blueprint $table) {
            $table->increments('id');
            $table->string('name', 50)->unique();
            $table->string('slug', 50)->unique();
            $table->timestamps();
        });
        Schema::create(config('backend.database.permissions_table'), function(Blueprint $table) {
            $table->increments('id');
            $table->string('name', 50)->unique();
            $table->string('slug', 50)->unique();
            $table->string('http_method')->nullable();
            $table->text('http_path')->nullable();
            $table->timestamps();
        });
        Schema::create(config('backend.database.menu_table'), function(Blueprint $table) {
            $table->increments('id');
            $table->integer('parent_id')->default(0);
            $table->integer('order')->default(0);
            $table->string('title', 50);
            $table->string('icon', 50);
            $table->string('uri')->nullable();
            $table->string('permission')->nullable();
            $table->timestamps();
        });
        Schema::create(config('backend.database.role_users_table'), function(Blueprint $table) {
            $table->integer('role_id');
            $table->integer('user_id');
            $table->index(['role_id', 'user_id']);
            $table->timestamps();
        });
        Schema::create(config('backend.database.role_permissions_table'), function(Blueprint $table) {
            $table->integer('role_id');
            $table->integer('permission_id');
            $table->index(['role_id', 'permission_id']);
            $table->timestamps();
        });
        Schema::create(config('backend.database.user_permissions_table'), function(Blueprint $table) {
            $table->integer('user_id');
            $table->integer('permission_id');
            $table->index(['user_id', 'permission_id']);
            $table->timestamps();
        });
        Schema::create(config('backend.database.role_menu_table'), function(Blueprint $table) {
            $table->integer('role_id');
            $table->integer('menu_id');
            $table->index(['role_id', 'menu_id']);
            $table->timestamps();
        });
        Schema::create(config('backend.database.operation_log_table'), function(Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id');
            $table->string('path');
            $table->string('method', 10);
            $table->string('ip');
            $table->text('input');
            $table->index('user_id');
            $table->timestamps();
        });
        Schema::create(config('backend.database.settings_table', 'settings'), function($table) {
            $table->string('key')->primary();
            $table->text('value')->nullable();
            $table->timestamps();
        });
        Schema::create('scaffold', function(Blueprint $table) {
            $table->id();
            $table->string('table_name');
            $table->string('model_name')->nullable();
            $table->string('controller_name')->nullable();
            $table->json('create_options')->nullable();
            $table->string('primary_key')->default('id');
            $table->boolean('timestamps')->default(true);
            $table->boolean('soft_deletes')->default(false);
            $table->timestamps();
        });
        Schema::create('scaffold_details', function(Blueprint $table) {
            $table->id();
            $table->foreignId('scaffold_id')->constrained('scaffold')->onDelete('cascade');
            $table->string('name')->nullable();
            $table->string('type')->nullable();
            $table->boolean('nullable')->default(false);
            $table->string('key')->nullable();
            $table->string('default')->nullable();
            $table->string('comment')->nullable();
            $table->integer('order')->default(0);
            $table->string('input_type', 40)->nullable();
            $table->string('options_source', 191)->nullable();
            $table->string('options_value_col', 191)->nullable();
            $table->string('options_label_col', 191)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists(config('backend.database.users_table'));
        Schema::dropIfExists(config('backend.database.roles_table'));
        Schema::dropIfExists(config('backend.database.permissions_table'));
        Schema::dropIfExists(config('backend.database.menu_table'));
        Schema::dropIfExists(config('backend.database.user_permissions_table'));
        Schema::dropIfExists(config('backend.database.role_users_table'));
        Schema::dropIfExists(config('backend.database.role_permissions_table'));
        Schema::dropIfExists(config('backend.database.role_menu_table'));
        Schema::dropIfExists(config('backend.database.operation_log_table'));
        Schema::dropIfExists(config('backend.database.settings_table'));
        Schema::dropIfExists('scaffold_details');
        Schema::dropIfExists('scaffold');
    }
}
