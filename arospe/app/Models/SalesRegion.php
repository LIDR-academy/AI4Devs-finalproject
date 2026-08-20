<?php

namespace App\Models;

use App\Enums\SalesRegionKind;
use Database\Factories\SalesRegionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * @property string $id
 * @property string $slug
 * @property string|null $code
 * @property string $name
 * @property string|null $description
 * @property string|null $rate 'decimal:3' casts to a STRING, not a float
 * @property SalesRegionKind $kind
 * @property string|null $parent_id
 * @property bool $is_default
 * @property bool $is_active
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read SalesRegion|null $parent
 * @property-read Collection<int, SalesRegion> $children
 */
#[Fillable(['code', 'description', 'rate'])]
class SalesRegion extends Model
{
    /** @use HasFactory<SalesRegionFactory> */
    use HasFactory, HasUuids;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'kind' => SalesRegionKind::class,
            'rate' => 'decimal:3',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * The country (or other Sales Region) this entry is a fiscal
     * sub-territory of. Null for a top-level country entry.
     *
     * @return BelongsTo<SalesRegion, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * The fiscal sub-territories belonging to this entry, if any.
     *
     * @return HasMany<SalesRegion, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }
}
