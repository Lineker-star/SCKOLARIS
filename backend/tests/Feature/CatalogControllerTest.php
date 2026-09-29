<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CatalogControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_browse_the_catalog_even_when_pending(): void
    {
        Sanctum::actingAs(User::factory()->create());
        Document::factory()->count(3)->create();

        $response = $this->getJson('/api/catalog');

        $response->assertStatus(200)->assertJsonCount(3, 'data');
    }

    public function test_guest_cannot_browse_the_catalog(): void
    {
        $response = $this->getJson('/api/catalog');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_view_a_document_detail(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $document = Document::factory()->create();

        $response = $this->getJson("/api/documents/{$document->id}");

        $response->assertStatus(200)->assertJsonPath('document.id', $document->id);
    }

    public function test_viewing_a_nonexistent_document_returns_404(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson('/api/documents/999');

        $response->assertStatus(404);
    }
}
