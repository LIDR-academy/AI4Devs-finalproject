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
}
