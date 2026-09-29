<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubdomainRequest;
use App\Http\Requests\UpdateSubdomainRequest;
use App\Models\Domain;
use App\Models\Subdomain;
use Illuminate\Http\JsonResponse;

class SubdomainController extends Controller
{
    public function store(StoreSubdomainRequest $request, Domain $domain): JsonResponse
    {
        $subdomain = $domain->subdomains()->create($request->validated());

        return response()->json(['subdomain' => $subdomain], 201);
    }

    public function update(UpdateSubdomainRequest $request, Subdomain $subdomain): JsonResponse
    {
        $subdomain->update($request->validated());

        return response()->json(['subdomain' => $subdomain]);
    }

    public function destroy(Subdomain $subdomain): JsonResponse
    {
        if ($subdomain->documents()->exists()) {
            abort(409, 'Ce sous-domaine est encore associé à des documents. Reclassez-les d\'abord.');
        }

        $subdomain->delete();

        return response()->json(null, 204);
    }
}
