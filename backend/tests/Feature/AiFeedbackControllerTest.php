<?php

namespace Tests\Feature;

use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiFeedbackControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_leave_feedback_on_their_own_message(): void
    {
        $user = User::factory()->validated()->create();
        $conversation = AiConversation::create(['user_id' => $user->id]);
        $message = AiMessage::create(['conversation_id' => $conversation->id, 'role' => 'assistant', 'content' => 'Réponse']);

        Sanctum::actingAs($user);
        $response = $this->postJson('/api/ai/feedback', ['message_id' => $message->id, 'rating' => 'up']);

        $response->assertStatus(201);
        $this->assertDatabaseHas('ai_feedback', ['message_id' => $message->id, 'user_id' => $user->id, 'rating' => 'up']);
    }

    public function test_a_user_cannot_leave_feedback_on_another_users_message(): void
    {
        $owner = User::factory()->validated()->create();
        $conversation = AiConversation::create(['user_id' => $owner->id]);
        $message = AiMessage::create(['conversation_id' => $conversation->id, 'role' => 'assistant', 'content' => 'Réponse']);

        Sanctum::actingAs(User::factory()->validated()->create());
        $response = $this->postJson('/api/ai/feedback', ['message_id' => $message->id, 'rating' => 'down']);

        $response->assertStatus(403);
    }

    public function test_rating_must_be_up_or_down(): void
    {
        $user = User::factory()->validated()->create();
        $conversation = AiConversation::create(['user_id' => $user->id]);
        $message = AiMessage::create(['conversation_id' => $conversation->id, 'role' => 'assistant', 'content' => 'Réponse']);

        Sanctum::actingAs($user);
        $response = $this->postJson('/api/ai/feedback', ['message_id' => $message->id, 'rating' => 'maybe']);

        $response->assertStatus(422);
    }
}
