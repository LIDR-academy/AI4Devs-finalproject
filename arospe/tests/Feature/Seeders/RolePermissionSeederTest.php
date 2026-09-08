<?php

use App\Enums\RoleName;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\CacheManager;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

// --- Seeder — happy path ---

test('seeding creates exactly one Super Admin role and one Administrator role, and no others', function () {
    $this->seed(RolePermissionSeeder::class);

    expect(Role::count())->toBe(2)
        ->and(Role::where('name', 'Super Admin')->count())->toBe(1)
        ->and(Role::where('name', 'Administrator')->count())->toBe(1);
});

test('seeding creates exactly 42 permissions', function () {
    $this->seed(RolePermissionSeeder::class);

    expect(Permission::count())->toBe(42);
});

test('the catalog offers a view, create, edit and delete permission for each managed module', function (string $module) {
    $this->seed(RolePermissionSeeder::class);

    foreach (['view', 'create', 'edit', 'delete'] as $action) {
        expect(Permission::where('name', "{$module}.{$action}")->exists())->toBeTrue();
    }
})->with([
    'users', 'products', 'sales-regions', 'shipping', 'payment-methods',
    'customers', 'orders', 'blog', 'store-languages', 'media',
]);

test('the catalog carries both role-management permissions', function () {
    $this->seed(RolePermissionSeeder::class);

    expect(Permission::where('name', 'roles.manage')->exists())->toBeTrue()
        ->and(Permission::where('name', 'roles.manage-administrators')->exists())->toBeTrue();
});

test('every seeded role and permission uses the web guard', function () {
    $this->seed(RolePermissionSeeder::class);

    expect(Role::pluck('guard_name')->unique()->all())->toBe(['web'])
        ->and(Permission::pluck('guard_name')->unique()->all())->toBe(['web']);
});

test('the Administrator role holds every catalog permission except roles.manage-administrators', function () {
    $this->seed(RolePermissionSeeder::class);

    $administrator = Role::findByName('Administrator');
    $granted = $administrator->permissions->pluck('name')->sort()->values()->all();

    $expected = Permission::query()
        ->where('name', '!=', 'roles.manage-administrators')
        ->pluck('name')
        ->sort()
        ->values()
        ->all();

    expect($granted)->toHaveCount(41)
        ->and($granted)->toBe($expected)
        ->and($granted)->not->toContain('roles.manage-administrators');
});

test('the Super Admin role is granted zero explicit permissions', function () {
    $this->seed(RolePermissionSeeder::class);

    $superAdmin = Role::findByName('Super Admin');

    expect($superAdmin->permissions)->toHaveCount(0);
});

// --- Story 0008a (Q1) — the seeded Administrator role's name must come from
// RoleName::Administrator, not a re-typed 'Administrator' string literal in
// this test -- otherwise the seeder and the test could drift together (both
// hardcoding the same typo) without either ever going red. ---

test('the seeded Administrator role is named after the RoleName enum value, and holds the same 41 permissions', function () {
    $this->seed(RolePermissionSeeder::class);

    $administrator = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->first();

    expect($administrator)->not->toBeNull()
        ->and($administrator->permissions)->toHaveCount(41);
});

// --- Seeder — edge cases ---

test('running the seeder twice leaves role, permission and grant counts unchanged', function () {
    $this->seed(RolePermissionSeeder::class);

    $roleCount = Role::count();
    $permissionCount = Permission::count();
    $grantCount = DB::table('role_has_permissions')->count();

    $this->seed(RolePermissionSeeder::class);

    expect(Role::count())->toBe($roleCount)
        ->and(Permission::count())->toBe($permissionCount)
        ->and(DB::table('role_has_permissions')->count())->toBe($grantCount);
});

test('re-running the seeder restores a permission revoked from the Administrator role', function () {
    $this->seed(RolePermissionSeeder::class);

    $administrator = Role::findByName('Administrator');
    $administrator->revokePermissionTo('blog.delete');

    expect($administrator->fresh()->hasPermissionTo('blog.delete'))->toBeFalse();

    $this->seed(RolePermissionSeeder::class);

    expect($administrator->fresh()->hasPermissionTo('blog.delete'))->toBeTrue()
        ->and($administrator->fresh()->permissions)->toHaveCount(41);
});

