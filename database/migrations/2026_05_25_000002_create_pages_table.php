<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pages', function(Blueprint $table) {
            $table->uuid('id')->primary();
            $table->json('title');
            $table->string('slug')->unique();
            $table->uuid('media_id')->nullable()->index();
            $table->json('excerpt')->nullable();
            $table->json('content')->nullable();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->string('status', 20)->default('active')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
