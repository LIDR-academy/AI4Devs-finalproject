<?php

use App\Enums\UserStatus;
use App\Livewire\Users\Index;
use App\Models\User;
use App\Notifications\PendingEmailVerification;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Livewire\Features\SupportLockedProperties\CannotUpdateLockedPropertyException;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

// =====================================================================
// Livewire::test(Index::class)
// =====================================================================

// --- Listing, counts, ordering ---

test('the list includes a roleless user and the acting administrators own row', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $roleless = User::factory()->create();

    $ids = collect(Livewire::test(Index::class)->get('users'))->pluck('id');

    expect($ids)->toContain($administrator->id)
        ->and($ids)->toContain($roleless->id);
});

test('each row exposes the id, name, email, pendingEmail, role and status the view contract requires', function () {
    // Code review finding (Phase 5): nothing previously asserted this shape beyond id/name, so a
    // regression renaming a key, returning the Role model instead of its name, or dropping a field
    // would pass every other test here while breaking story 0006's locked interface contract.
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $roled = User::factory()
        ->pendingEmail('mid-flight@arospe.es')
        ->create(['name' => 'Roled User', 'email' => 'roled@arospe.es', 'status' => UserStatus::Active]);
    $roled->assignRole($editorRole);

    $roleless = User::factory()->create(['name' => 'Roleless User', 'email' => 'roleless@arospe.es', 'status' => UserStatus::Inactive]);

    $users = collect(Livewire::test(Index::class)->get('users'));

    expect($users->firstWhere('id', $roled->id))->toBe([
        'id' => $roled->id,
        'name' => 'Roled User',
        'email' => 'roled@arospe.es',
        'pendingEmail' => 'mid-flight@arospe.es',
        'role' => 'Editor',
        'status' => UserStatus::Active,
        'canEdit' => true,
        'canDelete' => true,
    ]);

    expect($users->firstWhere('id', $roleless->id))->toBe([
        'id' => $roleless->id,
        'name' => 'Roleless User',
        'email' => 'roleless@arospe.es',
        'pendingEmail' => null,
        'role' => null,
        'status' => UserStatus::Inactive,
        'canEdit' => true,
        'canDelete' => true,
    ]);
});

// --- canEdit / canDelete per row ---

test('canEdit and canDelete mirror what UserPolicy would actually authorize for each row', function () {
    // An Administrator holds users.edit/users.delete but not roles.manage-administrators
    // (RolePermissionSeeder), so this exercises every branch UserPolicy::update()/delete() has:
    // an ordinary target (both true), an Administrator-holding OTHER target (both false as of
    // story 0015's F7 -- canEdit now requires updateSensitiveAttributes for any other target,
    // which this actor lacks; canDelete already required it), the actor's OWN row (canEdit true
    // via the F7 self-row exemption, canDelete unaffected by F7 and still false because the
    // policy itself refuses an Administrator-holding actor deleting themselves), and the Super
    // Admin target (both false, regardless of permissions).
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $ordinaryTarget = User::factory()->create(['name' => 'Ordinary Target']);
    $ordinaryTarget->assignRole($editorRole);

    $administratorTarget = User::factory()->create(['name' => 'Administrator Target']);
    $administratorTarget->assignRole('Administrator');

    $superAdminTarget = User::factory()->create(['name' => 'Super Admin Target']);
    $superAdminTarget->assignRole('Super Admin');

    $users = collect(Livewire::test(Index::class)->get('users'));

    expect($users->firstWhere('id', $ordinaryTarget->id))
        ->canEdit->toBeTrue()
        ->canDelete->toBeTrue();

    // Story 0015 F7: an actor lacking roles.manage-administrators can no longer open (or edit)
    // an OTHER Administrator-holding target's row at all -- canEdit is now false here, not true.
    expect($users->firstWhere('id', $administratorTarget->id))
        ->canEdit->toBeFalse()
        ->canDelete->toBeFalse();

    // New assertion (story 0015 F7): the actor's OWN row is exempt from that same narrowing --
    // canEdit stays true for it, proving the self-row exemption rather than a blanket refusal.
    expect($users->firstWhere('id', $administrator->id))
        ->canEdit->toBeTrue();

    expect($users->firstWhere('id', $superAdminTarget->id))
        ->canEdit->toBeFalse()
        ->canDelete->toBeFalse();
});

test('an actor without users.edit or users.delete sees every row as not editable and not deletable', function () {
    $viewer = User::factory()->create();
    $viewer->givePermissionTo('users.view');
    $this->actingAs($viewer);

    $target = User::factory()->create();

    $users = collect(Livewire::test(Index::class)->get('users'));

    expect($users->firstWhere('id', $target->id))
        ->canEdit->toBeFalse()
        ->canDelete->toBeFalse();
});

