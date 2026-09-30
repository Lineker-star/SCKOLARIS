<?php

namespace App\Http\Controllers;

use App\Models\AiConversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $conversations = AiConversation::query()
            ->where('user_id', $request->user()->id)
            ->with('document:id,title')
            ->latest('updated_at')
            ->paginate(20);

        return response()->json($conversations);
    }

    public function show(Request $request, AiConversation $conversation): JsonResponse
    {
        if (! $conversation->isOwnedBy($request->user())) {
            abort(403, "Cette conversation ne vous appartient pas.");
        }

        $conversation->load(['document:id,title', 'messages.citations']);

        return response()->json(['conversation' => $conversation]);
    }

    public function destroy(Request $request, AiConversation $conversation): JsonResponse
    {
        if (! $conversation->isOwnedBy($request->user())) {
            abort(403, "Cette conversation ne vous appartient pas.");
        }

        $conversation->delete();

        return response()->json(null, 204);
    }
}
