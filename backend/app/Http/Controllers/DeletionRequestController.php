<?php

namespace App\Http\Controllers;

use App\Enums\DeletionRequestStatus;
use App\Http\Requests\ProcessDeletionRequestRequest;
use App\Http\Requests\StoreDeletionRequestRequest;
use App\Models\DeletionRequest;
use App\Models\Document;
use App\Notifications\DeletionRequestDecisionNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class DeletionRequestController extends Controller
{
    public function store(StoreDeletionRequestRequest $request, Document $document): JsonResponse
    {
        $user = $request->user();

        if (! $document->isOwnedBy($user)) {
            abort(403, 'Vous ne pouvez demander la suppression que de vos propres documents.');
        }

        if ($document->deletionRequests()->where('status', DeletionRequestStatus::PENDING)->exists()) {
            abort(409, 'Une demande de suppression est déjà en attente pour ce document.');
        }

        $deletionRequest = $document->deletionRequests()->create([
            'justification' => $request->validated('justification'),
            'status' => DeletionRequestStatus::PENDING,
        ]);

        return response()->json(['deletion_request' => $deletionRequest], 201);
    }

    public function index(): JsonResponse
    {
        $requests = DeletionRequest::with(['document.depositor', 'document.subdomain.domain'])
            ->where('status', DeletionRequestStatus::PENDING)
            ->get();

        return response()->json(['deletion_requests' => $requests]);
    }

    public function update(ProcessDeletionRequestRequest $request, DeletionRequest $deletionRequest): JsonResponse
    {
        $status = DeletionRequestStatus::from($request->validated('decision'));
        $document = $deletionRequest->document?->load('depositor', 'subdomain');

        if (! $deletionRequest->isPending() || ! $document) {
            abort(409, 'Cette demande de suppression a déjà été traitée.');
        }

        $deletionRequest->update([
            'status' => $status,
            'processed_at' => now(),
        ]);

        if ($status === DeletionRequestStatus::APPROVED) {
            Storage::disk('local')->delete($document->file_path);
            if ($document->cover_path) {
                Storage::disk('public')->delete($document->cover_path);
            }
            $document->delete();
        }

        try {
            $document->depositor->notify(new DeletionRequestDecisionNotification(
                documentTitle: $document->title,
                subject: $document->subdomain->name,
                program: $document->program ?? 'Non précisée',
                decision: $status->value,
            ));
        } catch (\Throwable $exception) {
            Log::error('Deletion request notification failed.', [
                'deletion_request_id' => $deletionRequest->id,
                'user_id' => $document->depositor->id,
                'exception' => $exception->getMessage(),
            ]);
        }

        return response()->json(['deletion_request' => $deletionRequest]);
    }
}