test('users are listed alphabetically by name', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    User::factory()->create(['name' => 'Zoe Marin']);
    User::factory()->create(['name' => 'Ana Gil']);
    User::factory()->create(['name' => 'Diego Ferrer']);

    $names = collect(Livewire::test(Index::class)->get('users'))
        ->pluck('name')
        ->filter(fn (string $name): bool => in_array($name, ['Ana Gil', 'Diego Ferrer', 'Zoe Marin'], true))
        ->values()
        ->all();

    expect($names)->toBe(['Ana Gil', 'Diego Ferrer', 'Zoe Marin']);
});

// Story 0005 (verification only -- no component edit permitted). Both
// Index::loadUsers() and Index::usersSummary() run a bare User::query(), so
// the SoftDeletingScope installed on App\Models\User covers list rows and
// summary counts automatically. This proves that, it does not implement it.
test('a soft-deleted user is absent from the active users list and from both summary counts', function () {
    $baselineTotal = User::count();
    $baselineActive = User::where('status', UserStatus::Active)->count();

    $administrator = User::factory()->create(['status' => UserStatus::Active]);
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $target = User::factory()->create(['name' => 'Diego Ferrer', 'status' => UserStatus::Active]);
    $target->delete();

    $component = Livewire::test(Index::class);

    $ids = collect($component->get('users'))->pluck('id');
    $summary = $component->get('usersSummary');

    // Only the administrator was added to the baseline -- the deleted target
    // must not appear in the list or inflate either count.
    expect($ids)->not->toContain($target->id)
        ->and($summary['total'])->toBe($baselineTotal + 1)
        ->and($summary['active'])->toBe($baselineActive + 1);
});

test('usersSummary reports accurate totals computed independently of the users property, and counts a Super Admin holder in the total', function () {
    // Baseline against whatever already exists after the beforeEach seed, rather than
    // asserting an absolute count: RolePermissionSeeder's bootstrap provisions an extra
    // Super Admin user whenever the ambient SUPER_ADMIN_EMAIL config is set (this repo's
    // .env sets it), which a hardcoded expected total would miss. See docs/errors-log.md's
    // SUPER_ADMIN_EMAIL entry.
    $baselineTotal = User::count();
    $baselineActive = User::where('status', UserStatus::Active)->count();

    $administrator = User::factory()->create(['status' => UserStatus::Active]);
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    // Mount the component -- and so populate its #[Locked] $users property AND cache the
    // #[Computed] usersSummary()'s first evaluation (the header already renders it at mount) --
    // BEFORE any of the rows below exist. Story 0015 finding F4: $users is now #[Locked], so
    // independence can no longer be proven by forcing it empty via set('users', []).
    $component = Livewire::test(Index::class);

    User::factory()->count(3)->create(['status' => UserStatus::Active]);
    User::factory()->count(2)->create(['status' => UserStatus::Inactive]);

    $superAdmin = User::factory()->create(['status' => UserStatus::Active]);
    $superAdmin->assignRole('Super Admin');

    // Force a fresh dehydrate/hydrate/render cycle WITHOUT calling loadUsers() again: Livewire's
    // built-in '$refresh' action re-renders the current component from its existing snapshot (so
    // $this->users stays exactly what it was at mount -- created AFTER it are invisible to it,
    // proving the row set at mount could not be the source of a correct total below) and hydrates
    // a genuinely NEW PHP instance, whose #[Computed] cache (Livewire\Features\SupportComputed\
    // BaseComputed::$requestCachedValue, an in-memory-only property never part of the dehydrated
    // snapshot) starts empty -- so usersSummary() is evaluated FRESH here, not read back from the
    // value already cached during mount's own render. A bare ->get('usersSummary') without this
    // step would silently return that stale, mount-time value regardless of what usersSummary()
    // does, proving nothing about its independence from $users either way.
    $component->call('$refresh');

    // added: administrator + 3 active + 2 inactive + super admin = 7
    // added active: administrator + 3 active + super admin = 5
    $summary = $component->get('usersSummary');

    expect($summary['total'])->toBe($baselineTotal + 7)
        ->and($summary['active'])->toBe($baselineActive + 5);
});

// --- Locked properties ---

// Story 0015 finding F4: $users is the last remaining server-derived Livewire property that
// was not #[Locked] -- $editingUserId, $editingPendingEmail, $deletingUserId and
// $deletingUserName already were. A forged Livewire payload setting `users` directly must be
// rejected the same way the others already are.
test('a forged set against the users property is rejected, mirroring the existing locked-property guard', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    expect(fn () => Livewire::test(Index::class)->set('users', []))
        ->toThrow(CannotUpdateLockedPropertyException::class);
});

test('roleOptions excludes the Super Admin role', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $roleOptionsJson = json_encode(Livewire::test(Index::class)->get('roleOptions'));

    expect($roleOptionsJson)->toContain('Administrator')
        ->and($roleOptionsJson)->not->toContain('Super Admin');
});

