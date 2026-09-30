<?php

namespace App\Services;

use App\Models\RagChunk;
use App\Services\Ai\Concerns\RedactsSecrets;
use Symfony\Component\Finder\Finder;

class ProjectRagService
{
    use RedactsSecrets;

    private const MAX_CHUNK_LENGTH = 1800;
    private const MAX_RESULTS = 5;

    private const ALLOWED_EXTENSIONS = [
        'md', 'php', 'js', 'jsx', 'ts', 'tsx', 'json', 'css', 'html', 'vue',
    ];

    /**
     * Mots trop fréquents pour être discriminants — ignorés lors du calcul
     * de pertinence (français et anglais, les deux langues de l'interface).
     */
    private const STOPWORDS = [
        'les', 'des', 'une', 'un', 'que', 'qui', 'pour', 'dans', 'sur', 'avec',
        'est', 'sont', 'cette', 'ces', 'par', 'vous', 'votre', 'comment',
        'quoi', 'quel', 'quelle', 'quels', 'quelles', 'être', 'avoir', 'fait',
        'aussi', 'plus', 'tout', 'tous', 'toute', 'toutes', 'mais', 'donc',
        'the', 'and', 'for', 'with', 'that', 'this', 'how', 'what', 'are',
        'you', 'your', 'have', 'has', 'can', 'from', 'not',
    ];

    public function index(bool $force = false): int
    {
        if ($force) {
            RagChunk::query()->delete();
        }

        $indexed = 0;
        foreach ($this->projectFiles() as $file) {
            $relativePath = $this->relativePath($file->getRealPath());
            $chunks = $this->chunksForFile($relativePath, $file->getContents());

            foreach ($chunks as $chunk) {
                $existing = RagChunk::query()
                    ->where('source_path', $relativePath)
                    ->where('chunk_key', $chunk['chunk_key'])
                    ->first();

                if ($existing?->content_hash === $chunk['content_hash']) {
                    $indexed++;
                    continue;
                }

                RagChunk::query()->updateOrCreate(
                    [
                        'source_path' => $relativePath,
                        'chunk_key' => $chunk['chunk_key'],
                    ],
                    $chunk + ['indexed_at' => now()],
                );
                $indexed++;
            }

            RagChunk::query()
                ->where('source_path', $relativePath)
                ->whereNotIn('chunk_key', collect($chunks)->pluck('chunk_key'))
                ->delete();
        }

        return $indexed;
    }

    /**
     * Recherche lexicale (comptage pondéré des termes de la question dans
     * chaque passage) — pas d'appel à un service externe : l'indexation et
     * la recherche fonctionnent sans clé API, contrairement à une recherche
     * par embeddings.
     */
    public function search(string $question): array
    {
        $terms = $this->extractTerms($question);
        if ($terms === [] || ! RagChunk::query()->exists()) {
            return ['context' => '', 'sources' => []];
        }

        $matches = RagChunk::query()->get()
            ->map(fn (RagChunk $chunk) => [
                'chunk' => $chunk,
                'score' => $this->relevanceScore($terms, $chunk->content),
            ])
            ->filter(fn (array $match) => $match['score'] > 0)
            ->sortByDesc('score')
            ->take(self::MAX_RESULTS)
            ->values();

        return [
            'context' => $matches->map(function (array $match): string {
                $chunk = $match['chunk'];
                return "--- {$chunk->source_path} ({$chunk->chunk_key}) ---\n{$chunk->content}";
            })->implode("\n\n"),
            'sources' => $matches->map(fn (array $match) => $match['chunk']->source_path)->unique()->values()->all(),
        ];
    }

    /**
     * @param  string[]  $terms
     */
    private function relevanceScore(array $terms, string $content): float
    {
        $haystack = mb_strtolower($content);
        $score = 0.0;

        foreach ($terms as $term) {
            $count = substr_count($haystack, $term);
            if ($count > 0) {
                // Les termes longs sont plus spécifiques (ex. "téléchargement"
                // vs "compte") — légèrement mieux pondérés qu'un simple compte.
                $score += $count * (mb_strlen($term) >= 6 ? 2 : 1);
            }
        }

        return $score;
    }

    /**
     * @return string[]
     */
    private function extractTerms(string $text): array
    {
        $normalized = mb_strtolower($text);
        preg_match_all('/\p{L}[\p{L}\p{N}\-]*/u', $normalized, $matches);

        return array_values(array_unique(array_filter(
            $matches[0],
            fn (string $word) => mb_strlen($word) >= 3 && ! in_array($word, self::STOPWORDS, true),
        )));
    }

    private function projectFiles(): Finder
    {
        return (new Finder())
            ->files()
            ->in(dirname(base_path()))
            ->ignoreDotFiles(true)
            ->exclude(['vendor', 'node_modules', '.git', 'storage', 'bootstrap/cache', '.cache'])
            ->name('/\.(?:'.implode('|', self::ALLOWED_EXTENSIONS).')$/i');
    }

    private function chunksForFile(string $relativePath, string $content): array
    {
        $safeContent = $this->redactSecrets($content);
        $sections = preg_split('/\R\s*\R/', $safeContent) ?: [];
        $chunks = [];

        foreach ($sections as $section) {
            $section = trim($section);
            if ($section === '') {
                continue;
            }

            foreach (str_split($section, self::MAX_CHUNK_LENGTH) as $partIndex => $part) {
                $chunks[] = [
                    'chunk_key' => (string) (count($chunks) + 1),
                    'content' => trim($part),
                    'content_hash' => hash('sha256', $relativePath.'|'.trim($part)),
                ];
            }
        }

        return $chunks;
    }

    private function relativePath(string $path): string
    {
        return ltrim(str_replace('\\', '/', str_replace(dirname(base_path()), '', $path)), '/');
    }
}
