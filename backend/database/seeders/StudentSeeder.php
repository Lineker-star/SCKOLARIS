<?php

namespace Database\Seeders;

use App\Enums\AccountStatus;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    /**
     * Seed student accounts with mixed statuses, so admin screens
     * (Comptes en attente, Utilisateurs) have realistic data to show.
     */
    public function run(): void
    {
        // Code filière sur 3 lettres (format réglementaire IU-ZTF, voir
        // RegisterRequest) — illustratif pour ces comptes de démonstration,
        // faute de liste officielle complète des codes par filière.
        $students = [
            ['first_name' => 'Awa', 'last_name' => 'Fotso', 'program' => 'Informatique', 'code' => 'SWE', 'status' => AccountStatus::VALIDATED],
            ['first_name' => 'Paul', 'last_name' => 'Mballa', 'program' => 'Droit', 'code' => 'LAW', 'status' => AccountStatus::VALIDATED],
            ['first_name' => 'Fatima', 'last_name' => 'Nkeng', 'program' => 'Économie', 'code' => 'ECO', 'status' => AccountStatus::PENDING],
            ['first_name' => 'Eric', 'last_name' => 'Talla', 'program' => 'Informatique', 'code' => 'SWE', 'status' => AccountStatus::PENDING],
            ['first_name' => 'Grace', 'last_name' => 'Ateba', 'program' => 'Médecine', 'code' => 'MED', 'status' => AccountStatus::PENDING],
            ['first_name' => 'Samuel', 'last_name' => 'Njoya', 'program' => 'Histoire', 'code' => 'HIS', 'status' => AccountStatus::REJECTED],
        ];

        foreach ($students as $index => $student) {
            User::firstOrCreate(
                ['registration_number' => sprintf('26%s%03d', $student['code'], $index + 1)],
                [
                    'first_name' => $student['first_name'],
                    'last_name' => $student['last_name'],
                    'email' => sprintf(
                        '%s.%s@etu.iu-ztf.cm',
                        str($student['first_name'])->lower(),
                        str($student['last_name'])->lower(),
                    ),
                    'password' => Hash::make('password123'),
                    'role' => Role::STUDENT,
                    'program' => $student['program'],
                    'account_status' => $student['status'],
                ]
            );
        }
    }
}
