<?php

namespace App\Actions\Products;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\Auth;
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
 *
 * Story 0029a, D-A1 path 2 / D-A2: the delete branch below is hard-blocked,
 * per submitted value, while any product variant is still built on it --
 * logged via LogRefusedPrivilegedAttempt::log() (never ->authorize(), which
 * would add a Gate call this class deliberately has none of). The
 * ordering rule is INHERITED rather than added: this class authorizes
 * nothing of its own, so the in-use count it computes is already behind
 * its caller's Gate::authorize() call (Create/UpdateProductAttributeType's
 * own first statement) by construction -- do not add a Gate call here to
 * "close the same gap" DeleteProductAttributeType closes; there is no gap,
 * only a different mechanism producing the same guarantee.
 */
class SyncProductAttributeValues
{
    /**
     * Constructor injection for this action's own collaborators
     * (DeriveVariantSku, used by the rename cascade; TranslateProductVariantUniqueViolation,
     * the last-word 23000/1062 disambiguator for that cascade's write loop;
     * LogRefusedPrivilegedAttempt, the story 0029a in-use refusal's
     * recorder) -- the first two were resolved with app() inside a method
     * body before a Phase 5 code review found the anti-pattern
     * (code-style.md's constructor-injection convention: no fixed,
     * non-`$this`-controlled parameter list forces app() here, so it was
     * the shape to avoid, not the carve-out). __invoke()'s own signature
     * is unaffected, since callers already reach this class exclusively
     * through app(SyncProductAttributeValues::class), never `new`.
     */
    public function __construct(
        private readonly DeriveVariantSku $deriveVariantSku,
        private readonly TranslateProductVariantUniqueViolation $translateProductVariantUniqueViolation,
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ) {}

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
            // D-4.6.1: read id AND value (not ids alone) -- this is what lets the rename branch
            // below tell "renamed" from "resubmitted unchanged", which is what scopes story
            // 0029's SKU re-derivation cascade to the values that actually moved rather than
            // re-deriving every variant of the type on every save.
            $owned = $type->values()->get(['id', 'value'])->keyBy('id');
            $ownedIds = $owned->keys()->all();
            $ownedSet = array_flip($ownedIds);

            $submittedIds = [];
            $renamedIds = [];

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

                    // Story 0029 D-4.6.1: this is a QUERY-BUILDER mass update -- it instantiates
                    // no model and fires NO Eloquent event, so a model observer cannot carry the
                    // SKU re-derivation cascade below. It has to be explicit code, in this same
                    // transaction, after the diff loop.
                    if ($owned[$id]->value !== $text) {
                        $renamedIds[] = $id;
                    }

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

            $toDelete = array_values(array_diff($ownedIds, $submittedIds));

            if ($toDelete !== []) {
                // D-A1 path 2: the app-level pre-check, per submitted value, before any DELETE
                // runs -- refusing the WHOLE save rather than partially applying it (D-A5),
                // since a thrown ValidationException here rolls back this whole transaction,
                // including every update/insert already applied above.
                $this->guardAgainstValuesInUse($toDelete);

                try {
                    ProductAttributeValue::whereIn('id', $toDelete)->delete();
                } catch (QueryException $e) {
                    // D-A4: narrowed to MySQL error 1451 (row is referenced) via errorInfo[1],
                    // NEVER folded into writeRow()'s existing 23000 catch above -- that catch
                    // means "duplicate value", and 23000 covers both 1062 and 1451, so widening
                    // it would report "the value must be distinct" for an in-use deletion. This
                    // is the race backstop behind the pre-check above: a bulk
                    // `whereIn(...)->delete()` does not identify WHICH row tripped the
                    // RESTRICT, so every id in the batch is re-checked in firstValueInUse().
                    if (($e->errorInfo[1] ?? null) === 1451) {
                        $found = $this->firstValueInUse($toDelete) ?? [$toDelete[0], 0];

                        throw $this->blockedByValueInUse($found[0], $found[1]);
                    }

                    throw $e;
                }
            }

