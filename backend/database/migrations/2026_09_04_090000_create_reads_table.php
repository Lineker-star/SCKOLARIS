<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Miroir de `downloads` pour la lecture en ligne — jusqu'ici seul le
     * téléchargement était journalisé ; sans cette table, impossible de
     * comparer lecture en ligne et téléchargement dans les statistiques
     * admin.
     */
    public function up(): void
    {
        Schema::create('reads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->timestampTz('read_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reads');
    }
};
