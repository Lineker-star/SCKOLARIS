<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDomainRequest;
use App\Http\Requests\UpdateDomainRequest;
use App\Models\Domain;
use Illuminate\Http\JsonResponse;

class DomainController extends Controller
{
    public function index(): JsonResponse
    {
        $domains = Domain::with(['subdomains' => fn ($q) => $q->withCount('documents')])
            ->orderBy('name')
            ->get();

        return response()->json(['domains' => $domains]);
    }

    public function store(StoreDomainRequest $request): JsonResponse
    {
        $domain = Domain::create($request->validated());

        return response()->json(['domain' => $domain], 201);
    }

    public function update(UpdateDomainRequest $request, Domain $domain): JsonResponse
    {
        $domain->update($request->validated());

        return response()->json(['domain' => $domain]);
    }

    public function destroy(Domain $domain): JsonResponse
    {
        if ($domain->subdomains()->exists()) {
            abort(409, 'Ce domaine contient encore des sous-domaines. Supprimez-les d\'abord.');
        }

        $domain->delete();

        return response()->json(null, 204);
    }
}
