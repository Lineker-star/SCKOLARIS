<?php

namespace Database\Seeders;

use App\Enums\AccountStatus;
use App\Enums\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Génère 5000 comptes fictifs pour un test de charge (liste Utilisateurs,
 * statistiques admin, pagination...). Marqués clairement pour être
 * supprimables sans toucher aux vrais comptes :
 *   - registration_number commence par "LOADTEST-"
 *   - email se termine par "@loadtest.invalid" (domaine réservé par la RFC
 *     2606, garanti de ne jamais correspondre à un vrai domaine)
 *
 * Nettoyage après le test :
 *   php artisan tinker --execute="App\Models\User::where('registration_number', 'like', 'LOADTEST-%')->delete();"
 *
 * Usage : php artisan db:seed --class=LoadTestUserSeeder --force
 *
 * Insertion en masse (DB::table()->insert(), pas Eloquent::create()) par
 * lots de 500 : créer 5000 lignes une par une avec Eloquent (hooks,
 * casts, hashage bcrypt à chaque fois...) prendrait plusieurs minutes ;
 * en masse avec un mot de passe haché une seule fois, quelques secondes.
 */
class LoadTestUserSeeder extends Seeder
{
    private const TOTAL = 5000;

    private const CHUNK_SIZE = 500;

    private const EMAIL_DOMAIN = 'loadtest.invalid';

    private array $programs = [
        'Informatique', 'Droit', 'Économie', 'Médecine', 'Histoire',
        'Gestion', 'Physique', 'Pharmacie', 'Agronomie', 'Communication',
    ];

    private array $firstNames = [
        'Jean', 'Marie', 'Paul', 'Awa', 'Ahmed', 'Grace', 'Samuel', 'Fatima',
        'Eric', 'Nadine', 'David', 'Chantal', 'Pierre', 'Aïcha', 'Michel',
        'Brenda', 'Joseph', 'Sandrine', 'François', 'Léa',
    ];

    private array $lastNames = [
        'Fotso', 'Mballa', 'Nkeng', 'Talla', 'Ateba', 'Njoya', 'Kamdem',
        'Biya', 'Essomba', 'Tchoumi', 'Ngoune', 'Abena', 'Belinga', 'Owona',
        'Simo', 'Feudjio', 'Ngo', 'Kenfack', 'Zambo', 'Fouda',
    ];

    public function run(): void
    {
        $passwordHash = Hash::make('password123');
        $now = now();

        $rows = [];
        for ($i = 1; $i <= self::TOTAL; $i++) {
            $firstName = $this->firstNames[array_rand($this->firstNames)];
            $lastName = $this->lastNames[array_rand($this->lastNames)];
            $role = $i % 10 === 0 ? Role::TEACHER : Role::STUDENT; // ~10% enseignants
            $statusRoll = $i % 10;
            $status = match (true) {
                $statusRoll < 7 => AccountStatus::VALIDATED, // 70%
                $statusRoll < 9 => AccountStatus::PENDING,   // 20%
                default => AccountStatus::REJECTED,          // 10%
            };
            $number = str_pad((string) $i, 5, '0', STR_PAD_LEFT);

            $rows[] = [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'registration_number' => "LOADTEST-{$number}",
                'email' => "loadtest.{$number}@".self::EMAIL_DOMAIN,
                'secondary_email' => null,
                'password' => $passwordHash,
                'role' => $role->value,
                'program' => $this->programs[array_rand($this->programs)],
                'account_status' => $status->value,
                'is_active' => true,
                'is_online' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if (count($rows) === self::CHUNK_SIZE) {
                DB::table('users')->insert($rows);
                $this->command?->info("[{$i}/".self::TOTAL.'] comptes créés');
                $rows = [];
            }
        }

        if ($rows !== []) {
            DB::table('users')->insert($rows);
        }

        $this->command?->info('Terminé : '.self::TOTAL.' comptes de test créés (préfixe LOADTEST-).');
    }
}
