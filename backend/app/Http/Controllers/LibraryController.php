<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LibraryController extends Controller
{
    /**
     * Liste des documents que l'utilisateur veut garder disponibles hors
     * connexion — source de vérité côté serveur pour synchroniser la
     * bibliothèque locale (IndexedDB / AsyncStorage) de chaque appareil.
     */
    public function index(Request $request): JsonResponse
    {
        $documents = $request->user()->libraryDocuments()
            ->with('subdomain.domain')
            ->orderByPivot('added_at', 'desc')
            ->get();

        return response()->json(['documents' => $documents]);
    }

    /**
     * Retire un document de la bibliothèque — propagé à tous les appareils
     * au prochain passage de leur synchro, pas seulement l'appareil courant.
     */
    public function destroy(Request $request, Document $document): JsonResponse
    {
        $request->user()->libraryDocuments()->detach($document->id);

        return response()->json(null, 204);
    }
}
