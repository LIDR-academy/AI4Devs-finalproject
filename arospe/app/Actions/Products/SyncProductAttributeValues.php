<?php

namespace App\Actions\Products;

use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * The single writer of every `product_attribute_values` row for a given
 * type (story 0028, D4) -- shared by CreateProductAttributeType and
 * UpdateProductAttributeType so the diff algorithm exists once, not twice.
 *
 * Deliberately authorizes NOTHING (D6): it is a collaborator invoked only
 * by two actions that have already authorized the whole operation, never an
 * independently-reachable entry point -- the same structural reason
 * App\Actions\Products\SyncProductGallery, App\Actions\Products\
 * SyncProductSalesRegions, App\Actions\Media\GenerateImageConversions and
 * App\Actions\Roles\EnforceGrantorPermissionScope already authorize
 * nothing. This is this codebase's fifth shipped instance of that pattern.
 * `tests/Feature/Products/SyncProductAttributeValuesTest.php` asserts that
 * no class under app/, database/ or routes/ other than
 * CreateProductAttributeType/UpdateProductAttributeType references this
 * class, which is what makes the missing Gate call structural rather than
 * an oversight.
 */
class SyncProductAttributeValues
{
    /**
     * Diff-sync a type's value list against the submitted, complete,
     * authoritative array -- never a delta (D4).
     *
     * The five steps, run inside one transaction:
     * 1. Fetch the type's real value ids fresh, from the database.
     * 2. Re-scope every submitted id against that owned set. A submitted id
     *    not owned by this type is not an error -- it is treated as a NEW
     *    row. This is a security requirement, not tidiness: `$values` is
     *    the caller's own client-writable form input, and without this
     *    re-scope a crafted payload could point an UPDATE at another
     *    type's value row.
     * 3. Rows with a surviving id -> UPDATE value + position in place.
     * 4. Rows with a null/foreign id -> INSERT (position 3's re-scope IS
     *    what makes this branch also catch step 2's forged-id case).
     * 5. Owned ids absent from the submission -> DELETE.
     *
     * `position` is NEVER taken from the payload -- it is always the row's
     * 0-based index in the submitted array, rewritten for every surviving
     * row on every call (never MAX(position) + 1), matching
     * SyncProductGallery's identical `product_media.position` shape. That
     * full rewrite is what makes id stability across a no-op re-save hold:
     * renaming a type, or resubmitting an unchanged value list, must never
     * re-key a value that was not itself removed -- the property story
     * 0029's variant combinations depend on.
     *
     * `$values[i]['id']` is only ever read, never trusted for anything
     * beyond "does this id belong to this type" (step 2) -- an id
     * belonging to another type is silently re-scoped as a new row rather
     * than surfaced as an error, matching D4's own wording.
     *
     * Any array key beyond `id`/`value` (the Livewire component's own
     * view-only `key`, present when this is called through
     * CreateProductAttributeType/UpdateProductAttributeType after a
     * component round-trip) is ignored -- this action reads only the two
     * keys its own contract names.
     *
     * @param  array<int, array{id?: string|null, value: string}>  $values  The complete, authoritative value list, in display order.
     */
    public function __invoke(ProductAttributeType $type, array $values): void
    {
        DB::transaction(function () use ($type, $values): void {
            $owned = $type->values()->pluck('id')->all();
            $ownedSet = array_flip($owned);

            $submittedIds = [];

            foreach ($values as $position => $row) {
                $id = $row['id'] ?? null;
                $text = (string) $row['value'];

                // is_string() is load-bearing, not defensive noise: `$values` is
                // the caller's own client-writable form input, and a forged
                // non-string id (an array, say) reaching array_key_exists()
                // raises an unhandled TypeError rather than being re-scoped.
                // The calling component validates 'values.*.id' as
                // nullable|string above this, and this guard is the same rule
                // held independently by the class that actually acts on the id.
                //
                // unset() consumes the id: the SAME owned id submitted twice
                // must produce a second, genuinely new row (which the composite
                // UNIQUE index then judges on its value) rather than silently
                // collapsing two submitted rows into one persisted row, which is
                // what a re-matchable $ownedSet did before story 0028's Phase 4
                // audit.
                if (is_string($id) && array_key_exists($id, $ownedSet)) {
                    unset($ownedSet[$id]);

                    $this->writeRow(fn () => ProductAttributeValue::where('id', $id)->update([
                        'value' => $text,
                        'position' => $position,
                    ]));

                    $submittedIds[] = $id;

                    continue;
                }

                // Step 2/4: no owned match -- a new row, whether the submitted id was
                // genuinely null or forged against another type entirely.
                $this->writeRow(fn () => ProductAttributeValue::create([
                    'product_attribute_type_id' => $type->id,
                    'value' => $text,
                    'position' => $position,
                ]));
            }

            $toDelete = array_diff($owned, $submittedIds);

            if ($toDelete !== []) {
                ProductAttributeValue::whereIn('id', $toDelete)->delete();
            }
        });
    }

    /**
     * Run a single insert/update statement, converting the composite
     * UNIQUE(product_attribute_type_id, value) index's race-condition
     * violation into a clean ValidationException (D4's own explicit
     * contract) rather than letting an unhandled QueryException surface.
     * This layer performs no Validator::make()/distinct:ignore_case check
     * of its own -- that lives in the calling component, above this one --
     * so this catch is the last-word backstop for a submission that
     * bypassed it.
     *
     * @param  callable(): mixed  $write
     */
    private function writeRow(callable $write): void
    {
        try {
            $write();
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                throw ValidationException::withMessages([
                    'values' => trans('validation.distinct', ['attribute' => 'value']),
                ]);
            }

            throw $e;
        }
    }
}
