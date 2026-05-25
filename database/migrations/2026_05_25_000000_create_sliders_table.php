<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sliders', function(Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('title_accent')->nullable();
            $table->text('description')->nullable();
            $table->foreignUuid('media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('external_image_url')->nullable();
            $table->string('button_label')->nullable();
            $table->string('button_url')->nullable();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->string('status', 20)->default('active')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sliders');
    }
};
