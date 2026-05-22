<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('products', function(Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('sku')->unique();
            $table->foreignUuid('media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->text('description')->nullable();
            $table->decimal('price', 14, 2)->default(0);
            $table->unsignedInteger('stock')->default(0);
            $table->string('status', 30)->default('draft')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
