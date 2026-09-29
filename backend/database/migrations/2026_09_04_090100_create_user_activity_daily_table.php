<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Une ligne par utilisateur actif par jour (upsert depuis
     * TrackDailyActivity middleware) — permet une vraie courbe
     * "utilisateurs actifs par jour" dans le temps, sans dépendre d'une
     * tâche planifiée (le planificateur Laravel n'est pas garanti actif en
     * production, voir deploiement.md). `is_online` (déjà existant sur
     * `users`) reste la source pour "en ligne maintenant", un instantané.
     */
    public function up(): void
    {
        Schema::create('user_activity_daily', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('activity_date');
            $table->timestampTz('created_at')->useCurrent();
            $table->unique(['user_id', 'activity_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_activity_daily');
    }
};
