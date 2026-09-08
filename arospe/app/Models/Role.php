<?php

namespace App\Models;

use App\Enums\RoleName;
use App\Exceptions\ImmutableRoleException;
use App\Exceptions\RoleInUseException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use RuntimeException;
use Spatie\Permission\Models\Role as SpatieRole;

/**
 * The application's role model -- the only role model class application code
 * may use outside `config/permission.php`'s `models.role` binding (enforced
 * by an arch() test; see tests/Unit/ArchitectureTest.php). Adds the Super
 * Admin role's invariants on top of the package's base Role: the shared
 * `selectable()` scope every roles list / role selector must use, and guards
 * that categorically refuse to delete, rename, or change the permission set
 * of the Super Admin role in any direction.
 *
 * See ai-spec/tasks/done/0008-super-admin-role-invariants.md for the
 * full mechanism and why each design decision below is shaped the way it is.
 *
 * @property bool $canEdit Not a column -- a per-row UI hint appended by
 *                         App\Livewire\Roles\Index::roles() (story 0011), Gate::allows('update',
 *                         $role). Present only on rows returned from that computed property; the
 *                         plain (not -read) annotation is deliberate, since roles() assigns it.
 * @property bool $canDelete Same as $canEdit above, for the delete ability.
 */
class Role extends SpatieRole
{
    /**
     * The Super Admin role's name -- the single source of truth every guard
     * below, the selectable() scope, RolePolicy and RolePermissionSeeder
     * resolve through, so none of them can drift from one another or from
     * AppServiceProvider::configureAuthorization()'s Gate::before bypass,
     * which reads the same config key. Both fallbacks are mandatory: the
     * config() default only substitutes for a *missing* key, while `??`
     * covers a key that is present but null (e.g. an unset env var feeding
     * the config value) -- see docs/security/authorization-patterns.md.
     *
     * Story 0009 Phase 4 finding F6 — the two protected tiers must never be
     * able to resolve to the same name. Unlike the Super Admin name, the
     * Administrator name is locked and has no config override, so the only
     * way they could ever collide is an operator misconfiguring
     * auth.super_admin.role to 'Administrator' (or a case variant of it --
     * compared case-insensitively here on purpose, wider than every other
     * comparison in this file, because this check exists to catch an
     * operator's typo before it becomes a live misconfiguration, not to
     * decide role identity). Nothing else in this codebase would catch it:
     * RolePolicy would stay fail-closed (its Super Admin branch runs
     * first), but Gate::before's bypass would then hand the unrestricted
     * bypass to every Administrator holder. Fail loudly rather than let
     * that configuration silently take effect.
     *
     * Called eagerly from AppServiceProvider::configureAuthorization() for
     * exactly this reason (Phase 5 review finding F-C): this method sits on
     * the hottest authorization path in the app (Gate::before runs it on
     * nearly every check), so leaving detection to whichever request
     * happens to trigger it first turns a deploy-time configuration mistake
     * into an arbitrary user's request failing with a stack trace pointing
     * at a policy rather than at the config key.
     *
     * @throws RuntimeException if auth.super_admin.role collides with the locked Administrator name.
     */
    public static function superAdminName(): string
    {
        $name = config('auth.super_admin.role', RoleName::SuperAdmin->value) ?? RoleName::SuperAdmin->value;

        throw_if(
            Str::lower($name) === Str::lower(RoleName::Administrator->value),
            RuntimeException::class,
            'auth.super_admin.role cannot be configured to "'.RoleName::Administrator->value.'" -- '.
            'that name is reserved for the locked, uneditable Administrator tier.',
        );

        return $name;
    }

