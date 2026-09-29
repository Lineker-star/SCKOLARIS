<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Domain;
use App\Models\Download;
use App\Models\Read;
use App\Models\User;
use App\Models\UserActivityDaily;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Str;

/**
 * Statistiques du tableau de bord admin, calculées en R : Laravel extrait
 * les données brutes (Eloquent, aucune donnée sensible), les écrit en CSV
 * (pas de dépendance à un paquet CRAN JSON), lance `Rscript` pour le calcul
 * (moyenne mobile, régression linéaire, pourcentages), puis relit le
 * résultat. Voir backend/r-scripts/stats.R et backend/nixpacks.toml (R doit
 * être présent sur le serveur — absent par défaut, ajouté explicitement).
 */
class StatsController extends Controller
{
    private const DAYS = 90;

    public function index(): JsonResponse
    {
        $workDir = storage_path('app/stats-tmp/'.Str::uuid());
        File::ensureDirectoryExists($workDir.'/in');
        File::ensureDirectoryExists($workDir.'/out');

        try {
            $this->writeSeries($workDir.'/in/downloads_daily.csv', Download::query(), 'downloaded_at');
            $this->writeSeries($workDir.'/in/reads_daily.csv', Read::query(), 'read_at');
            $this->writeSeries($workDir.'/in/registrations_daily.csv', User::query(), 'created_at');
            $this->writeSeries($workDir.'/in/activity_daily.csv', UserActivityDaily::query(), 'activity_date');

            $this->writeCategorical($workDir.'/in/top_depositors.csv', $this->topDepositors());
            $this->writeCategorical($workDir.'/in/accounts_by_status.csv', $this->accountsByStatus());
            $this->writeCategorical($workDir.'/in/online_now.csv', $this->onlineNow());

            $result = Process::timeout(60)->run([config('services.r.script_bin'), base_path('r-scripts/stats.R'), $workDir.'/in', $workDir.'/out']);

            if ($result->failed()) {
                // La sortie d'erreur vient du système d'exploitation (ex:
                // "'Rscript' n'est pas reconnu..." sur Windows en local) ou
                // de R lui-même — dans les deux cas l'encodage n'est pas
                // garanti UTF-8, et json_encode() fait planter toute la
                // réponse (au lieu du message clair voulu ici) si on
                // l'interpole telle quelle. //IGNORE supprime les octets
                // invalides plutôt que de faire échouer la conversion.
                $errorOutput = iconv('UTF-8', 'UTF-8//IGNORE', $result->errorOutput()) ?: '(pas de détail disponible)';
                abort(500, "Le calcul statistique (R) a échoué — vérifiez que R est installé (voir backend/nixpacks.toml) : {$errorOutput}");
            }

            return response()->json([
                'downloads_daily' => $this->readSeries($workDir.'/out/downloads_daily_out.csv'),
                'reads_daily' => $this->readSeries($workDir.'/out/reads_daily_out.csv'),
                'registrations_daily' => $this->readSeries($workDir.'/out/registrations_daily_out.csv'),
                'activity_daily' => $this->readSeries($workDir.'/out/activity_daily_out.csv'),
                // Simple comptage structurel (pas une tendance à analyser) —
                // pas besoin de passer par R, calculé et groupé directement.
                'documents_by_domain' => $this->documentsByDomain(),
                'top_depositors' => $this->readCategorical($workDir.'/out/top_depositors_out.csv'),
                'accounts_by_status' => $this->readCategorical($workDir.'/out/accounts_by_status_out.csv'),
                'online_now' => $this->readCategorical($workDir.'/out/online_now_out.csv'),
                'summary' => $this->readSummary($workDir.'/out/summary_out.csv'),
            ]);
        } finally {
            File::deleteDirectory($workDir);
        }
    }

    /**
     * Comptage jour par jour sur les 90 derniers jours, zéro inclus pour les
     * jours sans activité — sans ce remplissage, R ne peut pas distinguer
     * "aucune donnée ce jour-là" d'un simple trou dans le CSV.
     */
    private function writeSeries(string $path, Builder $query, string $dateColumn): void
    {
        $since = now()->subDays(self::DAYS)->startOfDay();

        $counts = $query
            ->where($dateColumn, '>=', $since)
            ->selectRaw("DATE({$dateColumn}) as d, COUNT(*) as c")
            ->groupBy('d')
            ->pluck('c', 'd');

        $rows = [['date', 'count']];
        for ($day = $since->copy(); $day->lte(now()); $day->addDay()) {
            $key = $day->toDateString();
            $rows[] = [$key, (int) ($counts[$key] ?? 0)];
        }

        $this->writeCsv($path, $rows);
    }

