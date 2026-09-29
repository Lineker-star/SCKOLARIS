<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Subdomain;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OpenBookSeeder extends Seeder
{
    /**
     * Complète le catalogue avec de vrais ouvrages du domaine public
     * (texte intégral réel, pas une fiche), découverts dynamiquement via
     * Gutendex (API du catalogue Project Gutenberg — 70 000+ ebooks dont le
     * statut domaine public est vérifié par le projet lui-même), plutôt que
     * des URL choisies/devinées à l'avance.
     *
     * Volontairement concentré sur les sous-domaines où du contenu
     * réellement libre existe (sciences humaines, droit et économie
     * classiques, arts, leadership/philosophie, quelques sciences et
     * techniques anciennes) — les sous-domaines très techniques/modernes
     * (IA, robotique, génie logiciel, biotechnologie...) n'ont pas
     * d'équivalent dans le domaine public et sont volontairement absents
     * de cette liste plutôt que remplis avec du contenu inventé.
     */
    private array $topicsBySubdomain = [
        // Sciences Humaines Appliquées et Anthropologie
        'Anthropologie Culturelle' => ['anthropology'],
        'Sociologie' => ['sociology'],
        'Psychologie' => ['psychology'],
        "Sciences de l'Éducation" => ['education'],
        'Anthropologie Sociale' => ['ethnology'],
        'Démographie' => ['population'],
        'Travail Social' => ['charities', 'philanthropy'],
        'Linguistique' => ['linguistics'],
        'Ethnologie Africaine' => ['africa'],
        'Histoire Africaine' => ['egypt'],

        // Droit et Sciences Économiques et Gestion
        'Droit Civil' => ['civil law'],
        'Droit Constitutionnel' => ['constitutional law'],
        'Droit International' => ['international law'],
        'Droit Pénal' => ['criminal law'],
        'Droit des Affaires' => ['commercial law'],
        'Économie du Développement' => ['political economy'],
        'Gestion Financière Publique' => ['public finance'],

        // Sciences Économiques Appliquées et Gestion
        'Microéconomie' => ['economics'],
        'Macroéconomie' => ['money'],
        'Comptabilité' => ['bookkeeping'],
        "Finance d'Entreprise" => ['finance'],
        'Marketing' => ['advertising'],
        'Management' => ['management'],
        'Ressources Humaines' => ['labor'],
        'Entrepreneuriat' => ['business'],
        'Commerce International' => ['commerce'],

        // Communication et Art
        'Journalisme' => ['journalism'],
        'Cinéma et Audiovisuel' => ['moving pictures'],
        'Arts Plastiques' => ['art'],
        'Musique' => ['music'],
        'Théâtre' => ['drama'],
        'Photographie' => ['photography'],

        // Leadership
        'Leadership Stratégique' => ['strategy'],
        'Développement Personnel' => ['conduct of life'],
        'Communication de Leadership' => ['rhetoric'],
        'Éthique et Leadership' => ['ethics'],
        'Négociation' => ['diplomacy'],
        'Leadership Transformationnel' => ['statesmen'],

        // Sciences de la Santé
        'Médecine Générale' => ['medicine'],
        'Pharmacie' => ['materia medica'],
        'Anatomie' => ['anatomy'],
        'Physiologie' => ['physiology'],
        'Santé Publique' => ['public health'],
        'Nutrition' => ['diet'],
        'Microbiologie' => ['bacteriology'],
        'Sciences Infirmières' => ['nursing'],

        // Agronomie et Biotechnologie
        'Agronomie Générale' => ['agriculture'],
        'Sciences du Sol' => ['soils'],
        'Zootechnie' => ['cattle'],
        'Agroforesterie' => ['forestry'],

        // Ingénierie et Technologie Appliquée
        'Génie Civil' => ['civil engineering'],
        'Génie Électrique' => ['electricity'],
        'Génie Mécanique' => ['mechanical engineering'],
        'Télécommunications' => ['telegraph'],
        'Génie Industriel' => ['manufactures'],
    ];

    private const MAX_PER_SUBDOMAIN = 3;

    private const TARGET_TOTAL = 100;

    public function run(): void
    {
        $depositor = User::where('role', 'admin')->first();
        if (! $depositor) {
            $this->command?->error('Aucun compte admin trouvé — exécutez AdminSeeder avant OpenBookSeeder.');

            return;
        }

        $subdomains = Subdomain::pluck('id', 'name');
        $added = 0;

        foreach ($this->topicsBySubdomain as $subdomainName => $topics) {
            if ($added >= self::TARGET_TOTAL) {
                break;
            }

            $subdomainId = $subdomains[$subdomainName] ?? null;
            if (! $subdomainId) {
                continue;
            }

            $addedForSubdomain = 0;

            foreach ($topics as $topic) {
                if ($addedForSubdomain >= self::MAX_PER_SUBDOMAIN || $added >= self::TARGET_TOTAL) {
                    break;
                }

                foreach ($this->searchGutendex($topic) as $book) {
                    if ($addedForSubdomain >= self::MAX_PER_SUBDOMAIN || $added >= self::TARGET_TOTAL) {
                        break;
                    }

                    if (Document::where('title', $book['title'])->exists()) {
                        continue;
                    }

                    $text = $this->fetchGutenbergText($book['text_url']);
                    if (! $text) {
                        continue;
                    }

                    $pdfContent = $this->renderExcerptPdf($book['title'], $book['author'], $text);
                    $path = 'documents/'.Str::uuid().'.pdf';
                    Storage::disk('local')->put($path, $pdfContent);

                    Document::create([
                        'title' => $book['title'],
                        'author' => $book['author'],
                        'subdomain_id' => $subdomainId,
                        'summary' => "Extrait authentique (œuvre du domaine public, via Project Gutenberg) : {$book['title']}, {$book['author']}.",
                        'file_path' => $path,
                        'cover_path' => $this->fetchCoverPath($book['title'], $book['author']),
                        'uploaded_by_id' => $depositor->id,
                    ]);

                    $added++;
                    $addedForSubdomain++;
                    $this->command?->info("[{$added}/".self::TARGET_TOTAL."] {$subdomainName} — {$book['title']} ({$book['author']})");
                }
            }
        }

        $this->command?->info("Terminé : {$added} ouvrages du domaine public ajoutés avec leur texte réel.");
    }

    /**
     * Cherche des livres réellement domaine public sur un sujet donné via
     * Gutendex (gutendex.com), l'API du catalogue Project Gutenberg.
     * Ne garde que les résultats explicitement marqués "copyright: false"
     * par Gutenberg et disposant d'un format texte brut téléchargeable.
     *
     * @return array<int, array{title: string, author: string, text_url: string}>
     */
    private function searchGutendex(string $topic): array
    {
        try {
            $response = Http::timeout(15)
                ->withHeaders(['User-Agent' => 'e-biblio-IUZTF/1.0 (bibliotheque numerique institutionnelle; contact: admin@iu-ztf.cm)'])
                ->get('https://gutendex.com/books/', [
                    'topic' => $topic,
                    'languages' => 'en,fr',
                ]);

            if (! $response->ok()) {
                return [];
            }

            $books = [];
            foreach ($response->json('results') ?? [] as $result) {
                if (($result['copyright'] ?? null) !== false) {
                    continue;
                }

                $textUrl = null;
                foreach ($result['formats'] ?? [] as $mime => $url) {
                    if (str_starts_with($mime, 'text/plain')) {
                        $textUrl = $url;
                        break;
                    }
                }
                if (! $textUrl) {
                    continue;
                }

                $author = $result['authors'][0]['name'] ?? 'Auteur inconnu';

                $books[] = [
                    'title' => trim($result['title'] ?? ''),
                    'author' => $author,
                    'text_url' => $textUrl,
                ];
            }

            return array_filter($books, fn ($b) => $b['title'] !== '');
        } catch (\Throwable) {
            return [];
        }
    }

    private function fetchGutenbergText(string $url): ?string
    {
        try {
            $response = Http::timeout(20)
                ->withHeaders(['User-Agent' => 'e-biblio-IUZTF/1.0 (bibliotheque numerique institutionnelle; contact: admin@iu-ztf.cm)'])
                ->get($url);

            if (! $response->ok()) {
                return null;
            }

            $body = $response->body();
            $start = strpos($body, '*** START OF THE PROJECT GUTENBERG EBOOK');
            if ($start !== false) {
                $newline = strpos($body, "\n", $start);
                $body = $newline !== false ? substr($body, $newline + 1) : substr($body, $start);
            }

            $text = trim(preg_replace('/[ \t]+/', ' ', $body));
            $text = trim(preg_replace('/\n{3,}/', "\n\n", $text));

            return $text !== '' ? mb_substr($text, 0, 6000) : null;
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Même logique que DocumentSeeder::fetchCoverPath (Open Library), copiée
     * ici pour garder ce seeder autonome, conformément à la convention du
     * projet (un seeder = un fichier indépendant).
     */
    private function fetchCoverPath(string $title, string $author): ?string
    {
        try {
            $search = Http::timeout(10)->get('https://openlibrary.org/search.json', [
                'title' => $title,
                'author' => $author,
                'limit' => 1,
                'fields' => 'cover_i',
            ]);

            $coverId = $search->ok() ? $search->json('docs.0.cover_i') : null;
            if (! $coverId) {
                return null;
            }

            $image = Http::timeout(10)->get("https://covers.openlibrary.org/b/id/{$coverId}-L.jpg");
            if (! $image->ok() || strlen($image->body()) < 1000) {
                return null;
            }

            $path = 'covers/'.Str::uuid().'.jpg';
            Storage::disk('public')->put($path, $image->body());

            return $path;
        } catch (\Throwable) {
            return null;
        }
    }

    private function renderExcerptPdf(string $title, string $author, string $text): string
    {
        $html = '<html><head><meta charset="utf-8"><style>'
            .'body{font-family:serif;font-size:12px;line-height:1.6;}'
            .'h1{font-size:18px;} .author{font-style:italic;margin-bottom:20px;}'
            .'.excerpt{white-space:pre-wrap;} .note{margin-top:24px;font-style:italic;color:#555;}'
            .'</style></head><body>'
            ."<h1>{$this->escape($title)}</h1>"
            ."<p class=\"author\">{$this->escape($author)}</p>"
            ."<p class=\"excerpt\">".nl2br($this->escape($text))."</p>"
            .'<p class="note">— Extrait, œuvre du domaine public (Project Gutenberg).</p>'
            .'</body></html>';

        $dompdf = new \Dompdf\Dompdf();
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4');
        $dompdf->render();

        return $dompdf->output();
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
    }
}
