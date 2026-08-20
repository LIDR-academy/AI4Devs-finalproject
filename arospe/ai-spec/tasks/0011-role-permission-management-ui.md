# [0011] Roles & Permissions management — UI (custom role CRUD + granular permission toggles)

## Description
Build the Livewire view/Blade layer for the Roles & Permissions management area (PRD Epic 1,
*extends the prototype*): a list of custom roles, a create/edit modal whose permission toggles are
grouped by module, and a delete action that hard-blocks with a holder count when the role is still
assigned to users. The Super Admin role is never rendered anywhere, and the
"manage administrator-level roles/users" toggle is rendered only for a signed-in Super Admin.
This story owns markup and UI state only — all queries, persistence, and authorization come from
sibling backend story 0010.

## Type
frontend (related_task_id: 0010) | includes database-expert: no

**Dependencies (must land first or in parallel):**
- **0002** — seeds the roles/permission catalog and the per-module permissions this UI iterates.
- **0010** — the backend component logic behind the same component class (queries, persistence,
  validation, the Super-Admin-excluding role query, the holder count, and the
  `$canGrantAdministratorLevel` flag). This story consumes them; it never re-derives them.
- **0008** — Super Admin invariants (categorically undeletable/uneditable). This UI simply never
  renders it, relying on 0010/0008's query exclusion.
- **0009** — the authorization logic deciding who may grant administrator-level permissions. This
  UI only consumes the boolean flag 0009's backend exposes.
- **0013** — sidebar permission-based visibility, including the "Roles & Permissions" nav entry.
  Out of scope here; until 0013 lands the screen is reached directly at `/roles`.

