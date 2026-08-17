<?php

namespace App\Models;

use App\Enums\RoleName;
use App\Exceptions\ImmutableRoleException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
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
     */
    public static function superAdminName(): string
    {
        return config('auth.super_admin.role', RoleName::SuperAdmin->value) ?? RoleName::SuperAdmin->value;
    }

    /**
     * The one sanctioned way to bring the Super Admin role into existence --
     * used by RolePermissionSeeder only. Every other creation path is
     * refused by the `creating` guard below, so no role-management screen
     * (or any other application code) can mint a role that inherits the
     * Gate::before bypass. Bypasses model events entirely (withoutEvents)
     * because this is the one legitimate case the `creating` guard must not
     * catch, and firstOrCreate() would otherwise fire it.
     */
    public static function firstOrCreateSuperAdminRole(): self
    {
        return static::withoutEvents(fn (): self => static::firstOrCreate(
            ['name' => self::superAdminName(), 'guard_name' => 'web'],
        ));
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
     */
    protected static function boot(): void
    {
        static::creating(function (self $role): void {
            $role->guardAgainstAssumingSuperAdminName();
        });

        static::deleting(function (self $role): void {
            $role->guardAgainstSuperAdminMutation();
        });

        static::updating(function (self $role): void {
            $role->guardAgainstSuperAdminMutation();      // pre-mutation name: refuses editing the role AS IT IS today
            $role->guardAgainstAssumingSuperAdminName();   // post-mutation name: refuses renaming INTO the role's name
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
     * Whether this instance -- as it existed before whatever mutation is in
     * flight -- is the Super Admin role.
     *
     * Persisted identity only, deliberately never $this->getAttribute('name'):
     * by the time the `updating` event fires, Eloquent has already staged the
     * new value onto the in-memory attribute (fill() runs before the event),
     * so a rename mutation would otherwise read its own *new*,
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
    private function isSuperAdminRole(): bool
    {
        if ($this->exists && $this->getKey() !== null) {
            $name = array_key_exists('name', $this->getOriginal())
                ? $this->getOriginal('name')
                : static::query()->whereKey($this->getKey())->value('name');
        } else {
            $name = $this->getAttribute('name');
        }

        return $name === self::superAdminName();
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
