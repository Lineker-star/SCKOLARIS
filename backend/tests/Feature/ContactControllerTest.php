<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ContactControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_visitor_can_send_a_contact_message(): void
    {
        Http::fake(['api.brevo.com/*' => Http::response(['messageId' => 'fake'], 201)]);

        $response = $this->postJson('/api/contact', [
            'name' => 'Awa Fotso',
            'email' => 'awa@example.com',
            'subject' => 'Problème de téléchargement',
            'message' => 'Le document X ne se télécharge pas.',
        ]);

        $response->assertStatus(201);
        Http::assertSent(fn ($request) => $request->url() === 'https://api.brevo.com/v3/smtp/email'
            && $request['replyTo']['email'] === 'awa@example.com'
            && $request['to'][0]['email'] === config('services.contact.address'));
    }

    public function test_contact_message_requires_all_fields(): void
    {
        Http::fake();

        $response = $this->postJson('/api/contact', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name', 'email', 'subject', 'message']);
        Http::assertNothingSent();
    }

    public function test_contact_message_rejects_a_filled_honeypot_field(): void
    {
        Http::fake();

        $response = $this->postJson('/api/contact', [
            'name' => 'Robot',
            'email' => 'robot@example.com',
            'subject' => 'Spam',
            'message' => 'Achetez maintenant',
            'website' => 'https://spam.example.com',
        ]);

        $response->assertStatus(422);
        Http::assertNothingSent();
    }
}
