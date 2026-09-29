<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Enums\AccountStatus;
use App\Enums\Role;
use App\Models\User;
use App\Notifications\CourseAvailableNotification;
use App\Models\Document;
use App\Models\Download;
use App\Models\Read;
use App\Support\ImageResizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function store(StoreDocumentRequest $request): JsonResponse
    {
        $path = $request->file('file')->storeAs(
            'documents',
            Str::uuid().'.'.$request->file('file')->getClientOriginalExtension(),
            'local',
        );

        $data = [
            ...$request->safe()->except(['file', 'cover']),
            'file_path' => $path,
            'uploaded_by_id' => $request->user()->id,
        ];

        if ($request->hasFile('cover')) {
            $data['cover_path'] = $this->storeCover($request->file('cover'));
        }

        $document = Document::create($data);

        if (($request->user()->isTeacher() || $request->user()->isAdmin()) && filled($document->program)) {
            $document->load('subdomain');
            $program = trim($document->program);
            $domain = $document->subdomain->domain;
            $documentData = [
                'id' => $document->id,
                'title' => $document->title,
                'subject' => $document->subdomain->name,
                'domain' => $domain->name,
                'program' => $program,
                'summary' => $document->summary,
            ];

            User::query()
                ->where('role', Role::STUDENT)
                ->where('account_status', AccountStatus::VALIDATED)
                ->where('is_active', true)
                ->where(function ($query) use ($domain): void {
                    $query->where('domain_id', $domain->id)
                        ->orWhere(function ($fallback) use ($domain): void {
                            $fallback->whereNull('domain_id')
                                ->whereRaw('LOWER(TRIM(study_domain)) = ?', [mb_strtolower(trim($domain->name))]);
                        });
                })
                ->whereRaw('LOWER(TRIM(program)) = ?', [mb_strtolower($program)])
                ->each(function (User $student) use ($documentData): void {
                    try {
                        $student->notify(new CourseAvailableNotification($documentData));
                    } catch (\Throwable $exception) {
                        Log::error('Course notification failed.', [
                            'user_id' => $student->id,
                            'document_id' => $documentData['id'],
                            'exception' => $exception->getMessage(),
                        ]);
                    }
                });
        }

        return response()->json(['document' => $document->load('subdomain.domain')], 201);
    }

    public function update(UpdateDocumentRequest $request, Document $document): JsonResponse
    {
        $user = $request->user();

        if (! $user->isAdmin() && ! $document->isOwnedBy($user)) {
            abort(403, 'Vous ne pouvez modifier que vos propres documents.');
        }

        $data = $request->safe()->except(['file', 'cover']);

        if ($request->hasFile('file')) {
            Storage::disk('local')->delete($document->file_path);
            $data['file_path'] = $request->file('file')->storeAs(
                'documents',
                Str::uuid().'.'.$request->file('file')->getClientOriginalExtension(),
                'local',
            );
        }

        if ($request->hasFile('cover')) {
            if ($document->cover_path) {
                Storage::disk('public')->delete($document->cover_path);
            }
            $data['cover_path'] = $this->storeCover($request->file('cover'));
        }

        $document->update($data);

        return response()->json(['document' => $document->load('subdomain.domain')]);
    }

    public function destroy(Document $document): JsonResponse
    {
        if ($document->file_path) {
            Storage::disk('local')->delete($document->file_path);
        }
        if ($document->cover_path) {
            Storage::disk('public')->delete($document->cover_path);
        }
        $document->delete();

        return response()->json(null, 204);
    }

    public function read(Request $request, Document $document): StreamedResponse
    {
        $this->ensureCached($document);

        Read::create([
            'user_id' => $request->user()->id,
            'document_id' => $document->id,
        ]);

        return Storage::disk('local')->response($document->file_path, $this->downloadName($document));
    }

    /**
     * Génère une URL signée temporaire (5 min) vers `readStream` — permet au
     * navigateur de naviguer directement dessus (nouvel onglet, ou même
     * fenêtre) sans jeton d'authentification à joindre, pour un vrai
     * streaming natif (le visionneur PDF du navigateur affiche au fil de
     * l'eau) au lieu de tout charger en mémoire via une requête JS avant
     * affichage.
     */
    public function readLink(Request $request, Document $document): JsonResponse
    {
        $url = URL::temporarySignedRoute('documents.read-stream', now()->addMinutes(5), ['document' => $document->id]);

        Read::create([
            'user_id' => $request->user()->id,
            'document_id' => $document->id,
        ]);

        return response()->json(['url' => $url]);
    }

    /**
     * Cible de l'URL signée ci-dessus — volontairement hors du groupe
     * `auth:sanctum` (une navigation de navigateur ne peut pas joindre de
     * jeton), l'authentification est portée par la signature elle-même
     * (middleware `signed`), valable seulement pendant la fenêtre indiquée.
     */
    public function readStream(Document $document): StreamedResponse
    {
        $this->ensureCached($document);

        return Storage::disk('local')->response($document->file_path, $this->downloadName($document));
    }

    public function download(Request $request, Document $document): StreamedResponse
    {
        $this->ensureCached($document);

        Download::create([
            'user_id' => $request->user()->id,
            'document_id' => $document->id,
        ]);
        $request->user()->libraryDocuments()->syncWithoutDetaching([$document->id]);

        return Storage::disk('local')->download($document->file_path, $this->downloadName($document));
    }

    /**
     * Pour un document "externe" (source_url renseigné) : récupère le vrai
     * contenu à la demande, au tout premier accès, et le met en cache sur
     * le disque "local" — les accès suivants (par n'importe quel
     * utilisateur) sont ensuite instantanés, sans re-solliciter la source
     * externe. Ne fait rien si le document a déjà un fichier (déposé
     * normalement, ou déjà mis en cache une première fois).
     *
     * Deux types de source_url :
     * - se terminant par .pdf (Internet Archive) : un vrai fac-similé —
     *   pages scannées de l'édition originale — mis en cache tel quel,
     *   sans transformation.
     * - sinon (Project Gutenberg, texte brut .txt) : aucun fac-similé
     *   n'existe pour cet ouvrage, le texte est recomposé en PDF (voir
     *   renderTextPdf).
     */
    private function ensureCached(Document $document): void
    {
        if ($document->file_path && Storage::disk('local')->exists($document->file_path)) {
            return;
        }

        if (! $document->source_url) {
            abort(404, 'Ce document n\'a pas encore de contenu disponible.');
        }

        $userAgent = 'e-biblio-IUZTF/1.0 (bibliotheque numerique institutionnelle; contact: admin@iu-ztf.cm)';

        // Un vrai fac-similé scanné (Internet Archive) peut peser plusieurs
        // centaines de Mo — tout charger en mémoire avant d'écrire sur disque
        // (comme pour le texte Gutenberg ci-dessous) épuiserait la mémoire
        // PHP disponible sur Railway. On écrit directement le flux HTTP sur
        // le disque au fur et à mesure (Http::sink), sans jamais retenir le
        // fichier entier en RAM. Ce n'est possible que parce qu'on connaît le
        // type de contenu à l'avance grâce à l'extension de l'URL.
        if (str_ends_with(parse_url($document->source_url, PHP_URL_PATH) ?? '', '.pdf')) {
            $path = 'documents/'.Str::uuid().'.pdf';
            $fullPath = Storage::disk('local')->path($path);
            if (! is_dir(dirname($fullPath))) {
                mkdir(dirname($fullPath), 0755, true);
            }

            $response = Http::timeout(300)
                ->withHeaders(['User-Agent' => $userAgent])
                ->sink($fullPath)
                ->get($document->source_url);

            if (! $response->ok()) {
                @unlink($fullPath);
                abort(502, 'Impossible de récupérer le contenu de ce document pour le moment. Réessayez plus tard.');
            }

            $document->forceFill(['file_path' => $path])->save();

            return;
        }

        // Un simple texte Gutenberg (quelques Mo max, voir troncature plus
        // bas) reste raisonnable à charger entièrement en mémoire pour le
        // nettoyer avant de le passer à FPDF.
        $response = Http::timeout(120)
            ->withHeaders(['User-Agent' => $userAgent])
            ->get($document->source_url);

        if (! $response->ok()) {
            abort(502, 'Impossible de récupérer le contenu de ce document pour le moment. Réessayez plus tard.');
        }

        $body = $response->body();
        $start = strpos($body, '*** START OF THE PROJECT GUTENBERG EBOOK');
        if ($start !== false) {
            $newline = strpos($body, "\n", $start);
            $body = $newline !== false ? substr($body, $newline + 1) : substr($body, $start);
        }
        $end = strpos($body, '*** END OF THE PROJECT GUTENBERG EBOOK');
        if ($end !== false) {
            $body = substr($body, 0, $end);
        }
        $text = trim(preg_replace('/\n{3,}/', "\n\n", $body));
        // Garde-fou : un ouvrage multi-volumes pourrait dépasser plusieurs
        // Mo de texte brut — on tronque très large (≈ 1000 pages) plutôt
        // que de laisser une requête tourner indéfiniment.
        $text = mb_substr($text, 0, 3_000_000);

        $path = 'documents/'.Str::uuid().'.pdf';
        Storage::disk('local')->put($path, $this->renderTextPdf($document->title, $document->author, $text));

        $document->forceFill(['file_path' => $path])->save();
    }

    /**
     * Génère un vrai PDF multi-pages à partir de texte brut avec FPDF —
     * beaucoup plus économe en mémoire que dompdf (qui construit un DOM
     * complet en mémoire) pour un texte de la longueur d'un livre entier ;
     * dompdf épuisait la limite mémoire de PHP au-delà de quelques milliers
     * de mots. FPDF ne gère nativement que le Latin-1 : les caractères hors
     * de ce jeu (rare, surtout dans certains noms d'auteurs) sont
     * approximés plutôt que de faire échouer la génération.
     */
    private function renderTextPdf(string $title, string $author, string $text): string
    {
        $toLatin1 = fn (string $s) => mb_convert_encoding($s, 'ISO-8859-1', 'UTF-8');

        $pdf = new \FPDF();
        $pdf->AddPage();
        $pdf->SetFont('Arial', 'B', 16);
        $pdf->MultiCell(0, 8, $toLatin1($title));
        $pdf->SetFont('Arial', 'I', 11);
        $pdf->MultiCell(0, 6, $toLatin1($author));
        $pdf->Ln(6);
        $pdf->SetFont('Arial', '', 11);
        $pdf->MultiCell(0, 6, $toLatin1($text));

        return $pdf->Output('S');
    }

    public function downloads(Request $request): JsonResponse
    {
        $downloads = $request->user()->downloads()->with('document.subdomain.domain')->latest('downloaded_at')->get();

        return response()->json(['downloads' => $downloads]);
    }

    public function myUploads(Request $request): JsonResponse
    {
        $documents = $request->user()->depositedDocuments()->with(['deletionRequests', 'subdomain.domain'])->latest('uploaded_at')->get();

        return response()->json(['documents' => $documents]);
    }

    /**
     * Redimensionne (600px de long côté max) et recompresse en JPEG qualité
     * 82 — les couvertures uploadées telles quelles (jusqu'à 2 Mo, résolution
     * d'appareil photo/scanner) n'ont jamais besoin d'être aussi lourdes
     * qu'affichées en vignette de 44px ou en 208px sur la fiche document ;
     * ça alourdissait fortement chaque chargement du catalogue (une image
     * par document affiché).
     */
    private function storeCover(UploadedFile $file): string
    {
        return ImageResizer::resizeAndStore($file, 'covers', maxDimension: 600);
    }

    private function downloadName(Document $document): string
    {
        return $document->title.'.'.pathinfo($document->file_path, PATHINFO_EXTENSION);
    }
}