**Confirmed product decisions (human-approved during Phase 1, previously undefined in the PRD):**
1. A role has **no description field** — the form is role name + permission toggles only.
2. Role name is **required, unique, and trimmed** (mirrors the PRD's user-email precedent).
3. A role with **zero permissions granted is a legal, inert state** — not a validation error.
4. Routes live in a **new `routes/roles.php`**, required from `web.php` exactly as `settings.php`
   is; URI `/roles`, route name `roles.index`.
5. The live-count format and empty-state wording are deliberately **not pinned** to exact Spanish
   copy — acceptance criteria below are written copy-agnostically.

## Gherkin
```gherkin
Feature: Roles & permissions management UI

  # --- Listing ---

  Scenario: The roles list shows an explicit empty state
    Given a user administrator, with no custom roles defined
    When they open the Roles & Permissions screen
    Then an explicit empty state is shown in place of the roles list

  Scenario: The section header reflects how many roles are listed
    Given a user administrator, with three custom roles defined
    When they open the Roles & Permissions screen
    Then the section header shows a live count matching the three roles listed

  Scenario: The Super Admin role is invisible in the roles list
    Given a user administrator, with the Super Admin role present in the system
    When they view the roles list
    Then the Super Admin role is not among the listed roles

  # --- Creating and editing ---

  Scenario: Create a custom role with scoped permissions
    Given a user administrator on the Roles & Permissions screen
    When they save a new role "Blog Editor" with only the Blog module permissions toggled
    Then "Blog Editor" appears in the roles list

  Scenario: A newly created role reopens with exactly the permissions it was given
    Given a user administrator who has just created the role "Blog Editor" with only the Blog
      module permissions toggled
    When they reopen that role for editing
    Then only the Blog module permissions are shown as toggled on

  Scenario: Editing a role's permissions persists the change
    Given a user administrator editing the existing role "Blog Editor"
    When they save that role with the "delete blog content" permission cleared
    Then reopening the role shows that permission toggled off

  Scenario: A role may be saved with no permissions granted
    Given a user administrator creating a new role "Placeholder"
    When they save the role with no permissions toggled
    Then "Placeholder" appears in the roles list

  Scenario: Permission toggles are grouped by module
    Given a user administrator opening the role editor
    When they view the permission toggles
    Then the toggles are grouped under one heading per module in the seeded permission catalog

  Scenario Outline: Saving a role with an invalid name is refused
    Given a user administrator, with an existing role named "Blog Editor"
    When they save a role with <invalid_name>
    Then saving is refused and the reason is shown inline
    And no role is added to the list

    Examples:
      | invalid_name                          |
      | a blank name                          |
      | a name consisting only of whitespace  |
      | the already-taken name "Blog Editor"  |

  # --- Deleting ---

  Scenario: Deleting a role still assigned to users is hard-blocked with a count
    Given a user administrator, with the role "Blog Editor" assigned to 3 users
    When they open the delete action for "Blog Editor"
    Then they are told the role is assigned to 3 users and cannot be deleted
    And no confirm-and-proceed control is offered

  Scenario: An unassigned role can be deleted
    Given a user administrator, with the role "Blog Editor" assigned to no users
    When they confirm deletion of "Blog Editor"
    Then "Blog Editor" no longer appears in the roles list

  # --- Administrator-level grant visibility ---

  Scenario: Only the Super Admin sees the administrator-management grant option
    Given a signed-in Super Admin editing a custom role
    When they view that role's permission toggles
    Then the "manage administrator-level roles/users" toggle is shown

  Scenario: A broad administrator never sees the administrator-management grant option
    Given an administrator who holds the general "manage roles & permissions" permission but is
      not the Super Admin
    When they view a role's permission toggles
    Then the "manage administrator-level roles/users" toggle is not rendered
```

## Files to create/modify

> **Shared-surface warning.** Stories 0011 and 0010 touch the same component class. The split is
> strict: **0011 owns the Blade view and the component's UI-state properties**; **0010 owns every
> query, mutation, validation rule, and authorization decision**. 0011 must not add an Eloquent
> query, a `Role`/`Permission` write, or a permission check to the component.
>
> **File creation is 0010's, not this story's — one-directional, not "whichever lands first."**
> [Story 0010](0010-role-permission-management-backend.md) **creates** both `routes/roles.php` and
> `app/Livewire/Roles/Index.php`; this story **modifies** them. That follows from this story's own
> Definition of Done, which states it "is not independently shippable — it is the view layer of a
> component whose logic is 0010's" and requires 0010 to have landed first, so the two files always
> exist by the time this story runs. An earlier draft of 0010 hedged with "whichever lands first
> creates it" while this file declared both flatly **new**; that asymmetry is resolved here and in
> 0010's own file-ownership note, which reads identically. Per
> [`docs/contracts.md`](../../docs/contracts.md)'s Parallel Agent File-Ownership Rule, 0010 and 0011
> must not be dispatched to concurrent agents.

- `routes/roles.php` — **created by 0010; not created here.** It already registers
  `Route::livewire('roles', Index::class)->middleware('can:roles.manage')->name('roles.index')` inside
  a `Route::middleware(['auth', 'verified'])->group(...)`, mirroring `routes/settings.php`'s shape.
  The permission middleware gating this route is **0010/0012's**, not this story's. This story
  verifies the route resolves and needs no edit to the file at all:
  ```php
  // routes/roles.php -- 0010's file, shown for reference only
  Route::middleware(['auth', 'verified'])->group(function () {
      Route::livewire('roles', Index::class)
          ->middleware(['can:roles.manage'])
          ->name('roles.index');
  });
  ```
- `routes/web.php` — **`require __DIR__.'/roles.php';` is added by 0010**, beside the existing
  `require __DIR__.'/settings.php';`. Nothing to add here; verify it is present.
- `app/Livewire/Roles/Index.php` — **created by 0010; modified here.** Class-based Livewire component
  (per `conventions/base-standards.md`: class-based, never single-file), carrying a `#[Title(...)]`
  attribute. **This story's share** is the UI-state surface only, named per `conventions/naming.md`'s
  boolean-predicate rule — e.g. `$showRoleModal`, `$showDeleteModal`, and the bound
  `$selectedPermissions` array. (Note `$editingRoleId` and `$deletingRoleId` are **0010's**, declared
  `#[Locked]`, since they identify the row every authorization check resolves — this story reads them
  but must not add, rename or unlock them.) It consumes, without re-deriving, two things 0010 exposes:
  the Super-Admin-excluding roles collection, and a `$canGrantAdministratorLevel` boolean.
- `resources/views/livewire/roles.blade.php` — **the core deliverable.** **Corrected 2026-08-20
  (found running 0010's own test suite, which needs this same view to render) — not a kebab-case
  mirror path, and not nested under `roles/`.** `App\Livewire\Roles\Index` is an `Index` class inside
  a subfolder, exactly the case
  [`docs/conventions/naming.md`](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
  documents as an exception to the normal mirror rule: Livewire's `Finder` strips a trailing `.index`
  segment, so the component resolves to the **flat** file here — the direct analogue of
  `App\Livewire\Users\Index` → `livewire/users.blade.php`, already shipped. Verified by execution
  against 0010's real component: `Livewire::test(Index::class)` throws `ViewException: File does not
  exist at path .../resources/views/livewire/roles.blade.php`; Laravel never even probes the nested
  `roles/index.blade.php` path. Build the file at the flat path above, not
  `resources/views/livewire/roles/index.blade.php` — the earlier wording in this bullet and in
  0010's matching file bullet both had this wrong.

  Contains the list, the create/edit modal, and the delete
  modal. Built with Flux UI: `flux:card` + `flux:table` for the list, `flux:modal` for both dialogs,
  `flux:input` for the role name, `flux:checkbox.group` for each module's permission block, and
  `flux:heading`/`flux:separator` for the per-module grouping.

Presentational rules the view must honor:

- **Permission toggles are rendered by iterating the backend-supplied module→permissions
  structure**, never a hardcoded list of the 9 modules. This keeps the view correct whatever
  granularity story 0002's seeded catalog lands on, and means a new module needs no view change.
- **The administrator-level toggle is wrapped in a plain conditional** on the backend flag
  (`@if ($this->canGrantAdministratorLevel)`). It must be **absent from the DOM**, not merely
  hidden with CSS or disabled — a rendered-but-disabled control still leaks the permission's
  existence to a non-Super-Admin.
- **The delete modal branches on the holder count**: when the count is greater than zero it renders
  the blocking message including the count and offers **only a dismiss control** — the destructive
  button is not rendered at all, rather than rendered-and-disabled. This is the PRD's
  "no confirm-and-proceed path" expressed in markup.
- **The Super Admin row is never special-cased in the view.** The view renders whatever collection
  the backend hands it; there is no `@if ($role->name !== 'Super Admin')` guard, because that would
  duplicate an invariant that belongs to 0010/0008.

## Tests to perform

Split per `docs/testing/frontend/coverage-policy.md` — a small ceiling of browser tests covering
genuine user journeys, with cheaper structural cases pushed down to Livewire component tests rather
than padding the browser suite.

**Browser level** (`tests/Browser/`) — real rendering, Livewire round-trips, and DOM-absence
assertions:
- [ ] A user administrator creates a role with only Blog permissions toggled and sees it listed.
- [ ] Reopening that role shows exactly the permissions it was created with.
- [ ] Editing a role with a permission cleared persists, verified by reopening the editor.
- [ ] Deleting a role assigned to 3 users is blocked: the count-bearing message appears and no
      confirm-and-proceed control exists in the DOM.
- [ ] A signed-in Super Admin sees the "manage administrator-level roles/users" toggle.
- [ ] A broad administrator holding the general "manage roles & permissions" permission does **not**
      have that toggle present in the DOM (assert absence, not invisibility).
- [ ] Every browser test asserts `->assertNoJavaScriptErrors()` per
      `docs/testing/frontend/test-quality-checklist.md`.

**Livewire component level** (`tests/Feature/`) — faster, no browser needed:
- [ ] Empty state renders when no custom roles exist.
- [ ] The live count matches the number of roles rendered.
- [ ] The Super Admin role is absent from the rendered list even when present in the system.
- [ ] Permission toggles render one group per module in the supplied catalog.
- [ ] An unassigned role is removed from the list after deletion.
- [ ] A role saved with zero permissions is accepted and listed (legal inert state).

**Negative / edge:**
- [ ] Blank, whitespace-only, and duplicate role names are each refused with inline feedback and add
      no role (one test driven by a Pest dataset, one row per `Examples` row, per
      `gherkin-guidelines.md` rule 4).
- [ ] The delete-blocked path leaves the role in the list afterwards.
- [ ] A module whose catalog entry has no permissions renders its heading without crashing.

## Expected outcome
A signed-in administrator can reach `/roles`, see every custom role with a live count (or an
explicit empty state), create and edit roles through a modal whose permission toggles are grouped
per module, and delete only roles nobody holds — being told the exact holder count when they cannot.
The Super Admin role is nowhere on screen, and the administrator-level grant toggle exists in the
DOM only for the Super Admin.

## Acceptance criteria
- [ ] `/roles` resolves as `roles.index` from `routes/roles.php` (**created by 0010**), required from
      `routes/web.php` the same way `settings.php` is. This story verifies the wiring; it does not
      create the route file, the `require` line, or the component class.
- [ ] The screen follows the established list + modal pattern (section header with a live count, a
      primary create button, per-row edit/delete actions), consistent with the Users/Products/Taxes
      prototype screens.
- [ ] A live count reflecting the listed roles is shown, and an explicit empty state replaces the
      list when no custom roles exist (exact copy deliberately unpinned).
- [ ] The create/edit modal collects a role name and permission toggles **only** — no description
      field.
- [ ] Permission toggles are grouped by module and rendered by iterating the backend-supplied
      catalog, not a hardcoded module list.
- [ ] A role name that is blank, whitespace-only, or already taken is refused with inline feedback.
- [ ] A role saved with zero permissions is accepted.
- [ ] Deleting a role held by at least one user is hard-blocked, states the holder count, and offers
      no confirm-and-proceed control anywhere in the DOM; an unassigned role deletes normally.
- [ ] The Super Admin role is never rendered in the roles list, and the view contains no
      Super-Admin-specific guard (it relies on the backend query).
- [ ] The "manage administrator-level roles/users" toggle is absent from the DOM for anyone who is
      not the Super Admin, including a holder of the general "manage roles & permissions"
      permission — absent, not hidden or disabled.
- [ ] The view re-derives no authorization: it consumes 0009/0010's collection and boolean flag.
- [ ] Component is class-based with a `#[Title(...)]` attribute and a kebab-case mirrored view, per
      `conventions/base-standards.md` and `conventions/naming.md`.

## Definition of Done
- [ ] Tests written and green (browser + Livewire component cases above)
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor) — with explicit attention to the administrator-level
      toggle being absent rather than hidden, since a leak there is privilege-escalation-adjacent
- [ ] Documentation updated (docs-keeper) — `docs/api/routes.md` gains the new `roles.index` route
- [ ] Acceptance criteria met
- [ ] Sibling stories 0002, 0008, 0009, 0010 landed (this story is not independently shippable —
      it is the view layer of a component whose logic is 0010's)
