<?php

namespace App\Models;

use Database\Factories\ProductVariantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * A product variant: a specific combination of attribute values belonging
 * to one product (story 0029), carrying a DERIVED sku (D-4) plus its own
 * price and stock, and an optional featured image that falls back to the
 * parent product's at READ time when unset (D-7).
 *
 * `combination_hash` and `sku` are both server-derived and deliberately
 * absent from `#[Fillable]` (D-4.3) -- the same omission-as-mass-assignment
 * guard `users.status` uses. Both are written only by
 * App\Actions\Products\CreateProductVariant (via `forceCreate()`) or by the
 * D-4.6 re-derivation cascades in App\Actions\Products\UpdateProduct and
 * App\Actions\Products\SyncProductAttributeValues, never through a plain
 * create()/update() payload.
 *
 * No `SoftDeletes` (D-6): `Rule::unique()` does not apply the soft-delete
 * scope, so a trashed variant would permanently squat both its `sku` and
 * its `combination_hash`.
 *
 * `product_id` is deliberately absent from `#[Fillable]` (Phase 4 finding
 * F-7): a variant's parent is fixed at creation (D-13) and
 * `CreateProductVariant` writes it via `forceCreate()` anyway, so the only
 * effect of leaving it fillable was a mass-assignment guard gap with no
 * legitimate caller. This is defence in depth, not an integrity guard --
 * `save()` still writes the whole dirty set, so a caller that assigns
 * `$variant->product_id` directly and calls `save()` still reaches the
 * column (see docs/security/model-instance-trust.md).
 *
 * @property string $id
 * @property string $product_id
 * @property string $combination_hash
 * @property string $sku
 * @property string $price 'decimal:2' casts to a STRING, not a float
 * @property int $stock
 * @property string|null $featured_media_id
 * @property int $position
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Product $product
 * @property-read Media|null $featuredImage
 * @property-read Collection<int, ProductAttributeValue> $values
 */
#[Fillable(['price', 'stock', 'featured_media_id', 'position'])]
class ProductVariant extends Model
{
    /** @use HasFactory<ProductVariantFactory> */
    use HasFactory, HasUuids;

    /**
     * Get the attributes that should be cast.
     *
     * D-6/R-4, inherited wholesale from 0024: `decimal:2` casts `price` to
     * a STRING, never a float.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'stock' => 'integer',
            'position' => 'integer',
        ];
    }

    /**
     * The product this variant belongs to. NOT NULL FK; never nullable in
     * practice.
     *
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * This variant's OWN featured image, independent of the parent's
     * (D-7) -- nullable, and the null IS the inheritance flag. Never read
     * directly to decide what to display; use `displayFeaturedMediaId()`.
     *
     * @return BelongsTo<Media, $this>
     */
    public function featuredImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'featured_media_id');
    }

    /**
     * The combination of attribute values this variant is built on,
     * READ-ONLY (D-3): the pivot is written only by
     * App\Actions\Products\CreateProductVariant, never through a public
     * attach()/sync() surface handed out from here.
     *
     * Ordered by (type.position, type.id, value.position, value.id) --
     * D-4.2's exact derivation-order rule, declared inside the relationship
     * rather than at each call site so `label()` and every consumer see the
     * same order. The extra join exists purely for that ordering; `select()`
     * is scoped explicitly to `product_attribute_values.*` so the join's
     * own `id`/`position` columns on `product_attribute_types` never
     * collide with (and silently overwrite) this relation's own columns of
     * the same name during hydration.
     *
     * @return BelongsToMany<ProductAttributeValue, $this>
     */
    public function values(): BelongsToMany
    {
        return $this->belongsToMany(ProductAttributeValue::class, 'product_variant_values')
            ->join(
                'product_attribute_types',
                'product_attribute_types.id',
                '=',
                'product_attribute_values.product_attribute_type_id',
            )
            ->select('product_attribute_values.*')
            ->orderBy('product_attribute_types.position')
            ->orderBy('product_attribute_types.id')
            ->orderBy('product_attribute_values.position')
            ->orderBy('product_attribute_values.id');
    }

    /**
     * The featured image actually shown for this variant, resolved at READ
     * time (D-7): its own image if set, otherwise the parent product's.
     * NEVER copies `featured_media_id` at creation -- the null pointer IS
     * the inheritance flag, and changing the parent's image must keep
     * propagating to every variant that never chose one of its own.
     *
     * Eager-load `['featuredImage', 'product.featuredImage']` when calling
     * this across a list, or it lazy-loads per row.
     */
    public function displayFeaturedMediaId(): ?string
    {
        return $this->featured_media_id ?? $this->product->featured_media_id;
    }

    /**
     * The variant's derived display label, e.g. "Talla M / Color azul
     * marino" -- an accessor over the eager-loaded pivot, in the same
     * (type.position, value.position) order `values()` itself already
     * enforces (D-9). Never stored: a variant's combination can be
     * renamed by 0028 at any time.
     */
    public function label(): string
    {
        return $this->values
            ->map(fn (ProductAttributeValue $value): string => trim($value->type->name.' '.$value->value))
            ->implode(' / ');
    }
}
