<?php

namespace Tests\Feature;

use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiConversationControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_list_their_own_conversations(): void
    {
        $user = User::factory()->validated()->create();
        AiConversation::create(['user_id' => $user->id, 'title' => 'Ma conversation']);
        AiConversation::create(['user_id' => User::factory()->validated()->create()->id, 'title' => 'Une autre']);

        Sanctum::actingAs($user);
        $response = $this->getJson('/api/ai/conversations');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_a_user_cannot_read_another_users_conversation(): void
    {
        $owner = User::factory()->validated()->create();
        $conversation = AiConversation::create(['user_id' => $owner->id, 'title' => 'Privée']);

        Sanctum::actingAs(User::factory()->validated()->create());
        $response = $this->getJson("/api/ai/conversations/{$conversation->id}");

        $response->assertStatus(403);
    }

    public function test_owner_can_view_their_conversation_with_messages(): void
    {
        $user = User::factory()->validated()->create();
        $conversation = AiConversation::create(['user_id' => $user->id, 'title' => 'Ma conversation']);
        AiMessage::create(['conversation_id' => $conversation->id, 'role' => 'user', 'content' => 'Bonjour']);

        Sanctum::actingAs($user);
        $response = $this->getJson("/api/ai/conversations/{$conversation->id}");

        $response->assertStatus(200)->assertJsonPath('conversation.messages.0.content', 'Bonjour');
    }

    public function test_a_user_cannot_delete_another_users_conversation(): void
    {
        $owner = User::factory()->validated()->create();
        $conversation = AiConversation::create(['user_id' => $owner->id, 'title' => 'Privée']);

        Sanctum::actingAs(User::factory()->validated()->create());
        $response = $this->deleteJson("/api/ai/conversations/{$conversation->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('ai_conversations', ['id' => $conversation->id]);
    }

    public function test_owner_can_delete_their_conversation(): void
    {
        $user = User::factory()->validated()->create();
        $conversation = AiConversation::create(['user_id' => $user->id, 'title' => 'À supprimer']);

        Sanctum::actingAs($user);
        $response = $this->deleteJson("/api/ai/conversations/{$conversation->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('ai_conversations', ['id' => $conversation->id]);
    }
}
