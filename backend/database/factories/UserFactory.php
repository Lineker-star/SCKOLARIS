<?php

namespace Database\Factories;

use App\Enums\AccountStatus;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'last_name' => fake()->lastName(),
            'first_name' => fake()->firstName(),
            // Format réglementaire IU-ZTF (2 chiffres année + 3 lettres
            // filière + 3 chiffres séquentiels), ex: 26SWE001 — voir
            // RegisterRequest. Pas de fake()->unique() ici : l'espace de
            // combinaisons (~1,7 milliard) rend une collision négligeable
            // pour la taille de n'importe quelle suite de tests réaliste,
            // et unique() sur un seul segment de 3 chiffres s'épuiserait
            // après 1000 utilisateurs créés dans un même run.
            'registration_number' => fake()->numerify('##').strtoupper(fake()->lexify('???')).fake()->numerify('###'),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => Role::STUDENT,
            'program' => fake()->randomElement(['Informatique', 'Droit', 'Gestion']),
            'account_status' => AccountStatus::PENDING,
            'is_active' => true,
        ];
    }

    // "validated" par défaut : un enseignant/admin de test est presque
    // toujours censé pouvoir agir immédiatement (comme en réalité — voir
    // AdminSeeder) ; un enseignant encore "pending" (auto-inscrit, voir
    // RegisterRequest) est le cas particulier à composer explicitement avec
    // ->create(['account_status' => AccountStatus::PENDING]) plutôt que
    // l'inverse.
    public function teacher(): static
    {
        return $this->state(fn (array $attributes) => ['role' => Role::TEACHER, 'account_status' => AccountStatus::VALIDATED]);
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => ['role' => Role::ADMIN, 'account_status' => AccountStatus::VALIDATED]);
    }

    public function validated(): static
    {
        return $this->state(fn (array $attributes) => ['account_status' => AccountStatus::VALIDATED]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => ['account_status' => AccountStatus::REJECTED]);
    }

    public function deactivated(): static
    {
        return $this->state(fn (array $attributes) => ['is_active' => false]);
    }
}
