<?php

namespace App\Models;

use App\Enums\ProductDisplayStatus;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * A product in the catalog (story 0024).
 *
 * `featured_media_id` and every `product_media` pivot row are deliberately
 * absent from `#[Fillable]` and written only by the gallery-sync action
 * under app/Actions/Products/ -- the same single-writer shape
 * App\Models\SalesRegion already establishes for `is_default`/`is_active`
 * (D-9). No `SoftDeletes` (D-12): `Rule::unique()` does not apply the
 * soft-delete scope, so a trashed product would permanently squat its SKU,
 * and a cascade never fires on a soft delete, so 0029's variants would be
 * left live and reachable against a trashed parent.
 *
 * @property string $id
 * @property string $name
 * @property string $sku
 * @property string $product_category_id
 * @property ProductType|null $type
 * @property ProductStatus $status
 * @property string $price 'decimal:2' casts to a STRING, not a float
 * @property int $stock
 * @property string|null $description
 * @property string|null $featured_media_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read ProductCategory|null $category
 * @property-read Media|null $featuredImage
 * @property-read Collection<int, Media> $gallery
 */
#[Fillable(['name', 'sku', 'product_category_id', 'type', 'status', 'price', 'stock', 'description'])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, HasUuids;

    /**
     * Get the attributes that should be cast.
     *
     * D-2: `price` casts to a STRING via `decimal:2` -- never a float,
     * since binary floating point cannot represent 21.00/0.10 exactly. R-4:
     * `@property float $price` reads as obviously correct and is the
     * likeliest silent bug in this story.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => ProductType::class,
            'status' => ProductStatus::class,
            'price' => 'decimal:2',
            'stock' => 'integer',
        ];
    }

    /**
     * The category this product is filed under.
     *
     * @return BelongsTo<ProductCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'product_category_id');
    }

    /**
     * The single image representing this product in a list, independent of
     * its gallery (D-9) -- setting one never implicitly populates the
     * other, and nothing prevents this pointing at a media row absent from
     * the gallery.
     *
     * @return BelongsTo<Media, $this>
     */
    public function featuredImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'featured_media_id');
    }

    /**
     * The ordered image gallery shown on the product (D-8/D-17). `position`
     * is the caller's 0-based array index, written exclusively by the
     * gallery-sync action under app/Actions/Products/ -- the tiebreak on
     * `media_id` covers only a raw insert that bypasses that action, since
     * a bulk multi-select attach would otherwise leave every new row at the
     * `position` column's default of 0 and read back in arbitrary order.
     *
     * @return BelongsToMany<Media, $this>
     */
    public function gallery(): BelongsToMany
    {
        return $this->belongsToMany(Media::class, 'product_media', 'product_id', 'media_id')
            ->withPivot('position')
            ->orderByPivot('position')
            ->orderByPivot('media_id');
    }

    /**
     * Whether this product is out of stock -- `<= 0`, not `=== 0`, so a
     * negative value (representable, though refused by validation today)
     * still reads correctly (D-3).
     */
    public function isOutOfStock(): bool
    {
        return $this->stock <= 0;
    }

    /**
     * The badge status shown for this product (D-7, confirmed Phase 0
     * decision -- do not reopen). "Agotado" is COMPUTED here, never stored:
     * the out-of-stock badge overrides Active only (RQ-4) -- a Draft
     * product with zero stock still reads as Draft, since publication
     * state and availability are orthogonal axes one column cannot hold
     * without losing information.
     */
    public function displayStatus(): ProductDisplayStatus
    {
        if ($this->status === ProductStatus::Active && $this->isOutOfStock()) {
            return ProductDisplayStatus::OutOfStock;
        }

        return ProductDisplayStatus::from($this->status->value);
    }
}
