<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('pages') && ! Schema::hasColumn('pages', 'media_id')) {
            Schema::table('pages', function (Blueprint $table) {
                $table->uuid('media_id')->nullable()->after('slug')->index();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('pages') && Schema::hasColumn('pages', 'media_id')) {
            Schema::table('pages', function (Blueprint $table) {
                $table->dropColumn('media_id');
            });
        }
    }
};
