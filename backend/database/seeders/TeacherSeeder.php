<?php

namespace Database\Seeders;

use App\Enums\AccountStatus;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TeacherSeeder extends Seeder
{
    /**
     * Seed a handful of validated teacher accounts (document depositors).
     */
    public function run(): void
    {
        $teachers = [
            ['first_name' => 'Jean', 'last_name' => 'Dupont', 'program' => 'Informatique'],
            ['first_name' => 'Marie', 'last_name' => 'Curie', 'program' => 'Physique'],
            ['first_name' => 'Ahmed', 'last_name' => 'Benali', 'program' => 'Histoire'],
        ];

        foreach ($teachers as $index => $teacher) {
            User::firstOrCreate(
                ['registration_number' => sprintf('IUZTF-T%03d', $index + 1)],
                [
                    'first_name' => $teacher['first_name'],
                    'last_name' => $teacher['last_name'],
                    'email' => sprintf(
                        '%s.%s@iu-ztf.cm',
                        str($teacher['first_name'])->lower(),
                        str($teacher['last_name'])->lower(),
                    ),
                    'password' => Hash::make('password123'),
                    'role' => Role::TEACHER,
                    'program' => $teacher['program'],
                    'account_status' => AccountStatus::VALIDATED,
                ]
            );
        }
    }
}
