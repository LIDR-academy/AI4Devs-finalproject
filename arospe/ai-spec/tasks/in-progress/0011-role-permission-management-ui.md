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

  # --- The seeded Administrator role's row (added 2026-08-21, Phase 2 review resolution 1) ---

  Scenario: A broad roles.manage holder sees the Administrator role's actions disabled
    Given an administrator who holds "manage roles & permissions" but not the narrower
      "manage administrator-level roles/users" permission
    When they view the roles list
    Then the Administrator role's edit and delete actions are both rendered disabled

  # Added 2026-08-21 (Phase 2 re-review): the third actor tier, and the only row on this screen
  # whose two actions disagree. RolePolicy::update() gates the Administrator role on
  # roles.manage-administrators, while RolePolicy::delete() refuses that role CATEGORICALLY for
  # every actor the Gate::before bypass does not cover. Omitting this scenario left the middle
  # tier's delete state unspecified, and the Tests-to-perform bullet had it wrong (see the
  # correction there).
  Scenario: An administrator-level roles holder sees the Administrator role's edit enabled but its delete disabled
    Given an administrator who holds "manage administrator-level roles/users" but is not the
      Super Admin
    When they view the roles list
    Then the Administrator role's edit action is rendered enabled
    And the Administrator role's delete action is rendered disabled

  Scenario: The Super Admin sees the Administrator role's edit and delete actions enabled
    Given a signed-in Super Admin
    When they view the roles list
    Then the Administrator role's edit and delete actions are both rendered enabled
