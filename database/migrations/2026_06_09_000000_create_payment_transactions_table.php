<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payment_transactions', function(Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('provider', 50)->default('xendit')->index();
            $table->string('mode', 20)->default('sandbox')->index();
            $table->string('external_id')->index();
            $table->string('invoice_id')->nullable()->index();
            $table->string('idempotency_key')->nullable()->index();
            $table->string('status', 50)->default('PENDING')->index();
            $table->decimal('amount', 16, 2);
            $table->string('currency', 10)->default('IDR');
            $table->text('description')->nullable();
            $table->string('payer_email')->nullable();
            $table->text('invoice_url')->nullable();
            $table->text('success_redirect_url')->nullable();
            $table->text('failure_redirect_url')->nullable();
            $table->timestamp('paid_at')->nullable()->index();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamp('xendit_created_at')->nullable();
            $table->timestamp('xendit_updated_at')->nullable();
            $table->json('request_payload')->nullable();
            $table->json('response_payload')->nullable();
            $table->json('webhook_payload')->nullable();
            $table->timestamps();

            $table->unique(['provider', 'external_id']);
            $table->unique(['provider', 'invoice_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
