<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_reset_link_is_sent_for_a_known_email(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'awa@example.com']);

        $response = $this->postJson('/api/forgot-password', ['email' => 'awa@example.com']);

        $response->assertStatus(200);
        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    public function test_the_response_does_not_reveal_whether_the_email_exists(): void
    {
        Notification::fake();

        $known = $this->postJson('/api/forgot-password', ['email' => User::factory()->create()->email]);
        $unknown = $this->postJson('/api/forgot-password', ['email' => 'nobody@example.com']);

        $this->assertSame($known->json('message'), $unknown->json('message'));
    }

    public function test_the_reset_email_link_points_to_the_frontend(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'awa@example.com']);

        $this->postJson('/api/forgot-password', ['email' => 'awa@example.com']);

        Notification::assertSentTo($user, function (ResetPasswordNotification $notification) use ($user) {
            $html = $notification->toBrevo($user)['html'];

            return str_contains($html, config('services.frontend.url').'/reinitialiser-mot-de-passe?token=')
                && str_contains($html, 'email=awa%40example.com');
        });
    }

    public function test_a_user_can_reset_their_password_with_a_valid_token(): void
    {
        $user = User::factory()->create(['password' => Hash::make('old-password')]);
        $token = Password::createToken($user);
        $user->createToken('existing-session'); // doit être révoqué par le reset

        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertStatus(200);
        $this->assertTrue(Hash::check('new-password-123', $user->fresh()->password));
        $this->assertSame(0, $user->fresh()->tokens()->count());
    }

    public function test_a_reset_fails_with_an_invalid_token(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/reset-password', [
            'token' => 'not-a-real-token',
            'email' => $user->email,
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertStatus(422);
    }

    public function test_a_reset_requires_matching_password_confirmation(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'new-password-123',
            'password_confirmation' => 'does-not-match',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    public function test_a_reset_fails_with_a_password_that_does_not_meet_the_policy(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        // Aucun symbole (voir StrongPassword) — le reste de la politique
        // (longueur, lettres, chiffres) est respecté.
        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'nouveaumdp123',
            'password_confirmation' => 'nouveaumdp123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }
}
