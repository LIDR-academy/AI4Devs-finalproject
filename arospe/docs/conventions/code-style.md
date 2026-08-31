# Code Style

Real conventions observed and enforced in this codebase, each with a genuine example. Formatting itself (spacing, import order) is enforced mechanically by Pint (`pint.json` — Laravel preset) and doesn't need manual attention; run `vendor/bin/pint --dirty --format agent` after any PHP change. Static analysis runs at Larastan level 7 (`phpstan.neon`).

## Table of Contents

- [Explicit types everywhere](#explicit-types-everywhere)
- [Always use curly braces](#always-use-curly-braces)
- [Centralize shared validation in traits](#centralize-shared-validation-in-traits)
- [PHPDoc array shapes over inline comments](#phpdoc-array-shapes-over-inline-comments)
- [Inject single-purpose actions per-method](#inject-single-purpose-actions-per-method)

## Explicit types everywhere

✅ Good — every method declares parameter and return types, including array shapes in the docblock when the type alone isn't expressive enough:

```php
// app/Actions/Fortify/CreateNewUser.php
/**
 * Validate and create a newly registered user.
 *
 * @param  array<string, string>  $input
 */
public function create(array $input): User
{
    Validator::make($input, [
        ...$this->profileRules(),
        'password' => $this->passwordRules(),
    ])->validate();

    return User::create([
        'name' => $input['name'],
        'email' => $input['email'],
        'password' => $input['password'],
    ]);
}
```

❌ Bad — the same method without types (adapted to illustrate the violation; this is not real code in the repo):

```php
// anti-pattern — do not write this
public function create($input)
{
    // ...
    return User::create([...]);
}
```
Without `array $input` and `: User`, Larastan (level 7) cannot verify the return value and IDEs lose autocomplete on the caller side.

## Always use curly braces

✅ Good — every conditional in the codebase, even trivial ones, uses braces:

```php
// app/Livewire/Settings/Security.php
public function mount(DisableTwoFactorAuthentication $disableTwoFactorAuthentication): void
{
    $this->canManageTwoFactor = Features::canManageTwoFactorAuthentication();

    if ($this->canManageTwoFactor) {
        if (Fortify::confirmsTwoFactorAuthentication() && is_null(auth()->user()->two_factor_confirmed_at)) {
            $disableTwoFactorAuthentication(auth()->user());
        }
        // ...
    }
}
```

❌ Bad — brace-less single-line form (adapted to illustrate; not present in the repo):

```php
// anti-pattern — do not write this
if ($this->canManageTwoFactor)
    $this->twoFactorEnabled = auth()->user()->hasEnabledTwoFactorAuthentication();
```
Brace-less bodies are easy to break silently when a second statement is added later.

## Centralize shared validation in traits

✅ Good — password and profile rules live in one trait each and are reused everywhere they're needed, instead of being rewritten per call site:

```php
// app/Concerns/PasswordValidationRules.php
trait PasswordValidationRules
{
    protected function passwordRules(): array
    {
        return ['required', 'string', Password::default(), 'confirmed'];
    }

    protected function currentPasswordRules(): array
    {
        return ['required', 'string', 'current_password'];
    }
}
```

Consumed identically by `App\Actions\Fortify\CreateNewUser`, `App\Actions\Fortify\ResetUserPassword`, `App\Livewire\Settings\Security`, and `App\Livewire\Settings\DeleteUserForm` — four call sites, one definition.

❌ Bad — inlining the same rule array at each call site (adapted to illustrate; the trait exists specifically to prevent this):

```php
// anti-pattern — do not duplicate rules like this in a new component
$this->validate([
    'password' => ['required', 'string', Password::default(), 'confirmed'],
]);
```
If the password policy changes, a duplicated rule array means updating N call sites instead of one trait method — and it's easy to miss one.

## PHPDoc array shapes over inline comments

✅ Good — when a property or return value is a structured array, its shape is documented with a PHPDoc array-shape annotation, not an inline comment:

```php
// app/Livewire/Settings/Security.php
/**
 * @var array<int, array{id: int, name: string, authenticator: string|null, created_at_diff: string, last_used_at_diff: string|null}>
 */
#[Locked]
public array $passkeys = [];
```

```php
// app/Livewire/Settings/Security.php
/**
 * @return array{title: string, description: string, buttonText: string}
 */
#[Computed]
public function modalConfig(): array
{
    // ...
}
```

❌ Bad — describing the same shape in a trailing inline comment (adapted to illustrate):

```php
// anti-pattern — do not write this
public array $passkeys = []; // array of {id, name, authenticator, created_at_diff, last_used_at_diff}
```
Array-shape PHPDoc is understood by Larastan and IDEs for static analysis and autocomplete; a prose comment is not.

## Inject single-purpose actions per-method

✅ Good — Fortify/Passkeys action classes are type-hinted directly as method parameters on the Livewire component (Livewire/Laravel resolves them from the container per call), not resolved manually or pulled in through the constructor:

```php
// app/Livewire/Settings/Security.php
public function deletePasskey(DeletePasskey $deletePasskey): void
{
    if (! $this->deletingPasskeyId) {
        return;
    }

    $user = Auth::user();
    $passkey = $user->passkeys()->findOrFail($this->deletingPasskeyId);

    $deletePasskey($user, $passkey);

    $this->closeDeleteModal();
    $this->loadPasskeys();
}
```

The same pattern repeats for `enable(EnableTwoFactorAuthentication ...)`, `disable(DisableTwoFactorAuthentication ...)`, `confirmTwoFactor(ConfirmTwoFactorAuthentication ...)` in the same file, and `deleteUser(Logout $logout)` in `app/Livewire/Settings/DeleteUserForm.php`.

❌ Bad — resolving the action manually inside the method body (adapted to illustrate; not present in the repo):

```php
// anti-pattern — do not write this
public function deletePasskey(): void
{
    $deletePasskey = app(DeletePasskey::class);
    // ...
}
```
Method-parameter injection keeps the dependency visible in the signature (easier to test and to read) and matches every other action call site in this codebase.

### Exception: an action's own dependency is constructor-injected when the method signature is a public contract

Task 0015a's `App\Actions\Auth\EnsureRecentPasswordConfirmation` is used three ways in the same
story, and only one of them follows the rule above:

```php
// app/Actions/Users/UpdateUser.php — constructor injection
public function __construct(
    private readonly EnsureRecentPasswordConfirmation $ensureRecentPasswordConfirmation,
) {}

public function __invoke(User $user, string $name, string $email, string $roleId, UserStatus $status, RequestEmailChange $requestEmailChange): User
{
    // ...
    ($this->ensureRecentPasswordConfirmation)();
}
```

```php
// app/Livewire/Users/Index.php — method injection, the rule above
public function deleteUser(EnsureRecentPasswordConfirmation $ensureRecentPasswordConfirmation): void
{
    // ...
}
```

`UpdateUser` and `CreateUser` constructor-inject it; `Index::deleteUser()` method-injects it. Neither
is arbitrary. `__invoke()`'s parameter list on both actions is a **public contract**, called with
exactly those domain arguments by both `App\Livewire\Users\Index` and every direct-call test (per the
0008a rule that the action must be independently callable) — widening it to also carry the guard as a
parameter would put an internal dependency in a signature callers must match verbatim. `deleteUser()`
has no such external contract (it is a Livewire action method, called only via `wire:click` /
`Livewire::test()->call()`), so the rule above applies unmodified there.

❌ Bad — do not "fix" `UpdateUser`/`CreateUser` to match `deleteUser()`'s shape (adapted to illustrate):

```php
// anti-pattern — do not widen __invoke()'s signature for an internal dependency
public function __invoke(User $user, string $name, string $email, string $roleId, UserStatus $status, RequestEmailChange $requestEmailChange, EnsureRecentPasswordConfirmation $ensureRecentPasswordConfirmation): User
```

A fourth call site, `App\Livewire\Users\Index::requiresPasswordConfirmation()`, resolves the same
class with `app(EnsureRecentPasswordConfirmation::class)` — the ❌ shape above, in the one place it is
actually correct: a `#[Computed]` method takes no parameters at all (Livewire calls it with none), so
neither constructor nor method injection is available, and manual container resolution is the only
option. Don't read this as license to reach for `app()` elsewhere.

Task 0015b repeats the same split for `App\Actions\Auth\LogRefusedPrivilegedAttempt` across seven
classes — constructor-injected into all five domain actions, method-injected into both Livewire
components' action methods — which is the rule and its documented exception applied unchanged, not a
third case. What it does add is the constraint that falls out of the exception:

> **An action must be resolved from the container, never `new`-ed — including in tests.** This story
> gave `RequestEmailChange`, `EnforceAdministratorPermissionGrant` and `EnforceGrantorPermissionScope`
> their **first** constructor dependency, and every existing `new RequestEmailChange` call site broke
> at once: ten of them in `tests/Feature/Settings/EmailChangeTest.php`, each rewritten to
> `app(RequestEmailChange::class)` with no assertion touched. A zero-argument constructor is not a
> contract — the constructor is where this convention says a shared dependency goes, so any action can
> acquire one in a later story.

Task 0017 extends the same split to a third area without altering it — `LogRefusedPrivilegedAttempt` is now constructor-injected into **eight** domain actions and method-injected into **three** Livewire components' action methods — and adds the exception's clearest case yet: **one action depending on another**. `App\Actions\SalesRegions\SetSalesRegionActive` constructor-injects `SetDefaultSalesRegion`, because `__invoke(SalesRegion $region, bool $active, ?SalesRegion $replacementDefault = null)` is a signature every caller — the component and every direct-call test — matches verbatim, so widening it with a collaborator would put an internal dependency into a public contract:

```php
// app/Actions/SalesRegions/SetSalesRegionActive.php
public function __construct(
    private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    private readonly SetDefaultSalesRegion $setDefaultSalesRegion,
) {}
```

❌ Bad — reaching for `app()` here (the shape 0017's own Phase 1 draft proposed before it was corrected):

```php
// anti-pattern — app() is for a zero-parameter #[Computed] method, not for an action's collaborator
($replacement !== null) && app(SetDefaultSalesRegion::class)($replacement);
```

`app()` earns its one exception because a `#[Computed]` method **cannot** accept parameters; an action's constructor is available, so nothing forces the container call. The distinction matters for testability: a constructor dependency can be swapped in a test, an `app()` call inside a method body cannot without binding the container.

Story 0020 adds the exception's **second** shape, which generalises the reason rather than adding a special case. `App\Livewire\Media\Gallery::updatedPendingUploads()` — a Livewire `updated<Property>()` lifecycle hook — resolves two collaborators with `app()` before delegating:

```php
// app/Livewire/Media/Gallery.php
public function updatedPendingUploads(): void
{
    if ($this->pendingUploads === []) {
        return;
    }

    $this->upload(app(StoreUploadedImage::class), app(LogRefusedPrivilegedAttempt::class));
}
```

Livewire invokes lifecycle hooks through `wrap($component)->__call($name, $params)` with **fixed** parameters, not a container `call()`, so a type-hinted parameter here is never resolved. `upload()` itself keeps its ordinary method-injected signature, because it is *also* called directly by every Feature test and **is** container-resolved on that path — the hook is a caller, not a replacement for the signature.

**So the rule is not "a `#[Computed]` method may use `app()`" — it is: a method whose parameter list is fixed by something other than this class may use `app()`, and nothing else may.** Two instances now, a `#[Computed]` property and a lifecycle hook, and both answer the same question the same way: *is there any signature the author controls that the container would honour?* If yes, use it.

Story 0022 reuses `updatedSearch()`'s already-established lifecycle-hook shape (`App\Livewire\Components\SearchableMultiSelect` resolves `NormalizeForSearch` with `app()` there for the identical reason `Gallery::updatedPendingUploads()` does), and adds a **third** shape to the rule rather than a fourth instance of an existing one. `hasSearchedEnough()` is a plain public method — not `#[Computed]`, not a lifecycle hook — called directly from the Blade view with `$this->hasSearchedEnough()`:

```php
// app/Livewire/Components/SearchableMultiSelect.php
public function hasSearchedEnough(): bool
{
    return mb_strlen(app(NormalizeForSearch::class)->__invoke($this->search)) >= $this->minSearchLength;
}
```

```blade
{{-- resources/views/livewire/components/searchable-multi-select.blade.php --}}
@if ($this->hasSearchedEnough())
```

The Blade template's own call site is what fixes the parameter list here — a view invokes `$this->method()` with exactly the arguments it writes, and this one writes none — so the rule's test ("is there any signature the author controls that the container would honour?") answers `no` here for the same underlying reason it answers `no` for a `#[Computed]` property or a lifecycle hook: **the caller is not this class, and the caller cannot be made to pass a dependency.** The rule's own wording — "a method whose parameter list is fixed by something other than this class" — already covered this shape without needing a rewrite; it had simply never had an example that was neither `#[Computed]` nor a lifecycle hook until now.

✅ Good — how a direct-call test reaches an action, per the 0008a rule that these are independently callable:

```php
// tests/Feature/Settings/EmailChangeTest.php
app(RequestEmailChange::class)($user, 'new-address@example.com');
```

❌ Bad — the shape those ten call sites used until task 0015b:

```php
// anti-pattern — breaks the moment the action gains its first constructor dependency
(new RequestEmailChange)($user, 'new-address@example.com');
```

_Last updated: 2026-08-31 — Story 0022 (Shared searchable, server-side-filtered multi-select component). Extended the `app()` carve-out's list of confirmed instances with a **third shape**, not a rewritten rule: `App\Livewire\Components\SearchableMultiSelect::hasSearchedEnough()`, a plain public method (neither `#[Computed]` nor a Livewire lifecycle hook) invoked directly from its Blade view as `$this->hasSearchedEnough()` with a fixed, zero-argument call site — the rule's existing wording already covered it, since the Blade template rather than this class is what fixes the parameter list. `updatedSearch()` in the same component reuses the already-established lifecycle-hook shape (`app(NormalizeForSearch::class)`, matching `Gallery::updatedPendingUploads()`) rather than adding a fourth. **Verified as unchanged rather than assumed:** every other section on this page (explicit types, braces, validation traits, PHPDoc array shapes, per-method action injection) — this story adds no new action, no new validation trait, and its one `array<int, array{...}>` PHPDoc shape on `MultiSelectOptionsResolver::search()`/`resolveSelected()` is the existing array-shape convention applied, not extended._

_Previously: 2026-08-29 — Story 0020 (Shared media gallery modal — frontend), Phase 6: extended the
`app()` carve-out with its **second** shape and, more usefully, restated the rule behind it. It had read
as "a `#[Computed]` method may use `app()`", which is a description of the one instance that existed;
story 0020's `Gallery::updatedPendingUploads()` is a Livewire lifecycle hook — invoked through
`wrap($component)->__call($name, $params)` with fixed parameters rather than a container `call()`, so a
type-hint there is never resolved — and it fails the same test for the same reason. The rule is now
stated once: **a method whose parameter list is fixed by something other than this class may use
`app()`, and nothing else may.** Note the hook delegates to `upload()`, which keeps its ordinary
method-injected signature because it is also called directly (and container-resolved) by every Feature
test — the hook is a caller, not a replacement for the signature. Nothing else on this page changed: the
story's new action (`App\Actions\Media\UpdateMediaDetails`) constructor-injects
`LogRefusedPrivilegedAttempt` for the reason the documented exception already gives — its `__invoke()`
parameter list is a public contract — and its `array<int, array{...}>` payload shapes and explicit
return types are the existing type/PHPDoc rules applied, not new ones._

_Previously: 2026-08-26 — Task 0017 (Sales Region tax configuration — backend), Phase 6: extended the
constructor-injection exception with **the clearest case it has** — one action constructor-injecting
another (`SetSalesRegionActive` ← `SetDefaultSalesRegion`), with the ❌ pair against `app()`, which this
story's own Phase 1 draft proposed before Phase 2 corrected it. The distinction is not stylistic: `app()`
earns its single exception because a zero-parameter `#[Computed]` method *cannot* accept an injected
dependency, whereas an action's constructor always can — and a constructor dependency is swappable in a
test where an `app()` call in a method body is not. Also refreshed the two counts in the 0015b paragraph
above it, which had become under-counts (`LogRefusedPrivilegedAttempt` is now constructor-injected into
**eight** actions and method-injected into **three** components); the 0015b sentence itself is left as the
historical statement it is. Nothing else on this page changed: no new type, brace, validation-trait or
PHPDoc convention, and the story's own `@return array<int, ValidationRule|array<mixed>|string>` trait
docblocks and `array<int, array{...}>` shapes on `$regions` / `replacementCandidates()` are the existing
rules applied, not new ones._

_Previously: 2026-08-24 — Task 0015b (log refused privileged attempts), Phase 6: extended the
constructor-injection exception with the constraint that falls out of it — **an action must be resolved
from the container, never `new`-ed, including in tests**. This story gave three actions their *first*
constructor dependency, and every `new RequestEmailChange` call site broke at once (ten in
`tests/Feature/Settings/EmailChangeTest.php`, all rewritten to `app(RequestEmailChange::class)` with no
assertion changed), which is the proof that a zero-argument constructor is not a contract. The story's
own seven injection sites are the existing rule and its exception applied unchanged — five actions
constructor-inject `LogRefusedPrivilegedAttempt`, both Livewire components method-inject it — not a
third case, so the rule above is unmodified. Nothing else on this page changed: no new type, brace,
validation-trait or PHPDoc convention._

_Previously: 2026-08-24 — Task 0015a (step-up authentication for privileged Users actions), Phase 6:
added the constructor-injection exception, with the real ✅/❌ pair from
`App\Actions\Auth\EnsureRecentPasswordConfirmation`'s three call sites (two constructor-injected, one
method-injected, one `app()`-resolved out of necessity) — found during Phase 6 review rather than named
by the change→doc mapping, since this page's "Inject single-purpose actions per-method" rule reads as
contradicted by two of the three until the reason is stated._

_Previously: 2026-07-12 — Initial scaffold of the documentation set by the docs-maintainer skill._
