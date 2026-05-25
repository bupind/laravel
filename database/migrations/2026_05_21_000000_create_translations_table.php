<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('translations', function(Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('locale', 10);
            $table->string('scope', 50)->default('common');
            $table->string('namespace', 100);
            $table->string('key', 255);
            $table->text('value');
            $table->string('status', 20)->default('active')->index();
            $table->timestamps();
            $table->unique(['locale', 'scope', 'namespace', 'key'], 'translations_unique_key');
            $table->index(['locale', 'scope', 'namespace'], 'translations_locale_scope_namespace_index');
            $table->index(['scope', 'namespace'], 'translations_scope_namespace_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};
