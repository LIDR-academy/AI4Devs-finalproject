<?php

namespace App\Models;

use Database\Factories\ProductAttributeValueFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $product_attribute_type_id
 * @property string $value
 * @property int $position
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read ProductAttributeType $type
 */
#[Fillable(['product_attribute_type_id', 'value', 'position'])]
class ProductAttributeValue extends Model
{
    /** @use HasFactory<ProductAttributeValueFactory> */
    use HasFactory, HasUuids;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'position' => 'integer',
        ];
    }

    /**
     * The attribute type this value belongs to, e.g. "38" -> Size.
     *
     * Foreign key named explicitly: the relation method is named `type`, not
     * `productAttributeType`, so Eloquent's own convention would derive
     * `type_id` rather than the real column, `product_attribute_type_id`.
     *
     * @return BelongsTo<ProductAttributeType, $this>
     */
    public function type(): BelongsTo
    {
        return $this->belongsTo(ProductAttributeType::class, 'product_attribute_type_id');
    }

    /**
     * Every variant built on this value, across every product (story 0029,
     * D-17.2) -- the reverse of ProductVariant::values(). What a future
     * in-use count reads through.
     *
     * @return BelongsToMany<ProductVariant, $this>
     */
    public function variants(): BelongsToMany
    {
        return $this->belongsToMany(ProductVariant::class, 'product_variant_values');
    }
}
