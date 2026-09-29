<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Domain;
use App\Models\Subdomain;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SubdomainControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_a_subdomain_under_a_domain(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $domain = Domain::factory()->create();

        $response = $this->postJson("/api/domains/{$domain->id}/subdomains", ['name' => 'Médecine']);

        $response->assertStatus(201);
        $this->assertDatabaseHas('subdomains', ['domain_id' => $domain->id, 'name' => 'Médecine']);
    }

    public function test_student_cannot_create_a_subdomain(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $domain = Domain::factory()->create();

        $response = $this->postJson("/api/domains/{$domain->id}/subdomains", ['name' => 'Médecine']);

        $response->assertStatus(403);
    }

    public function test_admin_can_rename_a_subdomain(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $subdomain = Subdomain::factory()->create();

        $response = $this->putJson("/api/subdomains/{$subdomain->id}", ['name' => 'Nouveau nom']);

        $response->assertStatus(200);
        $this->assertDatabaseHas('subdomains', ['id' => $subdomain->id, 'name' => 'Nouveau nom']);
    }

    public function test_admin_can_delete_an_empty_subdomain(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $subdomain = Subdomain::factory()->create();

        $response = $this->deleteJson("/api/subdomains/{$subdomain->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('subdomains', ['id' => $subdomain->id]);
    }

    public function test_admin_cannot_delete_a_subdomain_with_documents(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $subdomain = Subdomain::factory()->create();
        Document::factory()->create(['subdomain_id' => $subdomain->id]);

        $response = $this->deleteJson("/api/subdomains/{$subdomain->id}");

        $response->assertStatus(409);
        $this->assertDatabaseHas('subdomains', ['id' => $subdomain->id]);
    }
}