    /**
     * The one sanctioned way to bring the Super Admin role into existence --
     * used by RolePermissionSeeder only. Every other creation path is
     * refused by the `creating` guard below, so no role-management screen
     * (or any other application code) can mint a role that inherits the
     * Gate::before bypass. Bypasses model events entirely (withoutEvents)
     * because this is the one legitimate case the `creating` guard must not
     * catch, and firstOrCreate() would otherwise fire it.
     *
     * Story 0008a's Phase 4 re-audit finding N3: `roles.name` carries a
     * case-INSENSITIVE collation, so firstOrCreate() below would silently
     * *adopt* a pre-existing row named e.g. "super admin" instead of
     * creating one named exactly superAdminName() -- and every identity
     * check in the app (isSuperAdminRoleRow(), the `Gate::before` bypass,
     * this class's own boot() guards) is a byte-exact PHP comparison, so
     * that adopted row would be treated as an ordinary, fully mutable role
     * while still being the literal row every operator-facing "who is
     * Super Admin" assumption points at. Fail loudly rather than seed that
     * fail-open state.
     */
    public static function firstOrCreateSuperAdminRole(): self
    {
        $role = static::withoutEvents(fn (): self => static::firstOrCreate(
            ['name' => self::superAdminName(), 'guard_name' => 'web'],
        ));

        throw_unless(
            $role->getRawOriginal('name') === self::superAdminName(),
            ImmutableRoleException::class,
            'A role named "'.$role->getRawOriginal('name').'" already exists and collides '.
            'case-insensitively with the Super Admin role name -- resolve the collision manually before reseeding.',
        );

        return $role;
    }

    /**
     * The one sanctioned way to bring the Administrator role into existence
     * -- used by RolePermissionSeeder only, the exact Administrator-tier
     * counterpart to firstOrCreateSuperAdminRole() above, added by story
     * 0010's Phase 4 security-audit fix for finding F1. Every other
     * creation path is refused by the `creating` guard in boot() below, so
     * no role-management screen (or any other application code) can create
     * a second row under this locked name. Bypasses model events via
     * withoutEvents() for the same reason the Super Admin method does: this
     * is the one legitimate case guardAgainstAssumingAdministratorName()
     * must not catch, and firstOrCreate() would otherwise fire it.
     *
     * Mirrors firstOrCreateSuperAdminRole()'s case-insensitive-collation
     * guard too: `roles.name` is `utf8mb4_unicode_ci`, so an unguarded
     * firstOrCreate() would silently *adopt* a pre-existing row named e.g.
     * "administrator" instead of creating one named exactly
     * RoleName::Administrator->value, and every identity check in this app
     * (isAdministratorRole(), UserPolicy's hasRole() calls) is a byte-exact
     * comparison that would then treat that adopted row as an ordinary,
     * fully mutable role while the seeder still hands it all 37
     * Administrator permissions.
     */
    public static function firstOrCreateAdministratorRole(): self
    {
        $role = static::withoutEvents(fn (): self => static::firstOrCreate(
            ['name' => RoleName::Administrator->value, 'guard_name' => 'web'],
        ));

        throw_unless(
            $role->getRawOriginal('name') === RoleName::Administrator->value,
            ImmutableRoleException::class,
            'A role named "'.$role->getRawOriginal('name').'" already exists and collides '.
            'case-insensitively with the Administrator role name -- resolve the collision manually before reseeding.',
        );

        return $role;
    }

    /**
     * Exclude the Super Admin role from a roles list / role selector query,
     * by exact name match (never a LIKE, so a role merely resembling the
     * name -- e.g. "Super Admin Assistant" -- stays visible). A local scope,
     * not a global one: a global scope would be inherited by
     * Role::findByName()/findById()/findOrCreate() and by User's roles()
     * relation (both go through static::query()), breaking the seeder,
     * assignRole('Super Admin'), the permission cache, and a Super Admin's
     * own hasRole() check.
     *
     * @param  Builder<Role>  $query
     * @return Builder<Role>
     */
    public function scopeSelectable(Builder $query): Builder
    {
        return $query->whereNot('name', self::superAdminName());
    }

