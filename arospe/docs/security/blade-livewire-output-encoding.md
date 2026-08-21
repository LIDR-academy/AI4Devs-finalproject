# Blade / Livewire Output Encoding

Rules governing where server data may be interpolated in this repo's Blade views, established by the
Phase 4 audit of task 0006 (the Users list/editor UI) — this repo's first screen that renders a
per-row action carrying a record identifier.

The short version: **`{{ }}` is the right default and it is used everywhere in this repo, but it is
an *HTML* escaper. It does not make a value safe in the one non-HTML context this codebase now has —
the inside of a `wire:*` / `x-on:*` directive value, which is JavaScript.**

## Table of Contents

- [`{{ }}` inside a `wire:` directive is not escaping — it is an injection sink](#--inside-a-wire-directive-is-not-escaping--it-is-an-injection-sink)
- [The client can rewrite any public property that is not `#[Locked]`, including the one feeding the loop](#the-client-can-rewrite-any-public-property-that-is-not-locked-including-the-one-feeding-the-loop)
- [What is already safe and needs no change](#what-is-already-safe-and-needs-no-change)

## `{{ }}` inside a `wire:` directive is not escaping — it is an injection sink

The Users list renders a per-row edit action by interpolating the row's id into the directive value:

```blade
{{-- resources/views/livewire/users.blade.php --}}
<flux:button wire:click="openEditModal('{{ $user['id'] }}')">
```

This reads like a safe Blade echo. It is not, and the reason is worth internalising because the same
shape will recur on every future module screen (products, blog, orders):

1. **Livewire hands the attribute value to a JavaScript evaluator.** `wire:<event>` is rewritten to
   `x-on:<event>` and evaluated as JS — verified in the installed vendor build:

   ```js
   // vendor/livewire/livewire/dist/livewire.esm.js — js/directives/wire-wildcard.js
   let attribute = directive.rawName.replace("wire:", "x-on:");
   // ...
   evaluateActionExpression(el, expression, { scope: { $event: e } });
   ```

   `evaluateActionExpression()` calls `Alpine.evaluateRaw()`, which compiles the string with
   `new AsyncFunction`. Before that, `contextualizeExpression()` lifts quoted string literals out
   with `/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g` and re-inserts them verbatim — so a quote that closes the
   literal early leaves the remainder as executable code.

2. **Blade's escaping is undone by the HTML parser before Livewire ever sees the value.** `{{ }}` is
   `e()` → `htmlspecialchars(..., ENT_QUOTES)`, so `'` becomes `&#039;` (confirmed:
   `e("x') + alert(1) + ('")` → `x&#039;) + alert(1) + (&#039;`). But the browser decodes entities in
   attribute values, so `el.getAttribute('wire:click')` returns the `'` back. **The escaping buys
   exactly nothing in this context.**

Today this is not exploitable: `$user['id']` is a UUIDv7 produced by `HasUuids`, `id` is absent from
`App\Models\User`'s `#[Fillable]`, and nothing in the app writes it. The same holds for this repo's
older instance of the pattern, `wire:click="confirmDelete({{ $passkey['id'] }})"` in
`resources/views/livewire/settings/security.blade.php`, whose value is a `bigint` by array shape.
Both are safe **by the type of what happens to be interpolated**, which is not a control — it is a
coincidence that the next screen may not reproduce.

✅ Good — encode for the JavaScript context with `@js()`, which is safe in both contexts at once:

```blade
<flux:button wire:click="openEditModal(@js($user['id']))">
```

`@js()` is `Illuminate\Support\Js::from()`, which JSON-encodes with
`JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT` — every quote, angle bracket and
ampersand leaves as a `\uXXXX` escape *inside* the JS string literal, so no input can terminate it,
and the HTML-entity round-trip cannot resurrect one.

❌ Bad — hand-quoting a value whose safety rests on it happening to be a UUID today:

```blade
{{-- anti-pattern — the quotes are yours, so any quote in the value is the attacker's --}}
<flux:button wire:click="openEditModal('{{ $user['id'] }}')">
<flux:button wire:click="rename('{{ $product['slug'] }}')">   {{-- and this one is genuinely exploitable --}}
```

**Rule: never hand-write quotes around an interpolated value inside a `wire:*`, `x-on:*` or `x-`
attribute. Use `@js(...)` for every argument, unconditionally — including ids you believe are
machine-generated.** The reviewer should not have to trace a value's provenance to judge a template.

## The client can rewrite any public property that is not `#[Locked]`, including the one feeding the loop

`App\Livewire\Users\Index::$users` is a plain `public array` — server-built by `loadUsers()`, never
bound with `wire:model`, and therefore easy to read as server-controlled. It is not. Livewire's
`updates` payload can set **any** public property that lacks `#[Locked]`, with no `wire:model` in the
DOM required; the repo's own test suite uses exactly that mechanism:

```php
// tests/Feature/Users/IndexRenderingTest.php
Livewire::test(Index::class)
    ->set('users', [])
    ->assertSee('No users found.');
```

The snapshot checksum protects the *server's* state from tampering; the `updates` diff is
client-supplied by design, and `#[Locked]` is the only thing that refuses it. So a client can inject
arbitrary rows into `$users` and have the view render them — which is what turns the sink above from
"unreachable" into "reachable, but only by the session that supplies it" (self-XSS; Livewire's CSRF
token plus the snapshot checksum keep it from being driven cross-user).

Two consequences to carry forward:

- **A server-derived property that the client never needs to write should be `#[Locked]`**, the same
  rule already recorded for `$editingUserId` / `$deletingUserId` in
  [livewire-authorization.md](livewire-authorization.md). `$deletingUserName` qualified and **now
  carries `#[Locked]`** (task 0006 audit, F3): the delete-confirmation modal's whole job is naming the
  account about to be removed, and that name must not be desyncable from the locked id it belongs to.

  `$users` qualifies by the same rule but is **deliberately left unlocked** — a documented, accepted
  residual rather than an oversight. It is display-only: every mutating and disclosing method
  (`openEditModal()`, `confirmDelete()`, `deleteUser()`, `save()`) re-reads its target with
  `User::findOrFail()` and re-authorizes, and `usersSummary()` is its own query, so no authorization
  or persistence decision reads `$users`. Tampering with it therefore only rewrites the attacker's own
  rendered rows (self-XSS is already closed by the `@js()` rule above). The cost of locking it is
  concrete: `->set('users', [])` throws on a locked property, so
  `tests/Feature/Users/IndexRenderingTest.php`'s empty-state test would have to construct that branch
  another way. Revisit the tradeoff the moment anything reads `$users` for a decision rather than for
  display.
- **Read authoritative values from the model, not from a client-writable array.** The edit modal's
  pending-address notice used to re-derive its value out of `$users` — this is the anti-pattern, and
  it is **no longer present in the repo** (task 0006 audit, F2):

  ```blade
  {{-- anti-pattern — removed from resources/views/livewire/users.blade.php --}}
  $editingPendingEmail = $editingUserId !== null
      ? (collect($users)->firstWhere('id', $editingUserId)['pendingEmail'] ?? null)
      : null;
  ```

  `openEditModal()` already did an authoritative `User::findOrFail($userId)`, so the fix was to read
  the value there into a locked property — trustworthy and non-stale — instead of backing it out of
  `$users`, which was a display-integrity regression for no gain:

  ```php
  // app/Livewire/Users/Index.php
  #[Locked]
  public ?string $editingPendingEmail = null;

  public function openEditModal(string $userId): void
  {
      $target = User::findOrFail($userId);
      // ...
      $this->editingPendingEmail = $target->pending_email;
  }
  ```

  The view now reads `$editingPendingEmail` directly. A property introduced this way must be reset
  everywhere its siblings are — here both `openCreateModal()` and `closeModal()` — or the previous
  target's address leaks into the next modal opening.

## What is already safe and needs no change

Recorded so a future audit does not re-litigate them:

- **Every user-controlled value rendered as HTML text goes through `{{ }}`.** No `{!! !!}` exists
  anywhere in `resources/views/livewire/users.blade.php` or
  `resources/views/layouts/app/sidebar.blade.php`. The Flux components consuming user data escape
  too — `flux:avatar` emits initials via `{{ $initials ?? $slot }}` and the alt text via
  `alt="{{ $alt ?? $name }}"`.
- **Translation calls never take user data as the key.** User data reaches `__()` only through the
  `:placeholder` replacement array (`__('Edit :name', ['name' => $user['name']])`), whose result is
  then `{{ }}`-escaped. A user-controlled *key* would let a caller select an arbitrary translation
  string; a user-controlled *replacement* is inert. Note the key itself is **not** always a literal
  and does not need to be — what matters is its provenance. Three non-literal forms exist and all
  three are safe because every input is developer-authored: a concatenated catalog value
  (`__('users.statuses.'.$this->value)` in `App\Enums\UserStatus`, and the composed
  `roles.modules.*` / `roles.actions.*` labels in `resources/views/livewire/roles.blade.php`), and —
  since task 0013 — a **fully variable** key read straight from config
  (`__($item['label'])` / `__($group['heading'])` in
  `resources/views/components/sidebar-nav.blade.php`, whose values come from `config/modules.php`).
  The rule to apply when adding a fourth: the key may be computed, but every term it is computed from
  must come from code, config, or a seeded catalog — never from a request, a database column an
  administrator can edit, or a route parameter.
- **The `wire:ignore.self` inside `flux:modal` is vendor-owned and scoped to the `<dialog>`
  element's own attributes**, not its children — it does not shield any interpolated content from
  Livewire's DOM handling.
- **`@close="closeModal"` works despite having no `()`.** Flux rewrites the attribute to
  `wire:close`, and `contextualizeExpression()` prefixes bare identifiers with `$wire.`, after which
  Alpine auto-invokes the returned function. This is the same pattern already in
  `resources/views/livewire/settings/security.blade.php`; it is not a silently-dead handler.

_Last updated: 2026-08-22 — Task 0013, Phase 6 docs sync: **corrected** the "Translation calls never take user data as the key" claim, which asserted that "every `__()` in this repo passes a **literal** first argument". That was already imprecise before this story (`App\Enums\UserStatus::label()` concatenates, and task 0011's composed `roles.modules.*` labels do too) and this story adds the first **fully variable** key — `__($item['label'])` in `resources/views/components/sidebar-nav.blade.php`, read from `config/modules.php`. The rule is restated by **provenance** rather than by syntax: a key may be computed, but every term must come from code, config or a seeded catalog. The rest of this page was re-verified against the real files in the same pass and needed no change — the layout this story rewrote still contains no `{!! !!}`, and the new component interpolates nothing into a `wire:*` directive (`wire:navigate` takes no argument), so the `@js()` rule is not engaged by it._

_Previously: 2026-08-21 — Task 0012, Phase 6 link sweep: fixed this file's own table-of-contents anchor for the `{{ }}`-in-a-`wire:`-directive section, which carried three leading hyphens where the generated slug has two (the heading opens with `{{ }}`, and stripping the braces leaves exactly two spaces). Content unchanged._

_Previously: 2026-08-16 — Re-audit of task 0006: all three findings verified fixed against the real
files, so the two consequences above were rewritten from "this is what the code does" to the rule plus
the shipped fix (`@js()` on both `wire:click` arguments, `#[Locked] $editingPendingEmail` read from
`User::findOrFail()`, `#[Locked] $deletingUserName`), and `$users` staying unlocked was recorded as an
accepted residual with the condition that would reopen it._

_Previously: 2026-08-16 — Created from the Phase 4 audit of task 0006 (Users list + create/edit
modal UI)._
