<?php

namespace Database\Factories;

use App\Actions\Products\DeriveVariantSku;
use App\Actions\Products\HashVariantCombination;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * `product_id => Product::factory()` so a bare `->create()` stands alone (story 0029, Files to
     * create/modify). `sku` and `combination_hash` are deliberately NOT faked with
     * `fake()->unique()->word()` or any other free-text generator — D-4.3's global consistency
     * test compares every stored `sku` against a live re-derivation, and a factory that writes an
     * underived SKU makes that assertion unfalsifiable (FP13). The base state attaches no real
     * combination -- `combination_hash` is a random per-row placeholder (Phase 5 finding F4, see
     * `configure()` below), never a real derivation of an empty set; a caller needing a real
     * combination for uniqueness-sensitive fixtures must use `withCombination()` below.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'price' => (string) fake()->randomFloat(2, 1, 500),
            'stock' => fake()->numberBetween(0, 100),
        ];
    }

    /**
     * `sku`/`combination_hash` are resolved AFTER the model is instantiated (so `product_id`,
     * whether supplied directly or resolved from a nested `Product::factory()`, is already a real,
     * persisted id we can look up the parent's `sku` through) but BEFORE it is inserted, so the row
     * is written once with its final, derived values rather than created-then-corrected.
     *
     * The segment is a short, faker-unique bothify() string run through the real
     * `DeriveVariantSku::segment()` transformation — not a raw attribute value, since the base
     * state deliberately attaches no real combination — so the derivation formula genuinely runs on
     * every factory-created row (FP13) rather than being bypassed by a hand-typed string.
     */
    public function configure(): static
    {
        return $this->afterMaking(function (ProductVariant $productVariant): void {
            $product = Product::query()->find($productVariant->product_id)
                ?? Product::factory()->create();

            $productVariant->product_id = $product->id;

            $segment = Str::upper((string) fake()->unique()->bothify('VAR-####'));

            $productVariant->sku = app(DeriveVariantSku::class)($product->sku, [$segment]);

            // Phase 5 code review finding F4: the base state used to write a single constant
            // placeholder (HashVariantCombination::class)([]) for every row, so two bare-factory
            // variants on the same product would collide on unique(product_id, combination_hash) --
            // nothing exercises that today because no existing test creates two, but it would bite
            // the first multi-variant fixture in a sibling story. Derived from a fresh random UUID
            // rather than the variant's own (still-unset) primary key: HasUuids populates `id` only
            // inside performInsert()'s setUniqueIds() call, which runs AFTER afterMaking() callbacks,
            // so $productVariant->getKey() is still null here and would collide identically.
            $productVariant->combination_hash = hash('sha256', (string) Str::uuid());
        });
    }

    /**
     * Attach the variant to a real combination of attribute values, deriving both
     * `combination_hash` and `sku` from those values exactly as `CreateProductVariant` would
     * (D-3, D-4.2's `(type.position, type.id, value.position, value.id)` order) — never a raw
     * `bothify()` string standing in for it, per this factory's own file banner.
     *
     * `$valueIds` are read back from the database (never trusted as submitted) precisely because
     * V-10's whole lesson is that a combination's identity is what the database says the ids ARE,
     * not what a caller claims they are.
     *
     * @param  array<int, string>  $valueIds
     */
    public function withCombination(array $valueIds): static
    {
        return $this->afterCreating(function (ProductVariant $productVariant) use ($valueIds): void {
            $productVariant->values()->attach($valueIds);

            $rows = ProductAttributeValue::query()
                ->whereIn('id', $valueIds)
                ->with('type')
                ->get()
                ->sortBy([
                    fn (ProductAttributeValue $a, ProductAttributeValue $b): int => $a->type->position <=> $b->type->position,
                    fn (ProductAttributeValue $a, ProductAttributeValue $b): int => $a->type->id <=> $b->type->id,
                    fn (ProductAttributeValue $a, ProductAttributeValue $b): int => $a->position <=> $b->position,
                    fn (ProductAttributeValue $a, ProductAttributeValue $b): int => $a->id <=> $b->id,
                ])
                ->values();

            $productVariant->forceFill([
                'combination_hash' => app(HashVariantCombination::class)($rows->pluck('id')->all()),
                'sku' => app(DeriveVariantSku::class)($productVariant->product->sku, $rows->pluck('value')->all()),
            ])->saveQuietly();
        });
    }

    /**
     * Give the variant its own featured image, independent of the parent product's (D-7 — an
     * OWN image, never an implicit copy of the parent's).
     */
    public function withOwnImage(): static
    {
        return $this->state(fn (array $attributes): array => [
            'featured_media_id' => Media::factory(),
        ]);
    }

    /**
     * Explicit state for "this variant has no image of its own and inherits the parent's at read
     * time" (D-7) — the column's own default, made an explicit, readable fixture rather than
     * relying on an unstated NULL default.
     */
    public function inheritingImage(): static
    {
        return $this->state(fn (array $attributes): array => [
            'featured_media_id' => null,
        ]);
    }

    /**
     * Zero stock — does not itself write any "out of stock" status anywhere; nothing on this
     * model computes a display badge the way `Product::displayStatus()` does (D-9: no `status`
     * column on a variant at all).
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes): array => [
            'stock' => 0,
        ]);
    }
}
