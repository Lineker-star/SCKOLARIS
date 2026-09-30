<?php

namespace Tests\Feature;

use App\Enums\AiIndexStatus;
use App\Jobs\IndexDocumentForAi;
use App\Models\Document;
use App\Services\Ai\Contracts\TextExtractorInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class IndexDocumentForAiJobTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        config(['services.gemini.api_key' => 'test-key']);

        // Pas de vrai PDF à parser dans ces tests : on remplace
        // l'extracteur par un double qui retourne un texte connu, pour
        // tester la suite du pipeline (chunking, embeddings, stockage)
        // indépendamment de smalot/pdfparser.
        $this->app->bind(TextExtractorInterface::class, fn () => new class implements TextExtractorInterface {
            public function extract(string $absoluteFilePath): array
            {
                return [
                    1 => 'Ce chapitre traite de la normalisation des bases de données relationnelles.',
                    2 => 'Ce chapitre traite des algorithmes de routage dans les réseaux informatiques.',
                ];
            }
        });
    }

    private function fakeEmbeddingResponses(): void
    {
        Http::fake([
            '*generativelanguage.googleapis.com*embedContent*' => Http::response([
                'embedding' => ['values' => array_fill(0, 8, 0.1)],
            ], 200),
        ]);
    }

    public function test_it_indexes_a_pdf_document_into_chunks(): void
    {
        $this->fakeEmbeddingResponses();

        $document = Document::factory()->create(['file_path' => 'documents/test.pdf']);
        Storage::disk('local')->put($document->file_path, 'contenu pdf factice');

        IndexDocumentForAi::dispatchSync($document);

        $document->refresh();
        $this->assertSame(AiIndexStatus::INDEXED, $document->ai_index_status);
        $this->assertNotNull($document->ai_indexed_at);
        $this->assertDatabaseCount('document_chunks', 2);
        $this->assertDatabaseHas('document_chunks', ['document_id' => $document->id, 'page_number' => 1]);
        $this->assertDatabaseHas('document_chunks', ['document_id' => $document->id, 'page_number' => 2]);
    }

    public function test_it_marks_non_pdf_documents_as_unsupported(): void
    {
        $document = Document::factory()->create(['file_path' => 'documents/test.docx']);
        Storage::disk('local')->put($document->file_path, 'contenu docx factice');

        IndexDocumentForAi::dispatchSync($document);

        $document->refresh();
        $this->assertSame(AiIndexStatus::UNSUPPORTED_FORMAT, $document->ai_index_status);
        $this->assertNotNull($document->ai_index_error);
        $this->assertDatabaseCount('document_chunks', 0);
    }

    public function test_it_marks_oversized_files_as_too_large_without_extracting(): void
    {
        config(['services.ai.max_indexable_file_mb' => 0]);

        $document = Document::factory()->create(['file_path' => 'documents/test.pdf']);
        Storage::disk('local')->put($document->file_path, 'contenu pdf factice');

        IndexDocumentForAi::dispatchSync($document);

        $document->refresh();
        $this->assertSame(AiIndexStatus::TOO_LARGE, $document->ai_index_status);
        $this->assertDatabaseCount('document_chunks', 0);
    }

    public function test_reindexing_skips_unchanged_chunks(): void
    {
        $this->fakeEmbeddingResponses();

        $document = Document::factory()->create(['file_path' => 'documents/test.pdf']);
        Storage::disk('local')->put($document->file_path, 'contenu pdf factice');

        IndexDocumentForAi::dispatchSync($document);
        Http::assertSentCount(2);

        IndexDocumentForAi::dispatchSync($document);
        // Contenu inchangé (même extracteur factice) : aucun nouvel appel
        // d'embedding, le content_hash évite le travail redondant.
        Http::assertSentCount(2);

        $this->assertDatabaseCount('document_chunks', 2);
    }
}
