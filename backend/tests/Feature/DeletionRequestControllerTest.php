<?php

namespace Tests\Feature;

use App\Enums\DeletionRequestStatus;
use App\Models\DeletionRequest;
use App\Models\Document;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DeletionRequestControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_teacher_can_request_deletion_of_their_document(): void
    {
        $teacher = User::factory()->teacher()->create();
        Sanctum::actingAs($teacher);
        $document = Document::factory()->create(['uploaded_by_id' => $teacher->id]);

        $response = $this->postJson("/api/documents/{$document->id}/deletion-request", [
            'justification' => 'Contenu obsolete.',
        ]);

        $response->assertStatus(201)->assertJsonPath('deletion_request.status', 'pending');
        $this->assertDatabaseHas('deletion_requests', ['document_id' => $document->id]);
    }

    public function test_teacher_cannot_request_deletion_of_another_teachers_document(): void
    {
        Sanctum::actingAs(User::factory()->teacher()->create());
        $document = Document::factory()->create();

        $response = $this->postJson("/api/documents/{$document->id}/deletion-request", [
            'justification' => 'Contenu obsolete.',
        ]);

        $response->assertStatus(403);
    }

    public function test_deletion_request_fails_when_one_is_already_pending(): void
    {
        $teacher = User::factory()->teacher()->create();
        Sanctum::actingAs($teacher);
        $document = Document::factory()->create(['uploaded_by_id' => $teacher->id]);
        DeletionRequest::factory()->create([
            'document_id' => $document->id,
            'status' => DeletionRequestStatus::PENDING,
        ]);

        $response = $this->postJson("/api/documents/{$document->id}/deletion-request", [
            'justification' => 'Autre justification.',
        ]);

        $response->assertStatus(409);
    }

    public function test_admin_can_list_pending_deletion_requests(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        DeletionRequest::factory()->count(2)->create(['status' => DeletionRequestStatus::PENDING]);

        $response = $this->getJson('/api/deletion-requests');

        $response->assertStatus(200)->assertJsonCount(2, 'deletion_requests');
    }

    public function test_non_admin_cannot_list_deletion_requests(): void
    {
        Sanctum::actingAs(User::factory()->teacher()->create());

        $response = $this->getJson('/api/deletion-requests');

        $response->assertStatus(403);
    }

    public function test_admin_approving_a_deletion_request_removes_the_document(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $document = Document::factory()->create();
        $deletionRequest = DeletionRequest::factory()->create([
            'document_id' => $document->id,
            'status' => DeletionRequestStatus::PENDING,
        ]);

        $response = $this->patchJson("/api/deletion-requests/{$deletionRequest->id}", ['decision' => 'approved']);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('documents', ['id' => $document->id]);
        $this->assertDatabaseHas('deletion_requests', ['id' => $deletionRequest->id, 'status' => 'approved']);
    }

    public function test_non_admin_cannot_process_a_deletion_request(): void
    {
        Sanctum::actingAs(User::factory()->teacher()->create());
        $deletionRequest = DeletionRequest::factory()->create();

        $response = $this->patchJson("/api/deletion-requests/{$deletionRequest->id}", ['decision' => 'approved']);

        $response->assertStatus(403);
    }
}
