<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * La recherche RAG est passée d'une similarité par embeddings (Gemini) à une
 * recherche lexicale calculée à la volée — voir ProjectRagService. La colonne
 * ne sert plus à rien.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rag_chunks', function (Blueprint $table) {
            $table->dropColumn('embedding');
        });
    }

    public function down(): void
    {
        Schema::table('rag_chunks', function (Blueprint $table) {
            $table->jsonb('embedding')->nullable();
        });
    }
};