test('re-seeding an environment that predates the media module adds its four permissions idempotently', function () {
    // Story 0019, Phase 5 finding N3: the QA plan named this upgrade path
    // explicitly ("re-seeding an environment already carrying the
    // 38-permission catalog yields 42 and creates no duplicates") but no
    // test covered it. Simulate a pre-0019 install by deleting the four
    // `media.*` rows (and the Administrator grants pointing at them) after
    // a normal seed, then re-seed and assert the catalog is restored to 42
    // with no duplicate rows.
    $this->seed(RolePermissionSeeder::class);

    $mediaPermissionIds = Permission::where('name', 'like', 'media.%')->pluck('id');

    DB::table('role_has_permissions')->whereIn('permission_id', $mediaPermissionIds)->delete();
    Permission::whereIn('id', $mediaPermissionIds)->delete();

    expect(Permission::count())->toBe(38);

    $this->seed(RolePermissionSeeder::class);

    expect(Permission::count())->toBe(42)
        ->and(Permission::where('name', 'like', 'media.%')->count())->toBe(4)
        ->and(Role::findByName('Administrator')->fresh()->permissions)->toHaveCount(41);
});

test('a configured super admin address matching a registered user assigns the role via the renamed morph column', function () {
    $user = User::factory()->create(['email' => 'super@example.test']);
    config(['auth.super_admin.email' => 'super@example.test']);

    $this->seed(RolePermissionSeeder::class);

    expect($user->fresh()->hasRole('Super Admin'))->toBeTrue();

    $morphKeyColumn = config('permission.column_names.model_morph_key');
    $storedModelId = DB::table('model_has_roles')
        ->where('model_type', User::class)
        ->value($morphKeyColumn);

    expect($storedModelId)->toBe($user->id);
});

test('seeding without a configured super admin address assigns the role to nobody', function () {
    config(['auth.super_admin.email' => null]);

    $this->seed(RolePermissionSeeder::class);

    expect(DB::table('model_has_roles')->count())->toBe(0);
});

test('the permission cache reflects seeded permissions immediately after seeding through DatabaseSeeder', function () {
    $registrar = app(PermissionRegistrar::class);

    // Prime the cache with the pre-seed (empty) state, simulating a cache already
    // populated before DatabaseSeeder's WithoutModelEvents run executes.
    expect($registrar->getPermissions())->toHaveCount(0);

    $this->seed();

    expect($registrar->getPermissions())->toHaveCount(42);
});

// --- Cache-flush placement (F2) ---

test('flushes the permission cache again after the seeding transaction commits, not only inside it', function () {
    $baselineTransactionLevel = DB::transactionLevel();

    // A spy subclass of the real registrar: every call to forgetCachedPermissions()
    // records the DB::transactionLevel() at the moment it fires, then delegates to the
    // real implementation. RefreshDatabase already wraps this test in its own outer
    // transaction, so "outside RolePermissionSeeder's own transaction" is $baselineTransactionLevel,
    // not necessarily 0 — comparing against the captured baseline is what makes this
    // portable across that wrapping.
    $registrar = new class(app(CacheManager::class)) extends PermissionRegistrar
    {
        /** @var array<int, int> */
        public array $transactionLevelsAtFlush = [];

        public function forgetCachedPermissions(): bool
        {
            $this->transactionLevelsAtFlush[] = DB::transactionLevel();

            return parent::forgetCachedPermissions();
        }
    };

    app()->instance(PermissionRegistrar::class, $registrar);

    $this->seed(RolePermissionSeeder::class);

    expect($registrar->transactionLevelsAtFlush)->not->toBeEmpty()
        ->and(min($registrar->transactionLevelsAtFlush))->toBe($baselineTransactionLevel)
        ->and(max($registrar->transactionLevelsAtFlush))->toBeGreaterThan($baselineTransactionLevel);
});

// --- Super Admin provisioning (F3) ---

test('with no configured super admin address, the seeder creates no account for it', function () {
    config(['auth.super_admin.email' => null]);

    $countBefore = User::count();

    $this->seed(RolePermissionSeeder::class);

    expect(User::count())->toBe($countBefore);
});

test('a configured super admin address matching no user provisions a new account holding the Super Admin role', function () {
    Notification::fake();
    config(['auth.super_admin.email' => 'ghost@example.test']);

    $this->seed(RolePermissionSeeder::class);

    $provisioned = User::where('email', 'ghost@example.test')->first();

    expect($provisioned)->not->toBeNull()
        ->and($provisioned->hasRole('Super Admin'))->toBeTrue();
});

test('a provisioned Super Admin account is created already verified', function () {
    Notification::fake();
    config(['auth.super_admin.email' => 'ghost@example.test']);

    $this->seed(RolePermissionSeeder::class);

    $provisioned = User::where('email', 'ghost@example.test')->firstOrFail();

    expect($provisioned->email_verified_at)->not->toBeNull();
});

