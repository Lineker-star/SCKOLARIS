<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Autorise le dépôt/retrait des installeurs desktop/mobile par deux voies
 * indépendantes :
 *  - un jeton fixe (RELEASE_UPLOAD_TOKEN, variable d'environnement Railway),
 *    attendu dans l'en-tête X-Release-Token — ne dépend d'aucun compte
 *    utilisateur, pour publier une version même sans accès admin dans
 *    l'application (voir deploiement.md) ;
 *  - à défaut, un compte connecté avec le rôle admin, exactement comme
 *    avant — pour que l'école puisse aussi le faire elle-même depuis le
 *    tableau de bord si elle en a un jour la charge.
 *
 * Un en-tête dédié (pas "Authorization: Bearer") plutôt que de réutiliser
 * l'en-tête standard : Sanctum lit lui aussi "Authorization: Bearer" pour
 * authentifier un compte, ce qui entrerait en conflit avec le jeton fixe
 * si on partageait le même en-tête. Ces routes ne peuvent donc pas vivre
 * dans le groupe auth:sanctum (qui rejetterait la requête avant même
 * d'arriver ici) : la résolution d'un éventuel compte admin est faite
 * manuellement ci-dessous, seulement si le jeton est absent/invalide.
 */
class ReleaseAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = config('services.releases.token');
        if ($token !== null && $token !== '' && hash_equals($token, (string) $request->header('X-Release-Token'))) {
            return $next($request);
        }

        $user = auth('sanctum')->user();
        if ($user) {
            if ($user->isActive() && $user->role->value === 'admin') {
                return $next($request);
            }
            abort(403, 'Rôle insuffisant pour publier un installeur.');
        }

        abort(401, "Jeton de publication invalide ou absent, et aucun compte n'est connecté.");
    }
}
