# [0015] Harden the Users CRUD backend's security posture (story 0004 follow-up)

## Description
Story 0004's Phase 4 security audit found one blocking (F1, fixed in the same story) and ten
non-blocking findings (F4–F13) in `App\Livewire\Users\Index`, `App\Actions\Users\CreateUser`,
`App\Actions\Users\UpdateUser` and `App\Notifications\UserInvitation`. None of them are exploitable
privilege escalation on their own against the seeded catalog — that is what made deferring them
from 0004 acceptable — but each is a small, well-bounded hardening item worth closing before this
screen carries more traffic (story 0006's real UI) or more roles (stories 0008/0009). This story
consolidates F4–F13 into one pass rather than ten micro-tasks. Findings F2/F3 (name-based role
matching, guard enforced only in the component) are tracked separately as notes on stories 0008 and
0009, since they are naturally that work's concern. F14 was recorded as an accepted, working-as-
designed control and needs no fix.

## Type
backend | includes database-expert: no

## Gherkin
```gherkin
Feature: Users CRUD backend hardening

  Scenario: A client cannot overwrite the server-derived users list or delete-confirmation name
    Given a user administrator viewing the Users screen
    When a forged Livewire payload attempts to set the users list or deletingUserName property directly
    Then the property update is rejected, mirroring the existing #[Locked] guard on editingUserId

  Scenario: Opening the edit or delete modal is itself authorized
    Given a signed-in user who holds users.view but not users.edit
    When they call openEditModal directly against another user
    Then the action is denied server-side, not merely hidden in the UI

  Scenario: A forged status value is rejected as a validation error, not a server error
    Given a user administrator with an open edit form
    When they submit a status value outside UserStatus's backing values
    Then the request is rejected with a validation message, not an unhandled exception

  Scenario: Creating users repeatedly is rate limited
    Given a user administrator who holds users.create
    When they submit far more create requests than a legitimate workflow would in an hour
    Then further requests are rejected with a validation message instead of sending more invitations

  Scenario: A partially applied edit is not possible
    Given a user administrator changing another user's name and email together
    When the email change is refused by its own throttle or uniqueness check
    Then the name change is not persisted either

  Scenario: A Super Admin cannot delete their own account through the Users screen
    Given a Super Admin acting on their own row
    When they confirm deletion of their own account
    Then the action is a no-op, mirroring the existing role/status self-edit guard

  Scenario: Every mutating and role-changing action leaves an audit trail
    Given a user administrator who creates, edits, or deletes another user
    When the action completes
    Then a structured log entry records the actor, the target, and what changed, without the generated password or any token
```

## Files to create/modify

**F4 — lock server-derived Livewire properties** (`app/Livewire/Users/Index.php`)
- Add `#[Locked]` to `public array $users` and `public string $deletingUserName`, matching the
  existing pattern on `$editingUserId`/`$deletingUserId` and the precedent in
  `app/Livewire/Settings/Security.php` (`#[Locked] public array $passkeys`).

**F7 — authorize the disclosure paths, not only the mutating ones** (`app/Livewire/Users/Index.php`)
- `openCreateModal()`: `Gate::authorize('create', User::class)` as the first statement.
- `openEditModal(string $userId)`: `Gate::authorize('update', $target)` right after resolving
  `$target`, before copying its attributes into public state. **Sharpened during the Phase 4
  re-audit**: when `$target` holds the `Administrator` role, this must be
  `Gate::authorize('updateSensitiveAttributes', $target)` instead of plain `update` — `email` and
  `status` are exactly the attributes F1 declared sensitive, and `openEditModal()` discloses both
  into public component state. A plain `update` check would let a `users.edit` holder without
  `roles.manage-administrators` read an Administrator's `pending_email`/`status` from the modal even
  though `save()` would refuse to write them.
- `confirmDelete(string $userId)`: `Gate::authorize('delete', $target)` right after resolving
  `$target`.

**F11 — self-delete guard** (`app/Livewire/Users/Index.php`)
- `deleteUser()`: return early (no-op, no error) when `$target->is(Auth::user())`, mirroring the
  role/status self-edit guard already in `updateExistingUser()`. Prevents any actor — including a
  Super Admin, who bypasses `UserPolicy::delete()` via `Gate::before` — from deleting their own
  account through this screen.

**F12 — null-collision in the administrator-role comparison** (`app/Livewire/Users/Index.php`)
- In `authorizeRoleChange()`, guard `$wasAdministrator`/`$willBeAdministrator` so two `null`s
  (`$currentRoleId === null && $administratorRoleId === null`) is never treated as "was
  Administrator". No behavioral change expected against the seeded catalog; this is a correctness
  fix for what the comparison expresses, not a live exploit.

**F8 — a forged `status` must fail validation, not raise `\ValueError`** (`app/Livewire/Users/Index.php`)
- Retype `public ?UserStatus $status` to `public ?string $status`, and hydrate the enum from the
  validated string after `$this->validate(...)` runs (mirroring the existing `$roleId` type
  asymmetry, which is `?string` for the same reason). Update every read site (`openEditModal()`
  prefill, the create/update calls) accordingly. Update
  `tests/Feature/Users/IndexTest.php`'s "a status outside the allowed set" dataset row, which today
  substitutes `null` with a comment acknowledging the raw value cannot survive — the story's own
  Gherkin scenario for this case is not actually exercised until this lands.

**F6 — rate-limit user creation** (`app/Actions/Users/CreateUser.php`)
- Add a `RateLimiter::attempt()` guard keyed on the acting user's id (e.g. 10/hour), converting a
  refusal to a `ValidationException` on a relevant field, mirroring
  `App\Actions\Users\RequestEmailChange`'s existing pattern exactly.
- Separately, in `RequestEmailChange.php`, consider whether the existing throttle key
  (`'email-change:'.$user->getKey()`, keyed on the *target*) should also account for the *actor*
  now that story 0004 added a second, cross-user call site — an administrator can otherwise burn a
  victim's own 3-per-hour quota. Evaluate a composite key or a second, actor-scoped limiter.

**F10 — wrap `UpdateUser` in a transaction** (`app/Actions/Users/UpdateUser.php`)
- Wrap the `fill()`/`save()`/`syncRoles()` sequence in `DB::transaction()`, matching `CreateUser`'s
  shape, so a `RequestEmailChange` refusal (throttle or uniqueness) rolls back the name/status/role
  changes instead of leaving them partially applied while the operator sees a validation error.
  Keep the `RequestEmailChange` call itself outside the transaction (or behind `DB::afterCommit()`
  if it must run inside it) — it already has its own error handling and should not be retried by a
  transaction retry. **The F1 `updateSensitiveAttributes` guard must keep preceding this transaction,
  not move inside it** — it already does today (both `Gate::authorize()` calls run before `UpdateUser`
  is invoked at all), and wrapping the sequence must not change that ordering, or a transaction retry
  could re-run a check that should only ever run once per request.

**F17 — the email guard's scope is keyed off a variable named for something else** (`app/Livewire/Users/Index.php`)
- `updateExistingUser()`'s `$emailChanged` check for F1 is scoped inside `if ($applyRoleAndStatus)`,
  a flag whose documented meaning is "the target is not the acting user" but whose name says "apply
  role and status" — email is neither. Extract the self-edit check to its own named variable
  (`$isSelfEdit = $target->is(Auth::user());`, then `$applyRoleAndStatus = ! $isSelfEdit;`) and use
  `$isSelfEdit`/`! $isSelfEdit` explicitly for the email guard's scope, so a future change to the
  self-edit rule for role/status cannot silently move the email guard's scope as a side effect. Found
  during the Phase 4 re-audit of F1; add a test that fixes "a self-edit of email never requires
  `roles.manage-administrators`" as an intentional property, since nothing pins it today.

**F18 — the Users editor cannot cancel an in-flight email change** (`app/Actions/Users/UpdateUser.php`)
- `RequestEmailChange` clears `pending_email` when handed the address already on the account
  (`RequestEmailChange.php:34-40`), but `UpdateUser` only calls it when the submitted address
  *differs* from the current one, so that branch is unreachable from this screen —
  `App\Livewire\Settings\Profile` can reach it, this editor cannot. Not a vulnerability (a missing
  remediation capability, not an attack path); decide whether an administrator should be able to
  abort another user's pending email change from the Users screen, and if so, expose a way to submit
  the current address explicitly (the form already prefills it, so this may already work once F8's
  status retyping is in and the difference is only what UI affordance surfaces it — confirm before
  treating this as a code change).

**F9 — do not queue a plaintext password-set token** (`app/Notifications/UserInvitation.php`)
- Either drop `ShouldQueue` (Fortify's own `ResetPassword` notification is not queued either, and
  one invitation email is not a latency concern this app currently optimizes for), or restructure
  so the token is minted inside `toMail()` from a stored reference rather than serialized in the
  queued job payload. Human decision needed on which approach — see Open questions.

**F5 — structured audit logging** (`app/Livewire/Users/Index.php`)
- Log a structured event in `save()` (create and edit paths) and `deleteUser()`: actor id, target
  id, ability exercised, and a before/after diff for role and status. Never log the generated
  password, the invitation token, or the email-change verification token. Match
  `database/seeders/RolePermissionSeeder.php`'s existing convention (`Log::warning` for
  sensitive/privileged outcomes — role/status/delete — `Log::info` for the rest).

