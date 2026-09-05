<?php

namespace App\Models;

use Database\Factories\ProductAttributeTypeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * @property string $id
 * @property string $name
 * @property int $position
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, ProductAttributeValue> $values
 */
#[Fillable(['name', 'position'])]
class ProductAttributeType extends Model
{
    /** @use HasFactory<ProductAttributeTypeFactory> */
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
     * The values this type can take, e.g. Size -> 38, 39, 40.
     *
     * Ordered inside the relationship (D5) — every read wants
     * position ASC, value ASC (never a bare ORDER BY value, which sorts "10, 38,
     * 39, 9" for shoe sizes). Use reorder() at the call site for the rare read
     * that genuinely needs something else.
     *
     * @return HasMany<ProductAttributeValue, $this>
     */
    public function values(): HasMany
    {
        return $this->hasMany(ProductAttributeValue::class)
            ->orderBy('position')
            ->orderBy('value');
    }

    /**
     * How many distinct variants are built on any value of this type --
     * story 0029a's D-A3 type-level query, the single source of truth
     * consumed by both App\Actions\Products\DeleteProductAttributeType's
     * in-use guard and App\Livewire\Products\AttributeTypes\Index::
     * confirmDelete() (D-A6).
     *
     * DISTINCT on pvv.product_variant_id is load-bearing, not decorative:
     * a variant built on TWO values of the same type (legal at schema
     * level, story 0029's DIS-1 -- e.g. Size 40 AND Size 41) must count
     * once, not twice, or the administrator would be told 13 variants are
     * affected when 12 are. Neither this query nor the per-value one in
     * App\Actions\Products\SyncProductAttributeValues needs a hand-written
     * index (D-A3/D-14): InnoDB's auto-created key on
     * product_variant_values.product_attribute_value_id already carries
     * the clustered-index columns in its leaf entries, so both are fully
     * covering.
     */
    public function variantUsageCount(): int
    {
        return DB::table('product_variant_values as pvv')
            ->join('product_attribute_values as pav', 'pav.id', '=', 'pvv.product_attribute_value_id')
            ->where('pav.product_attribute_type_id', $this->id)
            ->distinct()
            ->count('pvv.product_variant_id');
    }
}
