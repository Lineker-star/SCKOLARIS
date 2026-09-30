<?php

namespace App\Services\Ai\Concerns;

/**
 * Utilisé avant d'indexer tout contenu texte (fichiers projet ou documents
 * de la bibliothèque) pour éviter qu'une clé API ou un secret présent dans
 * un fichier ne se retrouve dans un chunk, puis dans un prompt envoyé au LLM.
 */
trait RedactsSecrets
{
    private function redactSecrets(string $content): string
    {
        $content = preg_replace(
            '/\b(?:GEMINI_API_KEY|ANTHROPIC_API_KEY|GOOGLE_API_KEY|API_KEY|SECRET_KEY|ACCESS_TOKEN)\s*[:=]\s*[^\s`]+/i',
            '[SECRET_REDACTED]',
            $content,
        );

        return preg_replace(
            '/\b(?:sk-ant-[A-Za-z0-9_-]{20,}|AIza[A-Za-z0-9_-]{20,})\b/',
            '[API_KEY_REDACTED]',
            $content,
        ) ?? $content;
    }
}
