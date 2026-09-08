<?php

namespace Database\Factories;

use App\Models\GeographyEntry;
use App\Models\ShippingZone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShippingZone>
 */
class ShippingZoneFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // fake()->unique() is a per-instance guard, NOT a database one -- any
            // test needing a guaranteed-distinct name passes it as a literal
            // (0023 R-5 / this story's R-11).
            'name' => fake()->unique()->words(2, true),
        ];
    }

    /**
     * Attach $count freshly-created, country-level geography catalog entries
     * to the zone once it exists.
     *
     * Uses App\Models\GeographyEntry's own factory (0032) rather than any
     * seeded catalog row -- this story's tests never seed the ~8,300-row
     * real catalog (see the story's own "never seed the geography catalog"
     * test-data strategy).
     */
    public function withGeography(int $count = 1): static
    {
        return $this->afterCreating(function (ShippingZone $shippingZone) use ($count): void {
            $shippingZone->geographyEntries()->attach(
                GeographyEntry::factory()->count($count)->create()->pluck('id')->all()
            );
        });
    }
}
