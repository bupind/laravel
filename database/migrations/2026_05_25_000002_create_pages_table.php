<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pages', function(Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->uuid('media_id')->nullable()->index();
            $table->string('template')->default('default')->index();
            $table->string('placement')->default('none')->index();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->boolean('is_published')->default(true)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
