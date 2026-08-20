<?php

namespace Database\Factories;

use App\Enums\SalesRegionKind;
use App\Models\SalesRegion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SalesRegion>
 */
class SalesRegionFactory extends Factory
{
    /**
     * Define the model's default state: a plain, active, top-level country
     * with no parent and no configured rate.
     *
     * `slug` uses `fake()->unique()->...` because it is the table's only
     * unique column — the classic factory collision otherwise.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(2),
            'code' => strtoupper(fake()->unique()->lexify('??')),
            'name' => fake()->country(),
            'description' => null,
            'rate' => null,
            'kind' => SalesRegionKind::Country,
            'parent_id' => null,
            'is_default' => false,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }

    /**
     * Indicate that the entry is a fiscal territory belonging to the given
     * parent Sales Region.
     */
    public function fiscalTerritoryOf(SalesRegion $parent): static
    {
        return $this->state(fn (array $attributes) => [
            'kind' => SalesRegionKind::FiscalTerritory,
            'parent_id' => $parent->id,
        ]);
    }

    /**
     * Flag the entry as the catalog default.
     *
     * Deliberately NOT the base `definition()` state, and deliberately does
     * NOT guard against creating a second default: the `sales_regions` table
     * carries no database constraint enforcing at-most-one default (see the
     * story's "Indexes" section), so nothing here should pretend otherwise.
     * Story 0017's negative tests need to be able to arrange exactly that —
     * two competing default rows — through this state.
     */
    public function isDefault(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_default' => true,
        ]);
    }

    /**
     * Indicate that the entry is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Set an explicit tax rate on the entry.
     */
    public function withRate(string $rate): static
    {
        return $this->state(fn (array $attributes) => [
            'rate' => $rate,
        ]);
    }
}