**F13 — step-up authentication decision** (routes/web.php or app/Livewire/Users/Index.php)
- Not a code change by default — record a deliberate decision on whether creating accounts,
  changing roles/status, or deleting users should require `password.confirm`-style step-up, the
  same way `settings/security` does for 2FA/passkeys. If yes, note that `RequirePassword` is not in
  Livewire's `PersistentMiddleware` allow-list either, so it must be enforced as an explicit check
  inside the mutating methods, not only as route middleware. See Open questions.

## Tests to perform
- [ ] `#[Locked]` on `$users`/`$deletingUserName`: a forged `set()` against either property from a
      test is rejected, mirroring the existing `$editingUserId` coverage.
- [ ] `openCreateModal()`/`openEditModal()`/`confirmDelete()` each throw `AuthorizationException`
      for an actor lacking the corresponding permission, called directly (not only through `save()`/
      `deleteUser()`).
- [ ] Self-delete: a Super Admin calling `confirmDelete()`/`deleteUser()` against their own row is a
      no-op — the account still exists, no error is raised.
- [ ] `administratorRoleId()` returning `null` (an unseeded/renamed Administrator role) does not
      cause a roleless target to be treated as "was Administrator" — add a focused unit test for
      `authorizeRoleChange()`'s branch, not only an integration test that happens not to hit it.