    /**
     * Register the deleting/updating guards *before* calling parent::boot(),
     * so they run ahead of `HasPermissions::bootHasPermissions()`'s own
     * `deleting` listener -- registered inside parent::boot() ->
     * bootTraits(), i.e. strictly after this method's own registrations.
     * `fireModelEvent('deleting')` dispatches with `until`, in registration
     * order, and this guard *throws* rather than returning false: the thrown
     * exception halts the dispatch outright, so the package's listener --
     * which unconditionally detaches every role_has_permissions row AND
     * every model_has_roles row for the role -- never runs. Registering this
     * in booted() instead would let that detach complete before the guard
     * ever fired, since Model::delete() opens no transaction; the roles row
     * would survive while its permission/user assignments silently vanished.
     * See the story's boxed note on this exact vendor-ordering trap.
     *
     * `creating` and the post-mutation half of `updating` guard against a
     * *different* attack: a role acquiring the Super Admin name rather than
     * one already holding it being mutated (F3 of the 0008 re-audit) --
     * reachable via `Role::create(['name' => 'Super Admin', ...])` or a
     * rename *into* the name, either of which would silently inherit the
     * Gate::before bypass. `firstOrCreateSuperAdminRole()` above is the one
     * sanctioned exception, via `withoutEvents()`.
     *
     * Story 0010 adds two more `deleting` listeners on top of the Super
     * Admin one above -- `guardAgainstAdministratorDeletion()` (Phase 4
     * security audit finding F1, see below) and `guardAgainstHolders()`,
     * for an unrelated reason but with the identical ordering requirement:
     * every one of them must run -- and be registered -- before
     * `parent::boot()`'s `HasPermissions::bootHasPermissions()` `deleting`
     * listener, which unconditionally detaches every `role_has_permissions`
     * row for the role regardless of whether the delete itself is later
     * allowed to proceed. `fireModelEvent('deleting')` dispatches every
     * registered listener in registration order and halts on the first one
     * that returns `false` or throws, so as long as every one of this
     * class's own listeners is registered above the vendor one, a refused
     * delete never reaches the detach at all -- its permission grants stay
     * intact alongside the row.
     *
     * Story 0010's Phase 4 security audit (finding F1) added the
     * Administrator-tier guards below, deliberately narrower than the
     * Super Admin ones: only the *name* is locked and the row is never
     * deletable -- its permission set stays editable via
     * givePermissionTo()/syncPermissions()/revokePermissionTo(), which are
     * NOT overridden for this tier, because the whole point of
     * App\Actions\Roles\EnforceAdministratorPermissionGrant (story 0009) is
     * that a Super-Admin-authorized actor *can* change what Administrator
     * grants. Before this fix, nothing stopped a `roles.manage-administrators`
     * holder from renaming the seeded Administrator role -- which silently
     * demoted it to an ordinary role for every `isAdministratorRole()`
     * check in the app (UserPolicy, CreateUser, UpdateUser) -- or from
     * deleting it once it had no holders, both verified live during the
     * audit. See docs/security/authorization-patterns.md.
     */
    protected static function boot(): void
    {
        static::creating(function (self $role): void {
            $role->guardAgainstAssumingSuperAdminName();
            $role->guardAgainstAssumingAdministratorName();
        });

        static::deleting(function (self $role): void {
            $role->guardAgainstSuperAdminMutation();
        });

        static::deleting(function (self $role): void {
            $role->guardAgainstAdministratorDeletion();
        });

        static::deleting(function (self $role): void {
            $role->guardAgainstHolders();
        });

        static::updating(function (self $role): void {
            $role->guardAgainstSuperAdminMutation();       // pre-mutation name: refuses editing the role AS IT IS today
            $role->guardAgainstAssumingSuperAdminName();    // post-mutation name: refuses renaming INTO the role's name
            $role->guardAgainstRenamingAdministrator();     // pre-mutation name: refuses renaming the role AS IT IS today
            $role->guardAgainstAssumingAdministratorName(); // post-mutation name: refuses renaming INTO the role's name
        });

        parent::boot();
    }

