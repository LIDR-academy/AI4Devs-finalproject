<?php

namespace App\Models;

use App\Enums\GeographyLevel;
use Database\Factories\GeographyEntryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * A read-only, seeded shipping geography catalog entry -- an ISO country, one
 * of Spain's 17 comunidades autónomas, or a Spanish municipio at INE
 * granularity. Physically independent of `SalesRegion` (the fiscal catalog):
 * no shared table, no foreign key, per PRD assumption 4.
 *
 * @property int $id
 * @property GeographyLevel $level
 * @property int|null $parent_id
 * @property string $name
 * @property string $normalized_name
 * @property string|null $ine_code
 * @property string|null $iso_alpha2
 * @property string|null $province_name
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read GeographyEntry|null $parent
 * @property-read Collection<int, GeographyEntry> $children
 */
#[Fillable([])]
class GeographyEntry extends Model
{
    /** @use HasFactory<GeographyEntryFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'level' => GeographyLevel::class,
        ];
    }

    /**
     * The entry this one is nested under. Null for a country row.
     *
     * @return BelongsTo<GeographyEntry, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * The entries nested directly under this one, if any.
     *
     * @return HasMany<GeographyEntry, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }
}
