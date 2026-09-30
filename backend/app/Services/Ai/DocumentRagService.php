<?php

namespace App\Services\Ai;

use App\Enums\AiIndexStatus;
use App\Models\Document;
use App\Models\DocumentChunk;
use App\Services\Ai\Concerns\RedactsSecrets;
use App\Services\Ai\Contracts\TextExtractorInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class DocumentRagService
{
    use RedactsSecrets;

    private const MAX_RESULTS = 5;
    private const MAX_CROSS_DOCUMENT_RESULTS = 8;
    private const MINIMUM_SIMILARITY = 0.5;

    public function __construct(
        private readonly TextExtractorInterface $extractor,
        private readonly DocumentChunker $chunker,
        private readonly GeminiEmbeddingClient $embeddings,
    ) {
    }

    /**
     * Extrait, découpe, calcule les embeddings et stocke les chunks d'un
     * document. Idempotent : un chunk dont le contenu n'a pas changé n'est
     * pas ré-embeddé (économise des appels API lors d'une ré-indexation).
     * N'écrit jamais d'exception vers l'appelant — le statut d'échec est
     * stocké sur le document lui-même pour rester visible depuis le
     * dashboard admin sans faire échouer le job en file d'attente.
     */
    public function index(Document $document, bool $force = false): void
    {
        $document->forceFill(['ai_index_status' => AiIndexStatus::PROCESSING, 'ai_index_error' => null])->save();

        try {
            if (! $document->file_path || ! Storage::disk('local')->exists($document->file_path)) {
                $this->markUnsupported($document, 'Aucun fichier local à indexer (source externe pas encore mise en cache).');

                return;
            }

            $extension = strtolower((string) pathinfo($document->file_path, PATHINFO_EXTENSION));
            if ($extension !== 'pdf') {
                $this->markUnsupported($document, "Format .{$extension} non pris en charge pour l'indexation IA (PDF uniquement pour l'instant).");

                return;
            }

            $maxBytes = ((int) config('services.ai.max_indexable_file_mb', 100)) * 1024 * 1024;
            $size = Storage::disk('local')->size($document->file_path);
            if ($size > $maxBytes) {
                $document->forceFill([
                    'ai_index_status' => AiIndexStatus::TOO_LARGE,
                    'ai_index_error' => sprintf('Fichier de %.1f Mo, au-delà de la limite d’indexation (%d Mo).', $size / 1024 / 1024, $maxBytes / 1024 / 1024),
                ])->save();

                return;
            }

            $pages = $this->extractor->extract(Storage::disk('local')->path($document->file_path));
            if ($pages === []) {
                $this->markUnsupported($document, "Aucun texte n'a pu être extrait (probablement un PDF scanné, sans OCR pour l'instant).");

                return;
            }

            $redactedPages = array_map(fn (string $text) => $this->redactSecrets($text), $pages);
            $chunks = $this->chunker->chunk($redactedPages);

            $keptChunkIndexes = [];
            foreach (array_values($chunks) as $chunkIndex => $chunk) {
                $contentHash = hash('sha256', $document->id.'|'.$chunk['content']);
                $keptChunkIndexes[] = $chunkIndex;

                $existing = DocumentChunk::query()
                    ->where('document_id', $document->id)
                    ->where('chunk_index', $chunkIndex)
                    ->first();

                if (! $force && $existing?->content_hash === $contentHash) {
                    continue;
                }

                $embedding = $this->embeddings->embed($chunk['content'], 'RETRIEVAL_DOCUMENT');

                DocumentChunk::query()->updateOrCreate(
                    ['document_id' => $document->id, 'chunk_index' => $chunkIndex],
                    [
                        'content' => $chunk['content'],
                        'page_number' => $chunk['page_number'],
                        'embedding' => $embedding,
                        'content_hash' => $contentHash,
                    ],
                );
            }

            DocumentChunk::query()
                ->where('document_id', $document->id)
                ->whereNotIn('chunk_index', $keptChunkIndexes)
                ->delete();

            $document->forceFill([
                'ai_index_status' => AiIndexStatus::INDEXED,
                'ai_indexed_at' => now(),
                'ai_index_error' => null,
            ])->save();
        } catch (Throwable $exception) {
            $document->forceFill([
                'ai_index_status' => AiIndexStatus::FAILED,
                'ai_index_error' => $exception->getMessage(),
            ])->save();
        }
    }

    /**
     * Recherche restreinte au contenu d'un seul document ("Ask this book").
     *
     * @return array{context: string, citations: array<int, array{chunk_id: int, page_number: ?int, content: string}>}
     */
    public function search(Document $document, string $question, int $limit = self::MAX_RESULTS): array
    {
        try {
            $questionEmbedding = $this->embeddings->embed($question, 'RETRIEVAL_QUERY');
        } catch (Throwable) {
            return ['context' => '', 'citations' => []];
        }

        $matches = $document->chunks()->get()
            ->map(fn (DocumentChunk $chunk) => [
                'chunk' => $chunk,
                'score' => $this->cosineSimilarity($questionEmbedding, $chunk->embedding),
            ])
            ->filter(fn (array $match) => $match['score'] >= self::MINIMUM_SIMILARITY)
            ->sortByDesc('score')
            ->take($limit)
            ->values();

        return $this->formatMatches($matches);
    }

    /**
     * Recherche à travers plusieurs documents (catalogue / recommandation).
     * Le filtrage par permission (quels documents l'utilisateur peut lire)
     * DOIT être fait par l'appelant avant : cette méthode ne recherche que
     * dans les documents listés dans $allowedDocumentIds.
     *
     * @return array{context: string, citations: array<int, array{chunk_id: int, page_number: ?int, content: string}>}
     */
    public function searchAcrossDocuments(string $question, Collection $allowedDocumentIds, int $limit = self::MAX_CROSS_DOCUMENT_RESULTS): array
    {
        if ($allowedDocumentIds->isEmpty()) {
            return ['context' => '', 'citations' => []];
        }

        try {
            $questionEmbedding = $this->embeddings->embed($question, 'RETRIEVAL_QUERY');
        } catch (Throwable) {
            return ['context' => '', 'citations' => []];
        }

        $matches = DocumentChunk::query()
            ->whereIn('document_id', $allowedDocumentIds)
            ->get()
            ->map(fn (DocumentChunk $chunk) => [
                'chunk' => $chunk,
                'score' => $this->cosineSimilarity($questionEmbedding, $chunk->embedding),
            ])
            ->filter(fn (array $match) => $match['score'] >= self::MINIMUM_SIMILARITY)
            ->sortByDesc('score')
            ->take($limit)
            ->values();

        return $this->formatMatches($matches);
    }

    private function formatMatches(Collection $matches): array
    {
        $citations = $matches->map(fn (array $match) => [
            'chunk_id' => $match['chunk']->id,
            'document_id' => $match['chunk']->document_id,
            'page_number' => $match['chunk']->page_number,
            'content' => $match['chunk']->content,
        ])->all();

        $context = $matches->map(function (array $match): string {
            $chunk = $match['chunk'];
            $pageLabel = $chunk->page_number ? "p. {$chunk->page_number}" : 'page inconnue';

            return "--- document #{$chunk->document_id} ({$pageLabel}) ---\n{$chunk->content}";
        })->implode("\n\n");

        return ['context' => $context, 'citations' => $citations];
    }

    private function markUnsupported(Document $document, string $reason): void
    {
        $document->forceFill([
            'ai_index_status' => AiIndexStatus::UNSUPPORTED_FORMAT,
            'ai_index_error' => $reason,
        ])->save();
    }

    private function cosineSimilarity(array $first, array $second): float
    {
        $dot = $firstMagnitude = $secondMagnitude = 0.0;
        foreach ($first as $index => $value) {
            $dot += $value * ($second[$index] ?? 0);
            $firstMagnitude += $value ** 2;
            $secondMagnitude += ($second[$index] ?? 0) ** 2;
        }

        return ($firstMagnitude && $secondMagnitude)
            ? $dot / (sqrt($firstMagnitude) * sqrt($secondMagnitude))
            : 0.0;
    }
}