    /**
     * {@inheritDoc}
     *
     * Overridden because `HasPermissions::givePermissionTo()` mutates the
     * `role_has_permissions` pivot directly (attach/sync), firing no
     * updating/saving model event the boot() guard above could intercept.
     * Blocked in every direction, additions included (human decision Q2):
     * the Super Admin role bypasses permission checks entirely via
     * Gate::before, so granting it a permission is inert but still
     * categorically refused rather than silently allowed.
     *
     * @param  mixed  ...$permissions
     */
    public function givePermissionTo(...$permissions): static
    {
        $this->guardAgainstSuperAdminMutation();

        return parent::givePermissionTo(...$permissions);
    }

    /**
     * {@inheritDoc}
     *
     * See givePermissionTo() above -- same pivot-mutation bypass of model
     * events.
     *
     * @param  mixed  ...$permissions
     */
    public function syncPermissions(...$permissions): static
    {
        $this->guardAgainstSuperAdminMutation();

        return parent::syncPermissions(...$permissions);
    }

    /**
     * {@inheritDoc}
     *
     * See givePermissionTo() above -- same pivot-mutation bypass of model
     * events.
     *
     * @param  mixed  $permission
     */
    public function revokePermissionTo($permission): static
    {
        $this->guardAgainstSuperAdminMutation();

        return parent::revokePermissionTo($permission);
    }

    /**
     * Throw when this role *was* the Super Admin role before whatever
     * mutation is in flight -- the single check every guard above calls, so
     * "is this the Super Admin role?" is answered in exactly one place and
     * always via superAdminName().
     */
    private function guardAgainstSuperAdminMutation(): void
    {
        if ($this->isSuperAdminRole()) {
            throw new ImmutableRoleException('The Super Admin role cannot be modified.');
        }
    }

    /**
     * Throw when this role still has holders -- the model-event layer behind
     * App\Livewire\Roles\Index::deleteRole()'s own holder-count check
     * (story 0010), so a direct `$role->delete()` bypassing the component
     * entirely is refused here too. Reads `users()->exists()` fresh rather
     * than a cached `users` relation or a `withCount('users')` attribute,
     * for the same reason `persistedName()` below never trusts an in-memory
     * value for an identity check: a caller's hydration state is not this
     * guard's source of truth for whether the role is still in use.
     */
    private function guardAgainstHolders(): void
    {
        // withTrashed(): a soft-deleted holder still counts. The morph
        // relation otherwise applies User's SoftDeletingScope, so a trashed
        // holder would silently count as zero, this guard would let the
        // delete through, and the FK cascade on model_has_roles would then
        // destroy that holder's role grant with no error anywhere -- story
        // 0010 Phase 4 security audit finding F3, verified live. Larastan
        // cannot resolve this: withTrashed() is a local scope Eloquent
        // forwards to the related User model's query builder via __call().
        // @phpstan-ignore method.notFound
        if ($this->users()->withTrashed()->exists()) {
            throw new RoleInUseException('This role cannot be deleted while it still has holders.');
        }
    }

    /**
     * Throw when this role still IS the Administrator role and the delete
     * would remove it -- story 0010 Phase 4 security audit finding F1,
     * human-confirmed decision: the Administrator role is never deletable,
     * the same as the Super Admin role, since it is the base of the
     * permission catalog and re-creating it manually (exact name, guard,
     * 37 permissions) is error-prone. Deliberately its own guard rather
     * than folded into guardAgainstSuperAdminMutation(): that guard also
     * blocks every permission-pivot mutation, which must stay allowed for
     * Administrator (see this class's boot() docblock).
     */
    private function guardAgainstAdministratorDeletion(): void
    {
        if (self::isAdministratorRole($this)) {
            throw new ImmutableRoleException('The Administrator role cannot be deleted.');
        }
    }

    /**
     * Throw when this role still IS the Administrator role (by its
     * PERSISTED, pre-mutation name -- isAdministratorRole() already reads
     * persistedName() internally) and the name is the attribute being
     * changed. Scoped to `isDirty('name')`, unlike the Super Admin
     * mutation guard, because Administrator's permission set legitimately
     * changes via story 0009's action -- only the name is locked here.
     */
    private function guardAgainstRenamingAdministrator(): void
    {
        if (self::isAdministratorRole($this) && $this->isDirty('name')) {
            throw new ImmutableRoleException('The Administrator role cannot be renamed.');
        }
    }