test('a provisioned Super Admin account is never given a guessable or disclosed password', function () {
    Notification::fake();
    config(['auth.super_admin.email' => 'ghost@example.test']);

    Artisan::call('db:seed', ['--class' => RolePermissionSeeder::class, '--no-interaction' => true]);
    $output = Artisan::output();

    $provisioned = User::where('email', 'ghost@example.test')->firstOrFail();

    expect(Hash::check('password', $provisioned->password))->toBeFalse()
        ->and(Hash::check('ghost@example.test', $provisioned->password))->toBeFalse()
        ->and($output)->not->toMatch('/password["\']?\s*[:=]\s*\S+/i');
});

test('provisioning the Super Admin account sends it a password-reset notification', function () {
    Notification::fake();
    config(['auth.super_admin.email' => 'ghost@example.test']);

    $this->seed(RolePermissionSeeder::class);

    $provisioned = User::where('email', 'ghost@example.test')->firstOrFail();

    Notification::assertSentTo($provisioned, ResetPassword::class);
});

test('bootstrapping an existing user sends no password-reset notification', function () {
    Notification::fake();
    $user = User::factory()->create(['email' => 'super@example.test']);
    config(['auth.super_admin.email' => 'super@example.test']);

    $this->seed(RolePermissionSeeder::class);

    expect($user->fresh()->hasRole('Super Admin'))->toBeTrue();
    Notification::assertNothingSent();
});

test('re-seeding after provisioning creates no second account for the same address', function () {
    Notification::fake();
    config(['auth.super_admin.email' => 'ghost@example.test']);

    $this->seed(RolePermissionSeeder::class);
    $this->seed(RolePermissionSeeder::class);

    expect(User::where('email', 'ghost@example.test')->count())->toBe(1);
});

test('re-seeding after provisioning sends no further password-reset notification', function () {
    Notification::fake();
    config(['auth.super_admin.email' => 'ghost@example.test']);

    $this->seed(RolePermissionSeeder::class);
    $this->seed(RolePermissionSeeder::class);

    $provisioned = User::where('email', 'ghost@example.test')->firstOrFail();

    Notification::assertSentToTimes($provisioned, ResetPassword::class, 1);
});

test('provisioning the Super Admin account emits an informational message, not a warning', function () {
    Notification::fake();
    config(['auth.super_admin.email' => 'ghost@example.test']);

    Artisan::call('db:seed', ['--class' => RolePermissionSeeder::class, '--no-interaction' => true]);
    $output = Artisan::output();

    // Pins the real info() message text from RolePermissionSeeder::run() (around line 92),
    // so this test actually fails if that call were changed to warn() with different
    // wording, or the message were dropped — Artisan::output() renders info() and warn()
    // identically as plain text, so only asserting the exact message content (not merely
    // "the address appears somewhere") distinguishes an intentional message from a missing one.
    expect($output)->toContain("Provisioned Super Admin account [ghost@example.test] and sent a password-reset link; the operator must claim it via 'Forgot password'.");
});

test('a configured address differing only in letter case matches the registered user and creates no second account', function () {
    Notification::fake();
    $user = User::factory()->create(['email' => 'admin@example.test']);
    config(['auth.super_admin.email' => 'Admin@Example.test']);

    $this->seed(RolePermissionSeeder::class);

    expect($user->fresh()->hasRole('Super Admin'))->toBeTrue()
        ->and(User::where('email', 'admin@example.test')->count())->toBe(1);

    Notification::assertNothingSent();
});

test('a mixed-case configured address with no matching user is provisioned in lowercase', function () {
    Notification::fake();
    config(['auth.super_admin.email' => 'Ghost@Example.Test']);

    $this->seed(RolePermissionSeeder::class);

    // users.email has a case-insensitive collation, so a plain `where('email', ...)`
    // comparison can't distinguish stored case — assert on the exact stored bytes instead.
    expect(DB::table('users')->whereRaw('BINARY email = ?', ['ghost@example.test'])->exists())->toBeTrue()
        ->and(DB::table('users')->whereRaw('BINARY email = ?', ['Ghost@Example.Test'])->exists())->toBeFalse();
});

test('a mail-transport failure sending the reset link does not abort the seed', function () {
    config(['auth.super_admin.email' => 'ghost@example.test']);

    $broker = Mockery::mock();
    $broker->shouldReceive('sendResetLink')->andThrow(new RuntimeException('SMTP unavailable'));

    Password::shouldReceive('broker')->andReturn($broker);

    $this->seed(RolePermissionSeeder::class);

    expect(Role::count())->toBe(2)
        ->and(Permission::count())->toBe(42)
        ->and(User::where('email', 'ghost@example.test')->exists())->toBeTrue();
});

