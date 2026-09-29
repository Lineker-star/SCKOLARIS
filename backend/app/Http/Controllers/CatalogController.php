<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $documents = Document::query()
            ->with('subdomain.domain')
            ->when($request->filled('title'), fn ($q) => $q->where('title', 'ilike', '%'.$request->string('title').'%'))
            ->when($request->filled('author'), fn ($q) => $q->where('author', 'ilike', '%'.$request->string('author').'%'))
            ->when($request->filled('program'), fn ($q) => $q->where('program', 'ilike', '%'.$request->string('program').'%'))
            ->when($request->filled('subdomain_id'), fn ($q) => $q->where('subdomain_id', $request->integer('subdomain_id')))
            ->when($request->filled('domain_id'), fn ($q) => $q->whereHas('subdomain', fn ($sq) => $sq->where('domain_id', $request->integer('domain_id'))))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->string('search').'%';
                $q->where(function ($q) use ($term) {
                    $q->where('title', 'ilike', $term)
                        ->orWhere('author', 'ilike', $term);
                });
            })
            ->latest('uploaded_at')
            ->paginate(20);

        return response()->json($documents);
    }

    public function show(Document $document): JsonResponse
    {
        return response()->json(['document' => $document->load('subdomain.domain')]);
    }
}
