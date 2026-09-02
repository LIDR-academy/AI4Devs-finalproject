<?php

namespace Database\Factories;

use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * `product_category_id => ProductCategory::factory()` so a bare
     * `->create()` stands alone. `status` defaults to Draft, deliberately
     * matching the `products.status` column default (D-6). `sku` is
     * generated already in its canonical, upper-cased form (D-11) — a
     * factory row must not need a second normalisation pass to be a valid
     * fixture.
     *
     * Factories build through `Model::unguarded()`, so `featured_media_id`
     * being absent from `#[Fillable]` does not block the `withFeaturedImage()`
     * state below from setting it directly.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_category_id' => ProductCategory::factory(),
            'name' => fake()->words(3, true),
            'sku' => Str::upper('SKU-'.fake()->unique()->bothify('??####')),
            'type' => ProductType::Physical,
            'status' => ProductStatus::Draft,
            'price' => fake()->randomFloat(2, 1, 500),
            'stock' => fake()->numberBetween(0, 100),
            'description' => fake()->optional()->paragraph(),
        ];
    }

    /**
     * Indicate that the product is active (published).
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => ProductStatus::Active,
        ]);
    }

    /**
     * Indicate that the product is a draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => ProductStatus::Draft,
        ]);
    }

    /**
     * Indicate that the product has no stock (D-7: this alone does not
     * write an "out of stock" status anywhere — `displayStatus()` computes
     * that badge from `stock` at read time).
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes): array => [
            'stock' => 0,
        ]);
    }

    /**
     * Indicate that the product is physical.
     */
    public function physical(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => ProductType::Physical,
        ]);
    }

    /**
     * Indicate that the product is virtual.
     */
    public function virtual(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => ProductType::Virtual,
        ]);
    }

    /**
     * Attach a freshly-created media row as the product's featured image
     * (D-9: independent of the gallery — this state never touches
     * `product_media`).
     */
    public function withFeaturedImage(): static
    {
        return $this->state(fn (array $attributes): array => [
            'featured_media_id' => Media::factory(),
        ]);
    }

    /**
     * Attach `$count` freshly-created media rows to the product's gallery,
     * in creation order, with `position` written as the 0-based array
     * index (D-8/D-17 — the same contract App\Actions\Products\
     * SyncProductGallery enforces at runtime). A raw pivot insert rather
     * than the action itself, since a factory state must not depend on an
     * authenticated actor or the request lifecycle.
     */
    public function withGallery(int $count = 3): static
    {
        return $this->afterCreating(function (Product $product) use ($count): void {
            $mediaIds = Media::factory()->count($count)->create()->pluck('id')->all();

            $rows = [];

            foreach (array_values($mediaIds) as $position => $mediaId) {
                $rows[] = [
                    'product_id' => $product->id,
                    'media_id' => $mediaId,
                    'position' => $position,
                ];
            }

            if ($rows !== []) {
                DB::table('product_media')->insert($rows);
            }
        });
    }
}
