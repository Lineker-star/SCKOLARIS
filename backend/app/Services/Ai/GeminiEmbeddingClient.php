<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class GeminiEmbeddingClient
{
    private const MAX_ATTEMPTS = 2;

    /**
     * @return float[]
     */
    public function embed(string $text, string $taskType = 'RETRIEVAL_DOCUMENT'): array
    {
        $apiKey = config('services.gemini.api_key');
        if (! $apiKey) {
            throw new RuntimeException('GEMINI_API_KEY n’est pas configurée.');
        }

        $model = config('services.gemini.embedding_model', 'gemini-embedding-001');
        $lastError = null;

        for ($attempt = 1; $attempt <= self::MAX_ATTEMPTS; $attempt++) {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'x-goog-api-key' => $apiKey,
            ])->timeout(30)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/{$model}:embedContent",
                [
                    'model' => "models/{$model}",
                    'content' => ['parts' => [['text' => $text]]],
                    'taskType' => $taskType,
                ],
            );

            if ($response->successful()) {
                $values = $response->json('embedding.values');
                if (is_array($values) && $values !== []) {
                    return $values;
                }
            }

            $apiMessage = $response->json('error.message');
            $lastError = sprintf(
                'Échec de la création de l’embedding (HTTP %d, modèle %s) : %s',
                $response->status(),
                $model,
                is_string($apiMessage) ? $apiMessage : 'réponse API inconnue',
            );

            if ($attempt < self::MAX_ATTEMPTS && $response->serverError()) {
                usleep(300_000);

                continue;
            }

            break;
        }

        throw new RuntimeException($lastError ?? 'Échec de la création de l’embedding.');
    }
}
