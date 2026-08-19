<?php

namespace Database\Seeders;

use App\Enums\RoleName;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use RuntimeException;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Throwable;

class RolePermissionSeeder extends Seeder
{
    /**
     * The nine PRD modules gated by the module x action permission grid.
     *
     * @var array<int, string>
     */
    public const MODULES = [
        'users', 'products', 'sales-regions', 'shipping', 'payment-methods',
        'customers', 'orders', 'blog', 'store-languages',
    ];

    /**
     * The CRUD actions applied to every module in MODULES.
     *
     * @var array<int, string>
     */
    public const ACTIONS = ['view', 'create', 'edit', 'delete'];

    /**
     * Non-CRUD permissions that sit outside the module x action grid.
     *
     * @var array<int, string>
     */
    public const ROLE_PERMISSIONS = ['roles.manage', 'roles.manage-administrators'];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $provisionedEmail = DB::transaction(function (): ?string {
            // firstOrCreateSuperAdminRole() is the one sanctioned way to bring this role into
            // existence -- it bypasses the `creating` guard (App\Models\Role::boot()) that
            // otherwise refuses any role acquiring the Super Admin name (story 0008 F3).
            $superAdminRole = Role::firstOrCreateSuperAdminRole();

            $administratorRole = Role::firstOrCreate(
                ['name' => RoleName::Administrator->value, 'guard_name' => 'web'],
            );

            // Phase 4 audit finding F5 (story 0008a): roles.name carries a
            // case-INSENSITIVE collation (utf8mb4_unicode_ci), so
            // firstOrCreate() above would silently *adopt* a pre-existing
            // row named e.g. "administrator" instead of creating one named
            // exactly RoleName::Administrator->value -- and this seeder
            // would go on to grant that row all 37 Administrator
            // permissions below, while every identity check in the app
            // (Role::isAdministratorRole(), UserPolicy's hasRole() calls) is
            // a byte-exact PHP comparison and would treat that same row as
            // an ordinary role: a full-privilege role assignable with a bare
            // users.edit. Fail loudly rather than seed that fail-open state.
            throw_unless(
                $administratorRole->getRawOriginal('name') === RoleName::Administrator->value,
                RuntimeException::class,
                'A role named "'.$administratorRole->getRawOriginal('name').'" already exists and collides '.
                'case-insensitively with the seeded Administrator role name -- resolve the collision manually before reseeding.',
            );

            $permissionNames = $this->allPermissionNames();

            foreach ($permissionNames as $permissionName) {
                Permission::firstOrCreate(
                    ['name' => $permissionName, 'guard_name' => 'web'],
                );
            }

            // DatabaseSeeder runs under WithoutModelEvents, which suppresses the
            // model-event-based cache flush Permission::firstOrCreate() would normally
            // trigger. Flush explicitly here so syncPermissions() below resolves the
            // permissions just created instead of a stale (possibly empty) cache.
            app(PermissionRegistrar::class)->forgetCachedPermissions();

            $administratorRole->syncPermissions(
                array_values(array_diff($permissionNames, ['roles.manage-administrators'])),
            );

            return $this->bootstrapSuperAdmin($superAdminRole);
        });