    /**
     * Throw when this role's *current, in-memory* name is the Super Admin
     * name -- the `creating` guard (a role has no "original" to compare
     * against yet) and the post-mutation half of the `updating` guard (a
     * rename INTO the name, as opposed to a mutation of the role that
     * already holds it).
     */
    private function guardAgainstAssumingSuperAdminName(): void
    {
        if ($this->getAttribute('name') === self::superAdminName()) {
            throw new ImmutableRoleException('A role cannot be named or renamed to the Super Admin role.');
        }
    }

    /**
     * Throw when this role's *current, in-memory* name is the Administrator
     * name -- the Administrator-tier counterpart to
     * guardAgainstAssumingSuperAdminName() above, for the same two call
     * sites. Mostly defense in depth: the composite unique(['name',
     * 'guard_name']) index already refuses a duplicate while the seeded row
     * exists, and guardAgainstAdministratorDeletion() now means that row
     * never stops existing -- but this turns what would otherwise be a raw
     * 23000 constraint violation into a deliberate, typed refusal, matching
     * the Super Admin tier's own defense-in-depth guard.
     */
    private function guardAgainstAssumingAdministratorName(): void
    {
        if ($this->getAttribute('name') === RoleName::Administrator->value) {
            throw new ImmutableRoleException('A role cannot be named or renamed to the Administrator role.');
        }
    }

    /**
     * Whether this instance -- as it existed before whatever mutation is in
     * flight -- is the Super Admin role. Delegates to the public,
     * row-shaped isSuperAdminRoleRow() below so there is one implementation
     * of the comparison, not two.
     */
    private function isSuperAdminRole(): bool
    {
        return self::isSuperAdminRoleRow($this);
    }

    /**
     * Whether the given role row is the configured Super Admin role, by
     * exact comparison against its PERSISTED name -- the row-shaped
     * counterpart to isAdministratorRole() below, for a caller (story
     * 0008a's user-management actions) that holds a Role instance rather
     * than being one of this model's own boot() guards. Story 0008a's
     * appsec-auditor Phase 4 finding F1: assigning the Super Admin role
     * through App\Actions\Users\CreateUser / UpdateUser was completely
     * ungated, because isAdministratorRole() correctly answers false for
     * it (the two tiers are not aliased) and nothing else in either action
     * checked the Super Admin tier at all. Both actions call this to
     * refuse that assignment outright, symmetrically with how they consult
     * isAdministratorRole() for the other tier.
     */
    public static function isSuperAdminRoleRow(self $role): bool
    {
        return $role->persistedName() === self::superAdminName();
    }

    /**
     * Whether the given role row is the seeded Administrator role, by exact,
     * case-sensitive comparison against its PERSISTED name -- never LIKE,
     * never case-insensitive, never a "contains" match. Unlike
     * superAdminName(), there is no config key here: the Administrator
     * tier's name is locked and uneditable (story 0008a's "locked-name
     * decision"), so RoleName::Administrator->value *is* the source of
     * truth and comparing against it directly is correct.
     *
     * public static, not a private policy-local helper: this is the single
     * shared implementation every Administrator-tier call site (UserPolicy,
     * the user-management actions, and RolePolicy from story 0009) must
     * consume rather than re-derive.
     *
     * Reads persisted identity via persistedName(), for the same reason
     * isSuperAdminRole() does: a partially-hydrated instance
     * (Role::query()->select('id')->find($id)) must not silently answer
     * false because `name` was never selected, and a role renamed in memory
     * but not yet saved must still answer by what is actually persisted.
     *
     * Deliberately guard-agnostic (matches on `name` only, not
     * `guard_name`): a row is typically resolved unscoped
     * (`Role::query()->find($id)`, with no `where('guard_name', ...)`), and
     * that is fail-closed in both directions -- a foreign-guard match only
     * makes this check *stricter* (demanding an ability the caller may not
     * hold), while Spatie's own cross-guard assignment guard
     * (`ensureModelSharesGuard()`) refuses granting a role on a foreign
     * guard to a `web` user regardless, so nothing is ever actually
     * assigned. See docs/architecture/authorization.md's "Known
     * limitations" section.
     */
    public static function isAdministratorRole(self $role): bool
    {
        return $role->persistedName() === RoleName::Administrator->value;
    }

