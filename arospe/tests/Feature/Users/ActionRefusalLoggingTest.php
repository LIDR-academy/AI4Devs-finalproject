<?php

// Story 0015b, Q5 — App\Actions\Users\CreateUser, UpdateUser and RequestEmailChange each log
// their own refusals, independently of App\Livewire\Users\Index, with the SAME shape and level
// the two Livewire components use (tests/Feature/Users/RefusalLoggingTest.php /
// tests/Feature/Roles/RefusalLoggingTest.php) -- so a future non-dashboard caller (API endpoint,
// Artisan command, queued job) inherits the audit trail for free. Every test here resolves the
// action from the container and calls it DIRECTLY, matching the existing precedent at
// tests/Feature/Users/CreateUserActionAuthorizationTest.php and
// tests/Feature/Users/UpdateUserActionAuthorizationTest.php (never through Livewire::test()) --
// because that IS the gap this story closes: the dashboard's own Gate checks (Index's 'create'/
// 'update'/'updateSensitiveAttributes') always fire upstream of these actions' own base gates
// for the same actor/target, so those inner refusals are only independently reachable by calling
// the action directly.
//
// RED-phase: App\Actions\Auth\LogRefusedPrivilegedAttempt does not exist yet, so every test below
// is expected to fail because no Log::warning is ever recorded.
//
// =====================================================================================
// COVERAGE CHECKLIST (task file "Files to create/modify" -> Non-Gate and previously-omitted
// refusals... for app/Livewire/Users/Index.php, re-verified against HEAD):
//
//   CreateUser.php:65   Gate::authorize('create', ...)              -- 'CreateUser -- base create refusal is logged, matching the components shape'
//   CreateUser.php:82   rate-limit ValidationException               -- covered by BOTH this file's 'CreateUser rate-limit refusal is logged with the pre-agreed reason, matching the components shape' AND (component-mediated) tests/Feature/Users/RefusalLoggingTest.php's 'an 11th CreateUser call...' -- deliberately not deduplicated, since the task file names this refusal under BOTH "Users -- rate-limit refusal is logged" (component-facing bullet) and "Domain actions" (action-facing bullet)
//   CreateUser.php:96   Super Admin AuthorizationException (direct throw) -- 'CreateUser -- Super Admin role assignment refusal is logged'
//   CreateUser.php:103  Gate::authorize('promoteToAdministrator', ...)    -- 'CreateUser -- promoteToAdministrator refusal is logged'
//   UpdateUser.php:79   Gate::authorize('update', ...)               -- 'UpdateUser -- base update refusal is logged, matching the components shape'
//   UpdateUser.php:168  Super Admin AuthorizationException (current holder, direct throw) -- 'UpdateUser -- modifying a current Super Admin holder is logged'
//   UpdateUser.php:174  Super Admin AuthorizationException (submitted role, direct throw) -- 'UpdateUser -- assigning the Super Admin role is logged'
//   UpdateUser.php:185  Gate::authorize('promoteToAdministrator', ...) -- 'UpdateUser -- promoteToAdministrator refusal is logged'
//   UpdateUser.php:187  Gate::authorize('downgrade', ...)             -- 'UpdateUser -- downgrade refusal is logged'
//   UpdateUser.php:200  Gate::authorize('updateSensitiveAttributes', ...) -- 'UpdateUser -- updateSensitiveAttributes refusal is logged (status change)'
//   RequestEmailChange.php:69      composite (target, actor) limiter -- 'RequestEmailChange -- the composite (target, actor) rate-limit refusal is logged'
//   RequestEmailChange.php:99-100  per-target aggregate limiter       -- 'RequestEmailChange -- the per-target aggregate rate-limit refusal is logged'
//   RequestEmailChange.php:110     pending_email uniqueness collision -- 'RequestEmailChange -- a pending_email uniqueness collision refusal is logged'
//
// Deliberately excluded per the task file's own explicit note (see both refusal-point tables'
// preamble): the PasswordConfirmationRequiredException thrown by EnsureRecentPasswordConfirmation
// from inside CreateUser/UpdateUser -- story 0015a already logs that shape
// ('Step-up password confirmation required'), and this story does not fold it into the shared
// helper or duplicate it.
// =====================================================================================

