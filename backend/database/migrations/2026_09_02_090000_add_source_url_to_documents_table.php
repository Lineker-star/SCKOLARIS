<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Permet à un document de "pointer" vers une source externe légale
     * (ex: Project Gutenberg, œuvre du domaine public) au lieu d'exiger un
     * fichier déjà stocké chez nous. file_path devient nullable : pour un
     * document externe, il reste vide jusqu'au premier accès, où
     * DocumentController le récupère et le met en cache localement — après
     * quoi il se comporte exactement comme un document déposé normalement
     * (lecture, téléchargement, disponibilité hors ligne).
     */
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->string('file_path')->nullable()->change();
            $table->string('source_url')->nullable()->after('file_path');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn('source_url');
            $table->string('file_path')->nullable(false)->change();
        });
    }
};
