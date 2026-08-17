<?php

namespace App\Enums;

/**
 * Well-known role names.
 *
 * This is the one place the Super Admin role's literal name is written — it
 * supplies only the compiled-in default for `App\Models\Role::superAdminName()`
 * (both the `config()` default and its `??` fallback); no guard, scope or
 * policy compares a role row against this enum directly. See
 * docs/architecture/authorization.md and the "Which name counts as 'the
 * Super Admin role'" section of ai-spec/tasks/done/0008-super-admin-role-invariants.md.
 */
enum RoleName: string
{
    case SuperAdmin = 'Super Admin';
}
