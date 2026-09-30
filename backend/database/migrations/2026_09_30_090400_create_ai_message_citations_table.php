<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_message_citations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('ai_messages')->cascadeOnDelete();
            $table->foreignId('document_id')->nullable()->constrained('documents')->nullOnDelete();
            $table->foreignId('chunk_id')->nullable()->constrained('document_chunks')->nullOnDelete();
            // Dénormalisé : si le document est supprimé (document_id passe
            // à null), la citation reste lisible dans l'historique — même
            // logique que deletion_requests.document_id (voir sa migration).
            $table->string('document_title_snapshot');
            $table->unsignedInteger('page_number')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_message_citations');
    }
};
