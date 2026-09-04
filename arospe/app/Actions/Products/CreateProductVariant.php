<?php

namespace App\Actions\Products;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Concerns\ProductVariantValidationRules;
use App\Models\Product;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class CreateProductVariant
{
    use ProductVariantValidationRules;

    /**
     * Constructor injection, not method injection: __invoke()'s domain
     * arguments are this action's whole public signature, matched verbatim
     * by every direct-call test (D-17.1), so every dependency is resolved
     * from the container without widening it (code-style.md's
     * constructor-injection exception) -- including DeriveVariantSku and
     * HashVariantCombination, this action's own collaborators, rather than
     * an in-method app() call.
     */
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
        private readonly TranslateProductVariantUniqueViolation $translateProductVariantUniqueViolation,
        private readonly DeriveVariantSku $deriveVariantSku,
        private readonly HashVariantCombination $hashVariantCombination,
    ) {}

    /**
     * Create a new product variant as a combination of attribute values.
     *
     * D-12.1: authorizes `update` on the PARENT PRODUCT as the very first
     * statement -- before validation, before any transaction opens -- so a
     * future Artisan command, queued job or REST controller inherits the
     * same refusal a dashboard will get. `targetType`/`targetId` are
     * passed explicitly since LogRefusedPrivilegedAttempt::resolveTarget()
     * auto-resolves only User and Role instances.
     *
     * D-16.1: the combination array is validated in TWO sequential passes
     * (shape/bound alone, then the per-element rules), never one combined
     * rule array -- Laravel expands a `.*` wildcard against every
     * submitted element regardless of whether the parent attribute's own
     * rules already failed, so a single combined call would pay one
     * Rule::exists() query per submitted id before `max:10` is ever
     * consulted. The scalar fields are a third, separate pass so passes
     * 1/2 are never delayed behind them.
     *
     * @param  array<int, string>  $productAttributeValueIds  as submitted; re-read from the DB per V-10
     *
     * @throws ValidationException on attributeValueIds, combination or sku
     */
    public function __invoke(
        Product $product,
        array $productAttributeValueIds,
        string $price,
        int $stock,
        ?string $featuredMediaId = null,
    ): ProductVariant {
        $this->logRefusedPrivilegedAttempt->authorize(
            'update',
            $product,
            targetType: 'product',
            targetId: $product->id,
        );

        Validator::make(
            ['attributeValueIds' => $productAttributeValueIds],
            ['attributeValueIds' => $this->variantCombinationRules()],
        )->validate();

        // D-16.1 pass 2 collapses every per-element failure onto the single 'attributeValueIds'
        // bag key (D-15) -- Laravel's own wildcard validation would otherwise key each failure as
        // 'attributeValueIds.0', 'attributeValueIds.1', ..., which is not the contract D-15 fixes:
        // the input array as a whole is the subject of this rule, never one submitted index.
        $elementValidator = Validator::make(
            ['attributeValueIds' => $productAttributeValueIds],
            ['attributeValueIds.*' => $this->variantCombinationValueRules()],
        );

        if ($elementValidator->fails()) {
            throw ValidationException::withMessages([
                'attributeValueIds' => $elementValidator->errors()->first(),
            ]);
        }

        Validator::make(
            ['price' => $price, 'stock' => $stock, 'featuredMediaId' => $featuredMediaId],
            [
                'price' => $this->variantPriceRules(),
                'stock' => $this->variantStockRules(),
                'featuredMediaId' => $this->variantFeaturedMediaIdRules(),
            ],
        )->validate();

        return DB::transaction(function () use (
            $product,
            $productAttributeValueIds,
            $price,
            $stock,
            $featuredMediaId,
        ): ProductVariant {
            // V-10: the read-back doubles as the existence check -- ids are ALWAYS re-read from
            // the database, never taken from the payload, because utf8mb4_unicode_ci makes
            // Rule::exists() above case-insensitive: a submitted `V-40` validates against a
            // stored `v-40` and would otherwise hash/derive differently than what is stored.
            $rows = ProductAttributeValue::query()
                ->whereIn('id', $productAttributeValueIds)
                ->with('type')
                ->get();

            if ($rows->count() !== count(array_unique($productAttributeValueIds))) {
                throw ValidationException::withMessages([
                    'attributeValueIds' => trans('validation.exists', ['attribute' => 'attribute value']),
                ]);
            }

            // D-4.2: (type.position, type.id, value.position, value.id) -- never submission
            // order. Deliberately NOT the same order as the combination hash below (D-3 sorts
            // value ids as strings): the hash is a set key, the SKU an ordered rendering.
            $ordered = $rows->sortBy([
                fn (ProductAttributeValue $a, ProductAttributeValue $b): int => $a->type->position <=> $b->type->position,
                fn (ProductAttributeValue $a, ProductAttributeValue $b): int => $a->type->id <=> $b->type->id,
                fn (ProductAttributeValue $a, ProductAttributeValue $b): int => $a->position <=> $b->position,
                fn (ProductAttributeValue $a, ProductAttributeValue $b): int => $a->id <=> $b->id,
            ])->values();

            $orderedIds = $ordered->pluck('id')->all();
            $orderedValues = $ordered->pluck('value')->all();

            $combinationHash = ($this->hashVariantCombination)($orderedIds);

            // D-3: the application check runs first -- the unique index on
            // (product_id, combination_hash) below is the last-word race guard, not the
            // primary defence.
            $duplicateCombination = DB::table('product_variants')
                ->where('product_id', $product->id)
                ->where('combination_hash', $combinationHash)
                ->lockForUpdate()
                ->exists();

            if ($duplicateCombination) {
                throw ValidationException::withMessages([
                    'combination' => trans('products.variants.duplicate_combination'),
                ]);
            }

            // F-1/F-2: the empty-segment and MAX_LENGTH checks live in DeriveVariantSku::checked()
            // itself now, so every writer of product_variants.sku shares them -- see
            // docs/security/derived-column-invariants.md.
            $sku = $this->deriveVariantSku->checked($product->sku, $orderedValues);

            // D-4.5: ALWAYS this order -- products, then product_variants. A fixed lock order is
            // what prevents a 1213 deadlock when a product and a variant claim the same string
            // concurrently.
            $conflict = DB::table('products')->where('sku', $sku)->lockForUpdate()->value('id');

            if ($conflict === null) {
                $conflict = DB::table('product_variants')->where('sku', $sku)->lockForUpdate()->value('id');
            }

            if ($conflict !== null) {
                throw ValidationException::withMessages([
                    'sku' => trans('products.variants.derived_sku_taken', ['sku' => $sku]),
                ]);
            }

            $maxPosition = $product->variants()->max('position');
            $position = $maxPosition === null ? 0 : ((int) $maxPosition) + 1;

            try {
                // forceCreate(): combination_hash and sku are deliberately absent from
                // #[Fillable] (D-4.3) -- a literal whitelist, never a spread of validated input.
                $variant = ProductVariant::forceCreate([
                    'product_id' => $product->id,
                    'combination_hash' => $combinationHash,
                    'sku' => $sku,
                    'price' => $price,
                    'stock' => $stock,
                    'featured_media_id' => $featuredMediaId,
                    'position' => $position,
                ]);
            } catch (UniqueConstraintViolationException $e) {
                // R-F: product_variants carries two unique indexes (sku and
                // (product_id, combination_hash)) -- this is the race-guard catch for whichever
                // one a concurrent writer slipped past the checks above, disambiguated by the
                // violated index's own name via the shared translator (F-1/F-3), never assumed.
                throw ($this->translateProductVariantUniqueViolation)($e, $sku);
            }

            $variant->values()->attach($orderedIds);

            return $variant;
        }, attempts: 3);
    }
}
