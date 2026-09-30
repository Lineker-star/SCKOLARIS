<?php

namespace App\Services\Ai;

use App\Enums\ChatIntent;

/**
 * Routage déterministe (pas d'appel LLM) : coût, latence et prévisibilité.
 * Volontairement simple pour cette première version — à faire évoluer si
 * les heuristiques montrent leurs limites en usage réel.
 */
class IntentRouter
{
    private const CATALOG_KEYWORDS = [
        // Français
        'trouve', 'trouver', 'cherche', 'chercher', 'recommande', 'recommander',
        'recommandation', 'livre', 'livres', 'document', 'documents', 'ressource',
        'ressources', 'problème', 'objectif', 'devenir', 'apprendre', 'apprentissage',
        'parcours', 'débuter', 'débutant', 'niveau', 'comparer', 'compare',
        // Anglais
        'find', 'search', 'recommend', 'recommendation', 'book', 'books',
        'resource', 'resources', 'problem', 'goal', 'become', 'learn', 'learning',
        'path', 'beginner', 'level', 'compare',
    ];

    public function classify(string $message, ?int $documentId): ChatIntent
    {
        if ($documentId !== null) {
            return ChatIntent::BOOK_QUESTION;
        }

        $normalized = mb_strtolower($message);
        foreach (self::CATALOG_KEYWORDS as $keyword) {
            if (str_contains($normalized, $keyword)) {
                return ChatIntent::CATALOG_SEARCH_OR_RECOMMEND;
            }
        }

        return ChatIntent::PLATFORM_HELP;
    }
}
