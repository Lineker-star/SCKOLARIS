<?php

namespace App\Services\Ai\Contracts;

interface TextExtractorInterface
{
    /**
     * Extrait le texte d'un fichier, page par page.
     *
     * @return array<int, string> Texte non vide par numéro de page
     * (1-indexé). Tableau vide si aucun texte n'a pu être extrait (ex: PDF
     * composé uniquement d'images scannées).
     */
    public function extract(string $absoluteFilePath): array;
}