        // F2 — flush again AFTER commit. Flushing only before COMMIT leaves a window in
        // which a concurrent request on another worker can miss the cache, read the
        // not-yet-committed (stale) state, and re-populate the shared `database` cache
        // store with that pre-commit snapshot for Spatie's 24-hour TTL. Do not remove
        // this second call — it is not a duplicate of the one inside the transaction.
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        if ($provisionedEmail !== null) {
            try {
                Password::broker()->sendResetLink(['email' => $provisionedEmail]);

                // Seeder::$command is uninitialized (null) when the seeder is invoked without an
                // Artisan command in context (e.g. directly from a test); the nullsafe call is
                // real defensive code, not redundant, despite the non-nullable PHPDoc type.
                // @phpstan-ignore nullsafe.neverNull
                $this->command?->info("Provisioned Super Admin account [{$provisionedEmail}] and sent a password-reset link; the operator must claim it via 'Forgot password'.");
            } catch (Throwable $e) {
                // N3 — the cause used to be discarded here, leaving the operator with a
                // warning and no way to find out why delivery failed. report() routes it to
                // the app's configured error tracking without re-throwing, so the seed still
                // completes.
                report($e);

                // @phpstan-ignore nullsafe.neverNull
                $this->command?->warn("Provisioned Super Admin account [{$provisionedEmail}], but the password-reset link could not be sent. Trigger 'Forgot password' for that address manually.");
            }
        }
    }

    /**
     * Build the full catalog of permission names: the module x action grid plus the
     * standalone role-management permissions.
     *
     * @return array<int, string>
     */
    protected function allPermissionNames(): array
    {
        $modulePermissions = [];

        foreach (self::MODULES as $module) {
            foreach (self::ACTIONS as $action) {
                $modulePermissions[] = "{$module}.{$action}";
            }
        }

        return [...$modulePermissions, ...self::ROLE_PERMISSIONS];
    }

    /**
     * Assign the Super Admin role to the user configured via SUPER_ADMIN_EMAIL, provisioning
     * the account when the address matches no existing user.
     *
     * @return string|null the address of a newly provisioned account, or null when nothing was created
     */
    protected function bootstrapSuperAdmin(Role $superAdminRole): ?string
    {
        $email = config('auth.super_admin.email');

        if (! filled($email)) {
            return null;
        }

        // Canonical form: every address in this system is lowercase. Normalize before the
        // lookup AND before the insert, so both see the same string.
        $email = Str::lower($email);

        // N2 — a malformed value ('admin', '0', 'admin@') otherwise provisions an
        // unclaimable "ghost" Super Admin: the reset mail cannot be delivered, and the next
        // reseed with a corrected value creates a *second* Super Admin, orphaning the first.
        // Refuse to bootstrap at all, loudly. The rest of the seed continues.
        if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            // @phpstan-ignore nullsafe.neverNull
            $this->command?->error("SUPER_ADMIN_EMAIL [{$email}] is not a valid email address. Skipping the Super Admin bootstrap; fix the value and re-run the seeder.");
            Log::warning('Super Admin bootstrap skipped: SUPER_ADMIN_EMAIL is not a valid email address.', [
                'email' => $email,
                'user_id' => null,
                'outcome' => 'aborted_invalid_format',
            ]);

            return null;
        }

        // N1 — an unverified row proves nothing about mailbox ownership, so verification is
        // part of the match condition, not a check bolted on after the fact.
        $user = User::where('email', $email)
            ->whereNotNull('email_verified_at')
            ->first();

        if ($user !== null) {
            $user->assignRole($superAdminRole);

            // N3 — persist the grant. $this->command is null outside an Artisan context, so
            // console output alone can leave a privilege grant with no trace at all.
            Log::warning('Super Admin role granted to an existing verified account.', [
                'email' => $email,
                'user_id' => $user->id,
                'outcome' => 'granted',
            ]);
            // @phpstan-ignore nullsafe.neverNull
            $this->command?->info("Granted the Super Admin role to the existing verified account [{$email}].");

            return null;
        }

        // N1 — the address exists but is UNVERIFIED. Neither a safe match (see above) nor a
        // safe create (the row exists, so the insert would violate the unique index on
        // users.email). Abort this bootstrap loudly and grant the role to nobody.
        // ->value('id') doubles as the existence check and the id lookup for the log entry
        // below, instead of an exists() call followed by a separate fetch.
        /** @var string|null $unverifiedUserId */
        $unverifiedUserId = User::where('email', $email)->value('id');

        if ($unverifiedUserId !== null) {
            // @phpstan-ignore nullsafe.neverNull
            $this->command?->error("An unverified account already occupies [{$email}], so the Super Admin role was NOT assigned to anyone. Resolve it manually — have that account's owner verify their email address, or free up the address — then re-run the seeder.");
            Log::warning('Super Admin bootstrap aborted: the configured address is occupied by an unverified account.', [
                'email' => $email,
                'user_id' => $unverifiedUserId,
                'outcome' => 'aborted_unverified_occupant',
            ]);

            return null;
        }

        // Password is random and never surfaced anywhere; the 'hashed' cast on
        // User::$password hashes it on assignment.
        $user = User::create([
            'name' => 'Super Admin',
            'email' => $email,
            'password' => Str::password(32),
        ]);

        // email_verified_at is not in User's #[Fillable] attribute, so force it. The address
        // came from server configuration, not from user input, so it is trusted.
        $user->forceFill(['email_verified_at' => now()])->save();

        $user->assignRole($superAdminRole);

        // N3 — persist the provisioning event alongside the console message emitted after commit.
        Log::warning('Super Admin account provisioned by the seeder.', [
            'email' => $email,
            'user_id' => $user->id,
            'outcome' => 'provisioned',
        ]);

        return $email;
    }
}
