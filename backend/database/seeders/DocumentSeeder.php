<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Subdomain;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentSeeder extends Seeder
{
    /**
     * Seed the catalog with, for each sous-domaine seeded by DomainSeeder,
     * at least two internationally recognized reference books (real
     * title/author). The PDF file itself is a minimal stub (no copyrighted
     * content is embedded) ; the cover image, however, is fetched live from
     * Open Library (openlibrary.org, a free public API) by title/author, so
     * no cover URL/ISBN needs to be hardcoded or guessed here. If a given
     * book isn't found on Open Library, the document is still created —
     * simply without a cover.
     */
    private array $books = [
        'Médecine Générale' => [
            ["Harrison's Principles of Internal Medicine", 'Dennis Kasper'],
            ["Gray's Anatomy", 'Henry Gray'],
        ],
        'Pharmacie' => [
            ['Goodman & Gilman\'s The Pharmacological Basis of Therapeutics', 'Laurence Brunton'],
            ['Remington: The Science and Practice of Pharmacy', 'Loyd Allen'],
        ],
        'Odontologie' => [
            ['Sturdevant\'s Art and Science of Operative Dentistry', 'André Ritter'],
            ['Carranza\'s Clinical Periodontology', 'Michael Newman'],
        ],
        'Sciences Infirmières' => [
            ['Fundamentals of Nursing', 'Patricia Potter'],
            ['Nursing Theorists and Their Work', 'Martha Raile Alligood'],
        ],
        'Kinésithérapie' => [
            ['Therapeutic Exercise: Foundations and Techniques', 'Carolyn Kisner'],
            ['Orthopaedic Physical Therapy', 'Robert Donatelli'],
        ],
        'Santé Publique' => [
            ['Public Health: What It Is and How It Works', 'Bernard Turnock'],
            ['Epidemiology', 'Leon Gordis'],
        ],
        'Anatomie' => [
            ["Gray's Anatomy for Students", 'Richard Drake'],
            ["Netter's Atlas of Human Anatomy", 'Frank Netter'],
        ],
        'Physiologie' => [
            ['Guyton and Hall Textbook of Medical Physiology', 'John Hall'],
            ["Ganong's Review of Medical Physiology", 'Kim Barrett'],
        ],
        'Microbiologie' => [
            ['Medical Microbiology', 'Patrick Murray'],
            ['Brock Biology of Microorganisms', 'Michael Madigan'],
        ],
        'Nutrition' => [
            ['Krause\'s Food & the Nutrition Care Process', 'Janice Raymond'],
            ['Human Nutrition', 'Catherine Geissler'],
        ],

        'Agronomie Générale' => [
            ['Introduction to Agronomy: Food, Crops, and Environment', 'Craig Sheaffer'],
            ['Principles of Agronomy for Sustainable Agriculture', 'Reddy S.N.'],
        ],
        'Génie Rural' => [
            ['Soil and Water Conservation Engineering', 'Glenn Schwab'],
            ['Irrigation Engineering and Hydraulic Structures', 'S.K. Garg'],
        ],
        'Biotechnologie Végétale' => [
            ['Plant Biotechnology', 'Adrian Slater'],
            ['Introduction to Plant Biotechnology', 'H.S. Chawla'],
        ],
        'Zootechnie' => [
            ['Animal Science', 'R.E. Taylor'],
            ["Stockman's Handbook", 'M.E. Ensminger'],
        ],
        'Phytopathologie' => [
            ['Plant Pathology', 'George Agrios'],
            ['Introductory Plant Pathology', 'Richard Sherf'],
        ],
        'Sciences du Sol' => [
            ['The Nature and Properties of Soils', 'Nyle Brady'],
            ['Soil Science and Management', 'Edward Plaster'],
        ],
        'Agroéconomie' => [
            ['Agricultural Economics', 'Andrew Barkley'],
            ['Principles of Agricultural Economics', 'David Colman'],
        ],
        'Génétique Végétale' => [
            ['Principles of Plant Genetics and Breeding', 'George Acquaah'],
            ['Plant Breeding', 'Jack Brown'],
        ],
        'Biotechnologie Alimentaire' => [
            ['Food Biotechnology', 'Kalidas Shetty'],
            ['Principles of Fermentation Technology', 'Peter Stanbury'],
        ],
        'Agroforesterie' => [
            ['Tropical Agroforestry', 'P.K. Ramachandran Nair'],
            ['Agroforestry: Principles and Practices', 'Julian Evans'],
        ],

        'Génie Civil' => [
            ['Structural Analysis', 'R.C. Hibbeler'],
            ['Design of Reinforced Concrete', 'Jack McCormac'],
        ],
        'Génie Électrique' => [
            ['Electrical Engineering: Principles and Applications', 'Allan Hambley'],
            ['Fundamentals of Electric Circuits', 'Charles Alexander'],
        ],
        'Génie Mécanique' => [
            ["Shigley's Mechanical Engineering Design", 'Richard Budynas'],
            ['Fundamentals of Fluid Mechanics', 'Bruce Munson'],
        ],
        'Génie Informatique' => [
            ['Computer Organization and Design', 'David Patterson'],
            ['Digital Design', 'M. Morris Mano'],
        ],
        'Génie Logiciel' => [
            ['Software Engineering', 'Ian Sommerville'],
            ['Clean Code', 'Robert C. Martin'],
        ],
        'Télécommunications' => [
            ['Communication Systems', 'Simon Haykin'],
            ['Principles of Communications', 'Rodger Ziemer'],
        ],
        'Énergies Renouvelables' => [
            ['Renewable and Efficient Electric Power Systems', 'Gilbert Masters'],
            ['Power from the Wind', 'Paul Gipe'],
        ],
        'Robotique' => [
            ['Introduction to Robotics: Mechanics and Control', 'John Craig'],
            ['Robotics: Modelling, Planning and Control', 'Bruno Siciliano'],
        ],
        'Intelligence Artificielle' => [
            ['Artificial Intelligence: A Modern Approach', 'Stuart Russell'],
            ['Deep Learning', 'Ian Goodfellow'],
        ],
        'Génie Industriel' => [
            ['Facilities Planning', 'James Tompkins'],
            ['Industrial Engineering and Management', 'O.P. Khanna'],
        ],

        'Microéconomie' => [
            ['Microeconomic Theory', 'Andreu Mas-Colell'],
            ['Microeconomics', 'Paul Krugman'],
        ],
        'Macroéconomie' => [
            ['Macroeconomics', 'N. Gregory Mankiw'],
            ['Macroeconomics', 'Olivier Blanchard'],
        ],
        'Comptabilité' => [
            ['Financial Accounting', 'Jerry Weygandt'],
            ['Principles of Accounting', 'Belverd Needles'],
        ],
        "Finance d'Entreprise" => [
            ['Principles of Corporate Finance', 'Richard Brealey'],
            ['Corporate Finance', 'Jonathan Berk'],
        ],
        'Marketing' => [
            ['Marketing Management', 'Philip Kotler'],
            ['Principles of Marketing', 'Gary Armstrong'],
        ],
        'Management' => [
            ['Management', 'Stephen Robbins'],
            ['The Practice of Management', 'Peter Drucker'],
        ],
        'Économétrie' => [
            ['Introductory Econometrics', 'Jeffrey Wooldridge'],
            ['Basic Econometrics', 'Damodar Gujarati'],
        ],
        'Ressources Humaines' => [
            ['Human Resource Management', 'Gary Dessler'],
            ["Armstrong's Handbook of Human Resource Management Practice", 'Michael Armstrong'],
        ],
        'Entrepreneuriat' => [
            ['The Lean Startup', 'Eric Ries'],
            ['Business Model Generation', 'Alexander Osterwalder'],
        ],
        'Commerce International' => [
            ['International Economics', 'Paul Krugman'],
            ['International Trade', 'Robert Feenstra'],
        ],

        'Droit Civil' => [
            ['Droit civil : Les obligations', 'François Terré'],
            ['Droit civil : Introduction générale', 'Jean Carbonnier'],
        ],
        'Droit des Affaires' => [
            ['Droit des affaires', 'Georges Ripert'],
            ['Business Law', 'Henry Cheeseman'],
        ],
        'Droit Constitutionnel' => [
            ['Droit constitutionnel', 'Dominique Chagnollaud'],
            ['Constitutional Law', 'Erwin Chemerinsky'],
        ],
        'Droit International' => [
            ['International Law', 'Malcolm Shaw'],
            ['Droit international public', 'Alain Pellet'],
        ],
        'Droit du Travail' => [
            ['Droit du travail', 'Jean Pélissier'],
            ['International Labour Law', 'International Labour Office'],
        ],
        'Droit Fiscal' => [
            ['Précis de fiscalité', 'Maurice Cozian'],
            ['Droit fiscal', 'Martin Collet'],
        ],
        'Droit Pénal' => [
            ['Droit pénal général', 'Frédéric Desportes'],
            ['Criminal Law', 'Joel Samaha'],
        ],
        'Droit OHADA' => [
            ['OHADA : Traité et actes uniformes commentés et annotés', 'Joseph Issa-Sayegh'],
            ['Droit des sociétés commerciales OHADA', 'Filiga Michel Sawadogo'],
        ],
        'Gestion Financière Publique' => [
            ['Public Finance', 'Harvey Rosen'],
            ['Finances publiques', 'Michel Bouvier'],
        ],
        'Économie du Développement' => [
            ['Economic Development', 'Michael Todaro'],
            ['Poor Economics', 'Abhijit Banerjee'],
        ],

        'Communication Digitale' => [
            ['Understanding Media', 'Marshall McLuhan'],
            ['Convergence Culture', 'Henry Jenkins'],
        ],
        'Journalisme' => [
            ['The Elements of Journalism', 'Bill Kovach'],
            ['News Reporting and Writing', 'The Missouri Group'],
        ],
        'Relations Publiques' => [
            ['Effective Public Relations', 'Scott Cutlip'],
            ['This Is PR: The Realities of Public Relations', 'Karen Miller Russell'],
        ],
        'Publicité' => [
            ['Advertising and Promotion', 'George Belch'],
            ['Ogilvy on Advertising', 'David Ogilvy'],
        ],
        'Cinéma et Audiovisuel' => [
            ['Film Art: An Introduction', 'David Bordwell'],
            ['In the Blink of an Eye', 'Walter Murch'],
        ],
        'Design Graphique' => [
            ['Thinking with Type', 'Ellen Lupton'],
            ['Grid Systems in Graphic Design', 'Josef Müller-Brockmann'],
        ],
        'Arts Plastiques' => [
            ['The Story of Art', 'Ernst Gombrich'],
            ['Ways of Seeing', 'John Berger'],
        ],
        'Musique' => [
            ['The Rest Is Noise', 'Alex Ross'],
            ['A History of Western Music', 'Donald Grout'],
        ],
        'Théâtre' => [
            ['The Empty Space', 'Peter Brook'],
            ['Poetics', 'Aristotle'],
        ],
        'Photographie' => [
            ['On Photography', 'Susan Sontag'],
            ["The Photographer's Eye", 'Michael Freeman'],
        ],

        'Anthropologie Culturelle' => [
            ['Cultural Anthropology', 'Conrad Kottak'],
            ['Tristes Tropiques', 'Claude Lévi-Strauss'],
        ],
        'Sociologie' => [
            ['The Sociological Imagination', 'C. Wright Mills'],
            ['Sociology', 'Anthony Giddens'],
        ],
        'Psychologie' => [
            ['Psychology', 'David Myers'],
            ['Thinking, Fast and Slow', 'Daniel Kahneman'],
        ],
        "Sciences de l'Éducation" => [
            ['Pedagogy of the Oppressed', 'Paulo Freire'],
            ['How People Learn', 'John Bransford'],
        ],
        'Anthropologie Sociale' => [
            ['Argonauts of the Western Pacific', 'Bronisław Malinowski'],
            ['The Interpretation of Cultures', 'Clifford Geertz'],
        ],
        'Démographie' => [
            ['Demography: Measuring and Modeling Population Processes', 'Samuel Preston'],
            ['The Population Bomb', 'Paul Ehrlich'],
        ],
        'Travail Social' => [
            ['Social Work Practice', 'Malcolm Payne'],
            ['An Introduction to Social Work Theory', 'David Howe'],
        ],
        'Linguistique' => [
            ['Course in General Linguistics', 'Ferdinand de Saussure'],
            ['Syntactic Structures', 'Noam Chomsky'],
        ],
        'Ethnologie Africaine' => [
            ['Facing Mount Kenya', 'Jomo Kenyatta'],
            ['African Religions and Philosophy', 'John Mbiti'],
        ],
        'Histoire Africaine' => [
            ['A History of Africa', 'J.D. Fage'],
            ['Africa Must Unite', 'Kwame Nkrumah'],
        ],

        'Leadership Stratégique' => [
            ['Good to Great', 'Jim Collins'],
            ['On Becoming a Leader', 'Warren Bennis'],
        ],
        'Développement Personnel' => [
            ['The 7 Habits of Highly Effective People', 'Stephen Covey'],
            ['Atomic Habits', 'James Clear'],
        ],
        'Gestion du Changement' => [
            ['Leading Change', 'John Kotter'],
            ['Switch: How to Change Things When Change Is Hard', 'Chip Heath'],
        ],
        'Prise de Décision' => [
            ['Thinking, Fast and Slow', 'Daniel Kahneman'],
            ['Decisive', 'Chip Heath'],
        ],
        'Communication de Leadership' => [
            ['Talk Like TED', 'Carmine Gallo'],
            ['Made to Stick', 'Chip Heath'],
        ],
        'Éthique et Leadership' => [
            ['The Servant as Leader', 'Robert Greenleaf'],
            ['Ethics: The Fundamentals', 'Julia Driver'],
        ],
        "Gestion d'Équipe" => [
            ['The Five Dysfunctions of a Team', 'Patrick Lencioni'],
            ['Team of Teams', 'Stanley McChrystal'],
        ],
        'Négociation' => [
            ['Getting to Yes', 'Roger Fisher'],
            ['Never Split the Difference', 'Chris Voss'],
        ],
        'Intelligence Émotionnelle' => [
            ['Emotional Intelligence', 'Daniel Goleman'],
            ['Primal Leadership', 'Daniel Goleman'],
        ],
        'Leadership Transformationnel' => [
            ['Leadership', 'James MacGregor Burns'],
            ['Transforming Leadership', 'James MacGregor Burns'],
        ],
    ];

    public function run(): void
    {
        $depositor = User::where('role', 'admin')->first();
        if (! $depositor) {
            $this->command?->error('Aucun compte admin trouvé — exécutez AdminSeeder avant DocumentSeeder.');

            return;
        }

        $subdomains = Subdomain::pluck('id', 'name');
        $total = array_sum(array_map('count', $this->books));
        $done = 0;

        foreach ($this->books as $subdomainName => $titles) {
            $subdomainId = $subdomains[$subdomainName] ?? null;
            if (! $subdomainId) {
                continue;
            }

            foreach ($titles as [$title, $author]) {
                $done++;

                if (Document::where('title', $title)->where('author', $author)->where('subdomain_id', $subdomainId)->exists()) {
                    $this->command?->info("[{$done}/{$total}] déjà présent — {$title}");

                    continue;
                }

                $path = 'documents/'.Str::uuid().'.pdf';
                Storage::disk('local')->put($path, $this->fakePdf($title));
                $coverPath = $this->fetchCoverPath($title, $author);

                Document::create([
                    'title' => $title,
                    'author' => $author,
                    'subdomain_id' => $subdomainId,
                    'summary' => "Ouvrage de référence : {$title}, {$author}.",
                    'file_path' => $path,
                    'cover_path' => $coverPath,
                    'uploaded_by_id' => $depositor->id,
                ]);

                $coverStatus = $coverPath ? 'couverture trouvée' : 'sans couverture';
                $this->command?->info("[{$done}/{$total}] {$subdomainName} — {$title} ({$coverStatus})");
            }
        }

        $this->seedRealExcerpts();
    }

    /**
     * Pour 3 ouvrages réellement tombés dans le domaine public (donc
     * légalement redistribuables en intégralité — contrairement au reste du
     * catalogue, qui ne contient que des fiches title/author/couverture),
     * récupère un vrai extrait de texte depuis sa source légale et génère
     * un vrai PDF multi-pages à la place du fichier stub. Datés comme les
     * plus récents pour remonter en premier dans le catalogue et les
     * tableaux de bord (triés par date d'ajout).
     */
    private function seedRealExcerpts(): void
    {
        $excerpts = [
            [
                'title' => 'Poetics',
                'source' => 'https://www.gutenberg.org/cache/epub/1974/pg1974.txt',
                'format' => 'gutenberg',
            ],
            [
                'title' => 'Course in General Linguistics',
                'source' => 'https://fr.wikisource.org/api/rest_v1/page/html/Cours_de_linguistique_g%C3%A9n%C3%A9rale%2FTexte_entier',
                'format' => 'html',
            ],
            [
                'title' => 'Argonauts of the Western Pacific',
                'source' => 'https://archive.org/download/ArgonautsOfTheWesternPacific/ArgonautsOfTheWesternPacific_djvu.txt',
                'format' => 'plain',
            ],
        ];

        foreach ($excerpts as $excerpt) {
            $document = Document::where('title', $excerpt['title'])->first();
            if (! $document) {
                $this->command?->warn("Extrait réel ignoré (document introuvable) : {$excerpt['title']}");

                continue;
            }

            if (str_starts_with($document->summary ?? '', 'Extrait authentique')) {
                $this->command?->info("Extrait réel déjà en place — {$document->title}");

                continue;
            }

            $text = $this->extractText($excerpt['source'], $excerpt['format']);
            if (! $text) {
                $this->command?->warn("Extrait réel introuvable à la source pour : {$excerpt['title']}");

                continue;
            }

            $pdfContent = $this->renderExcerptPdf($document->title, $document->author, $text);
            Storage::disk('local')->delete($document->file_path);
            $path = 'documents/'.Str::uuid().'.pdf';
            Storage::disk('local')->put($path, $pdfContent);

            $document->forceFill([
                'file_path' => $path,
                'summary' => "Extrait authentique (œuvre du domaine public) : {$document->title}, {$document->author}.",
                'uploaded_at' => now(),
            ])->save();

            $this->command?->info("Extrait réel intégré (remonté en tête du catalogue) : {$document->title}");
        }
    }

    /**
     * Récupère et nettoie sommairement le texte source. Suffisant pour un
     * extrait de prévisualisation, pas une édition critique.
     */
    private function extractText(string $url, string $format): ?string
    {
        try {
            // Wikimedia (et d'autres) rejettent les requêtes sans User-Agent
            // descriptif (politique anti-robots) — voir https://w.wiki/4wJS.
            $response = Http::timeout(20)
                ->withHeaders(['User-Agent' => 'e-biblio-IUZTF/1.0 (bibliotheque numerique institutionnelle; contact: admin@iu-ztf.cm)'])
                ->get($url);
            if (! $response->ok()) {
                return null;
            }

            $body = $response->body();

            if ($format === 'gutenberg') {
                $start = strpos($body, '*** START OF THE PROJECT GUTENBERG EBOOK');
                if ($start !== false) {
                    $newline = strpos($body, "\n", $start);
                    $body = $newline !== false ? substr($body, $newline + 1) : substr($body, $start);
                }
            }

            if ($format === 'html') {
                // API REST MediaWiki (fr.wikisource.org/api/rest_v1/page/html/...) :
                // rend le HTML de l'article, transclusions résolues (contenu réel des
                // pages scannées), sans le chrome de navigation du site.
                $body = preg_replace('/<(script|style)\b[^>]*>.*?<\/\1>/is', '', $body);
                $body = preg_replace('/<(p|br|h[1-6]|li)\b[^>]*>/i', "\n", $body);
                $body = strip_tags($body);
                $body = html_entity_decode($body, ENT_QUOTES, 'UTF-8');
            }

            $text = trim(preg_replace('/[ \t]+/', ' ', $body));
            $text = trim(preg_replace('/\n{3,}/', "\n\n", $text));

            return $text !== '' ? mb_substr($text, 0, 6000) : null;
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
            .'<p class="note">— Extrait, œuvre du domaine public.</p>'
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

    /**
     * Cherche la couverture réelle du livre sur Open Library (API publique,
     * sans clé requise) et la télécharge sur le disque "public". Retourne
     * null si le livre n'y est pas trouvé — le document est alors créé sans
     * image, sans faire échouer le reste du seeder.
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

    /**
     * Minimal but valid PDF content, enough for mime detection and viewers
     * to open without erroring on an empty/garbage file.
     */
    private function fakePdf(string $title): string
    {
        return <<<PDF
        %PDF-1.4
        1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
        2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
        3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj
        trailer << /Root 1 0 R >>
        %% {$title}
        %%EOF
        PDF;
    }
}
