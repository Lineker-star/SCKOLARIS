<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LibraryControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_validated_user_can_list_their_library(): void
    {
        $user = User::factory()->validated()->create();
        Sanctum::actingAs($user);
        $document = Document::factory()->create();
        $user->libraryDocuments()->attach($document->id);

        $response = $this->getJson('/api/library');

        $response->assertStatus(200)->assertJsonCount(1, 'documents');
    }

    public function test_pending_user_cannot_list_their_library(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson('/api/library');

        $response->assertStatus(403);
    }

    public function test_validated_user_can_remove_a_document_from_their_library(): void
    {
        $user = User::factory()->validated()->create();
        Sanctum::actingAs($user);
        $document = Document::factory()->create();
        $user->libraryDocuments()->attach($document->id);

        $response = $this->deleteJson("/api/library/{$document->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('document_library', ['user_id' => $user->id, 'document_id' => $document->id]);
    }

    public function test_removing_a_document_does_not_affect_other_users_libraries(): void
    {
        $owner = User::factory()->validated()->create();
        $other = User::factory()->validated()->create();
        $document = Document::factory()->create();
        $owner->libraryDocuments()->attach($document->id);
        $other->libraryDocuments()->attach($document->id);

        Sanctum::actingAs($owner);
        $this->deleteJson("/api/library/{$document->id}")->assertStatus(204);

        $this->assertDatabaseHas('document_library', ['user_id' => $other->id, 'document_id' => $document->id]);
    }
}
