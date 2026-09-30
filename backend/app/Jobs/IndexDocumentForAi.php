<?php

namespace App\Jobs;

use App\Models\Document;
use App\Services\Ai\DocumentRagService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Premier job en file d'attente de l'application (connexion `database`,
 * déjà configurée). Traité par un `php artisan queue:work` déclenché
 * périodiquement — voir deploiement.md pour la configuration Railway.
 *
 * N'échoue jamais bruyamment : DocumentRagService::index() capture ses
 * propres exceptions et stocke le statut/l'erreur directement sur le
 * document (visible depuis le dashboard admin), donc pas de retry
 * automatique ici — retenter un fichier structurellement invalide
 * consommerait des appels API pour rien.
 */
class IndexDocumentForAi implements ShouldQueue
{
    use Dispatchable, Queueable, InteractsWithQueue, SerializesModels;

    public int $tries = 1;

    public function __construct(
        public readonly Document $document,
        public readonly bool $force = false,
    ) {
    }

    public function handle(DocumentRagService $rag): void
    {
        $rag->index($this->document, $this->force);
    }
}
