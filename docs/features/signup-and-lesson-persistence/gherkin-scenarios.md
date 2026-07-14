# Gherkin scenarios — signup-and-lesson-persistence

The signed contract. Every `@s` tag is the traceability key the `implementator` and reviewers use;
each maps to ≥ 1 concrete test. Every acceptance criterion in `spec.md` maps to ≥ 1 scenario here.
Scope = **lesson persistence + delete** (sign-up is carved out to `pending/sign-up.md`).

```gherkin
Feature: Lesson persistence and delete
  As an authenticated learner, I want my generated lessons saved to my account,
  listed on Home, reopenable, and deletable, so that my study materials are
  private to me, still there next login, and removable when I no longer need them.

  Background:
    Given I am an authenticated learner

  @s1
  Scenario: A generated lesson is persisted server-side before it is studied
    Given I have an extracted document
    When lesson generation succeeds
    Then the lesson title and its ordered slides are already stored in Supabase under my user id
    And it is stored before I study or score it, even if I close the app immediately

  @s2
  Scenario: Persist/generation failure offers retry only, with no in-memory play path
    Given lesson generation or its server-side persist fails
    When the client surfaces the failure
    Then I see a retry affordance
    And no player opens for an unpersisted lesson
    When I retry and it succeeds
    Then the lesson is persisted and I can open it

  @s3
  Scenario: The player opens only for a real persisted lesson
    Given generation succeeded and returned a persisted lesson id
    When I open the lesson
    Then it opens the existing player flow keyed on that persisted id

  @s4
  Scenario: Saved lessons are listed newest first, showing all
    Given I have several saved lessons
    When I view Home
    Then I see all of my saved lessons with their title and created date
    And they are ordered newest first with no pagination

  @s5
  Scenario: Empty state when I have no saved lessons
    Given I have no saved lessons
    When I view Home
    Then I see an empty state
    And I see no other user's lessons

  @s6
  Scenario: Reopening a saved lesson starts it from the top
    Given a saved lesson appears in my list
    When I open it
    Then it opens in the existing player/slide flow starting from the first slide

  @s7
  Scenario: Saved lessons survive logout and login
    Given I have saved lessons
    When I log out and log back in
    Then all my previously saved lessons still appear unchanged

  @s8
  Scenario: Deleting a lesson after confirmation removes it everywhere
    Given a saved lesson appears in my list
    When I delete it and confirm
    Then it is removed from Supabase
    And it no longer appears on Home

  @s9
  Scenario: Dismissing the delete confirmation keeps the lesson
    Given a saved lesson appears in my list
    When I choose to delete it but dismiss the confirmation
    Then the lesson is not deleted
    And it still appears on Home

  @s10
  Scenario: lesson_attempts references a real lessons row and cascades on delete
    Given the lessons table exists
    And a saved lesson has recorded attempts
    When that lesson is deleted
    Then lesson_attempts.lesson_id is a foreign key to lessons.id
    And the lesson's attempt rows are removed with it

  @s11
  Scenario: Row-level security hides other users' lessons on read
    Given user A has saved lessons
    When user B or an unauthenticated request queries lessons directly
    Then no rows belonging to user A are returned

  @s12
  Scenario: Row-level security scopes delete to my own lessons
    Given user A has a saved lesson
    When user B attempts to delete that lesson directly
    Then no row belonging to user A is deleted

  @s13
  Scenario: The list shows a loading state while lessons load
    Given my saved lessons have not yet loaded
    When I view Home
    Then I see a loading state until they resolve

  @s14
  Scenario: The list shows a retryable error when loading fails
    Given loading my saved lessons will fail
    When I view Home
    Then I see an error state with a retry action
    When I retry and it succeeds
    Then I see my saved lessons

  @s15
  Scenario: All user-facing strings are localized
    Given the app locale is set to a supported language
    When I view the saved-lessons list, its empty/error states, and the delete confirmation
    Then every label, message, and action is rendered from the active locale bundle
    And no user-facing string is hardcoded

  @s16
  Scenario: The saved-lessons list is accessible
    Given I view my saved lessons
    Then each lesson exposes an accessible name and open action
    And the delete control exposes an accessible name
    And the loading, empty, and error states are announced to assistive technology
```

## AC → scenario coverage

| AC (story) | Scenario(s) |
|---|---|
| Lesson persisted on generation | @s1, @s3 |
| Persist failure → retry only | @s2 |
| Saved lessons visible (newest first, all) | @s4, @s13 |
| Empty home | @s5 |
| Reopen a saved lesson | @s6 |
| Survives logout/login | @s7 |
| Delete a lesson (with confirmation) | @s8, @s9 |
| FK landed | @s10 |
| Row-level security (read + delete) | @s11, @s12 |
| Loading / Error states | @s13, @s14 |
| i18n / a11y (cross-cutting) | @s15, @s16 |

## Scenario → primary test kind (how the implementator consumes it)

| Scenario | Primary test |
|---|---|
| @s1, @s2 | Edge-fn `_shared` persist-module unit test (JS mirror) + `lesson-generation.service`/helper error-normalization test (`persist_failed` → retry) + manual live-verify note |
| @s3, @s6 | `lesson-generation.tsx`/`saved-lessons` nav test (opens `/lesson/[id]` by persisted id) + integration |
| @s4, @s13, @s14 | `lesson-list.test.tsx` (Content/Loading/Error render) + `use-lessons.test.ts` (states) + Playwright e2e |
| @s5 | `lesson-list.test.tsx` (Empty render) + `use-lessons.test.ts` |
| @s7, @s11, @s12 | `lessons.dao.test.ts` + `lessons.service.test.ts` (RLS-scoped queries, mocked Supabase) + migration RLS note |
| @s8, @s9 | `lesson-list.test.tsx` / `saved-lessons.test.tsx` (confirm dialog) + `lessons.dao`/`service` delete tests + `use-lessons.test.ts` |
| @s10 | migration review + `lessons.dao` FK-dependent insert/delete test |
| @s15 | `lesson-list.test.tsx` (strings from `t()`) + localization coverage test (en/es/pt/de) |
| @s16 | `lesson-list.test.tsx` (roles/labels/announcements) + Playwright e2e |
