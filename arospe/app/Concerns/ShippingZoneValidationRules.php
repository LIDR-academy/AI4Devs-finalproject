<?php

namespace App\Concerns;

use App\Actions\NormalizeForSearch;
use App\Models\GeographyEntry;
use App\Models\ShippingZone;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Following naming.md's <Noun>ValidationRules / <noun>Rules() convention.
 *
 * The name method is `shippingZoneNameRules()`, NOT `nameRules()` --
 * ProfileValidationRules::nameRules() already exists and
 * ProductCategoryValidationRules also declares its own nameRules(); traits in
 * app/Concerns/ are composed flat at the consumer, so a third same-named
 * trait method would be a fatal error the moment two of them are composed
 * onto one class.
 */
trait ShippingZoneValidationRules
{
    /**
     * Upper bound on how many geography catalog entry ids one shipping
     * zone may reference in a single save -- used both in the `max:` rule
     * string below AND to bound the closure's own work (Phase 4 audit
     * finding F-2), so the two can never drift apart.
     */
    public const MAX_GEOGRAPHY_ENTRIES = 500;

    /**
     * Upper bound on a zone's name length -- used in the `max:` rule string
     * below. PHP does not allow a migration to reference a TRAIT constant
     * directly (only via a concrete class that composes the trait), so
     * database/migrations/2026_09_07_090000_create_shipping_zones_table.php's
     * `string('name', 150)` column length stays a literal, cross-referenced
     * by a comment pointing back at this constant rather than importing it
     * -- the two are still meant to move together (Phase 5 code review
     * finding F-5).
     */
    public const MAX_NAME_LENGTH = 150;

    /**
     * Get the validation rules used to validate a shipping zone name.
     *
     * D-6: enforced exactly as 0023's D-4 enforces product category names --
     * a normalised PHP comparison is the authoritative rule, with the
     * UNIQUE(name) index as the last-word race guard behind it. D-12: the
     * normaliser is the project's centralized text-normalizer utility,
     * injected as a parameter (never resolved internally), matching
     * ProductCategoryValidationRules::nameRules()'s own signature shape.
     *
     * @return array<int, ValidationRule|Closure|array<mixed>|string>
     */
    protected function shippingZoneNameRules(NormalizeForSearch $normalizer, ?string $id = null): array
    {
        return [
            'required',
            'string',
            'max:'.self::MAX_NAME_LENGTH,
            // A closure-based rule, deliberately not a bare Rule::unique()
            // (D-6/D-12): a bare Rule::unique() compiles to `WHERE name = ?`
            // and hands the case/accent decision to the connection's
            // utf8mb4_unicode_ci collation. This rule instead normalises the
            // candidate and every OTHER existing zone's name through the
            // SAME injected NormalizeForSearch instance and compares those
            // normalised forms directly, so a case-only or accent-only
            // duplicate is refused here -- cleanly, on the `name` field --
            // before the database's own UNIQUE(name) index is ever asked.
            $this->uniqueNormalisedShippingZoneName($normalizer, $id),
        ];
    }