test('the list query does not N plus 1 as the number of users grows', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    User::factory()->count(5)->create()->each(fn (User $user) => $user->assignRole($editorRole));

    // Warm Spatie's permission cache with a throwaway call before measuring: the first
    // Gate::authorize() in a process cold-loads and caches all permission/role data (a
    // fixed one-time cost, unrelated to the user count), which would otherwise be
    // miscounted as part of the list query's own cost and break the comparison below.
    Livewire::test(Index::class)->get('users');

    DB::enableQueryLog();
    Livewire::test(Index::class)->get('users');
    $smallQueryCount = count(DB::getQueryLog());
    DB::flushQueryLog();

    User::factory()->count(5)->create()->each(fn (User $user) => $user->assignRole($editorRole));
    DB::flushQueryLog();

    Livewire::test(Index::class)->get('users');
    $largeQueryCount = count(DB::getQueryLog());
    DB::disableQueryLog();

    expect($largeQueryCount)->toBe($smallQueryCount);
});

// --- Creating a user ---

test('creating a user via the form persists the user with the submitted role and status', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'New Hire')
        ->set('email', 'new.hire@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertHasNoErrors();

    $created = User::where('email', 'new.hire@arospe.es')->firstOrFail();

    expect($created->name)->toBe('New Hire')
        ->and($created->status)->toBe(UserStatus::Active)
        ->and($created->hasRole('Editor'))->toBeTrue();
});

// Regression test: the create form's roleId/status must never be genuine PHP `null`, only
// `''` (roleId) or a real UserStatus case (status). A native <select>'s wire:model sync
// assigns the dehydrated property value straight to the DOM select's `.value`; assigning the
// JS value `null` (rather than `""`) desyncs the browser's `selectedIndex` from its literal,
// disabled `selected` placeholder option. In real browser use this made the select silently
// auto-land on its first real option (id order, not the placeholder) while $roleId/$status
// stayed null server-side -- so picking that exact same option produced no `change` event and
// the pick was silently dropped, failing "The role id/status field is required." with the
// right-looking value still shown selected. See tests/Browser/UsersIndexTest.php for the
// browser-level reproduction of the failure this prevents.
test('opening the create form never leaves roleId or status as null', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->assertSet('roleId', '')
        ->assertSet('status', UserStatus::Inactive->value);
});

test('creating a user with invalid details is rejected and no user is created', function (Closure $overridesFactory) {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    $countBefore = User::count();

    $component = Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Valid Name')
        ->set('email', 'valid.create@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active->value);

    foreach ($overridesFactory() as $property => $value) {
        $component->set($property, $value);
    }

    $component->call('save')->assertHasErrors();

    expect(User::count())->toBe($countBefore);
})->with([
    'a blank name' => [fn () => ['name' => '']],
    'a malformed email address' => [fn () => ['email' => 'not-an-email']],
    'no role chosen' => [fn () => ['roleId' => null]],
    'a role that does not exist' => [fn () => ['roleId' => '999999999']],
    'the Super Admin role' => [fn () => ['roleId' => (string) Role::where('name', 'Super Admin')->where('guard_name', 'web')->value('id')]],
    // Story 0015 finding F8: a forged status value must fail validation, not raise an unhandled
    // \ValueError -- possible now that $status is a plain, non-nullable `public string`
    // (App\Livewire\Users\Index::$status) rather than a typed UserStatus enum property, which
    // hydrated a bad value BEFORE Rule::enum(UserStatus::class) ever got a chance to reject it.
    'a forged status value' => [fn () => ['status' => 'not-a-real-status']],
    'an empty status value' => [fn () => ['status' => '']],
]);

// Story 0015 finding F8: the validation error must land specifically on the status field, not
// merely "some error somewhere" -- and must never surface as an unhandled \ValueError/TypeError.
test('submitting a forged or empty status value fails validation on the status field, not an unhandled error', function (string $forgedStatus) {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Valid Name')
        ->set('email', 'valid.create@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', $forgedStatus)
        ->call('save')
        ->assertHasErrors(['status']);
})->with([
    'a forged status value' => ['not-a-real-status'],
    'an empty status value' => [''],
]);

test('creating a user with an address held as another users pending email is rejected', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    User::factory()->pendingEmail('claimed@arospe.es')->create();

    $countBefore = User::count();

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'New Hire')
        ->set('email', 'claimed@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertHasErrors(['email']);

    expect(User::count())->toBe($countBefore);
});

test('creating an active user persists the active status, not the inactive default', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Active Hire')
        ->set('email', 'active.hire@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertHasNoErrors();

    $created = User::where('email', 'active.hire@arospe.es')->firstOrFail();

    expect($created->status)->toBeInstanceOf(UserStatus::class)
        ->and($created->status)->toBe(UserStatus::Active);
});

test('creating a suspended user persists the suspended status', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Suspended Hire')
        ->set('email', 'suspended.hire@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Suspended->value)
        ->call('save')
        ->assertHasNoErrors();

    $created = User::where('email', 'suspended.hire@arospe.es')->firstOrFail();

    expect($created->status)->toBe(UserStatus::Suspended);
});

