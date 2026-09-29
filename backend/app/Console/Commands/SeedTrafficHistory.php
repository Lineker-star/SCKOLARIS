<?php

namespace App\Console\Commands;

use App\Models\Document;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Complète load-test.js : celui-ci simule du trafic RÉEL contre l'API (utile
 * pour mesurer des temps de réponse), mais tout ce qu'il génère est
 * forcément daté "maintenant" — impossible d'obtenir par ce biais une
 * courbe étalée sur 90 jours pour la page Statistiques. Cette commande
 * remplit directement les tables (téléchargements, lectures, activité,
 * inscriptions) avec un historique plausible, uniquement pour les comptes
 * LOADTEST- (voir LoadTestUserSeeder) — jamais de vrais utilisateurs/documents
 * touchés en écriture, seuls leurs id sont lus pour rattacher les lignes.
 *
 * Usage : php artisan traffic:seed-history [--days=90] [--reset]
 */
class SeedTrafficHistory extends Command
{
    protected $signature = 'traffic:seed-history {--days=90} {--reset : Supprime l\'historique LOADTEST- déjà généré avant de le recréer}';

    protected $description = "Génère un historique de trafic plausible (téléchargements, lectures, activité, inscriptions) sur les comptes LOADTEST-, pour que la page Statistiques ait un vrai rendu en local/démo.";

    public function handle(): int
    {
        $days = (int) $this->option('days');

        $userIds = User::where('registration_number', 'like', 'LOADTEST-%')->orderBy('id')->pluck('id')->all();
        if (count($userIds) === 0) {
            $this->error("Aucun compte LOADTEST- trouvé — lance d'abord : php artisan db:seed --class=LoadTestUserSeeder");

            return self::FAILURE;
        }

        $documentIds = Document::pluck('id')->all();
        if (count($documentIds) === 0) {
            $this->error('Aucun document en base — lance les seeders de catalogue avant celui-ci.');

            return self::FAILURE;
        }

        if ($this->option('reset')) {
            $this->resetPreviousHistory($userIds);
        }

        // On ne mobilise qu'une partie du bassin LOADTEST- (5000 comptes) —
        // largement assez pour une courbe crédible, sans générer des
        // centaines de milliers de lignes inutiles.
        $participants = array_slice($userIds, 0, min(2000, count($userIds)));

        $this->seedRegistrations($participants, $days);
        $this->seedDailyVolume('downloads', 'downloaded_at', $participants, $documentIds, $days, base: 4, weekdayBoost: 6);
        $this->seedDailyVolume('reads', 'read_at', $participants, $documentIds, $days, base: 6, weekdayBoost: 9);
        $this->seedActivity($participants, $days);

        $this->info("Historique généré sur {$days} jours pour ".count($participants).' comptes LOADTEST-.');
        $this->info('Va maintenant voir la page Statistiques du dashboard admin.');

        return self::SUCCESS;
    }

    private function resetPreviousHistory(array $userIds): void
    {
        foreach (array_chunk($userIds, 500) as $chunk) {
            DB::table('downloads')->whereIn('user_id', $chunk)->delete();
            DB::table('reads')->whereIn('user_id', $chunk)->delete();
            DB::table('user_activity_daily')->whereIn('user_id', $chunk)->delete();
        }
        $this->info('Ancien historique LOADTEST- supprimé.');
    }

    /**
     * Un peu de forme réaliste plutôt qu'un bruit purement uniforme : plus
     * calme le week-end, tendance globale légèrement croissante sur la
     * période (une bibliothèque qui gagne en fréquentation), et un peu de
     * hasard jour à jour.
     */
    private function dailyVolume(int $dayIndex, int $totalDays, int $base, int $weekdayBoost, \Carbon\CarbonInterface $date): int
    {
        $isWeekend = $date->isWeekend();
        $growth = $dayIndex / max(1, $totalDays); // 0 → 1 du premier au dernier jour
        $trendBonus = (int) round($growth * $base * 1.5);
        $weekdayBonus = $isWeekend ? 0 : $weekdayBoost;
        $noise = random_int(-2, 4);

        return max(0, $base + $weekdayBonus + $trendBonus + $noise);
    }

    private function seedDailyVolume(string $table, string $dateColumn, array $userIds, array $documentIds, int $days, int $base, int $weekdayBoost): void
    {
        $bar = $this->output->createProgressBar($days + 1);
        $bar->setMessage("Remplissage de {$table}...");

        for ($dayIndex = 0; $dayIndex <= $days; $dayIndex++) {
            $date = now()->subDays($days - $dayIndex)->startOfDay();
            $count = $this->dailyVolume($dayIndex, $days, $base, $weekdayBoost, $date);

            $rows = [];
            for ($i = 0; $i < $count; $i++) {
                $rows[] = [
                    'user_id' => $userIds[array_rand($userIds)],
                    'document_id' => $documentIds[array_rand($documentIds)],
                    $dateColumn => $date->copy()->addSeconds(random_int(0, 86_399)),
                ];
            }

            foreach (array_chunk($rows, 500) as $chunk) {
                DB::table($table)->insert($chunk);
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
    }

    private function seedActivity(array $userIds, int $days): void
    {
        $bar = $this->output->createProgressBar($days + 1);
        $bar->setMessage('Remplissage de user_activity_daily...');

        for ($dayIndex = 0; $dayIndex <= $days; $dayIndex++) {
            $date = now()->subDays($days - $dayIndex)->startOfDay();
            $count = $this->dailyVolume($dayIndex, $days, base: 10, weekdayBoost: 18, date: $date);
            $count = min($count, count($userIds));

            $activeUsers = (array) array_rand(array_flip($userIds), max(1, $count));
            $rows = array_map(fn ($userId) => [
                'user_id' => $userId,
                'activity_date' => $date->toDateString(),
            ], $activeUsers);

            foreach (array_chunk($rows, 500) as $chunk) {
                DB::table('user_activity_daily')->insertOrIgnore($chunk);
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
    }

    /**
     * Réutilise created_at des comptes LOADTEST- eux-mêmes (déjà isolés, sans
     * rapport avec de vrais utilisateurs) pour obtenir une courbe
     * d'inscriptions étalée plutôt qu'un unique pic le jour du seed initial.
     */
    private function seedRegistrations(array $userIds, int $days): void
    {
        $chunks = array_chunk($userIds, max(1, (int) ceil(count($userIds) / ($days + 1))));

        $bar = $this->output->createProgressBar(count($chunks));
        $bar->setMessage('Étalement des dates d\'inscription...');

        foreach ($chunks as $dayIndex => $chunk) {
            $date = now()->subDays($days - min($dayIndex, $days))->startOfDay();
            DB::table('users')->whereIn('id', $chunk)->update(['created_at' => $date]);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
    }
}
