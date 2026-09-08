<?php

namespace App\Models;

use Database\Factories\ShippingZoneFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * An admin-created, admin-editable shipping zone: a named group bundling one
 * or more geography-catalog entries (App\Models\GeographyEntry) at any level
 * -- country, comunidad autónoma, or municipio (PRD §2.4).
 *
 * Deliberately NOT soft-deleted (D-7): SoftDeletes would silently disable
 * cascadeOnDelete() on the pivot below and 0036's future restrictOnDelete()
 * FK from shipping_rates, and Rule::unique() does not apply the soft-delete
 * scope, so a trashed zone would permanently squat its name.
 *
 * @property string $id
 * @property string $name
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name'])]
class ShippingZone extends Model
{
    /** @use HasFactory<ShippingZoneFactory> */
    use HasFactory, HasUuids;

    /**
     * The geography catalog entries this zone covers.
     *
     * Deliberately UNCONSTRAINED by level: a zone bundles entries at ANY level --
     * country, comunidad autónoma or municipio (PRD 2.4). Do NOT add a
     * ->where('level', ...) filter here; the absence of that filter IS the
     * "at any level" rule. Membership is literal, never transitive (D-3).
     *
     * No inverse GeographyEntry::shippingZones() relation exists (D-11) --
     * that would make the deliberately generic catalog import a shipping
     * model. Every reverse query is expressible from this side.
     *
     * @return BelongsToMany<GeographyEntry, $this>
     */
    public function geographyEntries(): BelongsToMany
    {
        return $this->belongsToMany(GeographyEntry::class, 'shipping_zone_geography_entry');
    }
}
