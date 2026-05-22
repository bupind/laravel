<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('api_clients', function(Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('client_key')->unique();
            $table->string('client_secret');
            $table->boolean('is_active')->default(true)->index();
            $table->json('allowed_ips')->nullable();
            $table->text('description')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamp('last_used_at')->nullable();
            $table->string('last_request_path')->nullable();
            $table->string('last_request_ip', 45)->nullable();
            $table->unsignedSmallInteger('last_response_status')->nullable();
            $table->unsignedBigInteger('total_requests')->default(0);
            $table->uuid('created_by')->nullable()->index();
            $table->uuid('updated_by')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('api_clients');
    }
};
