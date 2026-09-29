<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\Subdomain;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
{
    protected $model = Document::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'author' => fake()->name(),
            'subdomain_id' => Subdomain::factory(),
            'program' => fake()->randomElement(['Informatique', 'Droit', 'Gestion']),
            'summary' => fake()->paragraph(),
            'file_path' => 'documents/'.fake()->uuid().'.pdf',
            'uploaded_by_id' => User::factory()->teacher(),
        ];
    }
}
