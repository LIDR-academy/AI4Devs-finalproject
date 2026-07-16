# Gherkin scenarios — ai-key-management

The signed contract. Every `@s` tag is the traceability key the `implementer` and reviewers use;
each maps to ≥ 1 concrete test. Every acceptance criterion in `spec.md` maps to ≥ 1 scenario here.

```gherkin
Feature: Bring-your-own AI key management
  As a learner on the free tier, I want to save, update, and remove my own AI
  provider API key and have it used server-side only, so that I can generate
  lessons with my own key without it ever being exposed to my device, logs, or
  other users.

  Background:
    Given I am authenticated
    And the account screen hosts inline API key management

  # --- Slice 1: happy path + loading ------------------------------------------

  @s1
  Scenario: Save a first key successfully
    Given I have no API key saved
    When I enter a key and submit it
    Then the key is validated by a server-side provider check
    And on success it is stored encrypted and scoped to my account
    And the account screen shows a masked "key saved" state
    And the raw key value is never shown

  @s2
  Scenario: The form shows a loading state while validating and saving
    Given I have no API key saved
    And I have entered a key
    When I submit it
    And the save request has not yet resolved
    Then the form shows a loading state
    And the submit control is disabled until the request resolves

  @s3
  Scenario: A returning user sees the masked saved state on reload
    Given I have a key saved
    When the account screen loads
    Then I see the masked "key saved" state
    And the client only receives a "key present" indicator, never the raw key

  @s4
  Scenario: Update replaces an existing key
    Given I have a key saved
    When I enter a new key and submit it
    Then the same validate-then-store flow runs
    And the new key replaces the previously stored one
    And the account screen still shows the masked "key saved" state

  # --- Slice 2: empty + error + retry + remove + guard ------------------------

  @s5
  Scenario: No-key (empty) state invites the user to add a key
    Given I have no API key saved
    When the account screen loads
    Then I see an input to enter a key with guidance on where to get one
    And the submit control is disabled until I enter a non-blank key

  @s6
  Scenario: An invalid or revoked key is rejected and nothing is stored
    Given I have no API key saved
    When I enter a key that fails the server-side provider check
    And I submit it
    Then the save is rejected
    And I see a message explaining the key didn't validate
    And no key is persisted
    And I remain able to correct the key and resubmit

  @s7
  Scenario: A transport failure on save is retryable
    Given I have no API key saved
    And I have entered a valid key
    And the server cannot be reached
    When I submit it
    Then I see a readable "couldn't reach the server" error
    And no key is persisted
    When the server is reachable again and I resubmit
    Then the key is validated, stored, and the masked "key saved" state is shown

  @s8
  Scenario: Remove a saved key
    Given I have a key saved
    When I choose to remove it and confirm
    Then the stored key is deleted from the server
    And the account screen returns to the no-key state

  @s9
  Scenario: A failed removal surfaces gracefully and keeps the key
    Given I have a key saved
    When I choose to remove it and confirm
    And the removal request fails
    Then I see a readable error
    And my saved key remains
    And the screen does not crash

  @s10
  Scenario: Guard rail when generating with no key set
    Given I have no API key saved
    When I open the lesson-generation entry point
    And my key status is still loading
    Then neither the "key required" notice nor generation is shown yet
    When my key status resolves to "no key" and I attempt to generate a lesson
    Then generation does not start
    And I see an inline message explaining an API key is required
    And I see a link to the account screen to add one
    And nothing crashes or fails silently

  # --- Security / server-side guarantees --------------------------------------

  @s11
  Scenario: The raw key is never returned to the client after save
    Given a key save, load, or reload has occurred
    When the client reads its API key status
    Then the response contains only a masked / boolean "key present" indicator
    And no field of the response contains the raw key value

  @s12
  Scenario: The raw key is never written to server logs
    Given a key save, update, remove, or generation-time read
    When the server processes the request
    Then the raw key value never appears in any log output

  @s13
  Scenario: The key is encrypted at rest and only readable server-side
    Given a key has been stored
    Then it is held as an encrypted secret scoped to my account
    And only a server-side privileged role can read its plaintext
    And an authenticated client has no path to retrieve the raw key

  # --- Slice 3: accessibility + i18n ------------------------------------------

  @s14
  Scenario: The key manager and the "key required" notice are accessible
    Given I am on the account screen
    Then the key input exposes an accessible label
    And the save, replace, and remove controls expose a button role
    And a save or removal error is announced to assistive technology
    When I reach the generation-entry guard with no key saved
    Then the "API key required" notice's action exposes a button role

  @s15
  Scenario: All user-facing strings are localized
    Given the app locale is set to a supported language
    When I view the key manager and the "key required" guard message
    Then all labels, placeholders, button text, guidance, and error messages render from the active locale bundle
    And no user-facing string is hardcoded
```