// --- Verified-mailbox requirement and unverified-occupant abort (N1) ---

test('an unverified account occupying the configured address is not granted the Super Admin role', function () {
    $occupant = User::factory()->unverified()->create(['email' => 'unverified@example.test']);
    config(['auth.super_admin.email' => 'unverified@example.test']);

    $this->seed(RolePermissionSeeder::class);

    expect($occupant->fresh()->hasRole('Super Admin'))->toBeFalse();
});

test('an unverified occupant leaves the Super Admin role assigned to nobody', function () {
    User::factory()->unverified()->create(['email' => 'unverified@example.test']);
    config(['auth.super_admin.email' => 'unverified@example.test']);

    $this->seed(RolePermissionSeeder::class);

    expect(DB::table('model_has_roles')->count())->toBe(0);
});

test('an unverified occupant is reported to the operator with an error naming the address', function () {
    User::factory()->unverified()->create(['email' => 'unverified@example.test']);
    config(['auth.super_admin.email' => 'unverified@example.test']);

    Artisan::call('db:seed', ['--class' => RolePermissionSeeder::class, '--no-interaction' => true]);
    $output = Artisan::output();

    expect($output)->toContain('unverified@example.test')
        ->and($output)->toContain('manually');
});

test('an unverified occupant does not abort the rest of the seed', function () {
    User::factory()->unverified()->create(['email' => 'unverified@example.test']);
    config(['auth.super_admin.email' => 'unverified@example.test']);

    $this->seed(RolePermissionSeeder::class);

    expect(Role::count())->toBe(2)
        ->and(Permission::count())->toBe(42);
});

test('an unverified occupant creates no second account for the same address', function () {
    User::factory()->unverified()->create(['email' => 'unverified@example.test']);
    config(['auth.super_admin.email' => 'unverified@example.test']);

    $this->seed(RolePermissionSeeder::class);

    expect(User::where('email', 'unverified@example.test')->count())->toBe(1);
});

test('an unverified occupant results in no password-reset notification being sent', function () {
    Notification::fake();
    User::factory()->unverified()->create(['email' => 'unverified@example.test']);
    config(['auth.super_admin.email' => 'unverified@example.test']);

    $this->seed(RolePermissionSeeder::class);

    Notification::assertNothingSent();
});

test('an address becomes usable once its unverified occupant verifies it', function () {
    $occupant = User::factory()->unverified()->create(['email' => 'unverified@example.test']);
    config(['auth.super_admin.email' => 'unverified@example.test']);

    $this->seed(RolePermissionSeeder::class);

    expect($occupant->fresh()->hasRole('Super Admin'))->toBeFalse();

    $occupant->forceFill(['email_verified_at' => now()])->save();

    $this->seed(RolePermissionSeeder::class);

    expect($occupant->fresh()->hasRole('Super Admin'))->toBeTrue();
});

test('running the seeder twice against an unmatched address still yields exactly one account holding the role', function () {
    Notification::fake();
    config(['auth.super_admin.email' => 'ghost-recheck@example.test']);

    $this->seed(RolePermissionSeeder::class);
    $this->seed(RolePermissionSeeder::class);

    $accounts = User::where('email', 'ghost-recheck@example.test')->get();

    expect($accounts)->toHaveCount(1)
        ->and($accounts->first()->hasRole('Super Admin'))->toBeTrue();
});

// --- Configured-address format validation (N2) ---

dataset('malformedSuperAdminEmails', [
    'bare word' => ['admin'],
    'single digit' => ['0'],
    'trailing at with no domain' => ['admin@'],
    'missing local part' => ['@example.com'],
    'embedded space' => ['a b@example.com'],
]);

test('a malformed super admin address is refused and grants the role to nobody', function (string $malformedEmail) {
    config(['auth.super_admin.email' => $malformedEmail]);

    $this->seed(RolePermissionSeeder::class);

    expect(DB::table('model_has_roles')->count())->toBe(0);
})->with('malformedSuperAdminEmails');

test('a malformed super admin address creates no user row for it', function (string $malformedEmail) {
    $countBefore = User::count();
    config(['auth.super_admin.email' => $malformedEmail]);

    $this->seed(RolePermissionSeeder::class);

    expect(User::count())->toBe($countBefore);
})->with('malformedSuperAdminEmails');

