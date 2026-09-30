<?php

namespace Tests\Feature;

use App\Enums\AiIndexStatus;
use App\Jobs\IndexDocumentForAi;
use App\Models\Document;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiAdministrationControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_list_ai_documents(): void
    {
        Sanctum::actingAs(User::factory()->validated()->create());

        $this->getJson('/api/admin/ai/documents')->assertStatus(403);
    }

    public function test_admin_can_list_documents_with_status_counts(): void
    {
        Document::factory()->create(['ai_index_status' => AiIndexStatus::INDEXED]);
        Document::factory()->create(['ai_index_status' => AiIndexStatus::PENDING]);

        Sanctum::actingAs(User::factory()->admin()->create());
        $response = $this->getJson('/api/admin/ai/documents');

        $response->assertStatus(200)
            ->assertJsonPath('counts.indexed', 1)
            ->assertJsonPath('counts.pending', 1);
    }

    public function test_admin_can_trigger_indexing(): void
    {
        Bus::fake();
        $document = Document::factory()->create(['ai_index_status' => AiIndexStatus::PENDING]);

        Sanctum::actingAs(User::factory()->admin()->create());
        $response = $this->postJson("/api/admin/ai/documents/{$document->id}/index");

        $response->assertStatus(200);
        Bus::assertDispatched(IndexDocumentForAi::class, fn ($job) => $job->document->id === $document->id);
    }

    public function test_reindexing_an_already_indexed_document_requires_force(): void
    {
        Bus::fake();
        $document = Document::factory()->create(['ai_index_status' => AiIndexStatus::INDEXED]);

        Sanctum::actingAs(User::factory()->admin()->create());
        $response = $this->postJson("/api/admin/ai/documents/{$document->id}/index");

        $response->assertStatus(409);
        Bus::assertNotDispatched(IndexDocumentForAi::class);
    }
}
