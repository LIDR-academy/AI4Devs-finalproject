<?php

namespace Database\Factories;

use App\Actions\NormalizeForSearch;
use App\Enums\GeographyLevel;
use App\Models\GeographyEntry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GeographyEntry>
 */
class GeographyEntryFactory extends Factory
{
    /**
     * Define the model's default state: a plain, top-level country entry.
     *
     * Not used to load the real catalog (that comes from the bundled CSV/JSON
     * fixtures via `GeographyCatalogSeeder`) -- this exists so a later story
     * (0033/0034) can arrange a handful of catalog entries in a test without
     * seeding the whole ~8,300-row real catalog.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->country();

        return [
            'level' => GeographyLevel::Country,
            'parent_id' => null,
            'name' => $name,
            'normalized_name' => app(NormalizeForSearch::class)($name),
            'ine_code' => null,
            'iso_alpha2' => strtoupper(fake()->unique()->lexify('??')),
            'province_name' => null,
        ];
    }

    /**
     * Indicate that the entry is one of Spain's comunidades autónomas,
     * belonging to the given country entry.
     */
    public function community(GeographyEntry $country): static
    {
        $name = ucfirst(fake()->unique()->word());

        return $this->state(fn (array $attributes) => [
            'level' => GeographyLevel::Community,
            'parent_id' => $country->id,
            'name' => $name,
            'normalized_name' => app(NormalizeForSearch::class)($name),
            'ine_code' => fake()->unique()->numerify('##'),
            'iso_alpha2' => null,
            'province_name' => null,
        ]);
    }

    /**
     * Indicate that the entry is a Spanish municipio, belonging to the given
     * comunidad autónoma entry.
     */
    public function municipality(GeographyEntry $community): static
    {
        $name = fake()->unique()->city();

        return $this->state(fn (array $attributes) => [
            'level' => GeographyLevel::Municipality,
            'parent_id' => $community->id,
            'name' => $name,
            'normalized_name' => app(NormalizeForSearch::class)($name),
            'ine_code' => fake()->unique()->numerify('#####'),
            'iso_alpha2' => null,
            'province_name' => fake()->city(),
        ]);
    }
}
