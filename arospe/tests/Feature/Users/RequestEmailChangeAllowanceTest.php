<?php

// Story 0015 finding F6 part 2 — App\Actions\Users\RequestEmailChange enforces TWO limiters:
// a composite (target, actor) key at 3/hour (unburnable across actors, so a target always
// retains their own three regardless of administrator activity) and a target-scoped aggregate
// at 10/hour (preserving the inbox-flood ceiling the old target-only key provided once the
// composite key stops being a global cap). Before this fix, the limiter keyed on the target
// alone, so an administrator editing someone else's row could exhaust a victim's own 3/hour
// allowance and leave them unable to change their own address.
//
// tests/Feature/Settings/EmailChangeTest.php already covers the (target, actor) limiter's basic
// 4th-call-refused and per-user-scoping behaviour for the single-caller (self-service) case,
// where target === actor -- that file is not duplicated here. This file is specifically about
// the CROSS-actor behaviour: what happens once a second, distinct actor (an administrator) can
// also call this action against the same target.

use App\Actions\Users\RequestEmailChange;
use App\Enums\UserStatus;
use App\Livewire\Settings\Profile;
use App\Models\User;
use App\Notifications\PendingEmailVerification;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

test('an administrator exhausting a targets email-change allowance does not prevent that target changing their own address', function () {
    Notification::fake();

    $target = User::factory()->create(['status' => UserStatus::Active]);

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $requestEmailChange = app(RequestEmailChange::class);

    $requestEmailChange($target, 'admin-attempt-1@arospe.es');
    $requestEmailChange($target, 'admin-attempt-2@arospe.es');
    $requestEmailChange($target, 'admin-attempt-3@arospe.es');

    // The administrator's own (target, actor) allowance for this target is now exhausted.
    expect(fn () => $requestEmailChange($target, 'admin-attempt-4@arospe.es'))
        ->toThrow(ValidationException::class);

    // The target's OWN request must still succeed -- driven through the OTHER real call site,
    // App\Livewire\Settings\Profile, so this proves the two call sites no longer share a bucket
    // (target !== actor above, target === actor here).
    $this->actingAs($target);

    Livewire::test(Profile::class)
        ->set('email', 'targets-own-choice@arospe.es')
        ->call('updateProfileInformation')
        ->assertHasNoErrors();

    expect($target->fresh()->pending_email)->toBe('targets-own-choice@arospe.es');
});

// Pre-story-0015 RED note: this test's OWN setup requires the composite (target, actor) key to
// already exist -- it drives 10 successful requests across 4 distinct actors specifically to
// stay under each actor's individual 3/hour cap while reaching the 10/hour aggregate one. Before
// F6 part 2 lands, RequestEmailChange still keys its single limiter on the TARGET ALONE
// (3/hour, shared by every actor), so the setup loop's 4th call overall throws
// ValidationException on its own -- surfacing as an uncaught exception/PHPUnit ERROR rather than
// a clean assertion failure at the `expect(fn () => ...)->toThrow()` line below. That is the
// correct, unavoidable shape of red for a scenario whose own preconditions cannot be satisfied
// without the fix: there is no restructuring that lets 10 cross-actor requests succeed against a
// single, target-only 3/hour bucket. Once F6 part 2 ships, the setup completes and this test
// exercises the aggregate ceiling itself, as named.
test('the per-target aggregate ceiling refuses further requests once reached, regardless of which actor sends them, and sends no further notification', function () {
    Notification::fake();

    $target = User::factory()->create(['status' => UserStatus::Active]);

    $requestEmailChange = app(RequestEmailChange::class);

    // Three distinct administrators, each well within their OWN 3/hour (target, actor)
    // allowance -- 9 requests total, all accepted.
    $sequence = 0;

    for ($administratorIndex = 0; $administratorIndex < 3; $administratorIndex++) {
        $administrator = User::factory()->create();
        $administrator->assignRole('Administrator');
        $this->actingAs($administrator);

        for ($attempt = 0; $attempt < 3; $attempt++) {
            $sequence++;
            $requestEmailChange($target, "aggregate-{$sequence}@arospe.es");
        }
    }

    // A FOURTH, still-fresh administrator sends the 10th request overall -- their own (target,
    // actor) allowance has only been used once, well under its cap, so this still succeeds.
    $fourthAdministrator = User::factory()->create();
    $fourthAdministrator->assignRole('Administrator');
    $this->actingAs($fourthAdministrator);

    $sequence++;
    $requestEmailChange($target, "aggregate-{$sequence}@arospe.es");

    // The per-target aggregate ceiling (10/hour) is now reached. This same fourth administrator
    // has sent only ONE request so far -- nowhere near their own 3/hour cap -- so a refusal here
    // can only come from the aggregate limiter, not the (target, actor) one.
    expect(fn () => $requestEmailChange($target, 'aggregate-11@arospe.es'))
        ->toThrow(ValidationException::class);

    Notification::assertSentOnDemandTimes(PendingEmailVerification::class, 10);
});

