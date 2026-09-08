<?php

namespace App\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait RoleValidationRules
{
    /**
     * Get the validation rules used to validate a role's name.
     *
     * Guard-scoped (`where('guard_name', 'web')`) rather than a bare
     * `Rule::unique('roles', 'name')`, matching the real
     * `unique(['name', 'guard_name'])` composite index (see
     * docs/database/schema.md) rather than being stricter than it -- a name
     * already taken on another guard must not collide. `ignore($roleId)` is
     * `null` on create, which Rule::unique() already treats as "ignore
     * nothing" -- no separate branch needed. `roles.name` carries a
     * case-insensitive collation (utf8mb4_unicode_ci), so this rule alone
     * also rejects a case-only duplicate; the caller is still responsible
     * for trimming the submitted name before validation runs, since a
     * Livewire property update never passes through the `TrimStrings`
     * middleware the way a normal HTTP request body does.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function roleNameRules(?int $roleId = null): array
    {
        return [
            'required',
            'string',
            'max:255',
            Rule::unique('roles', 'name')->where('guard_name', 'web')->ignore($roleId),
        ];
    }

    /**
     * Get the validation rules used to validate the submitted permission id
     * list -- both the array itself and each of its elements, spread
     * directly into validate() the same way ProfileValidationRules::
     * profileRules() is (field-keyed, not a single field's rule array).
     *
     * Guard-scoped for the same reason as roleNameRules() above: a
     * `permissions` row belonging to a non-`web` guard must never reach
     * `Role::syncPermissions()` through this form.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function rolePermissionRules(): array
    {
        return [
            'selectedPermissionIds' => ['array'],
            'selectedPermissionIds.*' => ['integer', Rule::exists('permissions', 'id')->where('guard_name', 'web')],
        ];
    }
}