test('the submitted email is lowercased before validation, and persisted lowercased', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Marta Ruiz')
        ->set('email', 'MARTA@X.COM')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertHasNoErrors();

    $created = User::where('email', 'marta@x.com')->firstOrFail();

    expect($created->getRawOriginal('email'))->toBe('marta@x.com');
});

test('creating a case-different duplicate of an existing email is rejected as a validation error, not an unhandled exception', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    User::factory()->create(['email' => 'marta.ruiz@arospe.es']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Marta Duplicate')
        ->set('email', 'MARTA.RUIZ@AROSPE.ES')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertHasErrors(['email']);

    expect(User::where('email', 'marta.ruiz@arospe.es')->count())->toBe(1);
});

// --- Editing a user ---

test('changing a users role detaches the previous role, leaving exactly one', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $target = User::factory()->create(['name' => 'Diego Ferrer']);
    $target->assignRole($editorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('roleId', (string) $blogEditorRole->id)
        ->call('save')
        ->assertHasNoErrors();

    $target->refresh();

    expect($target->hasRole('Blog Editor'))->toBeTrue()
        ->and($target->hasRole('Editor'))->toBeFalse()
        ->and($target->roles()->count())->toBe(1);

    $morphKeyColumn = config('permission.column_names.model_morph_key');
    $rowCount = DB::table('model_has_roles')
        ->where('model_type', User::class)
        ->where($morphKeyColumn, $target->id)
        ->count();

    expect($rowCount)->toBe(1);
});

test('a user administrator changes another users status', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['status' => UserStatus::Active]);
    $target->assignRole($role);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('status', UserStatus::Suspended->value)
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->status)->toBe(UserStatus::Suspended);
});

test('an administrator can save another user unchanged email', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['email' => 'target@arospe.es']);
    $target->assignRole($role);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('name', 'Target Renamed')
        ->set('email', 'target@arospe.es')
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->name)->toBe('Target Renamed');
});

test('an administrator can save their own unchanged email', function () {
    $administrator = User::factory()->create(['email' => 'admin@arospe.es']);
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    Livewire::test(Index::class)
        ->call('openEditModal', $administrator->id)
        ->set('name', 'Admin Renamed')
        ->set('email', 'admin@arospe.es')
        ->call('save')
        ->assertHasNoErrors();

    expect($administrator->fresh()->name)->toBe('Admin Renamed');
});

test('changing an email to a different free address is accepted', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['email' => 'target@arospe.es']);
    $target->assignRole($role);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('email', 'brand-new-free-address@arospe.es')
        ->call('save')
        ->assertHasNoErrors();
});

test('assigning a role that no longer exists is rejected, and the users role is left unchanged', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $vanishingRole = Role::create(['name' => 'Vanishing Role', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($vanishingRole);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    $vanishingRole->delete();

    $component->set('name', 'Renamed While Role Vanished')
        ->call('save')
        ->assertHasErrors(['roleId']);

    expect($target->fresh()->name)->not->toBe('Renamed While Role Vanished');
});

// --- Changing an email address is never applied immediately ---

test('editing another users email holds it as pending and notifies only the new address', function () {
    Notification::fake();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['email' => 'target@arospe.es', 'status' => UserStatus::Active]);
    $target->assignRole($role);
    $originalVerifiedAt = $target->email_verified_at;

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('email', 'new-target-address@arospe.es')
        ->call('save')
        ->assertHasNoErrors();

    $target->refresh();

    expect($target->getRawOriginal('email'))->toBe('target@arospe.es')
        ->and($target->email_verified_at)->toEqual($originalVerifiedAt)
        ->and($target->status)->toBe(UserStatus::Active)
        ->and($target->pending_email)->toBe('new-target-address@arospe.es');

    Notification::assertSentOnDemandTimes(PendingEmailVerification::class, 1);
    Notification::assertSentOnDemand(
        PendingEmailVerification::class,
        fn ($notification, $channels, $notifiable): bool => ($notifiable->routes['mail'] ?? null) === 'new-target-address@arospe.es',
    );
});

test('editing the acting administrators own email holds it as pending', function () {
    Notification::fake();

    $administrator = User::factory()->create(['email' => 'admin@arospe.es', 'status' => UserStatus::Active]);
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    $originalVerifiedAt = $administrator->email_verified_at;

    Livewire::test(Index::class)
        ->call('openEditModal', $administrator->id)
        ->set('email', 'new-admin-address@arospe.es')
        ->call('save')
        ->assertHasNoErrors();

    $administrator->refresh();

    expect($administrator->getRawOriginal('email'))->toBe('admin@arospe.es')
        ->and($administrator->email_verified_at)->toEqual($originalVerifiedAt)
        ->and($administrator->pending_email)->toBe('new-admin-address@arospe.es');

    Notification::assertSentOnDemandTimes(PendingEmailVerification::class, 1);
});

