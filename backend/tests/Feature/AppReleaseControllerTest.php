<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AppReleaseControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_anyone_can_list_releases_without_authentication(): void
    {
        // Pas de Sanctum::actingAs — le processus principal Electron et
        // l'app mobile n'ont pas de jeton disponible pour cette vérification.
        $response = $this->getJson('/api/app-releases');

        $response->assertStatus(200)->assertJsonStructure(['releases' => ['windows', 'android']]);
        $this->assertNull($response->json('releases.windows'));
    }

    public function test_admin_can_upload_a_windows_release_with_a_version(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $response = $this->postJson('/api/app-releases', [
            'platform' => 'windows',
            'version' => '1.0.0',
            'file' => UploadedFile::fake()->create('e-biblio-setup.exe', 100),
        ]);

        $response->assertStatus(201);
        Storage::disk('public')->assertExists('releases/windows.exe');

        $list = $this->getJson('/api/app-releases');
        $list->assertStatus(200)
            ->assertJsonPath('releases.windows.version', '1.0.0')
            ->assertJsonPath('releases.android', null);
    }

    public function test_uploading_without_a_version_fails_validation(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $response = $this->postJson('/api/app-releases', [
            'platform' => 'android',
            'file' => UploadedFile::fake()->create('app.apk', 100),
        ]);

        $response->assertStatus(422);
    }

    public function test_uploading_a_mismatched_extension_fails_validation(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $response = $this->postJson('/api/app-releases', [
            'platform' => 'android',
            'version' => '1.0.0',
            'file' => UploadedFile::fake()->create('app.exe', 100),
        ]);

        $response->assertStatus(422);
    }

    public function test_non_admin_cannot_upload_a_release(): void
    {
        Sanctum::actingAs(User::factory()->teacher()->create());

        $response = $this->postJson('/api/app-releases', [
            'platform' => 'android',
            'version' => '1.0.0',
            'file' => UploadedFile::fake()->create('app.apk', 100),
        ]);

        $response->assertStatus(403);
    }

    public function test_uploading_again_replaces_the_previous_release_and_version(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/app-releases', [
            'platform' => 'android',
            'version' => '1.0.0',
            'file' => UploadedFile::fake()->createWithContent('v1.apk', 'contenu-v1'),
        ])->assertStatus(201);

        $this->postJson('/api/app-releases', [
            'platform' => 'android',
            'version' => '1.1.0',
            'file' => UploadedFile::fake()->createWithContent('v2.apk', 'contenu-v2-plus-long'),
        ])->assertStatus(201);

        Storage::disk('public')->assertExists('releases/android.apk');
        $this->assertSame('contenu-v2-plus-long', Storage::disk('public')->get('releases/android.apk'));

        $list = $this->getJson('/api/app-releases');
        $list->assertJsonPath('releases.android.version', '1.1.0');
    }

    public function test_android_release_download_uses_the_sckolaris_filename(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/app-releases', [
            'platform' => 'android',
            'version' => '1.0.0',
            'file' => UploadedFile::fake()->createWithContent('android.apk', 'apk-content'),
        ])->assertStatus(201);

        $response = $this->get('/api/app-releases/android/download');

        $response->assertOk();
        $this->assertStringContainsString('sckolaris.apk', $response->headers->get('Content-Disposition'));
    }

    public function test_admin_can_delete_a_release(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/app-releases', [
            'platform' => 'android',
            'version' => '1.0.0',
            'file' => UploadedFile::fake()->create('app.apk', 100),
        ])->assertStatus(201);

        $response = $this->deleteJson('/api/app-releases/android');

        $response->assertStatus(204);
        Storage::disk('public')->assertMissing('releases/android.apk');
        Storage::disk('public')->assertMissing('releases/android.version');

        $list = $this->getJson('/api/app-releases');
        $list->assertJsonPath('releases.android', null);
    }

    public function test_deleting_a_release_does_not_affect_the_other_platform(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/app-releases', [
            'platform' => 'android',
            'version' => '1.0.0',
            'file' => UploadedFile::fake()->create('app.apk', 100),
        ])->assertStatus(201);
        $this->postJson('/api/app-releases', [
            'platform' => 'windows',
            'version' => '1.0.0',
            'file' => UploadedFile::fake()->create('setup.exe', 100),
        ])->assertStatus(201);

        $this->deleteJson('/api/app-releases/android')->assertStatus(204);

        Storage::disk('public')->assertExists('releases/windows.exe');
        $this->getJson('/api/app-releases')->assertJsonPath('releases.windows.version', '1.0.0');
    }

    public function test_deleting_a_release_that_does_not_exist_returns_404(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $response = $this->deleteJson('/api/app-releases/android');

        $response->assertStatus(404);
    }

    public function test_deleting_an_unknown_platform_returns_404(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $response = $this->deleteJson('/api/app-releases/linux');

        $response->assertStatus(404);
    }

    public function test_non_admin_cannot_delete_a_release(): void
    {
        Sanctum::actingAs(User::factory()->teacher()->create());

        $response = $this->deleteJson('/api/app-releases/android');

        $response->assertStatus(403);
    }

    public function test_upload_succeeds_with_a_valid_release_token_and_no_logged_in_account(): void
    {
        config(['services.releases.token' => 'le-bon-jeton']);

        // Pas de Sanctum::actingAs : c'est justement le but du jeton — publier
        // sans aucun compte utilisateur connecté (voir ReleaseAccess).
        $response = $this->postJson('/api/app-releases', [
            'platform' => 'windows',
            'version' => '2.0.0',
            'file' => UploadedFile::fake()->create('setup.exe', 100),
        ], ['X-Release-Token' => 'le-bon-jeton']);

        $response->assertStatus(201);
        Storage::disk('public')->assertExists('releases/windows.exe');
    }

    public function test_upload_fails_with_an_invalid_release_token_and_no_logged_in_account(): void
    {
        config(['services.releases.token' => 'le-bon-jeton']);

        $response = $this->postJson('/api/app-releases', [
            'platform' => 'windows',
            'version' => '2.0.0',
            'file' => UploadedFile::fake()->create('setup.exe', 100),
        ], ['X-Release-Token' => 'un-mauvais-jeton']);

        $response->assertStatus(401);
        Storage::disk('public')->assertMissing('releases/windows.exe');
    }

    public function test_upload_fails_with_no_token_and_no_logged_in_account(): void
    {
        config(['services.releases.token' => 'le-bon-jeton']);

        $response = $this->postJson('/api/app-releases', [
            'platform' => 'windows',
            'version' => '2.0.0',
            'file' => UploadedFile::fake()->create('setup.exe', 100),
        ]);

        $response->assertStatus(401);
    }

    public function test_release_token_also_works_for_deleting_a_release(): void
    {
        config(['services.releases.token' => 'le-bon-jeton']);

        $this->postJson('/api/app-releases', [
            'platform' => 'android',
            'version' => '1.0.0',
            'file' => UploadedFile::fake()->create('app.apk', 100),
        ], ['X-Release-Token' => 'le-bon-jeton'])->assertStatus(201);

        $response = $this->deleteJson('/api/app-releases/android', [], ['X-Release-Token' => 'le-bon-jeton']);

        $response->assertStatus(204);
        Storage::disk('public')->assertMissing('releases/android.apk');
    }

    public function test_admin_session_still_works_when_a_release_token_is_configured(): void
    {
        config(['services.releases.token' => 'le-bon-jeton']);
        Sanctum::actingAs(User::factory()->admin()->create());

        // Pas d'en-tête X-Release-Token ici : la voie "compte admin" doit
        // rester utilisable indépendamment de la voie "jeton".
        $response = $this->postJson('/api/app-releases', [
            'platform' => 'windows',
            'version' => '1.0.0',
            'file' => UploadedFile::fake()->create('setup.exe', 100),
        ]);

        $response->assertStatus(201);
    }
}
