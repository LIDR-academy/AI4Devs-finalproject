# [0006] Users list + create/edit modal — UI

## Description
Build the Livewire **view layer** for the Users screen of [PRD Epic 1](../../docs/PRD/PRD.md#epic-1--users-roles--permissions):
a list of users (avatar, name/email, assigned role, status badge, per-row edit/delete actions, a
live count and a primary "New user" button) plus a create/edit modal (full name, email, a **Role**
select fed by the dynamic roles list, and a **Status** select), and a delete-confirmation modal.
This story is markup/interaction only — the backing component class, validation rules, persistence,
route registration and the `users.status` column are sibling backend stories **0004** (component,
validation, persistence, route) and **0003** (the `users.status` / `users.pending_email` columns and
the `UserStatus` enum). Soft-delete semantics are story **0005**.

## Type
frontend (related_task_id: **0004**) | includes database-expert: **no**

## Debate decisions (confirmed before writing this story)

| # | Question | Decision |
|---|---|---|
| 1 | UI string language | **English source strings wrapped in `__()`**, matching the existing convention (`resources/views/livewire/settings/profile.blade.php` uses `{{ __('Save') }}`). `lang/es.json` and the Spanish/English switcher arrive with Epic 5 ([PRD assumption 14](../../docs/PRD/PRD.md)). The PRD's Spanish copy ("Nuevo usuario", "6 usuarios · 4 activos", "Activo/Inactivo/Suspendido") is therefore **reference copy, not literal requirement** for this story — "matching the prototype" means layout and structure, not Spanish text, until Epic 5. |
| 2 | `status` representation | **Backed enum `App\Enums\UserStatus`** with values `active \| inactive \| suspended`; display labels rendered through `__()`. The enum file and the migration are **0003's** deliverables; this view only binds to them. |
| 3 | Delete confirmation | **Confirm modal**, mirroring the existing passkey-deletion pattern in `App\Livewire\Settings\Security` (`showDeleteModal` / `confirmDelete` / `deleteUser` / `closeDeleteModal`). |
| 4 | Route & sidebar ownership | **0004 registers `users.index`** (it owns the permission middleware). 0006 only links via `route('users.index')` and adds a **static, not-yet-permission-gated** sidebar entry; permission-based sidebar hiding belongs to the Roles & Permissions story. |
| 5 | Browser-test infrastructure | A **separate infra task** bootstraps the `tests/Browser/` testsuite; 0006 **depends on it** (see [Dependencies & risks](#dependencies--risks)). |

Resolved directly from the docs, no decision needed: **avatar** is initials derived from the name via `flux:avatar :name="..."` (no `avatar` column exists or is planned per [schema.md](../../docs/database/schema.md), and the prototype derives initials the same way); **no pagination** (the prototype has no pager and no acceptance criterion asks for one); **naming** follows [naming.md](../../docs/conventions/naming.md) — `App\Livewire\Users\Index` ↔ `resources/views/livewire/users/index.blade.php`.

## Gherkin

```gherkin
Feature: Users screen — list and create/edit modal

  # --- List rendering ---

  Scenario: A user administrator views the users list
    Given a user administrator, with at least one existing user
    When they open the users screen
    Then they see each user's avatar, name, email, assigned role, and status

  Scenario: The section header shows a live user count
    Given a user administrator, with six users of whom four are active
    When they open the users screen
    Then the header shows that there are six users and four of them are active

  Scenario Outline: The status badge reflects the user's status
    Given a user administrator, with a user whose status is "<status>"
    When they open the users screen
    Then that user's row shows the "<status>" badge

    Examples:
      | status    |
      | Active    |
      | Inactive  |
      | Suspended |

  Scenario: An empty state is shown when there are no users to list
    Given a user administrator, with no users to display
    When they open the users screen
    Then an explicit empty state is shown instead of an empty table

  Scenario: A user with a pending email change is marked as such in the list
    Given a user administrator, with a user whose email change is awaiting confirmation
    When they open the users screen
    Then that user's row shows their current address together with the pending one

  Scenario: A user with no pending email change carries no pending marker
    Given a user administrator, with a user whose email has no change awaiting confirmation
    When they open the users screen
    Then that user's row shows only their current address, with no pending marker

  Scenario: The edit form explains that a pending address is not yet in effect
    Given a user administrator, with a user whose email change is awaiting confirmation
    When they choose to edit that user
    Then the form shows the pending address and explains it takes effect once confirmed

  # --- Create / edit modal ---

  Scenario: A user administrator opens the create-user form
    Given a user administrator on the users screen
    When they choose to create a new user
    Then a form opens with empty name, email, role, and status fields

  Scenario: A user administrator opens the edit form for an existing user
    Given a user administrator, with a user "Diego Ferrer" in the list
    When they choose to edit that user
    Then the form opens prefilled with that user's current name, email, role, and status

  Scenario: The role field offers the available roles
    Given a user administrator, with the roles "Editor" and "Administrator" available
    When they open the create-user form
    Then the role field offers "Editor" and "Administrator" as options

  Scenario: The Super Admin role is never offered in the role selector
    Given a user administrator, with the Super Admin role existing in the system
    When they open the create-user form
    Then the role field does not offer the Super Admin role

  Scenario: A user administrator cancels the create-user form without saving
    Given a user administrator with the create-user form open and some fields filled in
    When they cancel without saving
    Then the form closes and no new user appears in the list

  Scenario Outline: The user form surfaces a validation message for invalid details
    Given a user administrator with the create-user form open
    When they submit the form with <invalid_detail>
    Then a validation message is shown next to the offending field
    And the form remains open

    Examples:
      | invalid_detail            |
      | a blank name              |
      | a blank email             |
      | an email already in use   |
      | no role selected          |

  # --- Delete ---

  Scenario: Deleting a user asks for confirmation first
    Given a user administrator, with an existing user "Diego Ferrer"
    When they choose to delete that user
    Then a confirmation naming "Diego Ferrer" is shown and the user is still listed

  Scenario: A user administrator confirms the deletion
    Given a user administrator who has been asked to confirm deleting "Diego Ferrer"
    When they confirm the deletion
    Then "Diego Ferrer" no longer appears in the users list

  Scenario: A user administrator dismisses the delete confirmation
    Given a user administrator who has been asked to confirm deleting "Diego Ferrer"
    When they dismiss the confirmation
    Then "Diego Ferrer" still appears in the users list
```

> Scenarios follow [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1
> (named business-role actor, never "I") and 3 (exactly one `When` per scenario). Status names are
> the **English display labels** per decision 1; the stored values are `active` / `inactive` /
> `suspended` (decision 2).

## Files to create/modify

**Owned by this story:**

- `resources/views/livewire/users/index.blade.php` — **new.** The whole screen: section header (live count + primary "New user" button), the users table, the create/edit modal, the delete-confirmation modal, and the empty state. Named to mirror `App\Livewire\Users\Index` per [naming.md](../../docs/conventions/naming.md#livewire-components-and-views).
- `resources/views/layouts/app/sidebar.blade.php` — **modify.** Add one `<flux:sidebar.item icon="users" :href="route('users.index')" :current="request()->routeIs('users.*')" wire:navigate>` inside the existing `flux:sidebar.group :heading="__('Platform')"` group. Static and always visible for now; permission gating and the final nav grouping are deferred ([PRD](../../docs/PRD/PRD.md) states the prototype sidebar is not the final navigation).
- `tests/Feature/Users/IndexRenderingTest.php` — **new.** Livewire component-level tests for what this story owns: rendering, badges, the pending-email marker, the empty state, and inline validation display (mirrors `tests/Feature/Settings/SecurityTest.php`'s structure).
- `tests/Browser/UsersIndexTest.php` — **new.** Pest 4 browser tests for the JS-driven behavior. Gated on the browser-suite infra task (decision 5).

> **Test-file ownership — `tests/Feature/Users/IndexTest.php` is *not* this story's.** Story **0004**
> claims that file for component logic, persistence and authorization, and assigns this story
> `IndexRenderingTest.php` + `tests/Browser/UsersIndexTest.php` instead. An earlier draft of this
> story listed `IndexTest.php` as **new** here, which would have had two stories creating the same
> file. Do not recreate it; extend nothing in it either — if a rendering assertion seems to belong
> there, it belongs in `IndexRenderingTest.php`.

**Explicitly NOT this story** (listed so the boundary is unambiguous):

| File | Owner |
|---|---|
| `app/Livewire/Users/Index.php` | 0004 |
| `app/Enums/UserStatus.php` | 0003 |
| `database/migrations/*_add_status_to_users_table.php` | 0003 |
| `database/migrations/*_add_pending_email_to_users_table.php` + the pending-email flow | 0003 |
| Route registration of `users.index` + permission middleware | 0004 |
| `tests/Feature/Users/IndexTest.php` (component logic, persistence, authorization) | 0004 |
| Administrator-level delete/downgrade authorization | 0004 (rule) / 0005 (soft-delete semantics) |
| Blocking non-active users from signing in | 0007 |

No new CSS file: the handoff `usuarios.css` / `common.css` are a **visual reference only** and are translated into Tailwind v4 utilities inline, never ported.

### Interface contract required from 0004

This view binds to the following. **0004 must expose exactly these names**, or the two stories must
re-agree before implementation starts:

```php
// State
public array $users = [];              // rows: [{id, name, email, pendingEmail, role, status}, ...]
public bool $showModal = false;
public ?string $editingUserId = null;  // null = create mode; UUID string = edit mode
public string $name = '';
public string $email = '';
public ?string $roleId = null;
public ?UserStatus $status = null;
public bool $showDeleteModal = false;
public ?string $deletingUserId = null;
public string $deletingUserName = '';

// Computed
#[Computed] public function usersSummary(): array;  // ['total' => int, 'active' => int]
#[Computed] public function roleOptions(): array;   // [{id, name}, ...] — excludes Super Admin

// Actions
public function openCreateModal(): void;
public function openEditModal(string $userId): void;
public function save(): void;                       // creates or updates per $editingUserId
public function closeModal(): void;
public function confirmDelete(string $userId): void;
public function deleteUser(): void;
public function closeDeleteModal(): void;
```

Validation errors must land in Livewire's standard `$errors` bag keyed by `name` / `email` /
`roleId` / `status`, so `flux:input` and `flux:select` render them automatically with no extra
wiring on the view side.

> **One change to the previously locked contract, and its UI consequence.** Each row now also
> carries `pendingEmail` (`?string`). Story **0003** made an email change *pending* rather than
> immediate: submitting a new address writes `users.pending_email` and mails a verification link to
> it, while `users.email` keeps its old value until that link is used. Without surfacing
> `pendingEmail`, an administrator would save a new address, see the old one still displayed, and
> reasonably conclude the save silently failed.
>
> **What this story must render:** in the users list, a row whose `pendingEmail` is non-null shows
> the current address plus an unobtrusive "pending: `<new address>`" marker (a `flux:badge` or muted
> secondary line, consistent with the status badge treatment). In the edit modal, the same marker
> sits under the email field with a one-line explanation that the address takes effect once the
> recipient confirms it. Copy is English-source through `__()` per decision 1; exact wording is
> unpinned. **No cancel control here** — cancelling a pending change is self-service only
> (`Settings/Profile`, story 0003); adding an administrative cancel would be new backend surface
> nobody has specified.
>
> Nothing else in the contract moves: the array shape is still a plain `array`, still unpaginated,
> and every action name is unchanged.

### Technical approach

- **Flux UI (Free v2):** `flux:table` + `flux:table.columns` / `.column` / `.rows` / `.row` / `.cell` for the list; `flux:avatar :name="..."` for initials; `flux:badge` for the status pill (`lime` = Active, `zinc` = Inactive, `red` = Suspended); `flux:modal` bound with `wire:model="showModal"`; `flux:input`, `flux:select`, `flux:button`, `flux:heading`. The modal pattern copies `resources/views/livewire/settings/security.blade.php`, which already has both a setup modal and a confirm-delete modal working in this repo.
- **Tailwind v4:** utility classes with `dark:` variants throughout, reusing the `zinc` neutral palette already used in `security.blade.php`. No custom CSS variables from the prototype.
- **Live count:** rendered from 0004's `usersSummary()` computed property — server-side, never computed in JS.
- **Loading states:** `wire:loading.attr="disabled"` with `wire:target` on the modal save and delete-confirm buttons.
- **Accessibility:** Flux `input`/`select` provide label association; `flux:modal` provides the focus trap. Row action buttons carry accessible names, not icon-only markup without a label.

## Tests to perform

Level chosen per [coverage-policy.md](../../docs/testing/frontend/coverage-policy.md) — browser tests
only where JS/Alpine visibility is the actual risk, everything else at the cheaper component level.

- [ ] Component test: the list renders each user's name, email, role, and status.
- [ ] Component test: the header renders the live count (total + active).
- [ ] Component test (dataset): each status renders its correct badge label — active / inactive / suspended.
- [ ] Component test: the empty state renders when there are no users to display.
- [ ] Component test: a row whose `pendingEmail` is set renders both the current and the pending address; a row whose `pendingEmail` is null renders **no** pending marker. Both directions are needed — a marker rendered unconditionally passes the positive case alone.
- [ ] Component test: the edit modal for a user with a pending address shows it, with the explanatory line.
- [ ] Component test: the role select renders the available roles and **omits the Super Admin role**.
- [ ] Component test: submitting an invalid form renders a validation message next to the field and leaves the modal open (blank name, blank email, duplicate email, missing role).
- [ ] Browser test: "New user" opens the modal with empty fields, and no JavaScript errors occur.
- [ ] Browser test: the per-row edit action opens the modal **prefilled with that row's data** (highest-risk case — a wrong/stale prefill is a silent data bug).
- [ ] Browser test: cancelling the create modal closes it and adds no row.
- [ ] Browser test: the delete action opens a confirmation naming the user; confirming removes the row; dismissing keeps it.
- [ ] Browser test: `->assertNoJavaScriptErrors()` on list load and on every modal open/close (mandatory per [test-quality-checklist.md](../../docs/testing/frontend/test-quality-checklist.md)).

## Expected outcome
An authenticated administrator visiting `route('users.index')` sees the Users screen: a header with
the live count and a "New user" button, a table of users with initials avatar, name/email, role and
a colored status badge, and per-row edit/delete actions. "New user" and the edit action both open a
modal (empty vs. prefilled) with name, email, role and status fields that surface validation
messages inline. Deleting asks for confirmation first. With no users, an explicit empty state shows
instead of a bare table. The screen is styled consistently with the rest of the dashboard in both
light and dark mode, and produces no JavaScript console errors.

## Acceptance criteria
- [ ] The users list renders avatar, name/email, assigned role, status badge, and per-row edit/delete actions for every user, matching the prototype's layout and structure.
- [ ] The section header shows a live count of total users and active users, and a primary "New user" button.
- [ ] Status badges render distinctly for `active`, `inactive`, and `suspended`, using labels from the `UserStatus` enum rendered through `__()`.
- [ ] "New user" opens the modal with empty fields; the per-row edit action opens it prefilled with that user's data.
- [ ] The modal exposes full name, email, a Role select populated from `roleOptions()`, and a Status select.
- [ ] The Super Admin role never appears in the role selector.
- [ ] Validation errors from 0004 surface inline next to the offending field, and the modal stays open.
- [ ] Cancelling the modal discards unsaved input and adds no row.
- [ ] Deleting a user requires confirming in a modal that names the user; dismissing it leaves the user listed.
- [ ] An explicit empty state renders when there are no users to display.
- [ ] A user with a pending email change is visibly marked as such in the list and in the edit modal, showing both the current and the pending address; a user without one shows no marker. No administrative cancel control is rendered.
- [ ] All UI copy is wrapped in `__()` with English source strings; no hardcoded Spanish literals.
- [ ] The screen renders correctly in light and dark mode and produces no JavaScript console errors.
- [ ] No prototype HTML/CSS/JS from `docs/arospe-handoff/` is ported; the screen is Livewire + Blade + Flux + Tailwind only.

## Dependencies & risks
- **Depends on 0004** for the component class, the `users.index` route, validation and persistence, and transitively on **0003** for the `UserStatus` enum, the `users.status` / `users.pending_email` columns and the pending-email mechanism. **This UI story cannot be implemented or tested before 0004's public interface exists** — the contract above is the agreed boundary; any deviation invalidates both this story's tests and its markup.
- **Depends on the browser-test infra task** (decision 5): `tests/Browser/` does not exist, `phpunit.xml` declares only `Unit` and `Feature` testsuites, and `.gitignore` lacks `tests/Browser/Screenshots` — all still pending per [playwright-setup.md](../../docs/testing/frontend/playwright-setup.md). The component-level tests above can run without it; the browser tests cannot. **Risk:** if that task slips, the modal open/prefill/close behavior — the core of this story — ships untested.
- **Risk:** the sidebar entry is deliberately ungated. Until the Roles & Permissions story lands, every authenticated user sees the Users link. This is a cosmetic leak, not an access one: server-side access control is enforced by **0004's** `can:users.view` route middleware on `users.index` (0004 registers that route; 0003 registers no route touching this screen). This must not be forgotten.

## Resolved questions

- **Does the users list include the signed-in administrator's own row? — Yes, it is included.**
  Settled by story **0004**'s list-query decision and no longer open. The list query applies no
  `whereKeyNot(Auth::id())` filter; the administrator's own row is listed and editable, which is
  precisely why 0004 carries a self-edit guard (their own role and status submissions are silently
  ignored, and their own email follows the same pending-address path as anyone else's).

  **Consequence for this story:** the empty state is a **defensive rendering branch**, not a state
  reachable in production — reaching `/users` at all requires being signed in, and a signed-in user
  is always at least one row. It remains required and remains tested, but its component test must
  construct the empty collection deliberately (e.g. by asserting against a component whose list is
  empty) rather than expecting a real sign-in journey to produce it. Label that test honestly as
  exercising the branch in isolation.

## Definition of Done
- [ ] Tests written and green
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper)
- [ ] Acceptance criteria met
