<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rag_chunks', function (Blueprint $table) {
            $table->id();
            $table->string('source_path');
            $table->string('chunk_key');
            $table->text('content');
            $table->jsonb('embedding');
            $table->string('content_hash', 64);
            $table->timestampTz('indexed_at')->useCurrent();
            $table->timestamps();

            $table->unique(['source_path', 'chunk_key']);
            $table->index('content_hash');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rag_chunks');
    }
};