<?php

namespace App\Enums;

/**
 * Well-known role names.
 *
 * The two cases are resolved through deliberately different mechanisms, per
 * case:
 *
 * - `SuperAdmin` supplies only the compiled-in *default* for
 *   `App\Models\Role::superAdminName()` (both the `config()` default and its
 *   `??` fallback) — the operator-configurable `auth.super_admin.role` key is
 *   the actual source of truth, and no guard, scope or policy compares a role
 *   row against this case directly.
 * - `Administrator` is the locked, uneditable identity itself — there is no
 *   config key for it and none may be added (see story 0008a's "locked-name
 *   decision"). `App\Models\Role::isAdministratorRole()` compares a role
 *   row's persisted name against this case's value directly.
 *
 * See docs/architecture/authorization.md, the "Which name counts as 'the
 * Super Admin role'" section of ai-spec/tasks/done/0008-super-admin-role-invariants.md,
 * and ai-spec/tasks/done/0008a-centralize-administrator-role-identification.md.
 */
enum RoleName: string
{
    case SuperAdmin = 'Super Admin';
    case Administrator = 'Administrator';
}