- [ ] Submitting a status value outside `UserStatus`'s cases is rejected with a validation message
      on `status`, not an unhandled `\ValueError` (500). This finally exercises the story 0004
      Gherkin scenario "a status outside the allowed set" for real.
- [ ] `CreateUser`'s new rate limit: the 11th create request within the window is rejected with a
      validation message, and sends no invitation; the limit resets after the decay window
      (`Carbon::setTestNow()` or an equivalent time-travel helper).
- [ ] `UpdateUser`'s transaction: force `RequestEmailChange` to throw (e.g. by exhausting its
      throttle before the call) and assert the name/status/role changes were **not** persisted
      either.
- [ ] `UserInvitation`: assert the notification's queued/unqueued nature per whichever fix is
      chosen; if a token is still generated ahead of send, assert it is not present in the
      `jobs` table row when queued (or that the notification is no longer queued at all).
- [ ] Audit log: creating, editing, and deleting a user each produce exactly one matching log entry
      (use Laravel's `Log::spy()`/fake), and none of them contain the generated password, invitation
      token, or email-change hash.

## Expected outcome
The Users CRUD backend built in story 0004 has no known non-blocking security gaps left open: every
server-derived property is locked, every method that discloses or mutates state is authorized, a
forged status value fails cleanly, account creation and self-deletion cannot be abused, an
in-flight edit cannot partially apply, the invitation token is not exposed via the queue, and
privileged actions leave an audit trail.

## Acceptance criteria
- [ ] `$users` and `$deletingUserName` are `#[Locked]`.
- [ ] `openCreateModal()`, `openEditModal()`, `confirmDelete()` each authorize before disclosing or
      preparing state. `openEditModal()` uses `updateSensitiveAttributes` (not plain `update`) when
      the target holds the `Administrator` role, matching what `save()` itself requires to write
      those same fields — the disclosure check must not be weaker than the write check it precedes.
- [ ] `deleteUser()` no-ops against the acting user's own row, for every role including Super Admin.
- [ ] `authorizeRoleChange()`'s administrator comparison cannot be satisfied by two `null`s.
- [ ] A forged `status` value is a validation error, not a 500.
- [ ] `CreateUser` is rate-limited per acting user; `RequestEmailChange`'s throttle-key scope is
      evaluated and, if changed, documented.
- [ ] `UpdateUser` is transactional: a refused email change leaves no partial name/status/role write.
- [ ] `UserInvitation`'s token is not persisted in plaintext in the `jobs` table (either unqueued, or
      restructured so the token never leaves the request that sends it).
