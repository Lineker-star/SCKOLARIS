<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Download;
use App\Models\Subdomain;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DocumentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    public function test_teacher_can_upload_a_document(): void
    {
        Sanctum::actingAs(User::factory()->teacher()->create());

        $response = $this->postJson('/api/documents', [
            'title' => 'Cours de test',
            'author' => 'Prof',
            'subdomain_id' => Subdomain::factory()->create()->id,
            'file' => UploadedFile::fake()->create('cours.pdf', 100, 'application/pdf'),
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('documents', ['title' => 'Cours de test']);
        Storage::disk('local')->assertExists($response->json('document.file_path'));
    }

    public function test_student_cannot_upload_a_document(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/documents', [
            'title' => 'Cours de test',
            'author' => 'Prof',
            'subdomain_id' => Subdomain::factory()->create()->id,
            'file' => UploadedFile::fake()->create('cours.pdf', 100, 'application/pdf'),
        ]);

        $response->assertStatus(403);
    }

    public function test_a_not_yet_validated_teacher_cannot_upload_a_document(): void
    {
        // Cas d'un enseignant tout juste auto-inscrit (voir RegisterRequest)
        // — le rôle "teacher" est déjà attribué, mais le compte reste
        // "pending" tant qu'un admin ne l'a pas validé.
        Sanctum::actingAs(User::factory()->teacher()->create(['account_status' => 'pending']));

        $response = $this->postJson('/api/documents', [
            'title' => 'Cours de test',
            'author' => 'Prof',
            'subdomain_id' => Subdomain::factory()->create()->id,
            'file' => UploadedFile::fake()->create('cours.pdf', 100, 'application/pdf'),
        ]);

        $response->assertStatus(403);
    }

    public function test_owner_teacher_can_update_their_document(): void
    {
        $teacher = User::factory()->teacher()->create();
        Sanctum::actingAs($teacher);
        $document = Document::factory()->create(['uploaded_by_id' => $teacher->id]);

        $response = $this->putJson("/api/documents/{$document->id}", ['title' => 'Titre modifie']);

        $response->assertStatus(200);
        $this->assertDatabaseHas('documents', ['id' => $document->id, 'title' => 'Titre modifie']);
    }

    public function test_teacher_cannot_update_another_teachers_document(): void
    {
        Sanctum::actingAs(User::factory()->teacher()->create());
        $document = Document::factory()->create();

        $response = $this->putJson("/api/documents/{$document->id}", ['title' => 'Titre modifie']);

        $response->assertStatus(403);
    }

    public function test_admin_can_delete_a_document(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $document = Document::factory()->create();

        $response = $this->deleteJson("/api/documents/{$document->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('documents', ['id' => $document->id]);
    }

    public function test_teacher_cannot_delete_a_document(): void
    {
        Sanctum::actingAs(User::factory()->teacher()->create());
        $document = Document::factory()->create();

        $response = $this->deleteJson("/api/documents/{$document->id}");

        $response->assertStatus(403);
    }

    public function test_any_authenticated_user_can_read_a_document_online(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $document = Document::factory()->create(['file_path' => 'documents/test.pdf']);
        Storage::disk('local')->put($document->file_path, 'contenu-pdf');

        $response = $this->get("/api/documents/{$document->id}/read");

        $response->assertStatus(200);
    }

    public function test_reading_a_nonexistent_document_returns_404(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->get('/api/documents/999/read');

        $response->assertStatus(404);
    }

    public function test_authenticated_user_can_get_a_read_link(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $document = Document::factory()->create(['file_path' => 'documents/test.pdf']);
        Storage::disk('local')->put($document->file_path, 'contenu-pdf');

        $response = $this->getJson("/api/documents/{$document->id}/read-link");

        $response->assertStatus(200)->assertJsonStructure(['url']);
    }

    public function test_read_stream_serves_the_document_via_a_signed_url_without_authentication(): void
    {
        $document = Document::factory()->create(['file_path' => 'documents/test.pdf']);
        Storage::disk('local')->put($document->file_path, 'contenu-pdf');

        $url = \Illuminate\Support\Facades\URL::temporarySignedRoute(
            'documents.read-stream',
            now()->addMinutes(5),
            ['document' => $document->id],
        );

        $response = $this->get($url);

        $response->assertStatus(200);
    }

    public function test_read_stream_rejects_a_tampered_url(): void
    {
        $document = Document::factory()->create(['file_path' => 'documents/test.pdf']);
        Storage::disk('local')->put($document->file_path, 'contenu-pdf');

        $response = $this->get("/api/documents/{$document->id}/read-stream?expires=9999999999&signature=invalide");

        $response->assertStatus(403);
    }

    public function test_validated_user_can_download_a_document(): void
    {
        Sanctum::actingAs(User::factory()->validated()->create());
        $document = Document::factory()->create(['file_path' => 'documents/test.pdf']);
        Storage::disk('local')->put($document->file_path, 'contenu-pdf');

        $response = $this->post("/api/documents/{$document->id}/download");

        $response->assertStatus(200);
        $this->assertDatabaseHas('downloads', ['document_id' => $document->id]);
        $this->assertDatabaseHas('document_library', ['document_id' => $document->id]);
    }

    public function test_pending_user_cannot_download_a_document(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $document = Document::factory()->create(['file_path' => 'documents/test.pdf']);
        Storage::disk('local')->put($document->file_path, 'contenu-pdf');

        $response = $this->post("/api/documents/{$document->id}/download");

        $response->assertStatus(403);
    }

    public function test_validated_user_can_view_their_download_history(): void
    {
        $user = User::factory()->validated()->create();
        Sanctum::actingAs($user);
        Download::factory()->count(2)->create(['user_id' => $user->id]);

        $response = $this->getJson('/api/downloads');

        $response->assertStatus(200)->assertJsonCount(2, 'downloads');
    }

    public function test_pending_user_cannot_view_download_history(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson('/api/downloads');

        $response->assertStatus(403);
    }

    public function test_teacher_can_list_their_own_uploads(): void
    {
        $teacher = User::factory()->teacher()->create();
        Sanctum::actingAs($teacher);
        Document::factory()->count(2)->create(['uploaded_by_id' => $teacher->id]);
        Document::factory()->create();

        $response = $this->getJson('/api/my-uploads');

        $response->assertStatus(200)->assertJsonCount(2, 'documents');
    }

    public function test_student_cannot_list_uploads(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson('/api/my-uploads');

        $response->assertStatus(403);
    }
}
