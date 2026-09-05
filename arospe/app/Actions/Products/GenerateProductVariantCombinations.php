<?php

namespace App\Actions\Products;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Concerns\ProductVariantValidationRules;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * Story 0029b -- generates every combination in the cartesian product of the
 * given attribute types' values for one product, skipping combinations the
 * product already has and reporting a SKU collision by name rather than
 * failing the whole batch. Re-implements NOTHING: every combination goes
 * through the ordinary App\Actions\Products\CreateProductVariant -- not the
 * SKU derivation, not the combination hash, not the collision check, not the
 * pivot write.
 *
 * Constructor injection, not method injection: __invoke()'s two domain
 * arguments are this action's whole public signature, matched verbatim by
 * every direct-call test, so every dependency is resolved from the container
 * without widening it (code-style.md's constructor-injection exception) --
 * including HashVariantCombination and DeriveVariantSku, both pure,
 * dependency-free classes reused here (never re-derived) so the generator can
 * decide skip-vs-attempt and report a would-be SKU without duplicating either
 * algorithm.
 */
class GenerateProductVariantCombinations
{
    use ProductVariantValidationRules;

    /**
     * D-G5: 5 sizes x 8 colours is 40, 5 x 8 x 5 materials is exactly 200 --
     * the top of what a real clothing catalog generates in one gesture,
     * while 5 types x 4 values (1,024) is comfortably refused.
     */
    public const MAX_COMBINATIONS = 200;

    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
        private readonly CreateProductVariant $createProductVariant,
        private readonly HashVariantCombination $hashVariantCombination,
        private readonly DeriveVariantSku $deriveVariantSku,
    ) {}

    /**
     * Create one variant per combination in the cartesian product of the
     * given types' values, skipping combinations the product already has.
     *
     * D-G0: authorizes `update` on the PARENT PRODUCT as the very first
     * statement -- before validation, before the value-set read, before the
     * cap check, before any transaction -- so a refused actor learns
     * NEITHER the attempted count NOR which selected type is empty.
     *
     * @param  array<int, string>  $productAttributeTypeIds
     * @return array{
     *     created: Collection<int, ProductVariant>,
     *     skipped: array<int, array{value_ids: array<int, string>, label: string}>,
     *     refused: array<int, array{value_ids: array<int, string>, label: string, sku: string, message: string}>,
     *     attempted: int,
     * }
     *
     * @throws AuthorizationException D-G0
     * @throws ValidationException on attributeTypeIds (D-G8, D-G5, D-G6)
     */
    public function __invoke(Product $product, array $productAttributeTypeIds): array
    {
        $this->logRefusedPrivilegedAttempt->authorize(
            'update',
            $product,
            targetType: 'product',
            targetId: $product->id,
        );

        // D-G8 pass 1 -- shape and bound ALONE. Throws before a single per-element exists()
        // query runs.
        Validator::make(
            ['attributeTypeIds' => $productAttributeTypeIds],
            ['attributeTypeIds' => $this->variantAttributeTypeIdsRules()],
        )->validate();

        // D-G8 pass 2 -- per-element rules, now provably against at most 5 elements. Collapsed
        // onto the single 'attributeTypeIds' bag key, matching CreateProductVariant's own
        // D-16.1 pass 2 shape, rather than Laravel's default 'attributeTypeIds.0' keying.
        $elementValidator = Validator::make(
            ['attributeTypeIds' => $productAttributeTypeIds],
            ['attributeTypeIds.*' => $this->variantAttributeTypeIdRules()],
        );

        if ($elementValidator->fails()) {
            throw ValidationException::withMessages([
                'attributeTypeIds' => $elementValidator->errors()->first(),
            ]);
        }

        // D-G6: types in (position, id) order -- never submission order. Read back from the
        // database rather than trusting the payload, matching V-10's reasoning for the value ids
        // themselves.
        $types = ProductAttributeType::query()
            ->whereIn('id', $productAttributeTypeIds)
            ->get()
            ->sortBy([
                fn (ProductAttributeType $a, ProductAttributeType $b): int => $a->position <=> $b->position,
                fn (ProductAttributeType $a, ProductAttributeType $b): int => $a->id <=> $b->id,
            ])
            ->values();

        // V-10, applied to type ids too: product_attribute_types.id sits under
        // utf8mb4_unicode_ci, so a case-varied duplicate (e.g. two spellings of the same UUID)
        // passes both D-G8 passes -- `distinct` is case-sensitive, `Rule::exists()` is not -- and
        // silently collapses to fewer rows here. Mirrors CreateProductVariant's own read-back
        // count guard, so a submission that de-duplicates unexpectedly refuses loudly instead of
        // quietly generating a smaller-than-requested combination.
        if ($types->count() !== count(array_unique($productAttributeTypeIds))) {
            throw ValidationException::withMessages([
                'attributeTypeIds' => trans('validation.exists', ['attribute' => 'attribute type']),
            ]);
        }

        // D-G5: bound the WORK by the NUMBERS before doing the work, applied one read earlier
        // than the multiplication itself -- an aggregate COUNT per type, never a full hydration
        // of every value row, so a type holding an unbounded number of values (nothing but a
        // sibling action's own validation rule caps that today) cannot make this query's own
        // result set scale with anything this action does not already bound.
        $counts = DB::table('product_attribute_values')
            ->whereIn('product_attribute_type_id', $productAttributeTypeIds)
            ->selectRaw('product_attribute_type_id, count(*) as aggregate')
            ->groupBy('product_attribute_type_id')
            ->pluck('aggregate', 'product_attribute_type_id');

        /** @var list<int> $sizes */
        $sizes = [];

        // D-G6: an empty type is refused loudly, and this check runs BEFORE the cap
        // multiplication -- array_product() on an empty set returns 0, which would pass the cap
        // silently and report attempted: 0, an outcome indistinguishable from success.
        foreach ($types as $type) {
            $count = (int) ($counts[$type->id] ?? 0);

            if ($count === 0) {
                throw ValidationException::withMessages([
                    'attributeTypeIds' => trans('products.variants.generate.empty_type', ['type' => $type->name]),
                ]);
            }

            $sizes[] = $count;
        }

        // D-G5 (🔴): the count is computed by MULTIPLYING the value-set SIZES -- five integers
        // multiplied, whatever the answer is -- never by building the cartesian product and
        // counting it. This is a correctness rule, not a micro-optimisation: materialising first
        // means a request selecting five types of twenty values allocates 3.2 million PHP arrays
        // before discovering it is 16,000x over the limit.
        $attempted = array_product($sizes);

        if ($attempted > self::MAX_COMBINATIONS) {
            throw ValidationException::withMessages([
                'attributeTypeIds' => trans('products.variants.generate.too_many', [
                    'limit' => self::MAX_COMBINATIONS,
                    'attempted' => $attempted,
                ]),
            ]);
        }

        // Only now -- an $attempted already proven <= MAX_COMBINATIONS, and therefore the total
        // row count about to be hydrated below bounded to that same order of magnitude -- are the
        // real value rows read. D-G5's one query for the whole batch: N selected types cost one
        // read, not N.
        $valuesByType = ProductAttributeValue::query()
            ->whereIn('product_attribute_type_id', $productAttributeTypeIds)
            ->orderBy('position')
            ->orderBy('id')
            ->get()
            ->groupBy('product_attribute_type_id');

        /** @var list<Collection<int, ProductAttributeValue>> $valueSets */
        $valueSets = array_map(
            static fn (ProductAttributeType $type): Collection => $valuesByType->get($type->id, collect()),
            $types->all(),
        );

        // Only now -- an $attempted already proven <= MAX_COMBINATIONS -- is the cartesian
        // product actually materialised. Building it as [[]] and folding one value set at a time
        // makes the LAST type processed vary fastest, matching D-G6's SKU-order iteration
        // (38-Black, 38-White, 39-Black, ...).
        $combinations = [[]];

        foreach ($valueSets as $values) {
            $next = [];

            foreach ($combinations as $combination) {
                foreach ($values as $value) {
                    $next[] = [...$combination, $value];
                }
            }

            $combinations = $next;
        }

        return DB::transaction(function () use ($product, $types, $combinations): array {
            // D-G2: one query for the whole batch's existing combinations, never one per
            // candidate -- served as a covering scan by product_variants'
            // unique(product_id, combination_hash). This is a PRE-check, not a race guard: the
            // unique index remains the last word (see the catch below).
            $existingHashes = DB::table('product_variants')
                ->where('product_id', $product->id)
                ->pluck('combination_hash')
                ->all();

            // A plain O(1)-membership set, not a Collection -- flip()/has()/put() on a
            // Collection<int, string> infers a value type of int|string, which a boolean
            // membership flag does not satisfy without a cast that would only mask the type.
            $existingHashes = array_fill_keys($existingHashes, true);

            $created = collect();
            $skipped = [];
            $refused = [];

            foreach ($combinations as $combination) {
                $valueIds = array_map(static fn (ProductAttributeValue $value): string => $value->id, $combination);
                $label = $this->combinationLabel($types, $combination);
                $hash = ($this->hashVariantCombination)($valueIds);

                if (isset($existingHashes[$hash])) {
                    $skipped[] = ['value_ids' => $valueIds, 'label' => $label];

                    continue;
                }

                try {
                    $variant = ($this->createProductVariant)($product, $valueIds, $product->price, 0);
                    $created->push($variant);
                    $existingHashes[$hash] = true;
                } catch (ValidationException $e) {
                    if ($e->validator->errors()->has('combination')) {
                        // The race: lost between the pre-read above and CreateProductVariant's
                        // own lockForUpdate() insert check -- by now the combination genuinely
                        // exists, so this is a clean skip, never a refusal and never a 500.
                        $skipped[] = ['value_ids' => $valueIds, 'label' => $label];
                        $existingHashes[$hash] = true;

                        continue;
                    }

                    // D-G3: the SKU is derived exactly as for any other variant -- the same
                    // shared, dependency-free class CreateProductVariant itself uses, reused
                    // here (never re-implemented) purely to report what was attempted.
                    $sku = ($this->deriveVariantSku)(
                        $product->sku,
                        array_map(static fn (ProductAttributeValue $value): string => $value->value, $combination),
                    );

                    $refused[] = [
                        'value_ids' => $valueIds,
                        'label' => $label,
                        // Reported via the bare __invoke(), never checked() -- a combination
                        // whose derivation itself fails (empty segment / too long) still needs a
                        // string here for the report, and checked() would throw a SECOND time
                        // for a reason the 'message' field already names correctly.
                        'sku' => $sku,
                        'message' => $e->validator->errors()->first(),
                    ];
                }
            }

            return [
                'created' => $created,
                'skipped' => $skipped,
                'refused' => $refused,
                'attempted' => count($combinations),
            ];
            // attempts: 3 is SAFE here, unlike the UpdateProduct hazard errors-log.md records
            // (2026-09-04 entry): every mutable accumulator above ($existingHashes, $created,
            // $skipped, $refused) is created FRESH inside this closure, and $product/$types/
            // $combinations are only ever READ, never mutated, across the whole batch. A retried
            // attempt after a genuine deadlock therefore re-does real work from a clean read of
            // the database rather than replaying stale in-memory state. This is this epic's
            // single heaviest lock holder (R-G1), so it is also the site that benefits most from
            // surviving a transient 1213/1205 rather than 500ing the whole batch.
        }, attempts: 3);
    }

    /**
     * The human-readable label for one candidate combination, e.g. "Talla 38
     * / Color Black" -- matching App\Models\ProductVariant::label()'s
     * format, computed here from the value already in hand rather than from
     * a persisted variant's eager-loaded pivot (there is none yet for a
     * skipped or refused combination).
     *
     * @param  Collection<int, ProductAttributeType>  $types
     * @param  array<int, ProductAttributeValue>  $combination
     */
    private function combinationLabel(Collection $types, array $combination): string
    {
        $parts = [];

        foreach ($types as $index => $type) {
            $parts[] = trim($type->name.' '.$combination[$index]->value);
        }

        return implode(' / ', $parts);
    }
}
