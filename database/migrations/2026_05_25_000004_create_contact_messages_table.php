<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('subject');
            $table->text('message');
            $table->string('status', 30)->default('new')->index();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->foreignUuid('replied_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reply_subject')->nullable();
            $table->text('reply_message')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
    }
};
