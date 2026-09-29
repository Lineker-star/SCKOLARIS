<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAppReleaseRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class AppReleaseController extends Controller
{
    private const EXTENSIONS = [
        'windows' => 'exe',
        'android' => 'apk',
    ];

    /**
     * Accessible à tout utilisateur connecté (peu importe le rôle) — les
     * installeurs desktop/mobile ne sont pas un contenu sensible.
     */
    public function index(): JsonResponse
    {
        $releases = [];
        foreach (self::EXTENSIONS as $platform => $extension) {
            $path = "releases/{$platform}.{$extension}";
            $versionPath = "releases/{$platform}.version";
            $releases[$platform] = Storage::disk('public')->exists($path)
                ? [
                    'url' => route('app-releases.download', ['platform' => $platform]),
                    'version' => Storage::disk('public')->exists($versionPath)
                        ? trim(Storage::disk('public')->get($versionPath))
                        : null,
                ]
                : null;
        }

        return response()->json(['releases' => $releases]);
    }

    /**
     * Dépose/remplace l'installeur d'une plateforme (avec son numéro de
     * version, pour que les apps déjà installées puissent détecter qu'une
     * mise à jour existe) — un seul fichier actif par plateforme (écrase le
     * précédent), pas d'historique de versions.
     */
    public function store(StoreAppReleaseRequest $request): JsonResponse
    {
        $platform = $request->string('platform')->value();
        $extension = self::EXTENSIONS[$platform];
        $path = "releases/{$platform}.{$extension}";

        Storage::disk('public')->putFileAs('releases', $request->file('file'), "{$platform}.{$extension}");
        Storage::disk('public')->put("releases/{$platform}.version", $request->string('version')->value());

        return response()->json([
            'url' => route('app-releases.download', ['platform' => $platform]),
            'version' => $request->string('version')->value(),
        ], 201);
    }

    /**
     * Sert un installeur avec un nom de téléchargement stable et lisible.
     */
    public function download(string $platform)
    {
        if (! isset(self::EXTENSIONS[$platform])) {
            abort(404, 'Plateforme inconnue.');
        }

        $extension = self::EXTENSIONS[$platform];
        $path = "releases/{$platform}.{$extension}";

        if (! Storage::disk('public')->exists($path)) {
            abort(404, "Aucun installeur déposé pour cette plateforme.");
        }

        $filename = $platform === 'android' ? 'sckolaris.apk' : 'sckolaris.exe';

        return Storage::disk('public')->download($path, $filename);
    }

    /**
     * Retire l'installeur actif d'une plateforme (et son numéro de
     * version) — /app-releases la montrera de nouveau comme absente
     * jusqu'au prochain dépôt.
     */
    public function destroy(string $platform): JsonResponse
    {
        if (! isset(self::EXTENSIONS[$platform])) {
            abort(404, 'Plateforme inconnue.');
        }

        $extension = self::EXTENSIONS[$platform];
        $path = "releases/{$platform}.{$extension}";
        $versionPath = "releases/{$platform}.version";

        if (! Storage::disk('public')->exists($path)) {
            abort(404, "Aucun installeur déposé pour cette plateforme.");
        }

        Storage::disk('public')->delete([$path, $versionPath]);

        return response()->json(null, 204);
    }
}
