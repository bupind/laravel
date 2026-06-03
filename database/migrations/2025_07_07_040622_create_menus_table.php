<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('menus', function(Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('translation_key')->nullable();
            $table->string('scope', 20)->default('backend')->index();
            $table->string('location', 20)->default('sidebar')->index();
            $table->string('icon')->nullable();
            $table->string('route')->nullable();
            $table->string('permission_name')->nullable();
            $table->foreignUuid('parent_id')->nullable()->constrained('menus')->nullOnDelete();
            $table->integer('order')->default(0);
            $table->json('roles')->nullable();
            $table->timestamps();
            $table->index([
                'parent_id',
                'order'
            ], 'menus_parent_order_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
