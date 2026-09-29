<?php

namespace App\Http\Middleware;

use App\Models\UserActivityDaily;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Enregistre un utilisateur comme actif aujourd'hui, au plus une fois par
 * jour (contrainte unique sur user_id+activity_date) — alimente la courbe
 * "utilisateurs actifs par jour" des statistiques admin sans dépendre d'une
 * tâche planifiée (voir user_activity_daily, dont l'existence évite de
 * s'appuyer sur le planificateur Laravel, pas garanti actif en production).
 */
class TrackDailyActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user) {
            UserActivityDaily::insertOrIgnore([
                'user_id' => $user->id,
                'activity_date' => now()->toDateString(),
            ]);
        }

        return $next($request);
    }
}
