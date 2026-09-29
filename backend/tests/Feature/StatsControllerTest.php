<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Domain;
use App\Models\Subdomain;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Process;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StatsControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_cannot_view_analytics(): void
    {
        Sanctum::actingAs(User::factory()->validated()->create());

        $this->getJson('/api/analytics')->assertStatus(403);
    }

    public function test_admin_gets_a_clean_error_when_r_is_unavailable(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());

        // Simule un serveur sans R installé (Rscript introuvable) — ne doit
        // jamais faire fuiter une exception brute, mais renvoyer une erreur
        // claire.
        Process::fake([
            '*' => Process::result(errorOutput: 'Rscript: command not found', exitCode: 127),
        ]);

        $response = $this->getJson('/api/analytics');

        $response->assertStatus(500);
        $this->assertStringContainsString('calcul statistique', $response->json('message'));
    }

    public function test_admin_can_view_analytics_when_r_succeeds(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());

        $domain = Domain::factory()->create(['name' => 'Santé']);
        $withDocs = Subdomain::factory()->create(['domain_id' => $domain->id, 'name' => 'Médecine']);
        $empty = Subdomain::factory()->create(['domain_id' => $domain->id, 'name' => 'Pharmacie']);
        Document::factory()->count(2)->create(['subdomain_id' => $withDocs->id]);

        Process::fake(function ($process) {
            // Le contrôleur passe [dossier_entree, dossier_sortie] en 2e/3e
            // arguments de la commande — on y écrit les CSV de sortie
            // attendus, comme le ferait le vrai script R.
            $outputDir = $process->command[3];
            file_put_contents($outputDir.'/downloads_daily_out.csv', "date,count,trend\n2026-09-01,3,3\n");
            file_put_contents($outputDir.'/online_now_out.csv', "label,count,percentage\nEn ligne,1,100\nHors ligne,0,0\n");

            return Process::result();
        });

        $response = $this->getJson('/api/analytics');

        $response->assertStatus(200);
        $this->assertSame('2026-09-01', $response->json('downloads_daily.0.date'));
        $this->assertSame('En ligne', $response->json('online_now.0.label'));

        // Groupé par domaine, chaque sous-domaine listé même sans document
        // (utile pour repérer les manques du catalogue) — calculé
        // directement en PHP, jamais passé par R (voir documentsByDomain()).
        $response->assertJsonPath('documents_by_domain.0.domain', 'Santé');
        $response->assertJsonPath('documents_by_domain.0.total', 2);
        $response->assertJsonPath('documents_by_domain.0.subdomains.0.name', 'Médecine');
        $response->assertJsonPath('documents_by_domain.0.subdomains.0.count', 2);
        $response->assertJsonPath('documents_by_domain.0.subdomains.1.name', 'Pharmacie');
        $response->assertJsonPath('documents_by_domain.0.subdomains.1.count', 0);
    }
}