    /**
     * $id excludes that row from the comparison, which is what makes saving
     * a zone under its own unchanged name succeed (R-2).
     */
    protected function uniqueNormalisedShippingZoneName(NormalizeForSearch $normalizer, ?string $id = null): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) use ($normalizer, $id): void {
            $normalisedCandidate = $normalizer((string) $value);

            $existingNames = ShippingZone::query()
                ->when($id !== null, fn ($query) => $query->whereKeyNot($id))
                ->pluck('name');

            foreach ($existingNames as $existingName) {
                if ($normalizer($existingName) === $normalisedCandidate) {
                    $fail(trans('validation.unique', ['attribute' => $attribute]));

                    return;
                }
            }
        };
    }

    /**
     * Get the validation rules used to validate a submitted array of
     * geography catalog entry ids (any level -- country, comunidad autónoma
     * or municipio; D-3/D-5).
     *
     * DELIBERATE DIVERGENCE from docs/security/array-validation-bounds.md's
     * two-pass `max:` + `.*` shape used by 0026/0027/0028
     * (salesRegionIdsRules()/salesRegionIdRules(), productGalleryMediaIdsRules()):
     * those traits validate the array's own bound in one pass and then run a
     * PER-ELEMENT `Rule::exists()` in a second pass, which issues one SELECT
     * per submitted id. This story deliberately uses a SINGLE closure
     * instead, doing one `whereKey($ids)->count()` query for the WHOLE
     * array. This is a documented choice (see the task file's Phase 2
     * correction), not an oversight -- flagged here so a future security
     * audit does not re-raise it as one.
     *
     * Corrected at Phase 4 security audit (finding F-2): this docblock
     * previously claimed "both shapes are bounded by the same `max:500`
     * guard against an unbounded-array vector" -- that was FALSE until this
     * fix landed. Laravel runs every rule in the array regardless of
     * whether an earlier sibling (here, `max:`) already failed -- there is
     * no `bail` -- so the closure below used to run its own
     * `whereKey($ids)->count()` query against the WHOLE submitted array
     * even when it vastly exceeded MAX_GEOGRAPHY_ENTRIES, an unbounded
     * IN(...) list vector matching the pattern
     * docs/security/array-validation-bounds.md documents. The closure now
     * `array_slice()`s to MAX_GEOGRAPHY_ENTRIES itself, before the exists
     * query ever runs, so the two are genuinely bounded by the SAME
     * constant rather than by two independent literals that could drift.
     *
     * @return array<int, ValidationRule|Closure|array<mixed>|string>
     */
    protected function geographyEntryIdsRules(): array
    {
        return [
            // 'present', not 'required': an empty array is legal (D-5).
            'present',
            'array',
            // Bounded so a forged payload cannot turn one save into an
            // unbounded query. A whole country is ONE row, so 500 is far
            // above any legitimate zone.
            'max:'.self::MAX_GEOGRAPHY_ENTRIES,
            // ONE query for the whole array -- see this method's docblock
            // for why this deliberately diverges from the project's usual
            // two-pass max:+.* shape. No ->where('level', ...): entries at
            // ANY level are valid (D-3).
            function (string $attribute, mixed $value, Closure $fail): void {
                // Bounded to MAX_GEOGRAPHY_ENTRIES BEFORE the exists query
                // runs, independently of whether the `max:` rule above has
                // already failed (Phase 4 audit finding F-2) -- see this
                // method's own docblock.
                $candidates = array_slice((array) $value, 0, self::MAX_GEOGRAPHY_ENTRIES);

                // Reject anything that is not integer-shaped BEFORE casting
                // (Phase 4 audit finding F-3): array_map(intval(...), ...)
                // on a numeric string exceeding PHP_INT_MAX raises an
                // E_WARNING ("... is not representable as an int, cast
                // occurred"), which this app's error handler converts into
                // an uncaught ErrorException -- a 500, not a clean
                // validation refusal. is_int() covers the ordinary case; a
                // numeric STRING is accepted only when ctype_digit() and
                // within PHP_INT_MAX's own digit length, so an
                // out-of-range numeric string fails the rule instead of
                // ever reaching intval().
                $integerShaped = array_filter(
                    $candidates,
                    fn (mixed $id): bool => is_int($id)
                        || (is_string($id) && $id !== '' && ctype_digit($id) && self::isWithinPhpIntRange($id)),
                );

                if (count($integerShaped) !== count($candidates)) {
                    $fail(trans('validation.exists', ['attribute' => $attribute]));

                    return;
                }

                $ids = array_values(array_unique(array_map(intval(...), $integerShaped)));

                if (GeographyEntry::whereKey($ids)->count() !== count($ids)) {
                    $fail(trans('validation.exists', ['attribute' => $attribute]));
                }
            },
        ];
    }

    /**
     * Whether a digit-only string is safely castable to `int` without
     * PHP's own overflow-to-float coercion (Phase 4 audit finding F-3).
     * Compared by digit-string LENGTH first, and only falls back to a
     * same-length string comparison (safe here, since both operands are
     * pure-digit strings of identical length, which compares identically
     * whether PHP treats it as a string or a numeric comparison) --
     * deliberately never a numeric `<=` comparison against a value that
     * could itself already be too large to represent as an int or a
     * precise float.
     */
    private static function isWithinPhpIntRange(string $digits): bool
    {
        $maxDigits = (string) PHP_INT_MAX;

        if (strlen($digits) !== strlen($maxDigits)) {
            return strlen($digits) < strlen($maxDigits);
        }

        return $digits <= $maxDigits;
    }
}