- [ ] Privileged actions (create, role/status change, delete) are logged with actor, target, and
      what changed — never a password or token.
- [ ] The step-up-authentication question (F13) has an explicit, recorded decision either way.
- [ ] The email guard's self-edit scope is named for what it means (`$isSelfEdit`), not borrowed from
      an unrelated flag, and a test pins "a self-edit of email never requires
      `roles.manage-administrators`" as intentional (F17).
- [ ] The ability to cancel another user's in-flight email change from this screen — or the decision
      not to add one — is recorded (F18).

## Definition of Done
- [ ] Tests written and green, plus the full existing suite.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — this is itself the security-audit follow-up, so
      Phase 4 re-audits specifically against F4–F13's closure.
- [ ] Documentation updated (docs-keeper) — cross-reference this story's fixes from
      `docs/security/livewire-authorization.md` (added during 0004's Phase 4 audit), and record the
      F13 step-up decision in `docs/architecture/authorization.md` regardless of which way it goes.
- [ ] Acceptance criteria met.

## Open questions
Per [`docs/contracts.md`](../../docs/contracts.md)'s Uncertainty Handling Rule, these need a human
answer before Phase 3 begins.

**Q1 — Drop `ShouldQueue` from `UserInvitation`, or restructure to mint the token inside `toMail()`?**
Dropping it is simpler and matches Fortify's own `ResetPassword` notification; restructuring keeps
the queued/async delivery this story's DoD originally asked for at the cost of more code. No
functional difference to the end user either way, since account creation is already an
administrator-initiated, non-realtime action.

**Q2 — Does user administration need step-up authentication (F13)?**
`settings/security` requires `password.confirm` because it manages 2FA/passkeys — arguably a
comparable trust boundary to creating accounts or changing another user's role. Recommend: yes, at
least for role/status changes and deletion (not plain name edits), enforced as an explicit check
inside the mutating methods since route middleware cannot cover Livewire's `/livewire/update`
endpoint. Alternative: no, on the grounds that `users.edit`/`users.delete`/`roles.manage-
administrators` are already privilege gates and a second confirmation is friction without a
distinct threat model. Needs a human call, not an implementer's default.

**Q3 — Rate-limit window and threshold for `CreateUser`?**
10/hour was the audit's suggested starting point, matching `RequestEmailChange`'s order of
magnitude (3/hour) scaled up for a legitimate bulk-onboarding workflow. Confirm or adjust before
Phase 3.

## Dependencies and related work
- **Follow-up from story 0004**'s Phase 4 security audit (findings F4–F13; F1 was fixed in 0004
  itself; F2/F3 are tracked as notes on stories 0008 and 0009; F14 is accepted-as-designed).
- No dependency on stories 0005–0013; touches only files story 0004 created.

## Provenance
F4–F13 raised by `appsec-auditor` during story 0004's Phase 4 security audit
(`ai-spec/tasks/in-progress/0004-users-list-editor-backend.md` at the time of the audit), consolidated
into one follow-up task per human decision rather than filed as ten separate micro-tasks. F17/F18 and
the F7 sharpening were added by the same auditor's Phase 4 **re-audit**, run after the F1 fix landed —
the re-audit also produced F15 (the guard is role-shaped where it should be privilege-shaped, a sharper
restatement of F2/F3) and F16 (informational, no action needed), both recorded on story 0009 rather
than here since they concern the not-yet-built administrator-level-permission mechanism, not this
story's own code.
