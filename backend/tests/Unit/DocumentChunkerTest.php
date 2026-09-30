<?php

namespace Tests\Unit;

use App\Services\Ai\DocumentChunker;
use PHPUnit\Framework\TestCase;

class DocumentChunkerTest extends TestCase
{
    public function test_it_never_merges_two_pages_into_one_chunk(): void
    {
        $chunks = (new DocumentChunker())->chunk([
            1 => 'Contenu de la page un.',
            2 => 'Contenu de la page deux.',
        ]);

        $pageNumbers = array_unique(array_column($chunks, 'page_number'));
        $this->assertCount(2, $chunks);
        $this->assertSame([1, 2], $pageNumbers);
    }

    public function test_it_hard_splits_a_paragraph_longer_than_the_chunk_size(): void
    {
        $longParagraph = str_repeat('a', 4000);

        $chunks = (new DocumentChunker())->chunk([1 => $longParagraph]);

        $this->assertGreaterThan(1, count($chunks));
        foreach ($chunks as $chunk) {
            $this->assertLessThanOrEqual(1500, mb_strlen($chunk['content']));
            $this->assertSame(1, $chunk['page_number']);
        }
        $this->assertSame($longParagraph, implode('', array_column($chunks, 'content')));
    }

    public function test_it_ignores_empty_pages(): void
    {
        $chunks = (new DocumentChunker())->chunk([1 => '   ', 2 => 'Texte réel.']);

        $this->assertCount(1, $chunks);
        $this->assertSame(2, $chunks[0]['page_number']);
    }
}
