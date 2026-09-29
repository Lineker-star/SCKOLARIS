<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\AccountStatusNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_fetch_their_own_profile(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/me');

        $response->assertStatus(200)->assertJsonPath('user.id', $user->id);
    }

    public function test_user_can_update_their_own_name_and_program(): void
    {
        $user = User::factory()->create(['first_name' => 'Old']);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/me', [
            'first_name' => 'New',
            'program' => 'Informatique',
        ]);

        $response->assertStatus(200)->assertJsonPath('user.first_name', 'New');
        $this->assertDatabaseHas('users', ['id' => $user->id, 'first_name' => 'New', 'program' => 'Informatique']);
    }

    public function test_user_can_update_their_primary_email(): void
    {
        $user = User::factory()->create(['email' => 'old@example.com']);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/me', ['email' => 'new@example.com']);

        $response->assertStatus(200)->assertJsonPath('user.email', 'new@example.com');
        $this->assertDatabaseHas('users', ['id' => $user->id, 'email' => 'new@example.com']);
    }

    public function test_user_cannot_update_their_registration_number_from_profile(): void
    {
        $user = User::factory()->create(['registration_number' => '26SWE118']);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/me', ['registration_number' => '26SWE119']);

        $response->assertStatus(200)->assertJsonPath('user.registration_number', '26SWE118');
        $this->assertDatabaseHas('users', ['id' => $user->id, 'registration_number' => '26SWE118']);
    }

    public function test_user_can_add_a_secondary_email(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/me', ['secondary_email' => 'perso@example.com']);

        $response->assertStatus(200)->assertJsonPath('user.secondary_email', 'perso@example.com');
        $this->assertDatabaseHas('users', ['id' => $user->id, 'secondary_email' => 'perso@example.com']);
    }

    public function test_secondary_email_cannot_match_primary_email(): void
    {
        $user = User::factory()->create(['email' => 'main@example.com']);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/me', ['secondary_email' => 'main@example.com']);

        $response->assertStatus(422)->assertJsonValidationErrors('secondary_email');
    }

    public function test_secondary_email_must_be_unique(): void
    {
        User::factory()->create(['secondary_email' => 'taken@example.com']);
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/me', ['secondary_email' => 'taken@example.com']);

        $response->assertStatus(422)->assertJsonValidationErrors('secondary_email');
    }

    public function test_user_can_upload_a_profile_avatar(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->post('/api/me', [
            'avatar' => UploadedFile::fake()->image('avatar.jpg'),
        ]);

        $response->assertStatus(200);
        $path = $response->json('user.avatar_path');
        $this->assertNotNull($path);
        Storage::disk('public')->assertExists($path);
        $this->assertNotNull($response->json('user.avatar_url'));
    }

    public function test_a_large_avatar_is_resized_down_on_upload(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->post('/api/me', [
            'avatar' => UploadedFile::fake()->image('avatar.jpg', 2000, 2000),
        ]);

        $response->assertStatus(200);
        $path = $response->json('user.avatar_path');
        [$width, $height] = getimagesizefromstring(Storage::disk('public')->get($path));
        $this->assertLessThanOrEqual(400, $width);
        $this->assertLessThanOrEqual(400, $height);
    }

    public function test_guest_cannot_update_a_profile(): void
    {
        $response = $this->postJson('/api/me', ['first_name' => 'New']);

        $response->assertStatus(401);
    }

    public function test_guest_cannot_fetch_a_profile(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401);
    }

    public function test_register_creates_a_pending_account(): void
    {
        Storage::fake('public');

        $response = $this->postJson('/api/register', [
            'last_name' => 'Fotso',
            'first_name' => 'Awa',
            'role' => 'student',
            'registration_number' => '26SWE118',
            'email' => 'awa.fotso@etu.iu-ztf.cm',
            'password' => 'Password123!',
            'avatar' => UploadedFile::fake()->image('photo.jpg'),
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.account_status', 'pending');

        $this->assertDatabaseHas('users', [
            'email' => 'awa.fotso@etu.iu-ztf.cm',
            'account_status' => 'pending',
            'role' => 'student',
        ]);
        $avatarPath = User::where('email', 'awa.fotso@etu.iu-ztf.cm')->value('avatar_path');
        $this->assertNotNull($avatarPath);
        Storage::disk('public')->assertExists($avatarPath);
    }

    public function test_register_succeeds_without_a_photo(): void
    {
        Storage::fake('public');

        $response = $this->postJson('/api/register', [
            'last_name' => 'Fotso',
            'first_name' => 'Awa',
            'role' => 'student',
            'registration_number' => '26SWE118',
            'email' => 'awa.fotso@etu.iu-ztf.cm',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.account_status', 'pending');

        $this->assertDatabaseHas('users', [
            'email' => 'awa.fotso@etu.iu-ztf.cm',
            'avatar_path' => null,
        ]);
    }

    public function test_register_fails_with_an_invalid_role(): void
    {
        Storage::fake('public');

        $response = $this->postJson('/api/register', [
            'last_name' => 'Fotso',
            'first_name' => 'Awa',
            'role' => 'admin', // jamais permis en auto-inscription
            'registration_number' => '26SWE118',
            'email' => 'awa.fotso@etu.iu-ztf.cm',
            'password' => 'Password123!',
            'avatar' => UploadedFile::fake()->image('photo.jpg'),
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('role');
    }

    public function test_register_fails_when_a_student_omits_the_registration_number(): void
    {
        Storage::fake('public');

        $response = $this->postJson('/api/register', [
            'last_name' => 'Fotso',
            'first_name' => 'Awa',
            'role' => 'student',
            'email' => 'awa.fotso@etu.iu-ztf.cm',
            'password' => 'Password123!',
            'avatar' => UploadedFile::fake()->image('photo.jpg'),
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('registration_number');
    }

    public function test_a_teacher_can_register_without_a_registration_number(): void
    {
        Storage::fake('public');

        $response = $this->postJson('/api/register', [
            'last_name' => 'Mballa',
            'first_name' => 'Paul',
            'role' => 'teacher',
            'email' => 'paul.mballa@iu-ztf.cm',
            'password' => 'Password123!',
            'avatar' => UploadedFile::fake()->image('photo.jpg'),
        ]);

        $response->assertStatus(201)->assertJsonPath('user.account_status', 'pending');
        $this->assertDatabaseHas('users', [
            'email' => 'paul.mballa@iu-ztf.cm',
            'role' => 'teacher',
            'account_status' => 'pending',
            'registration_number' => null,
        ]);
    }

    public function test_a_teacher_registering_with_a_registration_number_must_still_respect_the_format(): void
    {
        Storage::fake('public');

        $response = $this->postJson('/api/register', [
            'last_name' => 'Mballa',
            'first_name' => 'Paul',
            'role' => 'teacher',
            'registration_number' => 'pas-le-bon-format',
            'email' => 'paul.mballa@iu-ztf.cm',
            'password' => 'Password123!',
            'avatar' => UploadedFile::fake()->image('photo.jpg'),
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('registration_number');
    }

    public function test_register_fails_when_registration_number_already_taken(): void
    {
        Storage::fake('public');
        User::factory()->create(['registration_number' => '26SWE118']);

        $response = $this->postJson('/api/register', [
            'last_name' => 'Fotso',
            'first_name' => 'Awa',
            'registration_number' => '26SWE118',
            'email' => 'autre@etu.iu-ztf.cm',
            'password' => 'Password123!',
            'role' => 'student',
            'avatar' => UploadedFile::fake()->image('photo.jpg'),
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('registration_number');
    }

    public function test_register_fails_when_registration_number_does_not_match_the_iuztf_format(): void
    {
        Storage::fake('public');

        $response = $this->postJson('/api/register', [
            'last_name' => 'Fotso',
            'first_name' => 'Awa',
            'role' => 'student',
            'registration_number' => 'IUZTF2024-118', // ancien format, non conforme
            'email' => 'awa.fotso@etu.iu-ztf.cm',
            'password' => 'Password123!',
            'avatar' => UploadedFile::fake()->image('photo.jpg'),
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('registration_number');
    }

    public function test_register_fails_with_a_password_that_does_not_meet_the_policy(): void
    {
        Storage::fake('public');

        // Aucun symbole (voir StrongPassword) — le reste de la politique
        // (longueur, lettres, chiffres) est respecté.
        $response = $this->postJson('/api/register', [
            'last_name' => 'Fotso',
            'first_name' => 'Awa',
            'role' => 'student',
            'registration_number' => '26SWE118',
            'email' => 'awa.fotso@etu.iu-ztf.cm',
            'password' => 'password123',
            'avatar' => UploadedFile::fake()->image('photo.jpg'),
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('password');
    }

    public function test_authenticated_user_can_update_their_password(): void
    {
        $user = User::factory()->create(['password' => Hash::make('AncienMdp123!')]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/me/password', [
            'current_password' => 'AncienMdp123!',
            'password' => 'NouveauMdp123!',
            'password_confirmation' => 'NouveauMdp123!',
        ]);

        $response->assertStatus(200);
        $this->assertTrue(Hash::check('NouveauMdp123!', $user->fresh()->password));
    }

    public function test_updating_password_fails_with_wrong_current_password(): void
    {
        $user = User::factory()->create(['password' => Hash::make('AncienMdp123!')]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/me/password', [
            'current_password' => 'wrong-current-password',
            'password' => 'NouveauMdp123!',
            'password_confirmation' => 'NouveauMdp123!',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('current_password');
    }

    public function test_updating_password_fails_when_the_new_password_does_not_meet_the_policy(): void
    {
        $user = User::factory()->create(['password' => Hash::make('AncienMdp123!')]);
        Sanctum::actingAs($user);

        // Aucun symbole (voir StrongPassword).
        $response = $this->postJson('/api/me/password', [
            'current_password' => 'AncienMdp123!',
            'password' => 'nouveaumdp123',
            'password_confirmation' => 'nouveaumdp123',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('password');
    }

    public function test_login_returns_a_token_for_valid_credentials(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/login', [
            'identifier' => $user->registration_number,
            'password' => 'password',
            'device_id' => str_repeat('a', 32),
            'platform' => 'web',
        ]);

        $response->assertStatus(200)->assertJsonStructure(['token', 'user' => ['id', 'role']]);
    }

    public function test_login_works_with_the_email_address_too(): void
    {
        // Cas d'un enseignant auto-inscrit sans matricule (voir
        // RegisterRequest) — seul l'e-mail permet alors de se connecter.
        $user = User::factory()->teacher()->create(['registration_number' => null]);

        $response = $this->postJson('/api/login', [
            'identifier' => $user->email,
            'password' => 'password',
            'device_id' => str_repeat('b', 32),
            'platform' => 'mobile',
        ]);

        $response->assertStatus(200)->assertJsonPath('user.id', $user->id);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/login', [
            'identifier' => $user->registration_number,
            'password' => 'wrong-password',
            'device_id' => str_repeat('c', 32),
            'platform' => 'desktop',
        ]);

        $response->assertStatus(401);
    }

    public function test_login_fails_for_a_deactivated_account(): void
    {
        $user = User::factory()->deactivated()->create();

        $response = $this->postJson('/api/login', [
            'identifier' => $user->registration_number,
            'password' => 'password',
            'device_id' => str_repeat('d', 32),
            'platform' => 'web',
        ]);

        $response->assertStatus(403);
    }

    public function test_a_account_cannot_have_more_than_two_active_devices(): void
    {
        $user = User::factory()->create();

        foreach (['a', 'b'] as $device) {
            $this->postJson('/api/login', [
                'identifier' => $user->registration_number,
                'password' => 'password',
                'device_id' => str_repeat($device, 32),
                'platform' => 'web',
            ])->assertStatus(200);
        }

        $this->postJson('/api/login', [
            'identifier' => $user->registration_number,
            'password' => 'password',
            'device_id' => str_repeat('c', 32),
            'platform' => 'mobile',
        ])->assertStatus(409)->assertJsonValidationErrors('device_id');
    }

    public function test_logging_in_again_from_the_same_device_reuses_its_slot(): void
    {
        $user = User::factory()->create();
        $deviceId = str_repeat('a', 32);
        $credentials = [
            'identifier' => $user->registration_number,
            'password' => 'password',
            'device_id' => $deviceId,
            'platform' => 'web',
        ];

        $this->postJson('/api/login', $credentials)->assertStatus(200);
        $this->postJson('/api/login', $credentials)->assertStatus(200);

        $this->assertSame(1, $user->fresh()->tokens()->count());
    }

    public function test_deactivated_account_is_rejected_on_any_authenticated_route(): void
    {
        Sanctum::actingAs(User::factory()->deactivated()->create());

        $response = $this->getJson('/api/catalog');

        $response->assertStatus(403);
    }

    public function test_admin_can_deactivate_an_account(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $account = User::factory()->validated()->create();

        $response = $this->patchJson("/api/accounts/{$account->id}/deactivate");

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['id' => $account->id, 'is_active' => false]);
    }

    public function test_deactivating_an_account_notifies_the_user_by_email(): void
    {
        Notification::fake();
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $account = User::factory()->validated()->create();

        $this->patchJson("/api/accounts/{$account->id}/deactivate");

        Notification::assertSentTo(
            $account,
            AccountStatusNotification::class,
            fn ($notification) => $notification->type() === 'deactivated',
        );
    }

    public function test_admin_cannot_deactivate_their_own_account(): void
    {
        $admin = User::factory()->admin()->validated()->create();
        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/accounts/{$admin->id}/deactivate");

        $response->assertStatus(403);
    }

    public function test_non_admin_cannot_deactivate_an_account(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $account = User::factory()->validated()->create();

        $response = $this->patchJson("/api/accounts/{$account->id}/deactivate");

        $response->assertStatus(403);
    }

    public function test_admin_can_reactivate_an_account(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $account = User::factory()->deactivated()->create();

        $response = $this->patchJson("/api/accounts/{$account->id}/reactivate");

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['id' => $account->id, 'is_active' => true]);
    }

    public function test_reactivating_an_account_notifies_the_user_by_email(): void
    {
        Notification::fake();
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $account = User::factory()->deactivated()->create();

        $this->patchJson("/api/accounts/{$account->id}/reactivate");

        Notification::assertSentTo(
            $account,
            AccountStatusNotification::class,
            fn ($notification) => $notification->type() === 'reactivated',
        );
    }

    public function test_non_admin_cannot_reactivate_an_account(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $account = User::factory()->deactivated()->create();

        $response = $this->patchJson("/api/accounts/{$account->id}/reactivate");

        $response->assertStatus(403);
    }

    public function test_admin_can_list_all_accounts_regardless_of_status(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        User::factory()->create();
        User::factory()->validated()->create();
        User::factory()->rejected()->create();

        $response = $this->getJson('/api/accounts');

        $response->assertStatus(200)->assertJsonCount(4, 'data');
    }

    public function test_non_admin_cannot_list_all_accounts(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson('/api/accounts');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_a_single_account(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $account = User::factory()->create();

        $response = $this->getJson("/api/accounts/{$account->id}");

        $response->assertStatus(200)
            ->assertJsonPath('account.id', $account->id)
            ->assertJsonStructure(['account', 'deposited_documents_count', 'downloads_count']);
    }

    public function test_non_admin_cannot_view_a_single_account(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $account = User::factory()->create();

        $response = $this->getJson("/api/accounts/{$account->id}");

        $response->assertStatus(403);
    }

    public function test_admin_can_list_pending_accounts(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        User::factory()->count(2)->create();

        $response = $this->getJson('/api/accounts/pending');

        $response->assertStatus(200)->assertJsonCount(2, 'data');
    }

    public function test_non_admin_cannot_list_pending_accounts(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson('/api/accounts/pending');

        $response->assertStatus(403);
    }

    public function test_admin_can_validate_a_pending_account(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $account = User::factory()->create();

        $response = $this->patchJson("/api/accounts/{$account->id}", ['account_status' => 'validated']);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['id' => $account->id, 'account_status' => 'validated']);
    }

    public function test_validating_an_account_notifies_the_user_by_email(): void
    {
        Notification::fake();
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $account = User::factory()->create();

        $this->patchJson("/api/accounts/{$account->id}", ['account_status' => 'validated']);

        Notification::assertSentTo(
            $account,
            AccountStatusNotification::class,
            fn ($notification) => $notification->type() === 'validated',
        );
    }

    public function test_the_validation_email_mentions_deposit_only_for_a_teacher(): void
    {
        // Le contenu de l'e-mail doit refléter le rôle choisi à
        // l'inscription — jamais mentionner le dépôt de supports à un
        // étudiant, ni l'omettre pour un enseignant.
        $teacher = User::factory()->teacher()->create(['account_status' => 'pending']);
        $student = User::factory()->create();

        $teacherMail = (new AccountStatusNotification('validated'))->toMail($teacher);
        $studentMail = (new AccountStatusNotification('validated'))->toMail($student);

        $this->assertStringContainsString('dépôt', implode(' ', $teacherMail->introLines));
        $this->assertStringNotContainsString('dépôt', implode(' ', $studentMail->introLines));
    }

    public function test_the_validation_email_says_it_was_validated_by_an_administrator(): void
    {
        // La validation n'est jamais accessible à un enseignant (voir
        // routes/api.php, PATCH /accounts/{account} est en role:admin) —
        // le message ne doit donc jamais laisser entendre le contraire.
        $mail = (new AccountStatusNotification('validated'))->toMail(User::factory()->make());

        $text = implode(' ', $mail->introLines);
        $this->assertStringContainsString('administrateur', $text);
        $this->assertStringNotContainsString('enseignant ou un administrateur', $text);
    }

    public function test_rejecting_an_account_notifies_the_user_by_email(): void
    {
        Notification::fake();
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $account = User::factory()->create();

        $this->patchJson("/api/accounts/{$account->id}", ['account_status' => 'rejected']);

        Notification::assertSentTo(
            $account,
            AccountStatusNotification::class,
            fn ($notification) => $notification->type() === 'rejected',
        );
    }

    public function test_non_admin_cannot_validate_an_account(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $account = User::factory()->create();

        $response = $this->patchJson("/api/accounts/{$account->id}", ['account_status' => 'validated']);

        $response->assertStatus(403);
    }

    public function test_a_rejected_account_can_never_be_validated_again(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $account = User::factory()->rejected()->create();

        $response = $this->patchJson("/api/accounts/{$account->id}", ['account_status' => 'validated']);

        $response->assertStatus(409);
        $this->assertDatabaseHas('users', ['id' => $account->id, 'account_status' => 'rejected']);
    }

    public function test_admin_can_upgrade_a_user_to_admin(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());
        $account = User::factory()->teacher()->create();

        $response = $this->patchJson("/api/accounts/{$account->id}/role", ['role' => 'admin']);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['id' => $account->id, 'role' => 'admin']);
    }

    public function test_non_admin_cannot_change_a_users_role(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $account = User::factory()->create();

        $response = $this->patchJson("/api/accounts/{$account->id}/role", ['role' => 'teacher']);

        $response->assertStatus(403);
    }

    public function test_admin_can_view_statistics(): void
    {
        Sanctum::actingAs(User::factory()->admin()->validated()->create());

        $response = $this->getJson('/api/statistics');

        $response->assertStatus(200)->assertJsonStructure([
            'total_users', 'pending_accounts', 'validated_accounts', 'total_documents', 'total_downloads',
        ]);
    }

    public function test_non_admin_cannot_view_statistics(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson('/api/statistics');

        $response->assertStatus(403);
    }
}
