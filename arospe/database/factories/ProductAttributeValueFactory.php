<?php

namespace Database\Factories;

use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductAttributeValue>
 */
class ProductAttributeValueFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // A bare ->create() must work standalone (no explicit ->for()), so the
            // FK carries its own factory default rather than requiring every
            // caller to supply one.
            'product_attribute_type_id' => ProductAttributeType::factory(),
            // fake()->unique()->word() throws OverflowException once enough rows
            // exist across a test run — see ProductAttributeTypeFactory's identical
            // note. bothify() sidesteps the fixed word pool entirely and reads
            // naturally as a taxonomy value (e.g. "38", "Red").
            'value' => fake()->unique()->bothify('Value-####'),
            'position' => 0,
        ];
    }
}