```

## Files to create/modify

> **Shared-surface warning.** Stories 0011 and 0010 touch the same component class. The split is
> strict: **0011 owns the Blade view and the component's UI-state properties**; **0010 owns every
> query, mutation, validation rule, and authorization decision**. 0011 must not add an Eloquent
> query, a `Role`/`Permission` write, or a permission check to the component.
>
> > **Corrected 2026-08-21 (Phase 2 re-review) — this sentence's "or a permission check" clause now
> > carries exactly one carve-out, and no others.** Open item 1's resolution requires this story to add
> > two `Gate::allows()` calls to `roles()`. That is deliberate and is the *only* permitted exception:
> > a per-row **UI hint** that disables a control, blessed for copying by
> > [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer)
> > ("worth copying on the next module screen") and anticipated by name in `RolePolicy::delete()`'s own
> > docblock. It is `Gate::allows()`, never `Gate::authorize()`; it decides nothing, it gates no write,
> > and it must reuse the same policy abilities `openEditModal()` / `saveRole()` /
> > `confirmDeleteRole()` / `deleteRole()` already authorize against — never a restated rule. Any other
> > permission check added to this component in this story is a split violation.
>
> **File creation is 0010's, not this story's — one-directional, not "whichever lands first."**
> [Story 0010](../done/0010-role-permission-management-backend.md) **creates** both `routes/roles.php` and
> `app/Livewire/Roles/Index.php`; this story may only **modify** them, and in practice needs to modify
> only `Index.php` — a small, precedented `canEdit`/`canDelete` addition (open item 1 below), not
> `routes/roles.php` at all — see the corrected bullets below. That follows from this story's own
> Definition of Done, which states it "is not independently shippable — it is the view layer of a
> component whose logic is 0010's" and requires 0010 to have landed first, so the two files always
> exist by the time this story runs. An earlier draft of 0010 hedged with "whichever lands first
> creates it" while this file declared both flatly **new**; that asymmetry is resolved here and in
> 0010's own file-ownership note, which reads identically. Per
> [`docs/contracts.md`](../../../docs/contracts.md)'s Parallel Agent File-Ownership Rule, 0010 and 0011
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
- `app/Livewire/Roles/Index.php` — **created by 0010; one small, precedented follow-up modification
  here (resolved 2026-08-21, open item 1).** Class-based Livewire component (per
  `conventions/base-standards.md`: class-based, never single-file), carrying a
  `#[Title('Roles & permissions')]` attribute.
  `roles()` gains `canEdit`/`canDelete` per row (`Gate::allows('update'|'delete', $role)`), the same
  post-closure "UI hint on an already-`done` component" shape the Users screen's own task-0006
  follow-up used — see "Open items … resolved" above for the full justification and why this is not a
  0010/0011 split violation.

  > **Corrected 2026-08-21 (Phase 2 review, verified against the shipped
  > [`app/Livewire/Roles/Index.php`](../../../app/Livewire/Roles/Index.php) rather than against this
  > story's Phase 1 assumption) — the UI-state surface this bullet reserved for 0011 already shipped
  > with 0010, under different names.** The real public surface is:
  >
  > | Property | Shape | Notes |
  > | --- | --- | --- |
  > | `$name` | `public string` (writable) | the form's role-name field |
  > | `$selectedPermissionIds` | `public array<int, int>` (writable) | **ids**, not names — not `$selectedPermissions` |
  > | `$showModal` | `public bool` (writable) | the create/edit modal — not `$showRoleModal` |
  > | `$showDeleteModal` | `public bool` (writable) | |
  > | `$editingRoleId` / `$deletingRoleId` | `#[Locked] ?int` | 0010's; `null` on `$editingRoleId` means create mode |
  > | `$deletingRoleName` | `#[Locked] string` | the delete modal's target name |
  > | `$canGrantAdministratorLevel` | `#[Locked] bool` | set in `mount()` from `Gate::allows('grantAdministratorPermission', Role::class)` |
  > | `roles()` | `#[Computed]` → `EloquentCollection<int, Role>` | `selectable()`- and `web`-scoped, `with('permissions')`, `withCount('users')` **including trashed holders**; read in the view as `$this->roles`. **To be added this story (open item 1):** `canEdit`/`canDelete` per row |
  > | `permissionOptions()` | `#[Computed]` → `EloquentCollection<int, Permission>` | the **full, unfiltered** `web` catalog, `id` + `name` only, ordered by name; read as `$this->permissionOptions` |
  >
  > Actions available to `wire:click`: `openCreateModal()`, `openEditModal(int $roleId)`, `saveRole()`,
  > `closeModal()`, `confirmDeleteRole(int $roleId)`, `deleteRole()`, `closeDeleteModal()`.
  >
  > Consequence for this story's scope: **beyond the `canEdit`/`canDelete` addition above, the
  > component needs no other new property to render the screen**, so the rest of the diff to this file
  > stays empty. Bind to the names above; do not rename them, do not unlock a `#[Locked]` one, and do
  > not add a duplicate under this story's originally guessed name. The same surface is documented in
  > [`docs/api/routes.md`](../../../docs/api/routes.md#rolesindex--the-second-permission-gated-route).
- `resources/views/livewire/roles.blade.php` — **the core deliverable.** **Corrected 2026-08-20
  (found running 0010's own test suite, which needs this same view to render) — not a kebab-case
  mirror path, and not nested under `roles/`.** `App\Livewire\Roles\Index` is an `Index` class inside
  a subfolder, exactly the case
  [`docs/conventions/naming.md`](../../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
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
- `lang/en/roles.php` and `lang/es/roles.php` — **created by 0010; extended here.** They currently hold
  exactly two keys (`roles.index.delete_blocked`, `roles.index.self_lockout_blocked`), both consumed by
  0010's refusals. This story owns the screen's markup and therefore its copy: every user-facing string
  the view renders (page/section headings, the create button, the empty state, modal titles and
  buttons, the per-module headings and the permission labels) is a key added to **both** files,
  key-for-key identical, per [`docs/conventions/naming.md`](../../../docs/conventions/naming.md#translation-keys).
  0010's file bullet is explicit that this story **may add keys to these files but must not move its
  two**. **Resolved 2026-08-21 (open item 3, human-confirmed):** the module/permission labels are a
  `modules` array (10 keys: the nine `RolePermissionSeeder::MODULES` entries plus `roles`) and an
  `actions` array (6 keys — `view`/`create`/`edit`/`delete` **plus** `manage` and
  `manage-administrators`, the two non-CRUD action segments; corrected 2026-08-21, Phase 2 re-review),
  both **top-level siblings of the existing `index` key**, composed together at render rather than one
  key per permission — see "Open items … resolved" below for why, and for the snake_case key-leaf note
  that applies to `manage-administrators`.

Presentational rules the view must honor:

- **Permission toggles are rendered by iterating the backend-supplied catalog**, never a hardcoded
  list of the 9 modules. This keeps the view correct whatever granularity story 0002's seeded catalog
  lands on, and means a new module needs no view change.

  > **Corrected 2026-08-21 (Phase 2 review) — there is no "module→permissions structure" on the
  > backend; the grouping has to be derived.** `permissionOptions()` returns a **flat**,
  > name-ordered collection of `Permission` rows carrying `id` and `name` only. The module is the
  > segment before the dot in 0002's `<module-slug>.<action>` permission name (`blog.view` → `blog`),
  > so the grouping is a pure presentational transform over an already-fetched collection — it adds no
  > Eloquent query and so does not cross this story's split with 0010. **Resolved 2026-08-21 (open item
  > 2, human-confirmed):** the transform lives view-side, a `->groupBy()` over
  > `$this->permissionOptions` in the Blade file — not a new `#[Computed]` on the component, so this
  > story's diff to 0010's closed component stays limited to the `canEdit`/`canDelete` addition (open
  > item 1). The invariant this bullet exists for is unchanged either way: the module list is derived
  > from the catalog, never written out by hand.
  >
  > Note the two non-CRUD permissions (`roles.manage`, `roles.manage-administrators`) group under a
  > `roles` "module" that is not in `RolePermissionSeeder::MODULES` — a derived grouping handles them
  > for free, a hardcoded module list would drop them silently.

- **The permission catalog is rendered in full and is never filtered to what the acting user may
  grant.** ⚠️ This is a hard constraint, not a preference, and it is new since this story was drafted.
  0010's Phase 4 audit added [`App\Actions\Roles\EnforceGrantorPermissionScope`](../../../app/Actions/Roles/EnforceGrantorPermissionScope.php),
  which refuses a payload that *newly grants* a permission the actor does not hold — and it treats an
  **omission** as a deliberate revoke, while its sibling `EnforceAdministratorPermissionGrant` treats
  an omission as something to *preserve*. That divergence is safe only because every permission a role
  currently holds is rendered as a checked box and comes back in the payload. Hiding the boxes for
  permissions the actor cannot grant — the intuitive reaction to that guard — turns the divergence into
  a **silent revoke**: a narrow `roles.manage` holder editing a role that legitimately holds
  `products.delete` would submit a payload omitting it, and `syncPermissions()` would strip it with no
  error anywhere. See
  [`docs/security/authorization-patterns.md`](../../../docs/security/authorization-patterns.md#two-guards-on-one-payload-must-agree-on-what-an-omission-means),
  whose ⚠️ names the two places the bug would be introduced — `permissionOptions()` **or the paired
  Blade view**, i.e. this story's own deliverable. *(Corrected 2026-08-21, Phase 2 re-review: this
  bullet previously claimed that page "names this story by number"; verified it does not — the string
  `0011` does not appear in it. The substance of the citation is exact, the attribution was not.)*
  Rendering such a box
  **disabled** is equally forbidden unless the disabled input still submits its current value.
- **The administrator-level toggle is wrapped in a plain conditional** on the backend flag
  (`@if ($this->canGrantAdministratorLevel)`). It must be **absent from the DOM**, not merely
  hidden with CSS or disabled — a rendered-but-disabled control still leaks the permission's
  existence to a non-Super-Admin.
- **The delete modal branches on the holder count**: when the count is greater than zero it renders
  the blocking message including the count and offers **only a dismiss control** — the destructive
  button is not rendered at all, rather than rendered-and-disabled. This is the PRD's
  "no confirm-and-proceed path" expressed in markup.

  > **Corrected 2026-08-21 (Phase 2 review) — where the count comes from.** 0010 exposes **no**
  > dedicated holder-count property; `confirmDeleteRole()` sets only `$deletingRoleId` and
  > `$deletingRoleName`. The count is the `users_count` attribute already present on each row of
  > `$this->roles` (`withCount(['users' => fn ($q) => $q->withTrashed()])` — **soft-deleted holders
  > count**, per 0010's Phase 4 finding F3), so the modal reads it off the row matching
  > `$deletingRoleId`. That is a lookup in an already-loaded collection, not a new query, so it stays
  > inside this story's split. The server-side backstop is unchanged and must not be duplicated in the
  > view: `deleteRole()` re-reads the count and throws a `ValidationException` on the `deletingRoleId`
  > key carrying `trans_choice('roles.index.delete_blocked', …)`, and `App\Models\Role`'s own
  > `deleting` guard throws `App\Exceptions\RoleInUseException` (**409**) behind that.

- **Every server-side refusal 0010 ships must have somewhere to land in the markup.** ⚠️ Added
  2026-08-21 (Phase 2 review): two of the three refusal channels below did not exist when this story
  was drafted, and a view that renders no error for them refuses the user *silently*.

  | Refusal | Shape | Error-bag key |
  | --- | --- | --- |
  | Invalid / duplicate / blank role name | `ValidationException` | `name` |
  | Self-lockout — the save would strip `roles.manage` from a role the actor holds (F7) | `ValidationException` | `selectedPermissionIds` |
  | Delete blocked by holder count | `ValidationException` | `deletingRoleId` |
  | Granting a permission the actor does not hold (`EnforceGrantorPermissionScope`, F2) | `AuthorizationException` → **403** | — (no error bag) |
  | Granting `roles.manage-administrators` without being the Super Admin (`EnforceAdministratorPermissionGrant`) | `AuthorizationException` → **403** | — (no error bag) |
  | Forged id targeting the Super Admin or Administrator role | `AuthorizationException` → 403, or `ImmutableRoleException` → 403 | — (no error bag) |

  The three `ValidationException` rows need an inline `@error(...)` outlet in the markup — including
  one on the **permission checkbox group** and one **inside the delete modal**, neither of which this
  story's original Gherkin covers. **Resolved 2026-08-21 — the three 403 rows stay full-page error
  responses, not inline feedback.** Each is reachable only by tampering (a forged role id, or a
  permission-catalog payload edited past what the rendered checkboxes offer), never by a normal click
  once `canEdit`/`canDelete` (open item 1) gate the controls and the catalog stays fully rendered —
  the same "no inline handling for a request the UI itself never produces" precedent 0010's own
  component already sets for these exact exceptions.
- **Every per-row action carries a `data-test` hook on *both* the enabled and the disabled branch.**
  ⚠️ Added 2026-08-21 (Phase 2 re-review): without this the two "rendered disabled" / "rendered
  enabled" Gherkin scenarios above have nothing concrete to assert against, because the row actions
  are icon-only and therefore carry no visible text to select by. This is not a new convention — it is
  the one the Users screen already ships, and the one its tests depend on:

  ```php
  // tests/Feature/Users/IndexRenderingTest.php — the established assertion shape
  $isRowActionDisabled = fn (string $dataTest): bool => (bool) preg_match(
      '/data-test="'.preg_quote($dataTest, '/').'"[^>]*\sdisabled="disabled"/',
      $html
  );
  ```

  So: `data-test="edit-role-{id}"` / `data-test="delete-role-{id}"`, present identically on the
  enabled and the disabled branch (a test must select the same row action regardless of its state),
  with `wire:click` arguments passed through `@js(...)` — mandatory, not stylistic, per
  [`docs/security/blade-livewire-output-encoding.md`](../../../docs/security/blade-livewire-output-encoding.md).
  The two Flux/Blaze traps the Users screen's disabled branch hit are pre-solved and must not be
  re-derived: write the disabled branch as its own `@if`/`@else` with an explicit `<flux:tooltip>`
  wrapper rather than a conditionally-bound `:tooltip="…"` prop, and put any `cursor-not-allowed!`
  class on that wrapper rather than on the `pointer-events-none` button — both recorded in
  [`docs/errors-log.md`](../../../docs/errors-log.md) (2026-08-16).

- **The Super Admin row is never special-cased in the view.** The view renders whatever collection
  the backend hands it; there is no `@if ($role->name !== 'Super Admin')` guard, because that would
  duplicate an invariant that belongs to 0010/0008.

  > **Note added 2026-08-21 (Phase 2 review) — this rule covers the Super Admin role and *only* it.**
  > `Role::selectable()` excludes the Super Admin role alone, so the seeded **Administrator** role
  > *is* in `$this->roles` and will render as an ordinary row. Since 0010's Phase 4 finding F1 it is
  > un-renameable and categorically undeletable (model guards + `RolePolicy::delete()`), while its
  > permission set stays fully editable — and `RolePolicy::update()` additionally requires
  > `roles.manage-administrators` for it. **Resolved 2026-08-21 (open item 1, human-confirmed):** its
  > row is never name-guarded either — it renders like any other row, but with its edit/delete actions
  > driven by the `canEdit`/`canDelete` UI hints described in "Open items … resolved" above, the same
  > per-row `Gate::allows()` pattern the Users screen already uses.

## Tests to perform

Split per `docs/testing/frontend/coverage-policy.md` — a small ceiling of browser tests covering
genuine user journeys, with cheaper structural cases pushed down to Livewire component tests rather
than padding the browser suite.

**Browser level** (`tests/Browser/`) — real rendering, Livewire round-trips, and DOM-absence
assertions:
- [x] A user administrator creates a role with only Blog permissions toggled and sees it listed.
- [x] Reopening that role shows exactly the permissions it was created with.
- [x] Editing a role with a permission cleared persists, verified by reopening the editor.
- [x] Deleting a role assigned to 3 users is blocked: the count-bearing message appears and no
      confirm-and-proceed control exists in the DOM.
- [x] A signed-in Super Admin sees the "manage administrator-level roles/users" toggle.
- [x] A broad administrator holding the general "manage roles & permissions" permission does **not**
      have that toggle present in the DOM (assert absence, not invisibility).
- [x] Every browser test asserts `->assertNoJavaScriptErrors()` per
      `docs/testing/frontend/test-quality-checklist.md`.

**Livewire component level** (`tests/Feature/`) — faster, no browser needed:
- [x] Empty state renders when no custom roles exist.
- [x] The live count matches the number of roles rendered.
- [x] The Super Admin role is absent from the rendered list even when present in the system.
- [x] Permission toggles render one group per module in the supplied catalog.
- [x] An unassigned role is removed from the list after deletion.
- [x] A role saved with zero permissions is accepted and listed (legal inert state).

**Negative / edge:**
- [x] Blank, whitespace-only, and duplicate role names are each refused with inline feedback and add
      no role (one test driven by a Pest dataset, one row per `Examples` row, per
      `gherkin-guidelines.md` rule 4).
- [x] The delete-blocked path leaves the role in the list afterwards.
- [x] A module whose catalog entry has no permissions renders its heading without crashing.

  > **Covered in its reachable form (Phase 3).** Because open item 2's resolution derives the grouping
  > with a view-side `->groupBy()`, a module with *zero* permissions is unconstructible — a group only
  > exists because a permission created it. The shipped test asserts the nearest reachable case that
  > carries the same risk: `tests/Feature/Roles/IndexUiTest.php`'s "a sparse permission catalog with
  > only one module renders its heading without crashing".

**Added 2026-08-21 (Phase 2 review) — coverage the shipped 0010 backend requires that this list
predates:**
- [x] **0010's own suite goes green.** `tests/Feature/Roles/IndexTest.php` (39 tests) currently fails
      wholesale on `Illuminate\View\ViewException`, because `Livewire::test()` renders and this
      story's view does not exist yet — 0010 closed with that as an explicit, agreed exception in its
      Definition of Done. Shipping the view is what resolves it, including the route-level
      `$this->get(route('roles.index'))->assertOk()` case. **The whole file passing unedited is this
      story's acceptance evidence**; any assertion that has to change is a regression to justify, not
      a test to update.

  > **Verified 2026-08-21.** `tests/Feature/Roles/IndexTest.php` is **untouched** by this story's diff
  > (`git diff bb0fd0c..HEAD -- tests/` lists only the two files this story created) and passes. The
  > "currently fails wholesale" wording above describes the state at Phase 2 and is left as written
  > rather than rewritten, since it is what made this bullet an acceptance criterion in the first place.
- [x] The self-lockout refusal renders inline against the permission group (drive it: an actor edits
      the role they hold and clears `roles.manage`), rather than failing silently.
- [x] The holder-count refusal renders inside the delete modal when it comes back from `deleteRole()`
      as a validation error, not only as a pre-emptive branch on `users_count`.
- [x] A narrow `roles.manage` holder editing a role that holds a permission they do **not** hold, and
      saving an unrelated change, leaves that permission intact — the regression test for the
      unfiltered-catalog rule above. This is the single highest-value test in this story: it is the
      one that fails if anyone "helpfully" filters `permissionOptions()` or the checkbox markup.
- [x] The Administrator role's row renders its edit/delete actions per the three-tier table below
      (added 2026-08-21, Phase 2 review resolution 1 — one Livewire component test per actor tier is
      enough; the browser suite does not need this case, per the coverage-policy small-ceiling rule).

  > **Corrected 2026-08-21 (Phase 2 re-review) — this bullet previously read "enabled for a
  > `roles.manage-administrators` holder / Super Admin", which is false for `canDelete` and would
  > have produced a test that cannot pass against the shipped policy.** Verified by reading
  > [`app/Policies/RolePolicy.php`](../../../app/Policies/RolePolicy.php) and
  > [`app/Providers/AppServiceProvider.php`](../../../app/Providers/AppServiceProvider.php) together:
  > `delete()` refuses `Role::isAdministratorRole($role)` **categorically**, with no permission
  > escape hatch, and the `Gate::before` closure defers only when the ability's *target* is the
  > **Super Admin** role — so it bypasses to `true` for a Super Admin actor targeting the
  > Administrator row. The three tiers:
  >
  > | Actor | `canEdit` | `canDelete` |
  > | --- | --- | --- |
  > | plain `roles.manage` holder | `false` | `false` |
  > | `roles.manage-administrators` holder, not the Super Admin | **`true`** | **`false`** |
  > | Super Admin | `true` (bypass) | `true` (bypass) — the accepted drift; 403s on click at the model guard |
  >
  > Do not "fix" `RolePolicy` to make the middle row symmetric — that asymmetry is task 0010's
  > human-confirmed Phase 4 finding F1 decision, recorded in `delete()`'s own docblock.

## Expected outcome
A signed-in administrator can reach `/roles`, see every custom role with a live count (or an
explicit empty state), create and edit roles through a modal whose permission toggles are grouped
per module, and delete only roles nobody holds — being told the exact holder count when they cannot.
The Super Admin role is nowhere on screen, and the administrator-level grant toggle exists in the
DOM only for the Super Admin.

## Acceptance criteria
- [x] `/roles` resolves as `roles.index` from `routes/roles.php` (**created by 0010**), required from
      `routes/web.php` the same way `settings.php` is. This story verifies the wiring; it does not
      create the route file, the `require` line, or the component class.
- [x] The screen follows the established list + modal pattern (section header with a live count, a
      primary create button, per-row edit/delete actions), consistent with the Users/Products/Taxes
      prototype screens.
- [x] A live count reflecting the listed roles is shown, and an explicit empty state replaces the
      list when no custom roles exist (exact copy deliberately unpinned).
- [x] The create/edit modal collects a role name and permission toggles **only** — no description
      field.
- [x] Permission toggles are grouped by module and rendered by iterating the backend-supplied
      catalog, not a hardcoded module list.
- [x] A role name that is blank, whitespace-only, or already taken is refused with inline feedback.
- [x] A role saved with zero permissions is accepted.
- [x] Deleting a role held by at least one user is hard-blocked, states the holder count, and offers
      no confirm-and-proceed control anywhere in the DOM; an unassigned role deletes normally.
- [x] The Super Admin role is never rendered in the roles list, and the view contains no
      Super-Admin-specific guard (it relies on the backend query).
- [x] The "manage administrator-level roles/users" toggle is absent from the DOM for anyone who is
      not the Super Admin, including a holder of the general "manage roles & permissions"
      permission — absent, not hidden or disabled.
- [x] The seeded Administrator role's row renders like any other row (added 2026-08-21, open item 1)
      — no name-based guard — with its edit/delete actions disabled for an actor `Gate::allows()`
      refuses (a plain `roles.manage` holder) and enabled for one it permits (a `roles.manage-administrators`
      holder for edit; a Super Admin for both, including the one accepted drift where a Super Admin's
      enabled delete control still 403s on click at the model layer).
- [x] Every per-row action carries a `data-test="edit-role-{id}"` / `data-test="delete-role-{id}"`
      hook on **both** its enabled and its disabled branch, so a test selects it identically either
      way (added 2026-08-21, Phase 2 re-review — the row actions are icon-only, so this is what makes
      the "rendered disabled/enabled" criteria above assertable at all; same convention as the Users
      screen, see the presentational rule for the two Flux/Blaze traps it pre-solves).
- [x] The permission catalog is rendered **in full**: no checkbox is hidden, omitted or made
      non-submitting on the basis of what the acting user may grant (added 2026-08-21 — see the
      presentational rule and its security citation above).

  > **Read together with the administrator-level criterion two bullets above, which is its one
  > carve-out — not a conflict.** The shipped view withholds exactly one checkbox,
  > `roles.manage-administrators`, which is precisely what that other criterion *requires* be absent
  > from the DOM. It is safe to omit only because it is the single permission whose guard
  > (`EnforceAdministratorPermissionGrant`) **preserves** an omission; every other permission — including
  > every one the actor could not themselves grant — is rendered. Verified by count, not by presence:
  > a non-Super-Admin's render carries `catalogSize - 1` checkboxes and a Super Admin's carries
  > `catalogSize`. The durable rule, added by this story's Phase 4 audit, is
  > [`docs/security/authorization-patterns.md`](../../../docs/security/authorization-patterns.md#a-control-omitted-from-the-dom-is-safe-only-for-the-one-value-whose-guard-preserves-an-omission)'s
  > "A control omitted from the DOM is safe only for the one value whose guard preserves an omission" —
  > read it before withholding a second control.
- [x] Each of 0010's three `ValidationException` refusals (`name`, `selectedPermissionIds`,
      `deletingRoleId`) has an inline outlet in the markup (added 2026-08-21).
- [x] The view derives no authorization **of its own**: it consumes 0009/0010's collection and
      boolean flag, plus the `canEdit`/`canDelete` UI hints resolution 1 adds to `roles()` — hints
      that disable a control, never a substitute for the model/policy layer that actually authorizes
      the click, identical in shape and disclaimer to the Users screen's own row actions. *(Amended
      2026-08-21 per Open item 1's resolution above.)*
- [x] Component is class-based with a `#[Title(...)]` attribute — **already true; verify, do not
      build** — and the view lives at the flat `resources/views/livewire/roles.blade.php`, per the
      [`Index`-in-a-subfolder exception](../../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
      to the kebab-case mirror rule. *(Corrected 2026-08-21: this bullet previously said "a kebab-case
      mirrored view", contradicting the corrected view-path bullet in Files to create/modify.)*

## Definition of Done
- [x] Tests written and green (browser + Livewire component cases above)
- [x] Code reviewed (code-reviewer)
- [x] No security findings (appsec-auditor) — with explicit attention to the administrator-level
      toggle being absent rather than hidden, since a leak there is privilege-escalation-adjacent
- [x] Documentation updated (docs-keeper) — `docs/api/routes.md` gains the new `roles.index` route
- [x] Acceptance criteria met
- [x] Sibling stories 0002, 0008, 0009, 0010 landed (this story is not independently shippable —
      it is the view layer of a component whose logic is 0010's). **Verified 2026-08-21:** all four
      are in `ai-spec/tasks/done/`; 0010 closed 2026-08-20 (commit `87bf0ae`).
- [x] `tests/Feature/Roles/IndexTest.php` — 0010's whole suite — passes **unedited** (added
      2026-08-21; see the Tests to perform note on why it is red today)

## Open items raised by the Phase 2 review — resolved 2026-08-21 (human-confirmed)

The three questions Phase 2 flagged as product/scope decisions, closed before Phase 3 starts. Each
resolution is also reflected inline at its own section above/below; this section is the single place
recording *that* a decision was made and *why*, per the same convention 0010 used for its own
human-confirmed calls (e.g. the Administrator-role deletion/self-escalation decisions in
[0010's implementation record](../done/0010-role-permission-management-backend.md), its "Phase 3/4/5/6
implementation record" section).

**1. The Administrator role renders with a per-row `Gate::allows()` UI hint — option (b).** Matches
the Users screen's own convention (`App\Livewire\Users\Index::loadUsers()`'s `canEdit`/`canDelete`,
`Gate::allows('update'|'delete', $user)`), rather than leaving two dead 403-on-click controls or
inventing a third, novel treatment.

**Consequence: this story's Phase 3 must add `canEdit`/`canDelete` to `App\Livewire\Roles\Index`'s
`roles()`, a narrow, precedented exception to the 0010/0011 file split.** `roles()` is 0010's own
`#[Computed]` property, on a file 0010 already closed — but this is not "reopening" 0010 any more
than the Users screen's own per-row hints were, which landed as a **post-closure follow-up on the
same screen** (see `docs/errors-log.md`'s "Task 0006 follow-up" entry, 2026-08-16, the exact same
shape: a UI-hint addition to an already-`done` component, on the story that actually needed it to
render). Concretely: `roles()` currently returns `Role::query()->selectable()->where(...)->...->get()`
(a bare `EloquentCollection<int, Role>`); it needs to expose `canEdit` = `Gate::allows('update',
$role)` and `canDelete` = `Gate::allows('delete', $role)` per row, either as an array shape mirroring
`Users\Index`'s `$users` (an `array<int, array{...}>`) or as an appended pseudo-attribute on each
`Role` — implementation-shape choice left to Phase 3, matching how this file leaves other such calls
to the agent doing the work.

> **Added 2026-08-21 (Phase 2 re-review) — two constraints on that shape choice, both verified.**
> **(a)** If Phase 3 picks the array shape, the array must still carry `users_count` **and** each
> role's granted `permissions`: the delete modal reads the holder count off the row of `$this->roles`
> matching `$deletingRoleId` (see the delete-modal correction above), and the list renders each role's
> granted modules from the eager-loaded relation. Dropping either while flattening to an array breaks
> a rendering requirement this file states elsewhere. The appended-attribute shape avoids the question
> entirely and is the lower-risk default. **(b)** The DoD item "0010's whole suite passes unedited" is
> satisfiable under either shape: the only assertion in `tests/Feature/Roles/IndexTest.php` that reads
> this property is `collect(Livewire::test(Index::class)->get('roles'))->pluck('name')` (line ~526),
> and `pluck('name')` resolves against both an array-of-arrays and a collection of models. Re-run that
> file after the change rather than assuming it — it is the story's own acceptance evidence. `RolePolicy::delete()`'s own docblock already anticipates this addition
by name and records the one accepted drift it carries forward unchanged: a Super Admin actor sees the
Administrator row's delete control enabled (the `Gate::before` bypass grants `allows()` true) and the
model guard (`guardAgainstAdministratorDeletion()`) refuses on click — same accepted-drift shape the
Users screen already has for its own Super Admin/Administrator edge case, not a new one.

The "**The view re-derives no authorization**" acceptance criterion (below) is amended accordingly:
it becomes "the view derives no authorization **of its own**; `canEdit`/`canDelete` are UI hints
consumed from the component, identical in shape and disclaimer to the Users screen's own, and never a
substitute for the model/policy layer that actually authorizes each click." Two Gherkin scenarios are
added for it (see the Gherkin block above/below).

**2. The module grouping is derived in the Blade view — option (a).** A view-side `->groupBy()` over
`$this->permissionOptions` (splitting each `Permission` row's `name` on the first `.`), not a new
`#[Computed]` on the component. Keeps the component's diff for this story at just the `canEdit`/
`canDelete` addition above — no second, unrelated method added to 0010's closed file for a
purely-presentational transform this story's own split already claims as its job.

**3. Permission-label copy uses a label-per-module plus a shared label-per-verb — option (a).** Ten
module label keys (the nine `RolePermissionSeeder::MODULES` entries plus the `roles` pseudo-module
from decision 2 above) and a verb label key per distinct action segment, composed at render
(`__("roles.modules.$module") . ' — ' . __("roles.actions.$action")` or equivalent), rather than 38+.
Survives a future catalog module addition with no new key, unlike option (b); ships real, readable
copy from day one, unlike option (c). Both `lang/en/roles.php` and `lang/es/roles.php` gain a
`modules` and an `actions` array, key-for-key identical between the two files per
`docs/conventions/naming.md`.

> **Corrected 2026-08-21 (Phase 2 re-review) — two factual errors in this decision as first written,
> both verified against `database/seeders/RolePermissionSeeder.php`.**
>
> 1. **"Four verb label keys (`view`/`create`/`edit`/`delete`)" and "fourteen keys total" are short by
>    two.** The seeded catalog is 9 modules × 4 CRUD actions **plus** `ROLE_PERMISSIONS =
>    ['roles.manage', 'roles.manage-administrators']`. Those two permissions' action segments are
>    `manage` and `manage-administrators` — neither is in `ACTIONS`. Composing them against a
>    four-verb `actions` array renders the raw key. The floor is therefore **10 module keys + 6 action
>    keys = 16 per language**, and the decision's own "derive from the catalog, never hand-write the
>    module list" invariant (rule 2) applies to the verb list too: it comes from the distinct action
>    segments present in `permissionOptions()`, not from `ACTIONS`. *Copy call left open to Phase 3,
>    consistent with this file's other unpinned copy:* those two may instead be two bespoke
>    whole-permission labels if "Roles — Manage administrator-level" reads badly; either way the count
>    is 16, not 14, and neither may render a raw key.
> 2. **The placement sentence contradicted the decision's own example.** It read "under the existing
>    `index` key structure", which would make the composed key `roles.index.modules.blog` — but the
>    example composes `__("roles.modules.$module")`. `modules` and `actions` are **top-level siblings
>    of `index`**, not nested under it. Corrected above.
>
> One convention note for Phase 3: `docs/conventions/naming.md` requires `snake_case` translation-key
> leaves, so the `manage-administrators` action segment cannot be used verbatim as a key. Map the
> segment to its key (`manage-administrators` → `manage_administrators`) at render; do not rename the
> permission, whose kebab-case name is fixed by the seeded catalog.

## Phase 3/4/5/6 implementation record

**2026-08-21 — Phase 3 (implementation), TDD red → green in two steps.**

*Step 1 (red, commit `779dd49`).* Two new test files, both verified red **for the expected reason** —
the missing `resources/views/livewire/roles.blade.php` — rather than for setup or syntax errors.
[`tests/Feature/Roles/IndexUiTest.php`](../../../tests/Feature/Roles/IndexUiTest.php) (17 tests at
this point) covers the component-level rendering cases listed in [Tests to perform](#tests-to-perform);
[`tests/Browser/RolesIndexTest.php`](../../../tests/Browser/RolesIndexTest.php) (6 tests) is the small
real-journey ceiling `docs/testing/frontend/coverage-policy.md` mandates, every one of them asserting
`assertNoJavaScriptErrors()`. Two practical notes worth carrying forward: the helpers are named
`roleUiPermission()` / `roleUiActor()` specifically so they cannot collide with `IndexTest.php`'s
`rolesTestPermission()` / `rolesTestActor()` when both files load in one process (Pest's helper
functions are global — a same-named pair is a redeclaration fatal, not a scoping error); and the
browser tests select checkboxes through Flux's `<ui-checkbox>` custom element by Playwright role +
accessible name, because there is no plain native `<input>` to target.

*Step 2 (green, commit `2273352`).* Built exactly what [Files to create/modify](#files-to-createmodify)
specified, and **neither test file needed a test-side change to turn green**:

- [`resources/views/livewire/roles.blade.php`](../../../resources/views/livewire/roles.blade.php) — the
  core deliverable, at the flat path the `Index`-in-a-subfolder exception resolves to. Listing with a
  live count and empty state, create/edit modal, delete-confirmation modal.
- [`app/Livewire/Roles/Index.php`](../../../app/Livewire/Roles/Index.php) — the one precedented
  addition open item 1 authorized: `roles()` appends `canEdit` / `canDelete` per row. Shipped as
  **appended pseudo-attributes on each `Role`**, not the array shape the open item left open — the
  lower-risk of the two options it named, since the view still needs `users_count` and the eager-loaded
  `permissions` relation off every row.
- [`app/Models/Role.php`](../../../app/Models/Role.php) — `@property` docblocks for those two, so
  Larastan level 7 resolves them on a `Role` instance. The only reason this file is in the diff.
- `lang/en/roles.php` + `lang/es/roles.php` — the screen's copy, 16 keys per language per open item 3's
  resolution (10 `modules` + 6 `actions`, top-level siblings of `index`), plus `summary`, `empty` and
  `action_not_allowed`. 0010's two existing keys were not moved.

Three Phase 1/2 decisions are worth recording as *confirmed by building*, since each could plausibly
have gone the other way and did not:

- **The module grouping is derived, and derivation is what makes it correct rather than merely tidy.**
  Grouping on the segment before the first dot puts `roles.manage` / `roles.manage-administrators` into
  a `roles` pseudo-module **for free** — a hardcoded `RolePermissionSeeder::MODULES` list would have
  dropped both silently, with no error anywhere.
- **The two Flux/Blaze traps `users.blade.php` already documented were reused verbatim, not
  re-derived.** The disabled row action is its own `@if`/`@else` branch wrapped in an explicit
  `<flux:tooltip>` (never a conditionally-bound `:tooltip` prop, which Blaze counts as *present*
  whenever the attribute is written at all), and `cursor-not-allowed!` sits on that wrapper rather than
  on the `pointer-events-none` button. See `docs/errors-log.md`, 2026-08-16.
- **`name` and `selectedPermissionIds` need no hand-written error outlet**; Flux's own `wire:model`
  error integration on `flux:input` / `flux:checkbox.group` renders both. Only `deletingRoleId` got an
  explicit `<flux:error>`, because the delete modal's pre-emptive holder-count branch cannot render the
  *race* case `deleteRole()` refuses on the server.

**Phase 4 (`appsec-auditor`) — verdict PASS, no blocking findings.** The story's highest-risk claim was
verified by **rendering and counting**, not by reading markup: the administrator-level toggle's DOM
absence was checked by mounting the component as each actor tier and counting the emitted checkboxes
(37 vs. 38). Three Low/Informational findings were hardened in commit `0b8806f`; one was accepted.

- **F2 / F4 — the withheld permission's filter moved out of the render loop.** As first built, the
  administrator-level permission was skipped by a per-item `@if` *inside* the checkbox loop, applied
  **after** `groupBy()`. Replaced with a single `->reject()` applied **before** the grouping. Same
  rendered result today, but two things follow that did not hold before: a module whose only permission
  is administrator-level can no longer render a heading with an **empty body** (F4 — the same
  disclosure the toggle's absence exists to prevent, arriving structurally), and "the catalog is
  unfiltered except for this one value" became a single expression rather than a branch a second,
  unrelated `@if` could duplicate or drift from.
- **F3 — the delete modal's holder-count read failed *open*.** `$deletingRole->users_count ?? 0` meant
  a role deleted or reassigned between page load and click read as *zero holders* and rendered the
  destructive button. Not exploitable (`deleteRole()` re-checks and `Role`'s model guard backstops it),
  but this screen's whole posture is fail-closed, so the destructive button's condition now requires
  `$deletingRole !== null` **in addition to** the zero count.
- **F1 — accepted and documented rather than closed (human-confirmed).** For a non-Super-Admin editing
  a role that holds `roles.manage-administrators`, that permission's **id** still reaches the browser
  inside `$selectedPermissionIds`, even though its checkbox is absent. The disclosure is an id, not a
  capability: granting and revoking it are both independently blocked and were verified so. The reason
  it was left open is the more interesting half — the fix lives in **0010's already-closed
  `openEditModal()`**, and putting the withholding rule in a second file is exactly how 0009's
  "preserve on omission" turns into a revoke for the Super Admin. Reopening condition: if a second
  permission ever becomes withheld, this stops being one id and starts being a pattern.

The audit's own **test** finding is worth stating separately, because it is a rule and not a fix: a
**presence** assertion ("this permission's checkbox is still there") would pass equally well against a
view that filtered half the catalog. Both regression tests therefore assert a rendered **count** —
catalog size minus exactly the withheld set, per actor tier — so any further omission fails one of
them. Commit `a8c3f9a` wrote the durable rule up as
[`docs/security/authorization-patterns.md`](../../../docs/security/authorization-patterns.md#a-control-omitted-from-the-dom-is-safe-only-for-the-one-value-whose-guard-preserves-an-omission)'s
new section, and **corrected** the neighbouring "Two guards on one payload" section in place: it closed
with "the second action never has to preserve anything, because nothing is ever invisibly absent",
which was true only once this story's `->reject()` landed and false in the window between 0010's
closure and now.

**Phase 5 (`code-reviewer`) — one blocking finding, four non-blocking, all fixed.**

- **F-1 (blocking, commit `70abd71`) — the new security section quoted code that had already been
  deleted.** It was written during Phase 4 (commit `a8c3f9a`) and its ✅ block quoted the per-item `@if`
  that the *previous* commit in this story's own history (`0b8806f`) had replaced with the
  `->reject()`. A verbatim instance of the failure class `docs/errors-log.md`'s 2026-08-20 entry
  already names — "a security page documented the vulnerable code as current, because it was written
  before its own fix" — and the same entry prescribes the fix that was applied: the ✅ now quotes the
  real shipped expression, and the removed per-item form is demoted to a labelled ❌ with the two
  independent reasons it was wrong, giving the section's Rule paragraph the counter-example it was
  written to warn against but did not have.
- **F-3 (commit `48dbf54`) — a plural written inline in a Blade file.** The per-role permission-count
  string `':count permission|:count permissions'` was hardcoded in the view, unreachable by
  `lang/es/roles.php` and a direct hit on `docs/conventions/naming.md`'s rule that a count-dependent
  message's plural split belongs in the translation file. Now `roles.index.permission_count` in both
  languages, consumed via `trans_choice()` — matching the sibling `summary` key beside it.
- **F-4 — the two count-based regression tests counted the wrong thing.** They used
  `substr_count($html, 'value="')`, correct today only because nothing else in the modal happens to
  emit that attribute. Rescoped to `'<ui-checkbox '` after tracing the real rendered markup — **with
  the trailing space**, because `flux:checkbox.group` emits its own `<ui-checkbox-group>` wrapper whose
  tag shares the child's prefix and silently inflated both counts by exactly one. Recorded as a durable
  lesson in [`docs/errors-log.md`](../../../docs/errors-log.md#a-count-based-assertion-over-rendered-html-counted-a-wrapper-element-it-never-meant-to-include--2026-08-21),
  since the failure mode is specific to counting: an over-count by a *constant* reads as the true number.
- **F-5 — an error assertion that read the bag instead of the render.** The invalid-name dataset test
  asserted only `assertHasErrors(['name'])`, which would keep passing if the render outlet itself
  vanished (a future edit dropping `flux:input`'s `:label` prop, which the implicit `flux:error` outlet
  is gated on — traced through the Flux `with-field` stub, not assumed). A dedicated test now asserts
  the duplicate-name message is present in the rendered HTML.
- **F-6 — explicit types added** to the two closures in the view's permission-grouping transform,
  matching the fully-typed `$permissionLabel` closure eleven lines below them
  (`docs/conventions/code-style.md`, "explicit types everywhere").

Quality gates were run in their **unscoped** form, per `docs/conventions/base-standards.md`'s
[completion rule](../../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done):
`vendor/bin/pint --format agent` (not `--dirty`) clean, Larastan level 7 clean, and the full isolated
suite **609/609** — 138 Roles-scoped, with `tests/Feature/Roles/IndexTest.php` untouched.

**Phase 6 (`docs-keeper`).** This story's own change is a Blade view, two lang files and a two-line
component addition — no route, no column, no migration, no new ability — so most of the documentation
work was **correcting claims other documents had written forward-looking about this story**, not
describing new surface. Four were named by Phase 5 and all four were verified before editing:

- [`docs/api/routes.md`](../../../docs/api/routes.md) — the `roles.index` ⚠️ "**`GET /roles` does not
  render yet**" is gone; the subsection's bullet list grew from four to eight, following the shape
  `users.index`'s own subsection sets.
- [`docs/README.md`](../../../docs/README.md) — the same claim, repeated in the index entry for
  `api/routes.md`, plus widened Authorization / Security / Errors-log entries.
- [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md) — the
  `RolePolicy::delete()` ⚠️'s future tense ("story 0011's UI hint **will** render that one action
  enabled") is now shipped and carries the three-tier table `IndexUiTest.php` pins; the grant-scope
  ⚠️'s "the obvious next move for story 0011's view" is replaced by what the view actually did and the
  condition under which a second omission would be unsafe. Also: the `Gate::allows()`-is-a-UI-hint
  section gained its **second** call site, and the "Who may grant a permission" table's Visibility row
  now names the real mechanism instead of a contract-to-be.
- [`docs/conventions/naming.md`](../../../docs/conventions/naming.md) — the `trans_choice()` rule now
  states that it binds a Blade template too (F-3's lesson), and the composed-label / snake_case-leaf
  convention is recorded with its real ✅/❌ pair.
- [`docs/errors-log.md`](../../../docs/errors-log.md) — one new entry (F-4), taking the log from
  eighteen to nineteen.
- [`../../../../readme.md`](../../../../readme.md) (the course delivery document, Spanish) — its
  "estado actual" callout said the Roles UI *did not exist yet*; replaced with what shipped, and two
  further claims corrected downstream (`RolePolicy::grantAdministratorPermission` "the contract the UI
  **will** consume", and the unfiltered-catalog warning). One unrelated stale claim was found and fixed
  in the same pass: it still listed the redundant `users_uuid_unique` index as open debt, which task
  0014 closed.

`docs/database/schema.md` and `docs/database/migrations.md` were checked and deliberately **not**
touched: this story writes no column, table or migration.