test('changing a users name and email at once applies the name immediately, the email staying pending', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['email' => 'target@arospe.es']);
    $target->assignRole($role);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('name', 'Renamed Immediately')
        ->set('email', 'still-pending@arospe.es')
        ->call('save')
        ->assertHasNoErrors();

    $target->refresh();

    expect($target->name)->toBe('Renamed Immediately')
        ->and($target->pending_email)->toBe('still-pending@arospe.es')
        ->and($target->getRawOriginal('email'))->toBe('target@arospe.es');
});

test('saving a user with their email unchanged writes no pending value and sends no notification', function () {
    Notification::fake();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['email' => 'target@arospe.es']);
    $target->assignRole($role);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('name', 'Renamed Only')
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->pending_email)->toBeNull();
    Notification::assertNothingSent();
});

// --- Self-edit guard ---

test('an administrator can update their own name', function () {
    $administrator = User::factory()->create(['name' => 'Old Name']);
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    Livewire::test(Index::class)
        ->call('openEditModal', $administrator->id)
        ->set('name', 'New Own Name')
        ->call('save')
        ->assertHasNoErrors();

    expect($administrator->fresh()->name)->toBe('New Own Name');
});

test('an administrator submitting a different role for themselves has it silently ignored', function () {
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    Livewire::test(Index::class)
        ->call('openEditModal', $administrator->id)
        ->set('roleId', (string) $editorRole->id)
        ->call('save')
        ->assertHasNoErrors();

    expect($administrator->fresh()->hasRole('Administrator'))->toBeTrue()
        ->and($administrator->fresh()->hasRole('Editor'))->toBeFalse();
});

test('an administrator submitting a different status for themselves has it silently ignored', function () {
    $administrator = User::factory()->create(['status' => UserStatus::Active]);
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    Livewire::test(Index::class)
        ->call('openEditModal', $administrator->id)
        ->set('status', UserStatus::Suspended->value)
        ->call('save')
        ->assertHasNoErrors();

    expect($administrator->fresh()->status)->toBe(UserStatus::Active);
});

test('changing another users role from Editor to Blog Editor applies, unaffected by the stricter administrator permission', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $target = User::factory()->create();
    $target->assignRole($editorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('roleId', (string) $blogEditorRole->id)
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->hasRole('Blog Editor'))->toBeTrue()
        ->and($target->fresh()->hasRole('Editor'))->toBeFalse();
});

// --- Authorization ---

test('a blog editor whose role does not grant users.view is denied server-side, not merely hidden in the UI', function () {
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $blogEditorRole->givePermissionTo('blog.view');

    $editor = User::factory()->create();
    $editor->assignRole($blogEditorRole);
    $this->actingAs($editor);

    $this->get(route('users.index'))->assertForbidden();
});

test('mounting the component directly is forbidden for a user lacking users.view, even though route middleware never ran', function () {
    // Livewire::test() dispatches through the full HTTP kernel, so without this
    // the framework's exception handler converts the AuthorizationException into
    // a 403 response instead of letting it propagate to toThrow().
    $this->withoutExceptionHandling();
    $user = User::factory()->create();
    $this->actingAs($user);

    expect(fn () => Livewire::test(Index::class))->toThrow(AuthorizationException::class);
});

test('authorization for editing is re-checked inside save, not only at mount', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($role);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    // The permission to edit was revoked (the Administrator role removed) after the modal was
    // already open -- exactly the "revoked after the screen loaded" scenario.
    $administrator->removeRole('Administrator');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->set('name', 'Should Not Persist')->call('save'))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->name)->not->toBe('Should Not Persist');
});

test('submitting the Super Admin role id is refused server-side, and that users role is left unchanged', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);

    $superAdminRole = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('roleId', (string) $superAdminRole->id)
        ->call('save')
        ->assertHasErrors(['roleId']);

    expect($target->fresh()->hasRole('Editor'))->toBeTrue()
        ->and($target->fresh()->hasRole('Super Admin'))->toBeFalse();
});

test('editing a user who holds the Super Admin role is refused, and that user is unchanged', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);

    $superAdminUser = User::factory()->create(['name' => 'Untouchable']);
    $superAdminUser->assignRole('Super Admin');

    expect(fn () => Livewire::test(Index::class)
        ->call('openEditModal', $superAdminUser->id)
        ->set('name', 'Should Not Change')
        ->call('save'))
        ->toThrow(AuthorizationException::class);

    expect($superAdminUser->fresh()->name)->toBe('Untouchable');
});

// --- Administrator-level guards ---

test('creating a user holding the seeded Administrator role is denied without the stricter permission, and no user is created', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $countBefore = User::count();

    expect(fn () => Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'New Administrator')
        ->set('email', 'new.administrator@arospe.es')
        ->set('roleId', (string) $administratorRole->id)
        ->set('status', UserStatus::Active->value)
        ->call('save'))
        ->toThrow(AuthorizationException::class);

    expect(User::count())->toBe($countBefore);
});