            if ($renamedIds !== []) {
                $this->reDeriveVariantSkusForRenamedValues($renamedIds);
            }
        });
    }

    /**
     * Story 0029 D-4.6: renaming an attribute value re-derives every variant built on it, across
     * EVERY product that uses it -- not just one, since the same value can be shared by variants
     * of unrelated products. Collect once, cascade once (D-4.6.1 point 3): every affected
     * variant's new SKU is computed and checked before any row is written, so a single collision
     * aborts the whole rename (this transaction is the caller's own, opened in __invoke() above).
     *
     * @param  array<int, string>  $renamedIds
     */
    private function reDeriveVariantSkusForRenamedValues(array $renamedIds): void
    {
        $variants = ProductVariant::query()
            ->whereHas('values', fn (Builder $query) => $query->whereIn('product_attribute_values.id', $renamedIds))
            ->with(['values', 'product'])
            ->get();

        if ($variants->isEmpty()) {
            return;
        }

        /** @var array<string, string> $newSkus keyed by variant id */
        $newSkus = [];

        foreach ($variants as $variant) {
            $orderedValues = $variant->values->pluck('value')->all();
            // F-1/F-2: checked() -- not the bare __invoke() -- so this rename cascade refuses an
            // over-length derivation (a raw 1406) or an empty-segment rename (a silent
            // trailing-hyphen SKU) exactly like CreateProductVariant does, instead of neither.
            $newSkus[$variant->id] = $this->deriveVariantSku->checked($variant->product->sku, $orderedValues);
        }

        // F-3: assert the batch's own new-SKU set has no internal duplicates BEFORE the database
        // is ever consulted. This is what makes it safe to widen the per-row database pre-check
        // below to exclude the WHOLE batch (Phase 4 re-audit finding R-4) rather than only the
        // row being checked -- a genuine same-batch duplicate is already caught here, so a batch
        // of two mutually-colliding renames still fails cleanly with a validation error rather
        // than reaching the write loop below and raising an uncaught
        // UniqueConstraintViolationException. See docs/security/derived-column-invariants.md.
        $duplicatesWithinBatch = array_diff_key($newSkus, array_unique($newSkus));

        if ($duplicatesWithinBatch !== []) {
            throw ValidationException::withMessages([
                'sku' => trans('products.variants.derived_sku_taken', ['sku' => reset($duplicatesWithinBatch)]),
            ]);
        }

        // R-4: excludes every variant id in THIS batch, not only the row being checked --
        // otherwise a batch that rotates two SKUs between two of its own variants (each ending up
        // with a SKU some OTHER variant in the batch currently holds, but nothing outside it) is
        // wrongly refused as "taken" even though the final state is legal. Safe because the
        // internal-duplicate check above already rules out a genuine within-batch collision.
        $batchVariantIds = array_keys($newSkus);

        foreach ($newSkus as $newSku) {
            $conflict = DB::table('products')->where('sku', $newSku)->lockForUpdate()->value('id');

            if ($conflict === null) {
                $conflict = DB::table('product_variants')
                    ->where('sku', $newSku)
                    ->whereNotIn('id', $batchVariantIds)
                    ->lockForUpdate()
                    ->value('id');
            }

            if ($conflict !== null) {
                throw ValidationException::withMessages([
                    'sku' => trans('products.variants.derived_sku_taken', ['sku' => $newSku]),
                ]);
            }
        }

        foreach ($newSkus as $variantId => $newSku) {
            try {
                DB::table('product_variants')->where('id', $variantId)->update([
                    'sku' => $newSku,
                    'updated_at' => now(),
                ]);
            } catch (UniqueConstraintViolationException $e) {
                // F-3: the same last-word 23000/1062 catch CreateProductVariant has for its own
                // write, via the shared translator -- a race that slips past the pre-check above
                // still surfaces as a clean products.variants.duplicate_combination-family
                // ValidationException rather than an uncaught database exception.
                //
                // Phase 4 audit (0030a, finding L-2): the translator's OTHER branch
                // (combination-hash index -> a 'combination'-keyed message) is unreachable from
                // THIS call site specifically, because the UPDATE above writes only
                // sku/updated_at and never touches product_id/combination_hash -- so only the
                // sku-uniqueness index can be the one that raced. If this UPDATE's column list
                // ever grows to include either of those two columns, re-check whether
                // AttributeTypes\Index's view needs a 'combination'-keyed outlet too, or that
                // refusal will be silently discarded exactly like the 'sku' one was before 0030a.
                throw ($this->translateProductVariantUniqueViolation)($e, $newSku);
            }
        }
    }

    /**
     * Story 0029a, D-A1 path 2's app-level guard, checked for every id about to be removed
     * BEFORE any DELETE runs. Throws on the first value found in use rather than accumulating
     * every one -- the whole save is already refused by the single throw, and the caller fixes
     * one value at a time in any case.
     *
     * @param  array<int, string>  $ids
     */
    private function guardAgainstValuesInUse(array $ids): void
    {
        $found = $this->firstValueInUse($ids);

        if ($found !== null) {
            throw $this->blockedByValueInUse(...$found);
        }
    }

    /**
     * D-A3's per-VALUE in-use query, re-run for each id until one shows usage -- the pivot's
     * PRIMARY KEY makes (variant, value) unique, so unlike
     * App\Models\ProductAttributeType::variantUsageCount()'s type-level query, no DISTINCT is
     * needed here.
     *
     * @param  array<int, string>  $ids
     * @return array{0: string, 1: int}|null
     */
    private function firstValueInUse(array $ids): ?array
    {
        foreach ($ids as $id) {
            $count = DB::table('product_variant_values')->where('product_attribute_value_id', $id)->count();

            if ($count > 0) {
                return [$id, $count];
            }
        }

        return null;
    }

    private function blockedByValueInUse(string $valueId, int $count): ValidationException
    {
        // max(1, ...): the same presentation floor App\Actions\ProductCategories\
        // DeleteProductCategory's blockedByProducts() documents -- the race backstop above may
        // call this with a recount of 0 once this whole transaction has already rolled back.
        $count = max(1, $count);

        $this->logRefusedPrivilegedAttempt->log(Auth::user(), 'attribute_value_in_use', 'product_attribute_value', $valueId);

        return ValidationException::withMessages([
            'values' => trans_choice('products.variants.value_in_use', $count, ['count' => $count]),
        ]);
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
