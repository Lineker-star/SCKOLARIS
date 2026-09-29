<?php

namespace Tests\Feature;

use Tests\TestCase;

class ChatControllerTest extends TestCase
{
    public function test_it_returns_503_when_gemini_is_not_configured(): void
    {
        config(['services.gemini.api_key' => null]);

        $response = $this->postJson('/api/chat', ['message' => 'Comment télécharger un document ?']);

        $response->assertStatus(503);
    }

    public function test_it_rejects_an_empty_message(): void
    {
        $response = $this->postJson('/api/chat', ['message' => '']);

        $response->assertStatus(422);
    }
}
