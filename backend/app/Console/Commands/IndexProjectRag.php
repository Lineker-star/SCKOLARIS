<?php

namespace App\Console\Commands;

use App\Services\ProjectRagService;
use Illuminate\Console\Command;
use Throwable;

class IndexProjectRag extends Command
{
    protected $signature = 'rag:index {--force : Recrée tous les passages indexés}';

    protected $description = 'Indexe le code et la documentation du projet pour l’assistant RAG';

    public function handle(ProjectRagService $rag): int
    {
        try {
            $count = $rag->index((bool) $this->option('force'));
            $this->info("Index RAG terminé : {$count} passage(s) disponible(s).");

            return self::SUCCESS;
        } catch (Throwable $exception) {
            $this->error('Échec de l’indexation RAG : '.$exception->getMessage());

            return self::FAILURE;
        }
    }
}