test('creating a user holding the seeded Administrator role succeeds with the stricter permission', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'New Administrator')
        ->set('email', 'new.administrator@arospe.es')
        ->set('roleId', (string) $administratorRole->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertHasNoErrors();

    $created = User::where('email', 'new.administrator@arospe.es')->firstOrFail();

    expect($created->hasRole('Administrator'))->toBeTrue();
});

test('promoting a user to Administrator without the stricter permission is denied, and that users role is left unchanged', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    expect(fn () => $component->set('roleId', (string) $administratorRole->id)->call('save'))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->hasRole('Editor'))->toBeTrue()
        ->and($target->fresh()->hasRole('Administrator'))->toBeFalse();
});

test('promoting a user to Administrator with the stricter permission succeeds', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('roleId', (string) $administratorRole->id)
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->hasRole('Administrator'))->toBeTrue();
});

// Story 0015 finding F7 restructuring: openEditModal() now gates on updateSensitiveAttributes
// for any OTHER Administrator-holding target, so an actor lacking roles.manage-administrators
// can no longer reach save()'s edit branch at all -- editingUserId is #[Locked] and only
// openEditModal() populates it. The permission is granted so the opener succeeds and reaches
// the mutating call, then revoked (and the permission cache flushed) before save() -- the same
// shape already shipped at "authorization for editing is re-checked inside save" above and at
// tests/Feature/Roles/IndexTest.php's "calling deleteRole() directly without roles.manage" --
// so this still proves the refusal happens on the write, not merely "somewhere before it".
test('downgrading an Administrator without the stricter permission is denied, and that users role is left unchanged', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators'); // held to open; revoked below
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($administratorRole);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    $administrator->revokePermissionTo('roles.manage-administrators');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->set('roleId', (string) $editorRole->id)->call('save'))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->hasRole('Administrator'))->toBeTrue();
});

test('downgrading an Administrator with the stricter permission succeeds', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($administratorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('roleId', (string) $editorRole->id)
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->hasRole('Editor'))->toBeTrue()
        ->and($target->fresh()->hasRole('Administrator'))->toBeFalse();
});

// Story 0015 finding F7 restructuring: confirmDelete() now authorizes 'delete' unconditionally
// (it always did need Gate::authorize('delete', ...), but with no self-row exemption --
// see F11's interaction note), and UserPolicy::delete() requires roles.manage-administrators for
// an Administrator-holding target exactly as this test's actor lacks. Verified to collide
// deterministically with confirmDelete()'s own new gate, so -- same shape as the downgrade
// restructuring above -- the permission is held to open the delete confirmation and revoked
// (with the permission cache flushed) only before the mutating call.
test('deleting a user holding the Administrator role without the stricter permission is denied, and that user still exists', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators'); // held to open; revoked below
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create();
    $target->assignRole($administratorRole);

    $component = Livewire::test(Index::class)->call('confirmDelete', $target->id);

    $administrator->revokePermissionTo('roles.manage-administrators');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->call('deleteUser'))->toThrow(AuthorizationException::class);

    expect(User::find($target->id))->not->toBeNull();
});

test('deleting a user holding the Administrator role succeeds with the stricter permission', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create();
    $target->assignRole($administratorRole);

    Livewire::test(Index::class)
        ->call('confirmDelete', $target->id)
        ->call('deleteUser');

    expect(User::find($target->id))->toBeNull();
});

test('deleting an ordinary roleless user is not blocked by the administrator-level guard', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators, but holds users.delete
    $this->actingAs($administrator);

    $target = User::factory()->create();

    Livewire::test(Index::class)
        ->call('confirmDelete', $target->id)
        ->call('deleteUser');

    expect(User::find($target->id))->toBeNull();
});

// --- F11: self-delete guard ---
//
// Story 0015 finding F11: deleteUser() resolves the target, authorizes and deletes with no
// self-check, and UserPolicy::delete() has none either -- a Super Admin actor bypasses that
// policy entirely via Gate::before, so nothing stops a Super Admin, or any actor whose own row
// UserPolicy::delete() would otherwise allow, from deleting their own account from this screen.

test('an actor holding users.delete directly, with no privileged role of their own, deleting their own account through the Users screen is a silent no-op', function () {
    $actor = User::factory()->create();
    // Direct permissions, no role at all -- users.view is required too, since mount() gates on
    // viewAny independently of users.delete (without it, Livewire::test() 403s at mount and the
    // subsequent chained ->call()s fail with a confusing "Invalid Livewire snapshot structure"
    // error instead of a clean signal).
    $actor->givePermissionTo(['users.view', 'users.delete']);
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('confirmDelete', $actor->id)
        ->call('deleteUser');

    expect(User::find($actor->id))->not->toBeNull();
});

test('a Super Admin actor deleting their own account through the Users screen is a silent no-op', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    Livewire::test(Index::class)
        ->call('confirmDelete', $superAdmin->id)
        ->call('deleteUser');

    expect(User::find($superAdmin->id))->not->toBeNull();
});

