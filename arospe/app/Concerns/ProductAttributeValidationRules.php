<?php

namespace App\Concerns;

use App\Models\ProductAttributeType;
use Illuminate\Validation\Rule;

/**
 * Validation rules for the product variant attribute taxonomy (story 0028).
 *
 * Unlike App\Concerns\ProductCategoryValidationRules, attributeTypeNameRules()
 * relies on a bare Rule::unique() rather than a NormalizeForSearch-based
 * closure (D3): this project's connection collation, utf8mb4_unicode_ci, is
 * already case- AND accent-insensitive, which is the behaviour a taxonomy
 * wants for free. What the collation does NOT collapse is surrounding/
 * internal whitespace runs, so the caller (App\Livewire\Products\
 * AttributeTypes\Index::save()) MUST apply Str::squish() to the submitted
 * name and to every submitted value before validate() runs -- see D3. If
 * normalisation happened only inside an action, after validation had
 * already run, "Size " would slip past an existing "Size".
 */
trait ProductAttributeValidationRules
{
    /**
     * Get the validation rules used to validate an attribute type name.
     *
     * $typeId comes from a #[Locked] property -- see
     * docs/security/livewire-authorization.md -- so it is server-
     * authoritative and cannot be forged to make ->ignore() skip a
     * different row.
     *
     * @return array<int, mixed>
     */
    protected function attributeTypeNameRules(?string $typeId = null): array
    {
        return [
            'required', 'string', 'max:100',
            Rule::unique(ProductAttributeType::class, 'name')->ignore($typeId),
        ];
    }

    /**
     * Get the validation rules used to validate the value list as a whole
     * (its own presence/shape, not each individual value's text).
     *
     * Deliberately carries no min:1 (Q2a, adopted at Phase 2): a type with
     * zero values is legal and inert, matching story 0010's "a role with
     * zero permissions is a legal, inert state" precedent. The caller
     * applies this rule set only when the submitted array is non-empty --
     * `required` on an empty PHP array always fails in Laravel, so applying
     * it unconditionally would make a legal zero-value submission
     * unsatisfiable.
     *
     * @return array<int, mixed>
     */
    protected function attributeValueListRules(): array
    {
        return ['required', 'array', 'max:100'];
    }

    /**
     * Get the validation rules used to validate a single submitted value
     * ROW's own shape (applied as 'values.*').
     *
     * Without this, a forged `values` payload carrying a scalar where a row
     * is expected reaches PHP's own type system rather than the validator --
     * an unhandled TypeError (a 500), not a validation error. Story 0028's
     * Phase 4 audit reproduced exactly that.
     *
     * @return array<int, mixed>
     */
    protected function attributeValueRowRules(): array
    {
        return ['array'];
    }

    /**
     * Get the validation rules used to validate a single submitted value's
     * client-supplied id (applied per-row, e.g. as 'values.*.id').
     *
     * The id is deliberately client-writable (D4 step 2 re-scopes it against
     * a fresh DB read rather than trusting it), but it must still be a
     * *string* id or null: without `string`, a forged array id reaches
     * SyncProductAttributeValues' array_key_exists() lookup and raises an
     * unhandled TypeError rather than a validation error (story 0028's
     * Phase 4 audit, reproduced by execution). `uuid` is not asserted here
     * on purpose -- a non-owned id of any shape is a legal "treat this as a
     * new row" submission under D4, so only the *type* is constrained.
     *
     * @return array<int, mixed>
     */
    protected function attributeValueIdRules(): array
    {
        return ['nullable', 'string'];
    }

    /**
     * Get the validation rules used to validate a single submitted value's
     * text (applied per-row, e.g. as 'values.*.value').
     *
     * distinct:ignore_case enforces per-type uniqueness WITHIN the
     * submission -- sufficient because the submission is the complete
     * intended state (D4: anything not submitted is being deleted, so no
     * persisted row survives to collide with it). Deliberately carries no
     * Rule::unique instance: a per-row scoped Rule::unique()->where(...)
     * ->ignore($valueId) was considered and rejected (D4 step 2 / R-2),
     * because $valueId is client-writable and would hand ->ignore() a
     * forged value. The composite UNIQUE(product_attribute_type_id, value)
     * index is the database's last word, and
     * App\Actions\Products\SyncProductAttributeValues catches its
     * QueryException SQLSTATE 23000 and rethrows it as a
     * ValidationException.
     *
     * @return array<int, mixed>
     */
    protected function attributeValueRules(): array
    {
        return ['required', 'string', 'max:100', 'distinct:ignore_case'];
    }
}
