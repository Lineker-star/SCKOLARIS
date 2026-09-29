<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Subdomain;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Un ouvrage francophone authentique par sous-domaine, pour la bibliothèque
 * de l'Institut Universitaire ZTF (Bertoua, Cameroun). Même exigence que
 * GutenbergCatalogSeeder : chaque `source_url` est un vrai fac-similé scanné
 * (auteur vérifié dans les métadonnées Internet Archive, jamais un lien
 * deviné à partir du seul titre) — DocumentController::ensureCached()
 * récupère et met en cache le contenu réel au tout premier accès. À la
 * différence de GutenbergCatalogSeeder, il n'y a ici aucun repli "texte brut
 * recomposé en PDF" : les 36 sources ci-dessous sont toutes de vrais
 * fac-similés (mise en page et illustrations d'origine préservées).
 */
class FrenchCatalogSeeder extends Seeder
{
    /**
     * sous-domaine => [titre, auteur, URL du fac-similé Internet Archive].
     */
    private array $books = [
        'Médecine Générale' => ["De l'auscultation médiate : de l'exploration des organes de la circulation", 'René Théophile Hyacinthe Laennec', 'https://archive.org/download/delauscultation00laengoog/delauscultation00laengoog.pdf'],
        'Anatomie' => ["Traité d'anatomie humaine : anatomie descriptive, histologie, développement", 'Léo Testut', 'https://archive.org/download/traitdanatomie1895test01/traitdanatomie1895test01.pdf'],
        'Physiologie' => ["Introduction à l'étude de la médecine expérimentale", 'Claude Bernard', 'https://archive.org/download/introductionltu01berngoog/introductionltu01berngoog.pdf'],
        'Santé Publique' => ["Traité d'hygiène publique et privée", 'Michel Lévy', 'https://archive.org/download/traitdhygine01lv/traitdhygine01lv.pdf'],
        'Nutrition' => ['Physiologie du goût, ou Méditations de gastronomie transcendante', 'Jean Anthelme Brillat-Savarin', 'https://archive.org/download/physiologiedugo00savgoog/physiologiedugo00savgoog.pdf'],
        'Microbiologie' => ['Éléments de microbiologie générale', 'Maurice Nicolle', 'https://archive.org/download/elmentsdemicrob00nicogoog/elmentsdemicrob00nicogoog.pdf'],
        'Pharmacie' => ['Histoire naturelle des drogues simples', 'Nicolas-Jean-Baptiste-Gaston Guibourt', 'https://archive.org/download/histoirenaturel00guibgoog/histoirenaturel00guibgoog.pdf'],
        'Sciences Infirmières' => ['Manuel du garde-malade, des gardes des femmes en couches et des enfans au berceau', 'François-Emmanuel Fodéré', 'https://archive.org/download/bnf-bpt6k6535208s/bnf-bpt6k6535208s.pdf'],
        'Agronomie Générale' => ["Le théâtre d'agriculture et mesnage des champs", 'Olivier de Serres', 'https://archive.org/download/letheatredagricu00serr/letheatredagricu00serr.pdf'],
        'Agroforesterie' => ['Manuel de sylviculture', 'Gustave Bagnéris', 'https://archive.org/download/manueldesylvicu02bagngoog/manueldesylvicu02bagngoog.pdf'],
        'Zootechnie' => ['Zootechnie : mouton, chèvre, porc', 'Paul Diffloth', 'https://archive.org/download/zootechniemouto00diffgoog/zootechniemouto00diffgoog.pdf'],
        'Génie Civil' => ['Traité de l\'équilibre des voûtes et de la construction des ponts en maçonnerie', 'Jules Dupuit', 'https://archive.org/download/bub_gb_4aX6pIZyYFAC/bub_gb_4aX6pIZyYFAC.pdf'],
        'Génie Électrique' => ["Théorie mathématique des phénomènes électro-dynamiques, uniquement déduite de l'expérience", 'André-Marie Ampère', 'https://archive.org/download/thoriemathmatiq00ampgoog/thoriemathmatiq00ampgoog.pdf'],
        'Génie Mécanique' => ['Réflexions sur la puissance motrice du feu et sur les machines propres à développer cette puissance', 'Sadi Carnot', 'https://archive.org/download/bub_gb_QX9iIWF3yOMC/bub_gb_QX9iIWF3yOMC.pdf'],
        'Télécommunications' => ['La télégraphie sans fil', 'Édouard Branly', 'https://archive.org/download/latelegraphiesan00bran/latelegraphiesan00bran.pdf'],
        'Microéconomie' => ["Traité d'économie politique", 'Jean-Baptiste Say', 'https://archive.org/download/traitdconomiepo01saygoog/traitdconomiepo01saygoog.pdf'],
        'Macroéconomie' => ["Nouveaux principes d'économie politique", 'J.-C.-L. Simonde de Sismondi', 'https://archive.org/download/nouveauxprincipe01sismuoft/nouveauxprincipe01sismuoft.pdf'],
        'Management' => ['Administration industrielle et générale', 'Henri Fayol', 'https://archive.org/download/fayol/fayol.pdf'],
        'Marketing' => ["La 4me page des journaux : histoire impartiale de l'annonce et de la réclame", 'Félix Verneuil', 'https://archive.org/download/BIUSante_pharma_014445/BIUSante_pharma_014445.pdf'],
        'Droit Constitutionnel' => ['Éléments de droit constitutionnel français et comparé', 'Adhémar Esmein', 'https://archive.org/download/lmentsdedroi01esmeuoft/lmentsdedroi01esmeuoft.pdf'],
        'Droit International' => ['Le droit des gens, ou Principes de la loi naturelle, appliqués à la conduite & aux affaires des nations & des souverains', 'Emer de Vattel', 'https://archive.org/download/bub_gb_92U8AAAAcAAJ/bub_gb_92U8AAAAcAAJ.pdf'],
        'Droit Pénal' => ['Éléments de droit pénal', 'Joseph Louis Elzéar Ortolan', 'https://archive.org/download/lmentsdedroi01ortouoft/lmentsdedroi01ortouoft.pdf'],
        'Journalisme' => ['Histoire du journal en France, 1631-1853', 'Eugène Hatin', 'https://archive.org/download/histoiredujourn00hatigoog/histoiredujourn00hatigoog.pdf'],
        'Arts Plastiques' => ['Entretiens sur les vies et sur les ouvrages des plus excellens peintres anciens et modernes', 'André Félibien', 'https://archive.org/download/entretienssurles01feli/entretienssurles01feli.pdf'],
        'Musique' => ["Traité de l'harmonie réduite à ses principes naturels", 'Jean-Philippe Rameau', 'https://archive.org/download/traitdelharmon00rame/traitdelharmon00rame.pdf'],
        'Théâtre' => ['Paradoxe sur le comédien', 'Denis Diderot', 'https://archive.org/download/paradoxesurleco00didegoog/paradoxesurleco00didegoog.pdf'],
        'Photographie' => ["Quand j'étais photographe", 'Nadar (Félix Tournachon)', 'https://archive.org/download/quandjetaisphoto00nada/quandjetaisphoto00nada.pdf'],
        'Cinéma et Audiovisuel' => ['La jungle du cinéma', 'Louis Delluc', 'https://archive.org/download/lajungleducinma00dellgoog/lajungleducinma00dellgoog.pdf'],
        'Anthropologie Sociale' => ['Les fonctions mentales dans les sociétés inférieures', 'Lucien Lévy-Bruhl', 'https://archive.org/download/lesfonctionsme00lv/lesfonctionsme00lv.pdf'],
        'Psychologie' => ['Les maladies de la mémoire', 'Théodule Ribot', 'https://archive.org/download/BIUSante_70268/BIUSante_70268.pdf'],
        'Linguistique' => ['Essai de sémantique (science des significations)', 'Michel Bréal', 'https://archive.org/download/essaidesmantiqu00brgoog/essaidesmantiqu00brgoog.pdf'],
        'Histoire Africaine' => ['Les Noirs de l\'Afrique', 'Maurice Delafosse', 'https://archive.org/download/lesnoirsdelafriq00dela/lesnoirsdelafriq00dela.pdf'],
        'Sociologie' => ['Le suicide : étude de sociologie', 'Émile Durkheim', 'https://archive.org/download/lesuicidetudede00durkgoog/lesuicidetudede00durkgoog.pdf'],
        'Leadership Stratégique' => ['Des principes de la guerre : conférences faites à l\'École supérieure de guerre', 'Ferdinand Foch', 'https://archive.org/download/desprincipesdel00fochgoog/desprincipesdel00fochgoog.pdf'],
        'Éthique et Leadership' => ['Essais de Michel de Montaigne', 'Michel de Montaigne', 'https://archive.org/download/essaisdemicheld09montgoog/essaisdemicheld09montgoog.pdf'],
        'Négociation' => ['De la manière de négocier avec les souverains', 'François de Callières', 'https://archive.org/download/delamaniredengo00callgoog/delamaniredengo00callgoog.pdf'],
    ];

    public function run(): void
    {
        $depositor = User::where('role', 'admin')->first();
        if (! $depositor) {
            $this->command?->error('Aucun compte admin trouvé — exécutez AdminSeeder avant FrenchCatalogSeeder.');

            return;
        }

        $subdomains = Subdomain::pluck('id', 'name');
        $total = count($this->books);
        $done = 0;

        foreach ($this->books as $subdomainName => [$title, $author, $sourceUrl]) {
            $done++;
            $subdomainId = $subdomains[$subdomainName] ?? null;
            if (! $subdomainId) {
                $this->command?->warn("[{$done}/{$total}] sous-domaine introuvable, ignoré — {$subdomainName}");

                continue;
            }

            $summary = "Fac-similé authentique de l'édition originale (Internet Archive, domaine public) : {$title}, {$author}.";

            $existing = Document::where('title', $title)->where('author', $author)->first();
            if ($existing) {
                if ($existing->source_url !== $sourceUrl && ! $existing->file_path) {
                    $existing->update(['source_url' => $sourceUrl, 'summary' => $summary]);
                    $this->command?->info("[{$done}/{$total}] source mise à jour — {$title}");
                } else {
                    $this->command?->info("[{$done}/{$total}] déjà présent — {$title}");
                }

                continue;
            }

            Document::create([
                'title' => $title,
                'author' => $author,
                'subdomain_id' => $subdomainId,
                'summary' => $summary,
                'file_path' => null,
                'source_url' => $sourceUrl,
                'cover_path' => $this->fetchCoverPath($title, $author),
                'uploaded_by_id' => $depositor->id,
            ]);

            $this->command?->info("[{$done}/{$total}] {$subdomainName} — {$title}");
        }
    }

    /**
     * Même logique que GutenbergCatalogSeeder::fetchCoverPath (Open
     * Library), copiée ici pour garder ce seeder autonome.
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
}
