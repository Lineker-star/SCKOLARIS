<?php

namespace App\Http\Controllers;

use App\Enums\AiIndexStatus;
use App\Jobs\IndexDocumentForAi;
use App\Models\AiUsage;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AiAdministrationController extends Controller
{
    public function documents(Request $request): JsonResponse
    {
        $documents = Document::query()
            ->with('subdomain.domain')
            ->when($request->filled('status'), fn ($q) => $q->where('ai_index_status', $request->string('status')))
            ->latest('uploaded_at')
            ->paginate(50);

        $counts = Document::query()
            ->select('ai_index_status', DB::raw('count(*) as total'))
            ->groupBy('ai_index_status')
            ->pluck('total', 'ai_index_status');

        return response()->json([
            'documents' => $documents,
            'counts' => collect(AiIndexStatus::cases())
                ->mapWithKeys(fn (AiIndexStatus $status) => [$status->value => (int) ($counts[$status->value] ?? 0)]),
        ]);
    }

    public function index(Request $request, Document $document): JsonResponse
    {
        $force = $request->boolean('force');

        if (! $force && $document->ai_index_status === AiIndexStatus::INDEXED) {
            return response()->json(['message' => 'Document déjà indexé. Utilisez ?force=1 pour ré-indexer.'], 409);
        }

        IndexDocumentForAi::dispatch($document, $force);

        return response()->json(['message' => "Indexation programmée."]);
    }

    public function usage(Request $request): JsonResponse
    {
        $since = now()->subDays(30);

        return response()->json([
            'total_requests_30d' => AiUsage::query()->where('created_at', '>=', $since)->count(),
            'input_tokens_30d' => (int) AiUsage::query()->where('created_at', '>=', $since)->sum('input_tokens'),
            'output_tokens_30d' => (int) AiUsage::query()->where('created_at', '>=', $since)->sum('output_tokens'),
            'average_latency_ms' => (int) AiUsage::query()->where('created_at', '>=', $since)->avg('latency_ms'),
            'requests_by_endpoint' => AiUsage::query()
                ->where('created_at', '>=', $since)
                ->select('endpoint', DB::raw('count(*) as total'))
                ->groupBy('endpoint')
                ->pluck('total', 'endpoint'),
        ]);
    }
}
