<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('xendit_webhook_events', function(Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('payment_transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event_id')->nullable()->unique();
            $table->string('event', 100)->nullable()->index();
            $table->string('invoice_id')->nullable()->index();
            $table->string('external_id')->nullable()->index();
            $table->string('status', 50)->nullable()->index();
            $table->string('payload_hash', 64)->index();
            $table->boolean('callback_token_valid')->default(false)->index();
            $table->json('headers')->nullable();
            $table->json('payload');
            $table->timestamp('received_at')->useCurrent()->index();
            $table->timestamp('processed_at')->nullable();
            $table->text('processing_error')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('xendit_webhook_events');
    }
};
