<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MarkExpiredSessionsOffline extends Command
{
    protected $signature = 'users:mark-expired-offline';

    protected $description = "Marque hors ligne (is_online = false) les utilisateurs dont plus aucun jeton n'est valide (expiré ou révoqué) — Sanctum ne déclenche aucun événement à l'expiration d'un jeton, cette commande planifiée compense ce manque.";

    public function handle(): int
    {
        $count = User::where('is_online', true)
            ->whereDoesntHave('tokens', function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->update(['is_online' => false]);

        $this->info("{$count} utilisateur(s) marqué(s) hors ligne (jeton expiré).");

        return self::SUCCESS;
    }
}
