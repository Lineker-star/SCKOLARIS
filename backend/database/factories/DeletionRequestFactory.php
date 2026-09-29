<?php

namespace Database\Factories;

use App\Enums\DeletionRequestStatus;
use App\Models\DeletionRequest;
use App\Models\Document;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DeletionRequest>
 */
class DeletionRequestFactory extends Factory
{
    protected $model = DeletionRequest::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'document_id' => Document::factory(),
            'justification' => fake()->sentence(),
            'status' => DeletionRequestStatus::PENDING,
        ];
    }
}
