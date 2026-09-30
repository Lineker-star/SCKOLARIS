<?php

namespace App\Services\Ai;

class DocumentChunker
{
    private const MAX_CHUNK_LENGTH = 1500;

    /**
     * Découpe un texte déjà extrait par page en chunks, sans jamais
     * fusionner deux pages dans un même chunk (les citations doivent
     * pouvoir référencer un numéro de page précis).
     *
     * @param  array<int, string>  $pages  Texte par numéro de page (1-indexé)
     * @return array<int, array{content: string, page_number: int}>
     */
    public function chunk(array $pages): array
    {
        $chunks = [];

        foreach ($pages as $pageNumber => $text) {
            $paragraphs = preg_split('/\R\s*\R/', $text) ?: [$text];
            $buffer = '';

            foreach ($paragraphs as $paragraph) {
                $paragraph = trim($paragraph);
                if ($paragraph === '') {
                    continue;
                }

                if ($buffer !== '' && mb_strlen($buffer) + mb_strlen($paragraph) + 2 > self::MAX_CHUNK_LENGTH) {
                    $chunks[] = ['content' => $buffer, 'page_number' => $pageNumber];
                    $buffer = '';
                }

                $buffer = $buffer === '' ? $paragraph : $buffer."\n\n".$paragraph;

                while (mb_strlen($buffer) > self::MAX_CHUNK_LENGTH) {
                    $chunks[] = ['content' => mb_substr($buffer, 0, self::MAX_CHUNK_LENGTH), 'page_number' => $pageNumber];
                    $buffer = mb_substr($buffer, self::MAX_CHUNK_LENGTH);
                }
            }

            if ($buffer !== '') {
                $chunks[] = ['content' => $buffer, 'page_number' => $pageNumber];
            }
        }

        return $chunks;
    }
}
