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

_Last updated: 2026-07-12 — Initial scaffold of the documentation set by the docs-maintainer skill._