// F7 interaction: confirmDelete()'s new gate carries no self-row exemption (unlike
// openEditModal()'s), so an actor whose own row holds Administrator is refused there -- the
// same AuthorizationException UserPolicy::delete() already produces for any OTHER
// Administrator-holding target -- and F11's silent no-op never gets a chance to fire.
test('an actor whose own row holds the Administrator role is refused at confirmDelete for their own row, before F11s self-delete no-op could ever fire', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators
    $this->actingAs($administrator);

    $component = Livewire::test(Index::class);

    expect(fn () => $component->call('confirmDelete', $administrator->id))
        ->toThrow(AuthorizationException::class);

    expect($component->get('deletingUserId'))->toBeNull();
    expect(User::find($administrator->id))->not->toBeNull();
});

// Story 0015 finding F7: this test used to prove that saving an unchanged Administrator role
// needs no stricter permission -- it succeeded because the mutating save() ran. Since F7 adds
// an unconditional updateSensitiveAttributes gate to openEditModal() itself for any OTHER
// target, an actor lacking roles.manage-administrators can no longer open this Administrator-
// holding target's edit modal at all, so the refusal now happens there instead -- rewritten to
// assert exactly that, per the story's enumerated list of intentional test changes.
test('opening the edit modal for an existing Administrator target without the stricter permission is refused at the opener', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create(['name' => 'Existing Admin']);
    $target->assignRole($administratorRole);

    expect(fn () => Livewire::test(Index::class)->call('openEditModal', $target->id))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->name)->toBe('Existing Admin');
});

// --- Security audit finding F1 (Phase 4): status/email on an Administrator target ---
// require roles.manage-administrators too, not only a role change -- suspending or
// seizing an Administrator's account is the same effect a role-change guard exists
// to prevent.

// Story 0015 finding F7 restructuring: same shape as the downgrade/delete restructurings above
// -- the permission is held to open the edit modal (openEditModal() now gates on
// updateSensitiveAttributes for any OTHER Administrator-holding target) and revoked, with the
// permission cache flushed, only before the mutating save() call.
test('changing an Administrators status without the stricter permission is denied, and that users status is left unchanged', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators'); // held to open; revoked below
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create(['status' => UserStatus::Active]);
    $target->assignRole($administratorRole);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    $administrator->revokePermissionTo('roles.manage-administrators');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->set('status', UserStatus::Suspended->value)->call('save'))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->status)->toBe(UserStatus::Active);
});

test('changing an Administrators status with the stricter permission succeeds', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create(['status' => UserStatus::Active]);
    $target->assignRole($administratorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('status', UserStatus::Suspended->value)
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->status)->toBe(UserStatus::Suspended);
});

// Story 0015 finding F7 restructuring: same shape as the status test above.
test('changing an Administrators email without the stricter permission is denied, and that users email is left unchanged', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators'); // held to open; revoked below
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create(['email' => 'admin.target@arospe.es']);
    $target->assignRole($administratorRole);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    $administrator->revokePermissionTo('roles.manage-administrators');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->set('email', 'attacker@arospe.es')->call('save'))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->email)->toBe('admin.target@arospe.es')
        ->and($target->fresh()->pending_email)->toBeNull();
});

test('changing an Administrators email with the stricter permission succeeds and holds it as pending', function () {
    Notification::fake();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create(['email' => 'admin.target@arospe.es']);
    $target->assignRole($administratorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('email', 'new.address@arospe.es')
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->email)->toBe('admin.target@arospe.es')
        ->and($target->fresh()->pending_email)->toBe('new.address@arospe.es');

    Notification::assertSentOnDemandTimes(PendingEmailVerification::class, 1);
});

// Over-blocking regression: a non-Administrator target's status/email changes must not
// require the stricter permission -- only an Administrator-holding target does.

test('changing a non-Administrators status does not require the stricter permission', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['status' => UserStatus::Active]);
    $target->assignRole($editorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('status', UserStatus::Suspended->value)
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->status)->toBe(UserStatus::Suspended);
});

test('a Super Admin actor can promote a user to Administrator without holding roles.manage-administrators explicitly', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create();

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('roleId', (string) $administratorRole->id)
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->hasRole('Administrator'))->toBeTrue();
});

// --- F7: authorize the disclosure paths, not only the mutating ones ---
//
// Story 0015 finding F7: openCreateModal(), openEditModal() and confirmDelete() previously
// performed no authorization of their own at all -- openEditModal() in particular copied a
// target's pending_email and status into public component state before any check ran.

test('calling openCreateModal directly is refused for an actor lacking users.create', function () {
    $this->withoutExceptionHandling();
    $viewer = User::factory()->create();
    $viewer->givePermissionTo('users.view'); // deliberately not users.create
    $this->actingAs($viewer);

    expect(fn () => Livewire::test(Index::class)->call('openCreateModal'))
        ->toThrow(AuthorizationException::class);
});

