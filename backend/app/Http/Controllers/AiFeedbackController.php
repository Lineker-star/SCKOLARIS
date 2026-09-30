<?php

namespace App\Http\Controllers;

use App\Enums\AiFeedbackRating;
use App\Models\AiFeedback;
use App\Models\AiMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiFeedbackController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message_id' => ['required', 'integer', 'exists:ai_messages,id'],
            'rating' => ['required', 'string', 'in:'.implode(',', array_column(AiFeedbackRating::cases(), 'value'))],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $message = AiMessage::query()->with('conversation')->findOrFail($validated['message_id']);
        if (! $message->conversation->isOwnedBy($request->user())) {
            abort(403, "Ce message ne vous appartient pas.");
        }

        $feedback = AiFeedback::query()->updateOrCreate(
            ['message_id' => $message->id, 'user_id' => $request->user()->id],
            ['rating' => $validated['rating'], 'reason' => $validated['reason'] ?? null],
        );

        return response()->json(['feedback' => $feedback], 201);
    }
}
