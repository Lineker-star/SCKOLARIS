<?php

namespace Database\Factories;

use App\Models\Domain;
use App\Models\Subdomain;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subdomain>
 */
class SubdomainFactory extends Factory
{
    protected $model = Subdomain::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'domain_id' => Domain::factory(),
        ];
    }
}
