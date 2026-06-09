<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('notification_templates', function(Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('channel', 50)->index();
            $table->string('event', 100)->index();
            $table->string('name');
            $table->string('subject')->nullable();
            $table->longText('body');
            $table->text('variables')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['channel', 'event']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_templates');
    }
};