    private function writeCategorical(string $path, array $rows): void
    {
        $this->writeCsv($path, [['label', 'count'], ...$rows]);
    }

    private function writeCsv(string $path, array $rows): void
    {
        $handle = fopen($path, 'w');
        foreach ($rows as $row) {
            fputcsv($handle, $row);
        }
        fclose($handle);
    }

    private function readSeries(string $path): array
    {
        if (! file_exists($path)) return [];

        return array_map(fn (array $row) => [
            'date' => $row['date'],
            'count' => (int) $row['count'],
            'trend' => (float) $row['trend'],
        ], $this->readCsv($path));
    }

    private function readCategorical(string $path): array
    {
        if (! file_exists($path)) return [];

        // Comme readSeries() : le CSV ne connaît que des chaînes de
        // caractères. Sans cette conversion, `count` arrivait en JSON sous
        // forme de texte ("5001" au lieu de 5001) — recharts a besoin d'un
        // nombre pour calculer les angles d'un camembert, une chaîne fait
        // simplement échouer ce calcul en silence (portion invisible).
        return array_map(fn (array $row) => [
            ...$row,
            'count' => (int) $row['count'],
            'percentage' => (float) $row['percentage'],
        ], $this->readCsv($path));
    }

    /**
     * summary_out.csv a des colonnes différentes (series,total,average,
     * slope_per_day) de celles de readCategorical() (label,count,
     * percentage) — les mélanger produisait des clés manquantes.
     */
    private function readSummary(string $path): array
    {
        if (! file_exists($path)) return [];

        return array_map(fn (array $row) => [
            'series' => $row['series'],
            'total' => (int) $row['total'],
            'average' => (float) $row['average'],
            'slope_per_day' => is_numeric($row['slope_per_day'] ?? null) ? (float) $row['slope_per_day'] : null,
        ], $this->readCsv($path));
    }

    private function readCsv(string $path): array
    {
        $handle = fopen($path, 'r');
        $header = fgetcsv($handle);
        $rows = [];
        while (($line = fgetcsv($handle)) !== false) {
            $rows[] = array_combine($header, $line);
        }
        fclose($handle);

        return $rows;
    }

    /**
     * Tableau, pas un graphique (voir Statistics.jsx) — un simple comptage
     * n'a rien à gagner d'un passage par R, et une vraie table permet de lire
     * le nombre exact de documents par sous-domaine sans deviner sur un axe.
     * Tous les sous-domaines apparaissent, y compris ceux à 0 document
     * (utile pour repérer les manques du catalogue).
     */
    private function documentsByDomain(): array
    {
        return Domain::with(['subdomains' => fn ($q) => $q->withCount('documents')->orderBy('name')])
            ->orderBy('name')
            ->get()
            ->map(fn ($domain) => [
                'domain' => $domain->name,
                'total' => $domain->subdomains->sum('documents_count'),
                'subdomains' => $domain->subdomains->map(fn ($subdomain) => [
                    'name' => $subdomain->name,
                    'count' => $subdomain->documents_count,
                ])->all(),
            ])
            ->all();
    }

    private function topDepositors(): array
    {
        return Document::query()
            ->join('users', 'documents.uploaded_by_id', '=', 'users.id')
            ->selectRaw("users.first_name || ' ' || users.last_name as label, count(*) as count")
            ->groupBy('users.id', 'users.first_name', 'users.last_name')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [$row->label, $row->count])
            ->all();
    }

    private function accountsByStatus(): array
    {
        return User::query()
            ->selectRaw('account_status as label, count(*) as count')
            ->groupBy('account_status')
            ->get()
            ->map(fn ($row) => [$row->label, $row->count])
            ->all();
    }

    private function onlineNow(): array
    {
        $online = User::where('is_online', true)->count();
        $offline = User::where('is_online', false)->count();

        return [['En ligne', $online], ['Hors ligne', $offline]];
    }
}
