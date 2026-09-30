<?php

namespace App\Services\Ai;

use App\Services\Ai\Contracts\TextExtractorInterface;
use RuntimeException;
use Smalot\PdfParser\Parser;
use Throwable;

class PdfTextExtractor implements TextExtractorInterface
{
    public function extract(string $absoluteFilePath): array
    {
        try {
            $document = (new Parser())->parseFile($absoluteFilePath);
        } catch (Throwable $exception) {
            throw new RuntimeException(
                "Impossible d'analyser le PDF : {$exception->getMessage()}",
                previous: $exception,
            );
        }

        $pages = [];
        foreach ($document->getPages() as $index => $page) {
            $text = trim((string) $page->getText());
            if ($text !== '') {
                $pages[$index + 1] = $text;
            }
        }

        return $pages;
    }
}