use App\Actions\Users\CreateUser;
use App\Actions\Users\RequestEmailChange;
use App\Actions\Users\UpdateUser;
use App\Enums\RoleName;
use App\Enums\UserStatus;
use App\Livewire\Users\Index as UsersIndex;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<string, mixed>  $context
 */
function usersActionRefusalLogContextHasNoSecretLookingKey(array $context): bool
{
    foreach (array_keys($context) as $key) {
        if (! is_string($key)) {
            continue;
        }

        if (str_contains($key, 'password') || str_contains($key, 'token') || str_contains($key, 'hash') || str_contains($key, 'session')) {
            return false;
        }
    }

    return true;
}

// =====================================================================
// CreateUser
// =====================================================================

test('CreateUser -- base create refusal is logged, matching the components shape, with no target', function () {
    Log::spy();

    $actor = User::factory()->create(); // holds no permission at all
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    try {
        app(CreateUser::class)('New Hire', 'action-no-permission@arospe.es', (string) $editorRole->id, UserStatus::Active);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'create'
            && array_key_exists('target_type', $context) && $context['target_type'] === null
            && array_key_exists('target_id', $context) && $context['target_id'] === null
            && usersActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect(User::where('email', 'action-no-permission@arospe.es')->exists())->toBeFalse();
});

test('CreateUser -- Super Admin role assignment refusal is logged', function () {
    Log::spy();

    $actor = User::factory()->create();
    $actor->givePermissionTo(['users.create', 'roles.manage-administrators']);
    $this->actingAs($actor);

    $superAdminRole = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    try {
        app(CreateUser::class)('New Super Admin', 'action-super-admin@arospe.es', (string) $superAdminRole->id, UserStatus::Active);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && is_string($context['ability'] ?? null)
            && ($context['ability'] ?? null) !== 'create' // distinguishable from the base ability
            && array_key_exists('target_type', $context) && $context['target_type'] === null
            && usersActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect(User::where('email', 'action-super-admin@arospe.es')->exists())->toBeFalse();
});

test('CreateUser -- promoteToAdministrator refusal is logged, with no target', function () {
    Log::spy();

    $actor = User::factory()->create();
    $actor->givePermissionTo('users.create'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);

    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    try {
        app(CreateUser::class)('New Administrator', 'action-promote@arospe.es', (string) $administratorRole->id, UserStatus::Active);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'promoteToAdministrator'
            && array_key_exists('target_type', $context) && $context['target_type'] === null
            && usersActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect(User::where('email', 'action-promote@arospe.es')->exists())->toBeFalse();
});

// The rate-limit refusal, tested directly here too (in addition to the component-mediated
// coverage in tests/Feature/Users/RefusalLoggingTest.php) -- "Domain actions -- authorization
// refusal is logged, matching the components' shape" explicitly names CreateUser's rate limiter.
test('CreateUser -- rate-limit refusal is logged with the pre-agreed reason, matching the components shape', function () {
    Log::spy();

    $actor = User::factory()->create();
    $actor->givePermissionTo('users.create');
    $this->actingAs($actor);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $createUser = app(CreateUser::class);

    for ($i = 0; $i < 10; $i++) {
        $createUser("Hire {$i}", "action-throttle-hire-{$i}@arospe.es", (string) $role->id, UserStatus::Active);
    }

    try {
        $createUser('Eleventh Hire', 'action-throttle-hire-11@arospe.es', (string) $role->id, UserStatus::Active);
    } catch (ValidationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'create_rate_limited'
            && array_key_exists('target_type', $context) && $context['target_type'] === null
            && usersActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect(User::where('email', 'action-throttle-hire-11@arospe.es')->exists())->toBeFalse();
});

// =====================================================================
// UpdateUser
// =====================================================================

test('UpdateUser -- base update refusal is logged, matching the components shape', function () {
    Log::spy();

    $actor = User::factory()->create(); // holds no permission at all
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['name' => 'Original Name']);
    $target->assignRole($editorRole);

    try {
        app(UpdateUser::class)($target, 'Changed Name', $target->email, (string) $editorRole->id, $target->status, app(RequestEmailChange::class));
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'user'
            && ($context['target_id'] ?? null) === $target->id
            && usersActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($target->fresh()->name)->toBe('Original Name');
});

test('UpdateUser -- modifying a current Super Admin holder is logged', function () {
    Log::spy();

    $superAdminRole = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    $actor = User::factory()->create();
    $actor->givePermissionTo(['users.edit', 'roles.manage-administrators']);
    $this->actingAs($actor);

    $target = User::factory()->create(['name' => 'Original Name']);
    $target->assignRole($superAdminRole);

    try {
        app(UpdateUser::class)($target, 'Changed Name', $target->email, (string) $superAdminRole->id, $target->status, app(RequestEmailChange::class));
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && is_string($context['ability'] ?? null)
            && ($context['target_type'] ?? null) === 'user'
            && ($context['target_id'] ?? null) === $target->id
            && usersActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($target->fresh()->name)->toBe('Original Name');
});

test('UpdateUser -- assigning the Super Admin role is logged', function () {
    Log::spy();

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $superAdminRole = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    $actor = User::factory()->create();
    $actor->givePermissionTo(['users.edit', 'roles.manage-administrators']);
    $this->actingAs($actor);

    $target = User::factory()->create(['email' => 'action-super-admin-target@arospe.es']);
    $target->assignRole($editorRole);

    try {
        app(UpdateUser::class)($target, $target->name, 'action-super-admin-target@arospe.es', (string) $superAdminRole->id, $target->status, app(RequestEmailChange::class));
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && is_string($context['ability'] ?? null)
            && ($context['target_type'] ?? null) === 'user'
            && ($context['target_id'] ?? null) === $target->id
            && usersActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($target->fresh()->hasRole('Super Admin'))->toBeFalse();
});

test('UpdateUser -- promoteToAdministrator refusal is logged', function () {
    Log::spy();

    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    $target = User::factory()->create(['name' => 'Original Name', 'status' => UserStatus::Inactive]);
    $target->assignRole($editorRole);

    try {
        app(UpdateUser::class)($target, 'Changed Name', $target->email, (string) $administratorRole->id, UserStatus::Inactive, app(RequestEmailChange::class));
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'promoteToAdministrator'
            && ($context['target_type'] ?? null) === 'user'
            && ($context['target_id'] ?? null) === $target->id
            && usersActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($target->fresh()->hasRole('Administrator'))->toBeFalse();
});

test('UpdateUser -- downgrade refusal is logged', function () {
    Log::spy();

    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    $target = User::factory()->create(['name' => 'Original Name', 'status' => UserStatus::Active]);
    $target->assignRole($administratorRole);

    try {
        app(UpdateUser::class)($target, 'Changed Name', $target->email, (string) $editorRole->id, UserStatus::Active, app(RequestEmailChange::class));
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'downgrade'
            && ($context['target_type'] ?? null) === 'user'
            && ($context['target_id'] ?? null) === $target->id
            && usersActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($target->fresh()->hasRole('Administrator'))->toBeTrue();
});

test('UpdateUser -- updateSensitiveAttributes refusal is logged (status change on an Administrator target)', function () {
    Log::spy();

    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);

    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    $target = User::factory()->create(['name' => 'Original Name', 'status' => UserStatus::Active]);
    $target->assignRole($administratorRole);

    try {
        app(UpdateUser::class)($target, 'Changed Name', $target->email, (string) $administratorRole->id, UserStatus::Suspended, app(RequestEmailChange::class));
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'updateSensitiveAttributes'
            && ($context['target_type'] ?? null) === 'user'
            && ($context['target_id'] ?? null) === $target->id
            && usersActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($target->fresh()->status)->toBe(UserStatus::Active);
});

// =====================================================================
// Phase 5 finding R-2(b) -- "asserted directly (not by each action asserting its own shape in
// isolation)" (task file, "Domain actions -- authorization refusal is logged" bullet). Every test
// above checks its OWN context with `array_key_exists('target_type', ...) && ...`, which would
// silently keep passing even if a FIFTH key leaked into one layer and not the other -- presence
// checks cannot catch an extra key, only a missing one. This test instead captures a genuine
// action-layer refusal (UpdateUser::promoteToAdministrator) alongside a genuine component-layer
// refusal (App\Livewire\Users\Index::openEditModal()) in the SAME Log::spy() session and
// set-equates their key sets, exactly the way
// tests/Feature/Roles/RefusalLoggingTest.php's "the Roles and Users screens refusal log lines
// share exactly the same shape" test already does one level up (screen vs. screen). This is the
// layer-vs-layer counterpart: action vs. component.
// =====================================================================

test('a domain-action refusal and a Livewire-component refusal share exactly the same context key set', function () {
    Log::spy();

    // -- Action-layer refusal: UpdateUser::promoteToAdministrator (same scenario as the dedicated
    // test above, re-run here only to capture its OWN context alongside a component refusal). --
    $actionActor = User::factory()->create();
    $actionActor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actionActor);

    $editorRole = Role::create(['name' => 'Editor Action Equivalence', 'guard_name' => 'web']);
    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();
    $actionTarget = User::factory()->create(['name' => 'Action Target', 'status' => UserStatus::Inactive]);
    $actionTarget->assignRole($editorRole);

    try {
        app(UpdateUser::class)($actionTarget, 'Renamed', $actionTarget->email, (string) $administratorRole->id, UserStatus::Inactive, app(RequestEmailChange::class));
    } catch (AuthorizationException) {
        //
    }

    // -- Component-layer refusal: App\Livewire\Users\Index::openEditModal(), a distinct actor and
    // target in the same test session. --
    $componentActor = User::factory()->create();
    $componentActor->givePermissionTo('users.view');
    $this->actingAs($componentActor);

    $componentTarget = User::factory()->create();

    try {
        Livewire::test(UsersIndex::class)->call('openEditModal', $componentTarget->id);
    } catch (AuthorizationException) {
        //
    }

    $recordedContexts = [];

    Log::shouldHaveReceived('warning')
        ->withArgs(function (string $message, array $context) use (&$recordedContexts): bool {
            if ($message === 'Privileged action refused') {
                $recordedContexts[] = $context;
            }

            return true;
        })
        ->atLeast()->times(2);

    expect(count($recordedContexts))->toBeGreaterThanOrEqual(2);

    $keySets = array_map(
        fn (array $context): array => collect(array_keys($context))->sort()->values()->all(),
        $recordedContexts,
    );

    // Every recorded refusal -- the action's and the component's alike -- must expose the
    // identical key set. count(array_unique(...)) === 1 proves every entry in $keySets is the
    // same array, not merely that the first two happen to match.
    $serializedKeySets = array_map(fn (array $keys): string => implode(',', $keys), $keySets);
    expect(array_unique($serializedKeySets))->toHaveCount(1)
        ->and($keySets[0])->toBe(['ability', 'actor_id', 'target_id', 'target_type']);
});

// =====================================================================
// "Domain actions — the refusal still refuses, identically" -- a dedicated test proving logging
// cannot intercept or swallow the exception, run through a distinct site (UpdateUser's
// promoteToAdministrator) than the ones already asserted above via try/catch.
// =====================================================================

test('UpdateUser refusal still throws AuthorizationException with its original message, and writes nothing', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create(['name' => 'Original Name']);
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, 'Changed Name', $target->email, (string) $administratorRole->id, $target->status, app(RequestEmailChange::class)))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->name)->toBe('Original Name')
        ->and($target->fresh()->hasRole('Administrator'))->toBeFalse();
});

// =====================================================================
// RequestEmailChange
// =====================================================================

test('RequestEmailChange -- the composite (target, actor) rate-limit refusal is logged', function () {
    Log::spy();

    $target = User::factory()->create(['status' => UserStatus::Active]);

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $requestEmailChange = app(RequestEmailChange::class);

    $requestEmailChange($target, 'composite-attempt-1@arospe.es');
    $requestEmailChange($target, 'composite-attempt-2@arospe.es');
    $requestEmailChange($target, 'composite-attempt-3@arospe.es');

    try {
        $requestEmailChange($target, 'composite-attempt-4@arospe.es');
    } catch (ValidationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $administrator->id
            && is_string($context['ability'] ?? null)
            && ($context['target_type'] ?? null) === 'user'
            && ($context['target_id'] ?? null) === $target->id
            && usersActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($target->fresh()->pending_email)->toBe('composite-attempt-3@arospe.es');
});

// Bug fix, caught by backend-expert during Phase 3 step 2: RateLimiter::attempt() only refuses
// once attempts() >= maxAttempts, so with the aggregate limiter's real maxAttempts: 10 (see
// app/Actions/Users/RequestEmailChange.php:108), the 10th call across all actors is still the
// 10th SUCCESSFUL one -- refusal requires an 11th. The previous version of this test drove only
// 9 successful calls (3 administrators x 3 attempts) then expected a 4th administrator's FIRST
// call (the 10th overall) to be refused; it isn't. Fixed to drive exactly 10 successful calls,
// then an 11th that is refused -- matching every sibling rate-limit test in this file (CreateUser
// does 10-then-11th, the composite RequestEmailChange limiter does 3-then-4th), which this one
// test alone got wrong.
test('RequestEmailChange -- the per-target aggregate rate-limit refusal is logged, regardless of which actor sends it', function () {
    Log::spy();

    $target = User::factory()->create(['status' => UserStatus::Active]);
    $requestEmailChange = app(RequestEmailChange::class);

    $sequence = 0;

    // 3 administrators x 3 attempts each = 9 successful calls, every one safely within its own
    // actor's separate 3/hour (target, actor) allowance.
    for ($administratorIndex = 0; $administratorIndex < 3; $administratorIndex++) {
        $administrator = User::factory()->create();
        $administrator->assignRole('Administrator');
        $this->actingAs($administrator);

        for ($attempt = 0; $attempt < 3; $attempt++) {
            $sequence++;
            $requestEmailChange($target, "aggregate-action-{$sequence}@arospe.es");
        }
    }

    // A 4th, distinct administrator's own first call is the 10th call overall -- still within
    // BOTH their own per-(target, actor) cap (their 1st of 3) AND the aggregate 10/hour ceiling
    // (the 10th of 10), so it must still succeed.
    $fourthAdministrator = User::factory()->create();
    $fourthAdministrator->assignRole('Administrator');
    $this->actingAs($fourthAdministrator);

    $requestEmailChange($target, 'aggregate-action-10th@arospe.es');

    // The SAME administrator's second call is the 11th overall -- still within their own
    // per-(target, actor) cap (their 2nd of 3), so it is the aggregate ceiling, and only the
    // aggregate ceiling, that refuses it.
    try {
        $requestEmailChange($target, 'aggregate-action-11th@arospe.es');
    } catch (ValidationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $fourthAdministrator->id
            && is_string($context['ability'] ?? null)
            && ($context['target_type'] ?? null) === 'user'
            && ($context['target_id'] ?? null) === $target->id
            && usersActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

// Story 0015b Phase 5 finding N-1 (non-blocking): the aggregate log-throttle key was fixed from
// target-only ('email-change-target-log:'.$aggregateKey) to target+actor
// ('email-change-target-log:'.$aggregateKey.':'.$actorKey) so a SECOND administrator's aggregate
// refusal against a target another administrator already triggered a log for within the same
// hour is not silently suppressed by the first administrator's own log-throttle window. No
// existing test drove two distinct actors' refusals against the same target in the same window --
// the test above ('regardless of which actor sends it') only asserts a single refusing actor, so
// it would stay green even with the old target-only key. This test drives two.
test('RequestEmailChange -- two different administrators each get their own logged aggregate refusal against the same target', function () {
    Log::spy();

    $target = User::factory()->create(['status' => UserStatus::Active]);
    $requestEmailChange = app(RequestEmailChange::class);

    $sequence = 0;

    // Exhaust the aggregate 10/hour ceiling with 10 successful calls, spread across three
    // administrators so no individual (target, actor) composite cap (3/hour) is ever hit.
    for ($administratorIndex = 0; $administratorIndex < 3; $administratorIndex++) {
        $administrator = User::factory()->create();
        $administrator->assignRole('Administrator');
        $this->actingAs($administrator);

        for ($attempt = 0; $attempt < 3; $attempt++) {
            $sequence++;
            $requestEmailChange($target, "shared-aggregate-{$sequence}@arospe.es");
        }
    }

    $administratorD = User::factory()->create();
    $administratorD->assignRole('Administrator');
    $this->actingAs($administratorD);

    // 10th successful call overall -- still within administrator D's own composite cap (1st of 3)
    // and exactly fills the aggregate ceiling.
    $requestEmailChange($target, 'shared-aggregate-10th@arospe.es');

    // Administrator D's SECOND call -- still within their own composite cap (2nd of 3) -- is the
    // 11th call overall, refused by the now-exhausted aggregate ceiling. This is the refusal that
    // "wins" the log-throttle window's single slot under the old (reverted, for the regression
    // check) target-only key.
    try {
        $requestEmailChange($target, 'shared-aggregate-11th-d@arospe.es');
    } catch (ValidationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $administratorD->id
            && is_string($context['ability'] ?? null)
            && ($context['target_type'] ?? null) === 'user'
            && ($context['target_id'] ?? null) === $target->id
            && usersActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    // A DIFFERENT administrator, E, refused for the first time against the SAME target in the SAME
    // window -- still within their own composite cap (1st of 3), so only the exhausted aggregate
    // ceiling refuses them. Under the old target-only log-throttle key this refusal would have been
    // silently suppressed, since administrator D's refusal above already consumed that window's one
    // log slot.
    $administratorE = User::factory()->create();
    $administratorE->assignRole('Administrator');
    $this->actingAs($administratorE);

    try {
        $requestEmailChange($target, 'shared-aggregate-e@arospe.es');
    } catch (ValidationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $administratorE->id
            && is_string($context['ability'] ?? null)
            && ($context['target_type'] ?? null) === 'user'
            && ($context['target_id'] ?? null) === $target->id
            && usersActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

test('RequestEmailChange -- a pending_email uniqueness collision refusal is logged', function () {
    Log::spy();

    User::factory()->pendingEmail('claimed-action@arospe.es')->create();
    $target = User::factory()->create(['status' => UserStatus::Active]);

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    try {
        app(RequestEmailChange::class)($target, 'claimed-action@arospe.es');
    } catch (ValidationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $administrator->id
            && is_string($context['ability'] ?? null)
            && ($context['target_type'] ?? null) === 'user'
            && ($context['target_id'] ?? null) === $target->id
            && usersActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($target->fresh()->pending_email)->toBeNull();
});
