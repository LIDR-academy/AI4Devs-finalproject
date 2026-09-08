<?php

namespace App\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

/**
 * Shared validation rules for the Sales Regions area (story 0017), consumed
 * by App\Livewire\SalesRegions\Index.
 */
trait SalesRegionValidationRules
{
    /**
     * Get the validation rules used to validate a Sales Region entry's tax
     * rate.
     *
     * `numeric` is deliberately absent — `decimal:0,3` already implies it
     * (`Validator::validateDecimal()` calls `validateNumeric()` as its first
     * line) and its own regex has no `e`/`E` branch, so scientific notation
     * is rejected without a separate rule. `Decimal`'s membership in
     * `Validator::$numericRules` is also what keeps `min`/`max` comparing
     * numerically rather than by string length — dropping `decimal` would
     * silently turn both into character-count rules. `0,3` caps precision at
     * the column's `decimal(6,3)`, and `max:100` keeps a typo'd rate from
     * overflowing it into a raw SQLSTATE (D5).
     *
     * `NULL` stays reachable: clearing a rate back to "unconfigured" is
     * supported, and `0.000` is a legitimate 0% rate distinct from it (D6).
     * `nullable` does not rewrite `''` to `null` — the component converts
     * explicitly before handing the value to the action.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function rateRules(): array
    {
        return ['nullable', 'decimal:0,3', 'min:0', 'max:100'];
    }

    /**
     * Get the validation rules used to validate a Sales Region entry's
     * display/fiscal code.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function codeRules(): array
    {
        return ['nullable', 'string', 'max:10'];
    }

    /**
     * Get the validation rules used to validate a Sales Region entry's
     * description.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function descriptionRules(): array
    {
        return ['nullable', 'string', 'max:255'];
    }

    /**
     * Get the validation rules used to validate a replacement default entry
     * id, submitted when disabling the current default (D3) or naming a new
     * default directly.
     *
     * The `is_active` condition is part of the MATCH, not a follow-up `if` —
     * an inactive entry is never a valid replacement at all (D10), the same
     * shape RolePermissionSeeder's `whereNotNull('email_verified_at')`
     * lookup uses for the same reason. This rule alone is not the
     * enforcement: SetDefaultSalesRegion / SetSalesRegionActive re-check the
     * replacement's `is_active` inside their own transactions, since this
     * rule only runs on the component path.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function replacementDefaultRules(): array
    {
        return ['nullable', Rule::exists('sales_regions', 'id')->where('is_active', true)];
    }
}
