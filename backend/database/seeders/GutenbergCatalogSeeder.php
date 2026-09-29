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
 * Catalogue de vrais ouvrages du domaine public. Deux sources selon
 * disponibilité, vérifiées manuellement (aucun lien deviné) :
 *
 * - Internet Archive : un vrai fac-similé (pages scannées de l'édition
 *   originale) quand un exemplaire librement téléchargeable existe ET dont
 *   l'auteur a été vérifié (la recherche par titre seul remonte parfois un
 *   tout autre livre au titre proche — écarté quand l'auteur ne
 *   correspondait pas).
 * - Project Gutenberg (texte brut) en repli pour les ouvrages sans
 *   fac-similé vérifié — recomposé en PDF par DocumentController.
 *
 * Contrairement à DocumentSeeder, aucun contenu n'est téléchargé ici : on
 * enregistre seulement `source_url`. DocumentController::ensureCached()
 * récupère et met en cache le contenu réel au tout premier accès (lecture
 * ou téléchargement). Seule la couverture est récupérée immédiatement
 * (rapide, utile pour l'affichage du catalogue).
 */
class GutenbergCatalogSeeder extends Seeder
{
    /**
     * title => URL Internet Archive du fac-similé PDF (auteur vérifié).
     */
    private array $facsimiles = [
        'Moral Principles and Medical Practice' => 'https://archive.org/download/MoralPrinciplesAndMedicalPractice/MoralPrinciplesAndMedicalPractice.pdf',
        'A Treatise on Anatomy, Physiology, and Hygiene' => 'https://archive.org/download/treatiseonanato00cutt/treatiseonanato00cutt.pdf',
        'A Text-book of Veterinary Anatomy' => 'https://archive.org/download/atextbookveteri00grosgoog/atextbookveteri00grosgoog.pdf',
        'Physiology and Hygiene for Secondary Schools' => 'https://archive.org/download/physiologyhygien00waltiala/physiologyhygien00waltiala.pdf',
        'Hygiene: a Manual of Personal and Public Health' => 'https://archive.org/download/b21355721/b21355721.pdf',
        'Civics and Health' => 'https://archive.org/download/b32757682/b32757682.pdf',
        'Science in the Kitchen' => 'https://archive.org/download/cu31924087301770/cu31924087301770.pdf',
        'The Fundamentals of Bacteriology' => 'https://archive.org/download/11120550R.nlm.nih.gov/11120550R.pdf',
        'Outlines of Dairy Bacteriology' => 'https://archive.org/download/outlinesdairyb00russrich/outlinesdairyb00russrich.pdf',
        'The Elements of Bacteriological Technique' => 'https://archive.org/download/elementsbacteri00unkngoog/elementsbacteri00unkngoog.pdf',
        'Dietetics for Nurses' => 'https://archive.org/download/dieteticsfornur02prougoog/dieteticsfornur02prougoog.pdf',
        'The Mothercraft Manual' => 'https://archive.org/download/mothercraftmanu01readgoog/mothercraftmanu01readgoog.pdf',
        'Rural Wealth and Welfare' => 'https://archive.org/download/in.ernet.dli.2015.261244/2015.261244.Rural-Wealth.pdf',
        'Steep Trails' => 'https://archive.org/download/cu31924014280782/cu31924014280782.pdf',
        'Conservation Reader' => 'https://archive.org/download/conservationrea00fairgoog/conservationrea00fairgoog.pdf',
        'The Life of Thomas Telford, Civil Engineer' => 'https://archive.org/download/lifethomastelfo00smilgoog/lifethomastelfo00smilgoog.pdf',
        'Surveying and Levelling Instruments' => 'https://archive.org/download/surveyingandlev00stangoog/surveyingandlev00stangoog.pdf',
        'The Life of Isambard Kingdom Brunel' => 'https://archive.org/download/11001081bsb/11001081bsb.pdf',
        'The Standard Electrical Dictionary' => 'https://archive.org/download/standardelectri00sloa/standardelectri00sloa.pdf',
        'Electricity for Boys' => 'https://archive.org/download/electricity-for-boys/Electricity%20for%20Boys%20-%20James%20Slough%20Zerbe.pdf',
        'Practical Mechanics for Boys' => 'https://archive.org/download/practical-mechanics-for-boys-james-slough-zerbe/Practical%20Mechanics%20for%20Boys%20-%20James%20Slough%20Zerbe.pdf',
        'Mechanical Drawing Self-Taught' => 'https://archive.org/download/mechanical-drawing-self-taught-comprisin-joshua-rose/Mechanical%20Drawing%20Self-Taught%20_%20Comprisin%20-%20Joshua%20Rose.pdf',
        'Wireless Telegraphy and Telephony Simply Explained' => 'https://archive.org/download/wirelesstelegra01morggoog/wirelesstelegra01morggoog.pdf',
        'The Romance of Modern Invention' => 'https://archive.org/download/romancemodernin00willgoog/romancemodernin00willgoog.pdf',
        'Principles of Political Economy' => 'https://archive.org/download/PrinciplesOfPoliticalEconomyVolII/PrinciplesOfPoliticalEconomyVolII.pdf',
        'On the Principles of Political Economy and Taxation' => 'https://archive.org/download/onprinciplesofpo00rica/onprinciplesofpo00rica.pdf',
        'The Art & Practice of Typography' => 'https://archive.org/download/TheArtPracticeOfTypography/TheArtPracticeOfTypography.pdf',
        'The Rights of War and Peace' => 'https://archive.org/download/bim_eighteenth-century_h-grotius-of-the-rights_grotius-hugo_1715_1/bim_eighteenth-century_h-grotius-of-the-rights_grotius-hugo_1715_1.pdf',
        'A Complete Guide to Heraldry' => 'https://archive.org/download/in.ernet.dli.2015.222126/2015.222126.A-Complete.pdf',
        'Operas Every Child Should Know' => 'https://archive.org/download/operas0000unse/operas0000unse.pdf',
        'Contemporary American Composers' => 'https://archive.org/download/famousamericanc00hughgoog/famousamericanc00hughgoog.pdf',
        'The Theory of the Theatre' => 'https://archive.org/download/theoryoftheatreo00hami/theoryoftheatreo00hami.pdf',
        'Photography in the Studio and in the Field' => 'https://archive.org/download/photographyinstu00estauoft/photographyinstu00estauoft.pdf',
        'A Manual of Photographic Chemistry' => 'https://archive.org/download/amanualphotogra01hardgoog/amanualphotogra01hardgoog.pdf',
        'The Seven Lively Arts' => 'https://archive.org/download/bwb_T2-CSF-216/bwb_T2-CSF-216.pdf',
        'Argonauts of the Western Pacific' => 'https://archive.org/download/dli.ernet.285326/285326-Argonauts%20Of%20The%20Western%20Pacific.pdf',
        'The Principles of Psychology, Vol.1' => 'https://archive.org/download/in.ernet.dli.2015.553461/2015.553461.The-Principles.pdf',
        'The Principles of Psychology, Vol.2' => 'https://archive.org/download/in.ernet.dli.2015.459681/2015.459681.The-Principles.pdf',
        'Psychology and Pedagogy of Anger' => 'https://archive.org/download/b32830208/b32830208.pdf',
        'Lectures on the Science of Language' => 'https://archive.org/download/dli.ernet.231170/231170-Lectures%20On%20The%20Science%20Of%20Language%20Vol-ii.pdf',
        'The Frontiers of Language and Nationality in Europe' => 'https://archive.org/download/frontierslangua00unkngoog/frontierslangua00unkngoog.pdf',
        'The Native Races of East Africa' => 'https://archive.org/download/nativeracesofeas00hambrich/nativeracesofeas00hambrich.pdf',
        'Narrative of the Life of Frederick Douglass' => 'https://archive.org/download/ASPC0002382600/ASPC0002382600.pdf',
        'Up from Slavery' => 'https://archive.org/download/bwb_Y0-CSB-522/bwb_Y0-CSB-522.pdf',
        'The Souls of Black Folk' => 'https://archive.org/download/soulsblackfolke00boisgoog/soulsblackfolke00boisgoog.pdf',
        'Democracy in America, Vol.1' => 'https://archive.org/download/TheProjectGutenbergEBookOfDemocracyInAmericaVol1/The%20Project%20Gutenberg%20EBook%20of%20Democracy%20In%20America_vol%201.pdf',
        'Anarchism and Other Essays' => 'https://archive.org/download/anarchismotheres00gold/anarchismotheres00gold.pdf',
        'Elements of Military Art and Science' => 'https://archive.org/download/cu31924031426327/cu31924031426327.pdf',
        "Plutarch's Morals" => 'https://archive.org/download/bim_early-english-books-1641-1700_plutarchs-morals-_plutarch_1690/bim_early-english-books-1641-1700_plutarchs-morals-_plutarch_1690.pdf',
        'The Origin and Development of the Moral Ideas' => 'https://archive.org/download/bwb_KV-062-511_2/bwb_KV-062-511_2.pdf',
        'Reflections; or Sentences and Moral Maxims' => 'https://archive.org/download/reflectionsorsen00laro/reflectionsorsen00laro.pdf',
        'On the Manner of Negotiating with Princes' => 'https://archive.org/download/onmannerofnegoti0000unse/onmannerofnegoti0000unse.pdf',

        // Deuxième vague — chaque lien vérifié individuellement (auteur
        // confirmé dans les métadonnées Internet Archive, pas seulement le
        // titre, et téléchargement testé) : le premier passage de ce fichier
        // laissait ces ouvrages sans fac-similé, affichés comme du texte
        // Gutenberg recomposé (mise en page/illustrations d'origine perdues).
        'The Principles and Practice of Modern Surgery' => 'https://archive.org/download/principlespracti00park/principlespracti00park.pdf',
        'Surgical Anatomy' => 'https://archive.org/download/surgicalanatomy00macl_0/surgicalanatomy00macl_0.pdf',
        'Zoonomia; Or, the Laws of Organic Life, Vol. II' => 'https://archive.org/download/b28772854_0002/b28772854_0002.pdf',
        'Principles of Public Health' => 'https://archive.org/download/principlesofpubl00tutt/principlesofpubl00tutt.pdf',
        'The Physiology of Digestion' => 'https://archive.org/download/physiologydiges00combgoog/physiologydiges00combgoog.pdf',
        'Pharmacologia' => 'https://archive.org/download/pharmacologiaal00parigoog/pharmacologiaal00parigoog.pdf',
        'Notes on Nursing' => 'https://archive.org/download/notesonnursingwh00byu2nigh/notesonnursingwh00byu2nigh.pdf',
        'Principles and Practice of Agricultural Analysis, Vol.1 (Soils)' => 'https://archive.org/download/principlespracti12/principlespracti12.pdf',
        'Principles and Practice of Agricultural Analysis, Vol.3' => 'https://archive.org/download/principlespracti14/principlespracti14.pdf',
        'Sylva; Or, A Discourse of Forest Trees, Vol.1' => 'https://archive.org/download/b22006813_0001/b22006813_0001.pdf',
        'The Inventions, Researches and Writings of Nikola Tesla' => 'https://archive.org/download/inventionsresear00martiala/inventionsresear00martiala.pdf',
        'How It Works' => 'https://archive.org/download/howitworksdealinginsimplelanguagearchibaldwilliams/How%20it%20Works%20_%20Dealing%20in%20simple%20language%20-%20Archibald%20Williams.pdf',
        'Cyclopedia of Telephony and Telegraphy, Vol.1' => 'https://archive.org/download/cyclopedia-of-telephony-and-telegraphy-vol-1/Cyclopedia%20of%20Telephony%20and%20Telegraphy%20vol%201.pdf',
        'Lombard Street' => 'https://archive.org/download/lombardstreetdes00bage_0/lombardstreetdes00bage_0.pdf',
        'Readings in Money and Banking' => 'https://archive.org/download/readingsinmoneyb00philiala/readingsinmoneyb00philiala.pdf',
        'The Principles of Scientific Management' => 'https://archive.org/download/principlesofscie1911tayl/principlesofscie1911tayl.pdf',
        'A History of Advertising from the Earliest Times' => 'https://archive.org/download/historyofadverti00samp_0/historyofadverti00samp_0.pdf',
        'Poster Advertising' => 'https://archive.org/download/posteradvertisin00hawk/posteradvertisin00hawk.pdf',
        'The Federalist Papers' => 'https://archive.org/download/federalistonnewc1818hami/federalistonnewc1818hami.pdf',
        'International Law: A Treatise, Vol.1' => 'https://archive.org/download/internationallaw01oppeuoft/internationallaw01oppeuoft.pdf',
        'International Law: A Treatise, Vol.2' => 'https://archive.org/download/internationallaw02oppeuoft/internationallaw02oppeuoft.pdf',
        'The Common Law' => 'https://archive.org/download/commonlaw00holmuoft/commonlaw00holmuoft.pdf',
        'The United States Constitution' => 'https://archive.org/download/constitutionofun00unit/constitutionofun00unit.pdf',
        'Criminal Psychology' => 'https://archive.org/download/criminalpsycholo00gros/criminalpsycholo00gros.pdf',
        'Commentaries on the Laws of England, Book 1' => 'https://archive.org/download/bim_eighteenth-century_commentaries-on-the-laws_blackstone-william-sir_1769_1/bim_eighteenth-century_commentaries-on-the-laws_blackstone-william-sir_1769_1.pdf',
        'Public Opinion' => 'https://archive.org/download/publicopinionhar0000walt/publicopinionhar0000walt.pdf',
        'The Elements of Style' => 'https://archive.org/download/cu31924014450716/cu31924014450716.pdf',
        'Lives of the Most Eminent Painters, Vol.1' => 'https://archive.org/download/livesofmostemi01vasa1892/livesofmostemi01vasa1892.pdf',
        'Royal Palaces and Parks of France' => 'https://archive.org/download/royalpalacespark00mansuoft/royalpalacespark00mansuoft.pdf',
        'Critical and Historical Essays' => 'https://archive.org/download/criticalhistoric00macdiala/criticalhistoric00macdiala.pdf',
        'Irish Plays and Playwrights' => 'https://archive.org/download/irishplaysplaywr00weyguoft/irishplaysplaywr00weyguoft.pdf',
        'Photography Self Taught' => 'https://archive.org/download/photographyselft1139snod/photographyselft1139snod.pdf',
        'The Tribes and Castes of the Central Provinces of India, Vol.1' => 'https://archive.org/download/dli.csl.5251/5251.pdf',
        'Myths of the Cherokee' => 'https://archive.org/download/mythsofcherokee00moon/mythsofcherokee00moon.pdf',
        'The Montessori Method' => 'https://archive.org/download/cu31924032538500/cu31924032538500.pdf',
        'The History of Pedagogy' => 'https://archive.org/download/historyofpedagog00compuoft/historyofpedagog00compuoft.pdf',
        'Æsthetic as Science of Expression and General Linguistic' => 'https://archive.org/download/aestheticasscien0000croc_g2u4/aestheticasscien0000croc_g2u4.pdf',
        'The Book of War (Art of War)' => 'https://archive.org/download/artofwaroldestmi00suntuoft/artofwaroldestmi00suntuoft.pdf',
        'Mahan on Naval Warfare' => 'https://archive.org/download/mahanonnavalwar00maha/mahanonnavalwar00maha.pdf',
    ];

    private array $books = [
        'Médecine Générale' => [
            [72658, 'The Principles and Practice of Modern Surgery', 'Roswell Park'],
            [18616, 'Moral Principles and Medical Practice', 'Charles Coppens'],
        ],
        'Anatomie' => [
            [24440, 'Surgical Anatomy', 'Joseph Maclise'],
            [30541, 'A Treatise on Anatomy, Physiology, and Hygiene', 'Calvin Cutter'],
            [75996, 'A Text-book of Veterinary Anatomy', 'Septimus Sisson'],
        ],
        'Physiologie' => [
            [18779, 'Physiology and Hygiene for Secondary Schools', 'Francis M. Walters'],
            [27600, 'Zoonomia; Or, the Laws of Organic Life, Vol. II', 'Erasmus Darwin'],
        ],
        'Santé Publique' => [
            [58591, 'Hygiene: a Manual of Personal and Public Health', 'Arthur Newsholme'],
            [53974, 'Principles of Public Health', 'Thomas Dyer Tuttle'],
            [21353, 'Civics and Health', 'William H. Allen'],
        ],
        'Nutrition' => [
            [15237, 'The Chemistry of Food and Nutrition', 'A. W. Duncan'],
            [72451, 'The Physiology of Digestion', 'Andrew Combe'],
            [12238, 'Science in the Kitchen', 'E. E. Kellogg'],
        ],
        'Microbiologie' => [
            [43227, 'The Fundamentals of Bacteriology', 'Charles Bradfield Morrey'],
            [27778, 'Outlines of Dairy Bacteriology', 'H. L. Russell'],
            [27713, 'The Elements of Bacteriological Technique', 'J. W. H. Eyre'],
        ],
        'Pharmacie' => [
            [41697, "Merck's 1899 Manual of the Materia Medica", 'Merck & Co.'],
            [62958, 'Pharmacologia', 'John Ayrton Paris'],
        ],
        'Sciences Infirmières' => [
            [17366, 'Notes on Nursing', 'Florence Nightingale'],
            [33379, 'Dietetics for Nurses', 'Fairfax T. Proudfit'],
            [70887, 'The Mothercraft Manual', 'Mary L. Read'],
        ],

        'Agronomie Générale' => [
            [32158, 'Rural Wealth and Welfare', 'Geo. T. Fairchild'],
            [73302, 'Principles and Practice of Agricultural Analysis, Vol.1 (Soils)', 'Harvey W. Wiley'],
            [75389, 'Principles and Practice of Agricultural Analysis, Vol.3', 'Harvey W. Wiley'],
        ],
        'Agroforesterie' => [
            [326, 'Steep Trails', 'John Muir'],
            [20778, 'Sylva; Or, A Discourse of Forest Trees, Vol.1', 'John Evelyn'],
            [26935, 'Conservation Reader', 'Harold W. Fairbanks'],
        ],
        'Zootechnie' => [
            [35448, 'Herd Record of the Association of Breeders of Thorough-Bred Neat Stock', 'Various'],
        ],

        'Génie Civil' => [
            [939, 'The Life of Thomas Telford, Civil Engineer', 'Samuel Smiles'],
            [63834, 'Surveying and Levelling Instruments', 'William Ford Stanley'],
            [41210, 'The Life of Isambard Kingdom Brunel', 'Isambard Brunel'],
        ],
        'Génie Électrique' => [
            [26535, 'The Standard Electrical Dictionary', 'T. O. Conor Sloane'],
            [22766, 'Electricity for Boys', 'James S. Zerbe'],
            [39272, 'The Inventions, Researches and Writings of Nikola Tesla', 'Thomas C. Martin'],
        ],
        'Génie Mécanique' => [
            [22298, 'Practical Mechanics for Boys', 'James S. Zerbe'],
            [23319, 'Mechanical Drawing Self-Taught', 'Joshua Rose'],
            [28553, 'How It Works', 'Archibald Williams'],
        ],
        'Télécommunications' => [
            [15617, 'Cyclopedia of Telephony and Telegraphy, Vol.1', 'American School of Correspondence'],
            [66702, 'Wireless Telegraphy and Telephony Simply Explained', 'Alfred P. Morgan'],
            [41160, 'The Romance of Modern Invention', 'Archibald Williams'],
        ],

        'Microéconomie' => [
            [30107, 'Principles of Political Economy', 'John Stuart Mill'],
            [33310, 'On the Principles of Political Economy and Taxation', 'David Ricardo'],
            [41936, 'Principles of Political Economy', 'Arthur Latham Perry'],
        ],
        'Macroéconomie' => [
            [4359, 'Lombard Street', 'Walter Bagehot'],
            [35120, 'Readings in Money and Banking', 'Chester A. Phillips'],
            [57819, "Other People's Money", 'Louis D. Brandeis'],
        ],
        'Management' => [
            [6435, 'The Principles of Scientific Management', 'Frederick W. Taylor'],
        ],
        'Marketing' => [
            [54149, 'A History of Advertising from the Earliest Times', 'Henry Sampson'],
            [71042, 'Poster Advertising', 'George H. E. Hawkins'],
            [54476, 'The Art & Practice of Typography', 'Edmund G. Gress'],
        ],

        'Droit Constitutionnel' => [
            [1404, 'The Federalist Papers', 'Hamilton, Madison & Jay'],
            [5, 'The United States Constitution', 'United States'],
            [2, 'The United States Bill of Rights', 'United States'],
        ],
        'Droit International' => [
            [41046, 'International Law: A Treatise, Vol.1', 'L. Oppenheim'],
            [41047, 'International Law: A Treatise, Vol.2', 'L. Oppenheim'],
            [46564, 'The Rights of War and Peace', 'Hugo Grotius'],
        ],
        'Droit Pénal' => [
            [2449, 'The Common Law', 'Oliver Wendell Holmes'],
            [1320, 'Criminal Psychology', 'Hans Gross'],
            [30802, 'Commentaries on the Laws of England, Book 1', 'William Blackstone'],
        ],

        'Journalisme' => [
            [6456, 'Public Opinion', 'Walter Lippmann'],
            [63754, "All in the Day's Work", 'Ida M. Tarbell'],
            [37134, 'The Elements of Style', 'William Strunk'],
        ],
        'Arts Plastiques' => [
            [25326, 'Lives of the Most Eminent Painters, Vol.1', 'Giorgio Vasari'],
            [41617, 'A Complete Guide to Heraldry', 'Arthur C. Fox-Davies'],
            [25842, 'Royal Palaces and Parks of France', 'M. F. Mansfield'],
        ],
        'Musique' => [
            [16351, 'Critical and Historical Essays', 'Edward MacDowell'],
            [28711, 'Operas Every Child Should Know', 'Mary S. H. Bacon'],
            [23800, 'Contemporary American Composers', 'Rupert Hughes'],
        ],
        'Théâtre' => [
            [13589, 'The Theory of the Theatre', 'Clayton M. Hamilton'],
            [66536, 'Shakespeare at the Globe, 1599-1609', 'Bernard Beckerman'],
            [19028, 'Irish Plays and Playwrights', 'Cornelius Weygandt'],
        ],
        'Photographie' => [
            [42982, 'Photography in the Studio and in the Field', 'Edward M. Estabrooke'],
            [63710, 'A Manual of Photographic Chemistry', 'T. Frederick Hardwich'],
            [77383, 'Photography Self Taught', 'Lloyd I. Snodgrass'],
        ],
        'Cinéma et Audiovisuel' => [
            [66294, 'The Seven Lively Arts', 'Gilbert Seldes'],
        ],

        'Anthropologie Sociale' => [
            [55822, 'Argonauts of the Western Pacific', 'Bronisław Malinowski'],
            [20583, 'The Tribes and Castes of the Central Provinces of India, Vol.1', 'R. V. Russell'],
            [45634, 'Myths of the Cherokee', 'James Mooney'],
        ],
        'Psychologie' => [
            [57628, 'The Principles of Psychology, Vol.1', 'William James'],
            [57634, 'The Principles of Psychology, Vol.2', 'William James'],
        ],
        "Sciences de l'Éducation" => [
            [39863, 'The Montessori Method', 'Maria Montessori'],
            [62376, 'The History of Pedagogy', 'Gabriel Compayré'],
            [59183, 'Psychology and Pedagogy of Anger', 'Roy F. Richardson'],
        ],
        'Linguistique' => [
            [32856, 'Lectures on the Science of Language', 'F. Max Müller'],
            [54618, 'Æsthetic as Science of Expression and General Linguistic', 'Benedetto Croce'],
            [58205, 'The Frontiers of Language and Nationality in Europe', 'Leon Dominian'],
        ],
        'Histoire Africaine' => [
            [67513, 'The Native Races of East Africa', 'Wilfrid D. Hambly'],
            [23, 'Narrative of the Life of Frederick Douglass', 'Frederick Douglass'],
            [2376, 'Up from Slavery', 'Booker T. Washington'],
        ],
        'Sociologie' => [
            [408, 'The Souls of Black Folk', 'W. E. B. Du Bois'],
            [815, 'Democracy in America, Vol.1', 'Alexis de Tocqueville'],
            [2162, 'Anarchism and Other Essays', 'Emma Goldman'],
        ],

        'Leadership Stratégique' => [
            [44024, 'The Book of War (Art of War)', 'Sun Tzu'],
            [16170, 'Elements of Military Art and Science', 'H. W. Halleck'],
            [72412, 'Mahan on Naval Warfare', 'A. T. Mahan'],
        ],
        'Éthique et Leadership' => [
            [23639, "Plutarch's Morals", 'Plutarch'],
            [52106, 'The Origin and Development of the Moral Ideas', 'Edward Westermarck'],
            [9105, 'Reflections; or Sentences and Moral Maxims', 'La Rochefoucauld'],
        ],
        'Négociation' => [
            [68987, 'On the Manner of Negotiating with Princes', 'Monsieur de Callières'],
        ],
    ];

    public function run(): void
    {
        $depositor = User::where('role', 'admin')->first();
        if (! $depositor) {
            $this->command?->error('Aucun compte admin trouvé — exécutez AdminSeeder avant GutenbergCatalogSeeder.');

            return;
        }

        $subdomains = Subdomain::pluck('id', 'name');
        $total = array_sum(array_map('count', $this->books));
        $done = 0;

        foreach ($this->books as $subdomainName => $entries) {
            $subdomainId = $subdomains[$subdomainName] ?? null;
            if (! $subdomainId) {
                continue;
            }

            foreach ($entries as [$gutenbergId, $title, $author]) {
                $done++;

                $facsimileUrl = $this->facsimiles[$title] ?? null;
                $sourceUrl = $facsimileUrl ?? "https://www.gutenberg.org/cache/epub/{$gutenbergId}/pg{$gutenbergId}.txt";
                $summary = $facsimileUrl
                    ? "Fac-similé authentique de l'édition originale (Internet Archive, domaine public) : {$title}, {$author}."
                    : "Ouvrage authentique du domaine public (Project Gutenberg #{$gutenbergId}) : {$title}, {$author}.";

                $existing = Document::where('title', $title)->where('author', $author)->first();

                if ($existing) {
                    // Une source peut changer après coup : un fac-similé
                    // identifié plus tard, ou (cas vécu : #22788 "The
                    // Federalist Papers" pointait vers un livre audio
                    // Gutenberg sans aucun texte, échec systématique) un
                    // identifiant corrigé. On ne retouche jamais un document
                    // déjà mis en cache (file_path rempli).
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

                $label = $facsimileUrl ? 'fac-similé' : 'texte recomposé';
                $this->command?->info("[{$done}/{$total}] {$subdomainName} — {$title} ({$label})");
            }
        }
    }

    /**
     * Même logique que DocumentSeeder::fetchCoverPath (Open Library),
     * copiée ici pour garder ce seeder autonome.
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
