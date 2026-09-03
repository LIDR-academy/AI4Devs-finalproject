<?php

namespace Database\Factories;

use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\Sequence;

/**
 * @extends Factory<ProductAttributeType>
 */
class ProductAttributeTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // fake()->unique()->word() draws from Faker's ~1000-word pool and
            // throws OverflowException once enough rows have been created across a
            // test run — words(2, true) (two words joined with a space) gives a
            // combinatorially much larger pool and matches ProductCategoryFactory's
            // identical workaround for the same trap.
            'name' => fake()->unique()->words(2, true),
            'position' => 0,
        ];
    }

    /**
     * Attach `$count` values to the type, e.g. Size -> 38, 39, 40.
     *
     * Mirrors UserFactory::withTwoFactor()'s `with*` naming for an attached-state
     * factory helper. Values are assigned strictly increasing positions starting
     * at 0, matching the "assign on create as the next position in the sibling
     * set" rule (D5) — a bare afterCreating() with no explicit position would
     * leave every seeded value tied at the column's own default(0).
     */
    public function withValues(int $count = 3): static
    {
        return $this->afterCreating(function (ProductAttributeType $productAttributeType) use ($count): void {
            ProductAttributeValue::factory()
                ->count($count)
                ->sequence(fn (Sequence $sequence) => ['position' => $sequence->index])
                ->for($productAttributeType, 'type')
                ->create();
        });
    }
}
