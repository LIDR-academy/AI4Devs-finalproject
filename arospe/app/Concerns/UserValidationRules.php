<?php

namespace App\Concerns;

use App\Enums\UserStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait UserValidationRules
{
    /**
     * Get the validation rules used to validate a user's assigned role.
     *
     * The Super Admin role is excluded server-side, in the rule itself — not
     * merely omitted from the dropdown — so a forged submission cannot
     * assign it.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function roleRules(): array
    {
        return [
            'required',
            Rule::exists('roles', 'id')->where('guard_name', 'web')->whereNot('name', 'Super Admin'),
        ];
    }

    /**
     * Get the validation rules used to validate a user's status.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function statusRules(): array
    {
        return ['required', Rule::enum(UserStatus::class)];
    }
}