## AC → scenario coverage

| AC | Scenario(s) |
|---|---|
| AC1 (save → validated → stored encrypted + scoped → masked state) | @s1, @s2, @s13 |
| AC2 (invalid/revoked key rejected, nothing persisted) | @s6 |
| AC3 (network/transport failure on save is retryable) | @s7 |
| AC4 (update replaces old key) | @s4 |
| AC5 (remove → no-key state) | @s8 |
| AC6 (failed removal keeps the key + readable error) | @s9 |
| AC7 (no-key empty state; submit disabled until non-blank) | @s5 |
| AC8 (masked/boolean only; raw never sent/rendered after save) | @s3, @s11 |
| AC9 (raw key never in logs) | @s12 |
| AC10 (no-key guard rail on generate attempt; loading → no flash) | @s10 |
| AC11 (key read server-side; client never holds the raw key) | @s11, @s13 |
| AC12 (accessibility — account-screen form **and** generation-entry-guard notice) | @s14 |
| AC13 (i18n) | @s15 |

## Scenario → primary test kind (how the implementer consumes it)

| Scenario | Primary test |
|---|---|
| @s1 | `api-key.dao.test.ts` (invoke `manage-api-key` save) + `api-key.service.test.ts` + `use-api-key.test.ts` + `api-key-form.test.tsx` (masked state after save) + integration (hook→service→DAO, mocked `getSupabase().functions.invoke`) + Edge Function Deno test (probe 2xx → Vault store + metadata upsert) |
| @s2 | `api-key-form.test.tsx` (loading render) + `use-api-key.test.ts` (`isSubmitting`) |
| @s3 | `api-key.dao.test.ts` (`getApiKeyStatus` select) + `api-key.service.test.ts` + `use-api-key.test.ts` (load on mount) + `api-key-form.test.tsx` (masked display) |
| @s4 | `api-key.service.test.ts` (save when a key already exists) + `api-key-form.test.tsx` (Replace affordance) + integration |
| @s5 | `api-key-form.test.tsx` (empty state, submit disabled until non-blank) + `use-api-key.test.ts` (`hasKey === false`) + `api-key.service.test.ts` (blank/whitespace key rejected → `validation_error`, defensive backstop) |
| @s6 | `api-key.service.test.ts` (normalize `invalid_key`) + `api-key-form.test.tsx` (error message + editable) + Edge Function Deno test (probe 401 → reject, nothing stored) + Playwright e2e |
| @s7 | `api-key.service.test.ts` (normalize `network_error`) + `use-api-key.test.ts` + `api-key-form.test.tsx` (retry) |
| @s8 | `api-key.dao.test.ts` (invoke remove) + `api-key.service.test.ts` + `use-api-key.test.ts` + `api-key-form.test.tsx` (remove → empty) + Edge Function Deno test (purge Vault secret + metadata row) |
| @s9 | `api-key.service.test.ts` (remove error normalization) + `api-key-form.test.tsx` (error, key remains) |
| @s10 | `api-key-required-notice.test.tsx` (message + link) + `api-key-gate.test.tsx` (loading → neither; no key → notice; has-key → children) + Playwright e2e |
| @s11 | `api-key.dao.test.ts` + `api-key.service.test.ts` (returned status shape has no raw-key field) + type-level assertion on `ApiKeyStatus` + code review |
| @s12 | Edge Function Deno test (log spy asserts the raw key never appears in any log call) + manual smoke against the hosted project + code review of redaction |
| @s13 | Migration/RLS: policy-presence check + **manual RLS verification** (an authenticated user cannot read another user's row nor the decrypted secret) + Edge Function Deno test (uses service role + Vault decrypted view); structurally, no client DAO method returns the raw key |
| @s14 | `api-key-form.test.tsx` (input label, Save/Replace/Remove roles, error announcement) + `api-key-required-notice.test.tsx` (guard-context: notice action exposes a button role) + Playwright e2e |
| @s15 | `api-key-form.test.tsx` / notice test (strings from `t()`) + `migration-coverage.test.ts` extension (key-existence for the new component dirs + en/es/pt/de alignment) |

> **Harness note.** The Edge Function (`supabase/functions/manage-api-key`, Deno) and the SQL migration sit **outside** the repo's Jest + StrykerJS harness (which covers `libs/*` TS/JS). Scenarios whose primary proof is server-side (@s12, @s13, and the server halves of @s1/@s6/@s8) are verified by **Deno tests + manual verification against the hosted Supabase project + code review**, not by the Jest run or the mutation-on-changed-lines gate. The client-observable proxies of those guarantees (status shape has no key field; DAO has no raw-key read path; error normalization) **are** Jest/Stryker-covered. See `risks.md` R1/R2.