test('a request refused by the narrower (target, actor) limiter does not consume the per-target aggregate quota', function () {
    Notification::fake();

    $target = User::factory()->create(['status' => UserStatus::Active]);
    $actorA = User::factory()->create();

    $requestEmailChange = app(RequestEmailChange::class);

    $this->actingAs($actorA);
    $requestEmailChange($target, 'ordering-a1@arospe.es');
    $requestEmailChange($target, 'ordering-a2@arospe.es');
    $requestEmailChange($target, 'ordering-a3@arospe.es');

    // Actor A's own (target, actor) allowance is now exhausted -- refused BEFORE the aggregate
    // limiter is ever checked (ordering: (1) then (2), never the reverse).
    expect(fn () => $requestEmailChange($target, 'ordering-a4@arospe.es'))
        ->toThrow(ValidationException::class);

    // Exactly three successful requests have been made against this target so far. If the
    // refused 4th attempt above had ALSO consumed aggregate quota, this would read 4, not 3.
    $aggregateKey = 'email-change-target:'.$target->getKey();

    expect(RateLimiter::attempts($aggregateKey))->toBe(3);

    // A second, distinct actor still has the FULL aggregate remainder (7 of the 10), not 6 --
    // proving the refused attempt above cost the target's own inbox ceiling nothing.
    $actorB = User::factory()->create();
    $this->actingAs($actorB);

    for ($i = 0; $i < 3; $i++) {
        $requestEmailChange($target, "ordering-b{$i}@arospe.es");
    }

    expect(RateLimiter::attempts($aggregateKey))->toBe(6);
});

// Story 0015 Phase 4 re-audit finding F-A: the per-target aggregate ceiling (10/hour) is shared
// by every ADMINISTRATOR acting on a target, but must never apply to the target's OWN
// self-service request -- that key is inherently burnable by third-party activity, and the
// target is not a third party. Before this fix, four administrators each sending 3 requests
// (each safely within their own per-(target, actor) cap) exhausted the target's aggregate
// allowance before the target ever acted, locking them out of changing their own address via
// App\Livewire\Settings\Profile for up to an hour -- contradicting this story's own "a target
// always retains their own three regardless of administrator activity" acceptance criterion.
test('an administrator exhausting the per-target aggregate ceiling does not prevent the target changing their own address', function () {
    Notification::fake();

    $target = User::factory()->create(['status' => UserStatus::Active]);

    $requestEmailChange = app(RequestEmailChange::class);

    // Four distinct administrators exhaust the FULL 10/hour aggregate ceiling between them
    // (3 + 3 + 3 + 1 = 10), each safely within their OWN 3/hour (target, actor) allowance --
    // the identical setup shape as "the per-target aggregate ceiling refuses further
    // requests..." above, which already proves an 11th third-party request is refused once this
    // ceiling is reached.
    $sequence = 0;

    for ($administratorIndex = 0; $administratorIndex < 3; $administratorIndex++) {
        $administrator = User::factory()->create();
        $administrator->assignRole('Administrator');
        $this->actingAs($administrator);

        for ($attempt = 0; $attempt < 3; $attempt++) {
            $sequence++;
            $requestEmailChange($target, "aggregate-exempt-{$sequence}@arospe.es");
        }
    }

    $fourthAdministrator = User::factory()->create();
    $fourthAdministrator->assignRole('Administrator');
    $this->actingAs($fourthAdministrator);

    $sequence++;
    $requestEmailChange($target, "aggregate-exempt-{$sequence}@arospe.es");

    // The per-target aggregate ceiling is now fully exhausted by third-party (administrator)
    // activity alone. The target's own self-service request must still succeed -- driven
    // through the real call site, App\Livewire\Settings\Profile -- because the aggregate
    // limiter never applies to the target's own request.
    $this->actingAs($target);

    Livewire::test(Profile::class)
        ->set('email', 'targets-own-choice-after-aggregate@arospe.es')
        ->call('updateProfileInformation')
        ->assertHasNoErrors();

    expect($target->fresh()->pending_email)->toBe('targets-own-choice-after-aggregate@arospe.es');
});