test('calling openEditModal directly against another user is refused for an actor lacking users.edit', function () {
    $this->withoutExceptionHandling();
    $viewer = User::factory()->create();
    $viewer->givePermissionTo('users.view'); // deliberately not users.edit
    $this->actingAs($viewer);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    expect(fn () => Livewire::test(Index::class)->call('openEditModal', $target->id))
        ->toThrow(AuthorizationException::class);
});

test('calling confirmDelete directly against another user is refused for an actor lacking users.delete', function () {
    $this->withoutExceptionHandling();
    $viewer = User::factory()->create();
    $viewer->givePermissionTo('users.view'); // deliberately not users.delete
    $this->actingAs($viewer);

    $target = User::factory()->create();

    expect(fn () => Livewire::test(Index::class)->call('confirmDelete', $target->id))
        ->toThrow(AuthorizationException::class);
});

test('opening the edit modal for another Administrator-holding target is refused before the target status or pending email is disclosed', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()
        ->pendingEmail('secret-pending@arospe.es')
        ->create(['status' => UserStatus::Suspended]);
    $target->assignRole($administratorRole);

    $component = Livewire::test(Index::class);

    expect(fn () => $component->call('openEditModal', $target->id))
        ->toThrow(AuthorizationException::class);

    // Asserting the component's own state, not only the exception: a check placed AFTER the
    // assignments would also pass a bare toThrow() test while still having disclosed the
    // values -- these two properties are exactly what F7 exists to keep undisclosed.
    expect($component->get('status'))->toBe(UserStatus::Inactive->value)
        ->and($component->get('editingPendingEmail'))->toBeNull();
});

test('F7 must-not-over-block: the same actor still opens an ordinary targets edit modal', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['name' => 'Ordinary Target']);
    $target->assignRole($editorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->assertSet('editingUserId', $target->id);
});

test('F7 must-not-over-block, self row: an actor lacking roles.manage-administrators still opens, renames and re-emails their own row, and canEdit stays true for it', function () {
    $administrator = User::factory()->create(['name' => 'Old Own Name', 'email' => 'own-row@arospe.es']);
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators
    $this->actingAs($administrator);

    $component = Livewire::test(Index::class);

    $component->call('openEditModal', $administrator->id)
        ->assertSet('editingUserId', $administrator->id);

    $component->set('name', 'New Own Name')
        ->set('email', 'new-own-row@arospe.es')
        ->call('save')
        ->assertHasNoErrors();

    expect($administrator->fresh()->name)->toBe('New Own Name')
        ->and($administrator->fresh()->pending_email)->toBe('new-own-row@arospe.es');

    $ownRow = collect($component->get('users'))->firstWhere('id', $administrator->id);

    expect($ownRow['canEdit'])->toBeTrue();
});

// --- Malformed / unknown ids handled by the component itself ---

test('openEditModal fails cleanly for an unknown id', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $unknownId = (string) Str::uuid7();

    expect(fn () => Livewire::test(Index::class)->call('openEditModal', $unknownId))
        ->toThrow(ModelNotFoundException::class);
});

test('openEditModal fails cleanly for a malformed id', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    expect(fn () => Livewire::test(Index::class)->call('openEditModal', 'not-a-uuid'))
        ->toThrow(ModelNotFoundException::class);
});

test('confirmDelete fails cleanly for an unknown id', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $unknownId = (string) Str::uuid7();

    expect(fn () => Livewire::test(Index::class)->call('confirmDelete', $unknownId))
        ->toThrow(ModelNotFoundException::class);
});

test('confirmDelete fails cleanly for a malformed id', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    expect(fn () => Livewire::test(Index::class)->call('confirmDelete', 'not-a-uuid'))
        ->toThrow(ModelNotFoundException::class);
});

// --- Spatie permission cache freshness (revocation direction) ---

test('revoking a permission via a role change is reflected immediately, not masked by a stale cache', function () {
    $limitedRole = Role::create(['name' => 'Limited Role', 'guard_name' => 'web']);
    $limitedRole->givePermissionTo(['products.view']); // deliberately withholds products.delete

    $user = User::factory()->create();
    $user->assignRole('Administrator'); // Administrator holds products.delete

    expect($user->hasPermissionTo('products.delete'))->toBeTrue();

    $user->syncRoles([$limitedRole]);

    // No forgetCachedPermissions() call here, between Act and Assert: if a stale cache were
    // masking the revocation, this assertion -- not a call the test makes for it -- is what
    // must catch it.
    expect($user->fresh()->hasPermissionTo('products.delete'))->toBeFalse();
});

// =====================================================================
// $this->get(route('users.index'))
// =====================================================================

test('guests are redirected to the login page when visiting the users screen', function () {
    $this->get(route('users.index'))->assertRedirect(route('login'));
});

test('a user without users.view is forbidden from the users screen', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('users.index'))->assertForbidden();
});

test('a user holding users.view can reach the users screen', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $this->get(route('users.index'))->assertOk();
});

test('a Super Admin can reach the users screen', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    $this->get(route('users.index'))->assertOk();
});