    /**
     * This instance's *persisted* name -- as it existed before whatever
     * mutation is in flight, or the in-memory attribute for a not-yet-
     * persisted instance.
     *
     * Deliberately never $this->getAttribute('name') for an existing row: by
     * the time an `updating` event fires, Eloquent has already staged the
     * new value onto the in-memory attribute (fill() runs before the
     * event), so a rename mutation would otherwise read its own *new*,
     * attacker-supplied name and silently miss itself -- this is exactly
     * what Phase 4 re-audit finding R1 caught: the earlier `??` version fell
     * back to getAttribute('name') whenever getOriginal('name') was absent,
     * and on a partially-hydrated instance mid-rename that attribute holds
     * the *new* name, which is non-null and so short-circuited the `??`
     * before the database read-back (added for exactly this "unhydrated"
     * case) ever ran.
     *
     * So: when the row exists, read getOriginal('name') only if the column
     * was actually hydrated (array_key_exists, not `??` -- "never selected"
     * and "selected but null" are different states `??` cannot tell apart),
     * otherwise read the persisted name back from the database. The
     * in-memory attribute is never consulted for an existing row's identity.
     * Only for a not-yet-persisted instance (the `creating` guard has no
     * "original" to compare against) does this fall through to the
     * attribute -- guardAgainstAssumingSuperAdminName() is the one that
     * actually needs that case, via a *different* method that deliberately
     * keeps reading the in-memory/incoming attribute, since its whole job is
     * checking what name is being written. Do not merge the two: they read
     * from different sources for different reasons.
     */
    private function persistedName(): ?string
    {
        if ($this->exists && $this->getKey() !== null) {
            return array_key_exists('name', $this->getOriginal())
                ? $this->getOriginal('name')
                : static::query()->whereKey($this->getKey())->value('name');
        }

        return $this->getAttribute('name');
    }

    /**
     * {@inheritDoc}
     *
     * Overridden because `HasAssignedModels::assignToModels()` mutates the
     * Super-Admin-role side of the polymorphic model_has_roles pivot
     * directly, firing no model event the boot() guards above could
     * intercept. Left unguarded, this would let a role administrator grant
     * the Super Admin role to an arbitrary user from the role side --
     * exactly the escalation `UserValidationRules::roleRules()` exists to
     * block from the user side. The seeder assigns the role via
     * `$user->assignRole(...)`, which is unaffected by this override.
     *
     * @param  array<int, Model|int|string>|Collection<int, Model|int|string>|Model|int|string  $models
     */
    public function assignToModels(array|Collection|Model|int|string $models, ?string $modelClass = null): static
    {
        $this->guardAgainstSuperAdminMutation();

        return parent::assignToModels($models, $modelClass);
    }

    /**
     * {@inheritDoc}
     *
     * See assignToModels() above -- same pivot-mutation bypass of model
     * events.
     *
     * @param  array<int, Model|int|string>|Collection<int, Model|int|string>|Model|int|string  $models
     */
    public function removeFromModels(array|Collection|Model|int|string $models, ?string $modelClass = null): static
    {
        $this->guardAgainstSuperAdminMutation();

        return parent::removeFromModels($models, $modelClass);
    }

    /**
     * {@inheritDoc}
     *
     * See assignToModels() above -- same pivot-mutation bypass of model
     * events. `syncModels([])` in particular would strip every Super Admin
     * holder in one call, an irrecoverable lockout since Gate::before is the
     * only route to unrestricted access.
     *
     * @param  array<int, Model|int|string>|Collection<int, Model|int|string>|Model|int|string  $models
     */
    public function syncModels(array|Collection|Model|int|string $models, ?string $modelClass = null): static
    {
        $this->guardAgainstSuperAdminMutation();

        return parent::syncModels($models, $modelClass);
    }
}
