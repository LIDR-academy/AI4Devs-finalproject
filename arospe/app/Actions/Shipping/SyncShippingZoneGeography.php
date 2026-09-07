<?php

namespace App\Actions\Shipping;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Concerns\ShippingZoneValidationRules;
use App\Models\ShippingZone;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class SyncShippingZoneGeography
{
    use ShippingZoneValidationRules;

    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ) {}

    /**
     * Replace the zone's geography membership with the given catalog
     * entries (D-4: replace/sync semantics, in one action -- syncing [A, B]
     * then [B, C] leaves exactly [B, C]).
     *
     * Corrected at Phase 4 security audit (finding F-1): this docblock
     * previously claimed this action "performs NO authorization, matching
     * App\Actions\Users\CreateUser and UpdateUser" -- that citation was
     * FALSE (see CreateShippingZone's docblock for the correction).
     * Authorizes `update` on `$shippingZone` as its own first statement --
     * ShippingZonePolicy::update()'s own docblock already states this
     * ability covers "rename a shipping zone or replace its geography
     * membership", so no policy change was needed to add this gate call,
     * which closes exactly the "method most likely to ship ungated because
     * it does not look like saving" risk this docblock used to name as a
     * hand-off rather than closing it here.
     *
     * Passing an empty array detaches everything -- that is legal (D-5).
     *
     * Casts and de-duplicates before sync(): a mixed `"33024"` / `33024`
     * payload would otherwise produce a dishonest changes array, which the
     * caller renders back to the administrator. Returning sync()'s changes
     * array rather than the model is deliberate: the future editor needs
     * "3 added, 1 removed" and recomputing it from a re-query is both
     * slower and racy.
     *
     * @param  array<int, int|string>  $geographyEntryIds
     * @return array{attached: array<int, int>, detached: array<int, int>, updated: array<int, int>}
     */
    public function __invoke(ShippingZone $shippingZone, array $geographyEntryIds): array
    {
        $this->logRefusedPrivilegedAttempt->authorize(
            'update',
            $shippingZone,
            targetType: 'shipping_zone',
            targetId: $shippingZone->id,
        );

        Validator::make(
            ['geographyEntryIds' => $geographyEntryIds],
            ['geographyEntryIds' => $this->geographyEntryIdsRules()],
        )->validate();

        $ids = array_values(array_unique(array_map(intval(...), $geographyEntryIds)));

        try {
            return DB::transaction(fn (): array => $shippingZone->geographyEntries()->sync($ids));
        } catch (QueryException $e) {
            // Narrowed to 1452 (ER_NO_REFERENCED_ROW_2), not the whole
            // 23000 SQLSTATE class (Phase 4 audit finding F-4) -- matching
            // this repo's own precedent, App\Actions\Products\CreateProduct's
            // errorInfo[1] narrowing for the identical reason. The pivot
            // table (shipping_zone_geography_entry) carries BOTH a unique
            // composite primary key (shipping_zone_id, geography_entry_id)
            // AND a restrictOnDelete FK into geography_entries, so a bare
            // `$e->getCode() === '23000'` check cannot distinguish a real
            // race (two admins saving concurrently, error 1062 -- the
            // composite PK) from the only case this catch is meant to
            // cover (a validation-bypassing unknown/deleted geography_entry
            // id, error 1452). A 1062 here means sync()'s own attach half
            // collided with a concurrent write to the SAME zone's pivot
            // rows -- a real, distinct failure this action does not
            // attempt to resolve, so it is rethrown rather than
            // misreported as "unknown geography entry".
            if (($e->errorInfo[1] ?? null) === 1452) {
                // Pre-flight check, not a race guard -- the restrictOnDelete
                // FK into geography_entries has the last word. Converted to
                // a clean ValidationException so a validation-bypassing
                // race never surfaces as a 500.
                throw ValidationException::withMessages([
                    'geographyEntryIds' => trans('validation.exists', ['attribute' => 'geographyEntryIds']),
                ]);
            }

            throw $e;
        }
    }
}