test('a malformed super admin address is reported to the operator naming the rejected value', function (string $malformedEmail) {
    config(['auth.super_admin.email' => $malformedEmail]);

    Artisan::call('db:seed', ['--class' => RolePermissionSeeder::class, '--no-interaction' => true]);
    $output = Artisan::output();

    // Assert the rejection wording specifically, not just that the raw value appears
    // somewhere in the output — the (buggy) happy-path provisioning message also embeds
    // the configured address, so a bare toContain($malformedEmail) would pass even
    // without N2 implemented.
    expect($output)->toContain($malformedEmail)
        ->and($output)->toContain('not a valid email address')
        ->and($output)->not->toContain('Provisioned Super Admin account');
})->with('malformedSuperAdminEmails');

test('a malformed super admin address does not abort the rest of the seed', function (string $malformedEmail) {
    config(['auth.super_admin.email' => $malformedEmail]);

    $this->seed(RolePermissionSeeder::class);

    expect(Role::count())->toBe(2)
        ->and(Permission::count())->toBe(42);
})->with('malformedSuperAdminEmails');

test('a malformed super admin address results in no password-reset notification', function (string $malformedEmail) {
    Notification::fake();
    config(['auth.super_admin.email' => $malformedEmail]);

    $this->seed(RolePermissionSeeder::class);

    Notification::assertNothingSent();
})->with('malformedSuperAdminEmails');

// --- Audit logging and error reporting (N3) ---

test('granting the Super Admin role to an existing verified account is recorded in the log', function () {
    Log::spy();
    $user = User::factory()->create(['email' => 'super-log@example.test']);
    config(['auth.super_admin.email' => 'super-log@example.test']);

    $this->seed(RolePermissionSeeder::class);

    Log::shouldHaveReceived('warning')
        ->once()
        ->withArgs(fn (string $message, array $context = []): bool => ($context['email'] ?? null) === 'super-log@example.test'
            && ($context['user_id'] ?? null) === $user->id
        );
});

test('provisioning a Super Admin account is recorded in the log, distinguishable from a grant entry', function () {
    Log::spy();
    Notification::fake();
    config(['auth.super_admin.email' => 'ghost-log@example.test']);

    $this->seed(RolePermissionSeeder::class);

    $provisioned = User::where('email', 'ghost-log@example.test')->firstOrFail();

    Log::shouldHaveReceived('warning')
        ->once()
        ->withArgs(fn (string $message, array $context = []): bool => ($context['email'] ?? null) === 'ghost-log@example.test'
            && ($context['user_id'] ?? null) === $provisioned->id
            && ($context['outcome'] ?? null) === 'provisioned'
        );
});

test('a Super Admin grant is recorded in the log even when the seeder runs with no console attached', function () {
    Log::spy();
    $user = User::factory()->create(['email' => 'super-noconsole@example.test']);
    config(['auth.super_admin.email' => 'super-noconsole@example.test']);

    // Instantiating and invoking the seeder directly, rather than via $this->seed()/Artisan,
    // leaves Seeder::$command unset — this is the specific "no console attached" gap N3 closes.
    (new RolePermissionSeeder)();

    Log::shouldHaveReceived('warning')
        ->once()
        ->withArgs(fn (string $message, array $context = []): bool => ($context['email'] ?? null) === 'super-noconsole@example.test'
            && ($context['user_id'] ?? null) === $user->id
        );
});

test('a failed password-reset delivery is reported to the application error tracking', function () {
    Exceptions::fake();
    config(['auth.super_admin.email' => 'ghost-report@example.test']);

    $broker = Mockery::mock();
    $broker->shouldReceive('sendResetLink')->andThrow(new RuntimeException('SMTP unavailable'));

    Password::shouldReceive('broker')->andReturn($broker);

    $this->seed(RolePermissionSeeder::class);

    Exceptions::assertReported(RuntimeException::class);
});

test('a failed password-reset delivery still emits a console warning and still commits the catalog', function () {
    config(['auth.super_admin.email' => 'ghost-report-console@example.test']);

    $broker = Mockery::mock();
    $broker->shouldReceive('sendResetLink')->andThrow(new RuntimeException('SMTP unavailable'));

    Password::shouldReceive('broker')->andReturn($broker);

    Artisan::call('db:seed', ['--class' => RolePermissionSeeder::class, '--no-interaction' => true]);
    $output = Artisan::output();

    expect($output)->toContain('ghost-report-console@example.test')
        ->and(Role::count())->toBe(2)
        ->and(Permission::count())->toBe(42);
});
