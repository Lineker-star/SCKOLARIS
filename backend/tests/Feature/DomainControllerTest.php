<?php

namespace Tests\Feature;

use App\Models\Domain;
use App\Models\Subdomain;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DomainControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_any_authenticated_user_can_list_domains(): void
    {
        Sanctum::actingAs(User::factory()->create());
        Domain::factory()->has(Subdomain::factory()->count(2))->create();

        $response = $this->getJson('/api/domains');

        $response->assertStatus(200)->assertJsonCount(1, 'domains');
    }

    public function test_admin_can_create_a_domain(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());

        $response = $this->postJson('/api/domains', ['name' => 'Sciences de la Santé']);

        $response->assertStatus(201);
        $this->assertDatabaseHas('domains', ['name' => 'Sciences de la Santé']);
    }

    public function test_student_cannot_create_a_domain(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/domains', ['name' => 'Sciences de la Santé']);

        $response->assertStatus(403);
    }

    public function test_admin_can_update_a_domain(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $domain = Domain::factory()->create();

        $response = $this->putJson("/api/domains/{$domain->id}", ['name' => 'Nouveau nom']);

        $response->assertStatus(200);
        $this->assertDatabaseHas('domains', ['id' => $domain->id, 'name' => 'Nouveau nom']);
    }

    public function test_admin_can_delete_an_empty_domain(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $domain = Domain::factory()->create();

        $response = $this->deleteJson("/api/domains/{$domain->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('domains', ['id' => $domain->id]);
    }

    public function test_admin_cannot_delete_a_domain_with_subdomains(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $domain = Domain::factory()->has(Subdomain::factory())->create();

        $response = $this->deleteJson("/api/domains/{$domain->id}");

        $response->assertStatus(409);
        $this->assertDatabaseHas('domains', ['id' => $domain->id]);
    }

}
