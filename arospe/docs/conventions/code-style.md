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

_Last updated: 2026-08-24 — Task 0015a (step-up authentication for privileged Users actions), Phase 6:
added the constructor-injection exception, with the real ✅/❌ pair from
`App\Actions\Auth\EnsureRecentPasswordConfirmation`'s three call sites (two constructor-injected, one
method-injected, one `app()`-resolved out of necessity) — found during Phase 6 review rather than named
by the change→doc mapping, since this page's "Inject single-purpose actions per-method" rule reads as
contradicted by two of the three until the reason is stated._

_Previously: 2026-07-12 — Initial scaffold of the documentation set by the docs-maintainer skill._
