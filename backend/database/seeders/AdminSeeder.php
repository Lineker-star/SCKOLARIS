<?php

namespace Database\Seeders;

use App\Enums\AccountStatus;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Seed the first administrator account.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['registration_number' => 'ADMIN-0001'],
            [
                'first_name' => 'Admin',
                'last_name' => 'IU-ZTF',
                'email' => 'admin@iu-ztf.cm',
                'password' => Hash::make('password123'),
                'role' => Role::ADMIN,
                'account_status' => AccountStatus::VALIDATED,
            ]
        );
    }
}
