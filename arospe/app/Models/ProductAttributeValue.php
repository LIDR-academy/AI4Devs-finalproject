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
use Illuminate\Support\Facades\DB;

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

    /**
     * How many variants are built on each of the given value ids -- story
     * 0030a's bulk display query for the attribute types screen's per-row
     * "used by :count variants" notice.
     *
     * This mirrors App\Actions\Products\SyncProductAttributeValues::
     * firstValueInUse()'s reasoning, not ProductAttributeType::
     * variantUsageCount()'s: a per-VALUE count needs no DISTINCT, because
     * product_variant_values' composite primary key
     * (product_variant_id, product_attribute_value_id) already makes
     * (variant, value) unique -- unlike the type-level query, which must
     * deduplicate across a type's several values because a single variant
     * can be built on two values of the same type at once.
     *
     * One query for the whole type's values (up to 100 per 0028's
     * max:100), never one query per row -- GROUP BY
     * product_attribute_value_id. This is NOT a duplicate of
     * firstValueInUse(): that one is a private, early-exit "does any of
     * these ids show usage, stopping at the first" check built for a
     * delete refusal; this one is a public, read-every-row bulk count
     * built for display. Neither this query nor firstValueInUse()'s needs
     * a hand-written index -- InnoDB's auto-created key on
     * product_variant_values.product_attribute_value_id already covers it.
     *
     * @param  array<int, string>  $valueIds
     * @return array<string, int> keyed by value id; an id with no variants is simply absent
     */
    public static function variantUsageCounts(array $valueIds): array
    {
        if ($valueIds === []) {
            return [];
        }

        return DB::table('product_variant_values')
            ->whereIn('product_attribute_value_id', $valueIds)
            ->select('product_attribute_value_id', DB::raw('count(*) as count'))
            ->groupBy('product_attribute_value_id')
            ->pluck('count', 'product_attribute_value_id')
            ->map(fn (mixed $count): int => (int) $count)
            ->all();
    }
}
