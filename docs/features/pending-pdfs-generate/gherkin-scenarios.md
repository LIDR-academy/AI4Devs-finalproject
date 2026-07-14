---
feature: pending-pdfs-generate
status: spec_drafted
---

# Gherkin scenarios — pending-pdfs-generate (PDF list)

The signed contract. Every `@s` tag is the traceability key the `implementator` and reviewers use;
each maps to ≥ 1 concrete test. Every acceptance criterion in `spec.md` maps to ≥ 1 scenario here.
Scope = **list the learner's successfully-extracted PDFs on the upload screen, each with the action
that fits its state (Generate / Retry / Open lesson), plus delete for un-generated PDFs**.
Generation itself and the lesson player are R2/R4/R5 (done) — reused, not re-specified.

```gherkin
Feature: PDF list — generate, retry, or open lessons from your uploaded PDFs
  As a learner, I want the upload screen to list all my uploaded (extracted) PDFs, each showing its
  status and the fitting action, so I can generate, retry, or revisit lessons without re-uploading.

  Background:
    Given I am an authenticated learner on the upload screen
    And a PDF appears in the list once its extraction has succeeded

  # ---------------------------------------------------------------------------
  # Listing (Content) + row status
  # ---------------------------------------------------------------------------

  @s1
  Scenario: My extracted PDFs are listed alongside the new-upload control
    Given I have one or more successfully-extracted documents
    When the upload screen loads
    Then I see them listed, each showing its filename, status, created date, and page count
    And they are ordered newest first
    And I can still upload a new PDF from the same screen

  @s2
  Scenario: A PDF with no lesson and no failed attempt shows "ready to generate"
    Given an extracted document that has no lesson and no recorded failed generation
    When it appears in the list
    Then its status reads as ready to generate
    And its action is Generate

  @s3
  Scenario: A PDF whose last generation failed shows "generation failed"
    Given an extracted document with no lesson whose most recent generation attempt failed
    When it appears in the list
    Then its status reads as generation failed
    And its action is Retry

  @s4
  Scenario: A PDF that already produced a lesson shows "lesson ready"
    Given an extracted document for which a lesson exists
    When it appears in the list
    Then its status reads as lesson ready
    And its action is Open lesson
    And the document remains in the list

  # ---------------------------------------------------------------------------
  # Row actions
  # ---------------------------------------------------------------------------

  @s5
  Scenario: Generate on a ready PDF starts the existing generation flow for that document
    Given a document whose action is Generate
    When I press Generate
    Then the existing generation flow (composition picker then generate) targets that document
    And no re-upload is required because the extracted content is reused

  @s6
  Scenario: Retry on a failed PDF re-runs generation for that document
    Given a document whose action is Retry
    When I press Retry
    Then the existing generation flow targets that document again

  @s7
  Scenario: Open lesson opens the persisted lesson in the player
    Given a document whose action is Open lesson
    When I press Open lesson
    Then the existing player/lesson flow opens for the lesson linked to that document

  @s8
  Scenario: A failed generation keeps the PDF listed as retryable
    Given I generated from a listed document and it failed
    When the list refreshes
    Then that document still appears with status generation failed and a Retry action

  @s9
  Scenario: A successful generation flips the PDF to "lesson ready" without removing it
    Given I generated from a listed document and it succeeded
    When the list refreshes
    Then that document still appears
    And its status becomes lesson ready with an Open lesson action

  @s10
  Scenario: A newly extracted upload appears in the list
    Given I upload a new PDF from the same screen and its extraction succeeds
    When the list refreshes
    Then the newly extracted document appears in the list

  # ---------------------------------------------------------------------------
  # Delete (only PDFs without a lesson)
  # ---------------------------------------------------------------------------

  @s11
  Scenario: Delete is offered only for PDFs that have no lesson
    Given a listed document
    When its status is ready to generate or generation failed
    Then a delete action is available
    But when its status is lesson ready
    Then no delete action is offered

  @s12
  Scenario: Deleting a PDF after confirmation removes it and its stored data
    Given a listed document that has no lesson
    When I delete it and confirm
    Then it disappears from the list and is no longer available for generation
    And its stored PDF, its extracted images, and its document rows are removed for me

  @s13
  Scenario: Dismissing the delete confirmation keeps the PDF
    Given a listed document that has no lesson
    When I choose to delete it but dismiss the confirmation
    Then the document is not deleted
    And it still appears in the list

  # ---------------------------------------------------------------------------
  # UI states
  # ---------------------------------------------------------------------------

  @s14
  Scenario: Empty state when I have no extracted PDFs
    Given I have no successfully-extracted documents
    When I open the upload screen
    Then I see an empty state for the list
    And the control to upload a new PDF is still available

  @s15
  Scenario: The list shows a loading state while PDFs load
    Given my documents have not yet loaded
    When I open the upload screen
    Then I see a loading state until they resolve

  @s16
  Scenario: The list shows a retryable error when loading fails
    Given loading my documents will fail
    When I open the upload screen
    Then I see an error state with a retry action
    When I retry and it succeeds
    Then I see my documents

  @s17
  Scenario: Only successfully-extracted PDFs are listed
    Given I have documents that are still processing or whose extraction failed
    When the upload screen loads
    Then those documents do not appear in the list
    And only successfully-extracted documents are shown

  # ---------------------------------------------------------------------------
  # Ownership / isolation
  # ---------------------------------------------------------------------------

  @s18
  Scenario: Row-level security hides other users' PDFs on read
    Given user A has extracted documents
    When user B or an unauthenticated request queries the documents directly
    Then no documents belonging to user A are returned

  @s19
  Scenario: Row-level security scopes delete to my own PDFs
    Given user A has a deletable document
    When user B attempts to delete that document directly
    Then no document belonging to user A is deleted

  # ---------------------------------------------------------------------------
  # Cross-cutting
  # ---------------------------------------------------------------------------

  @s20
  Scenario: All PDF-list copy is localized
    Given the app locale is set to a supported language
    When I view the list, its status labels, action buttons, empty/error states, and the delete confirmation
    Then every label, message, and action is rendered from the active locale bundle
    And no user-facing string is hardcoded

  @s21
  Scenario: The PDF list is accessible
    Given I view my PDFs
    Then each row exposes an accessible name and its action exposes an accessible name
    And any delete control exposes an accessible name
    And the loading, empty, and error states are announced to assistive technology
```

## AC → scenario coverage

| AC (story) | Scenario(s) |
|---|---|
| PDF list on upload (+ upload still available) | @s1, @s14 |
| Row status/action: ready → Generate | @s2, @s5 |
| Row status/action: failed → Retry | @s3, @s6 |
| Row status/action: lesson ready → Open lesson (stays listed) | @s4, @s7 |
| Failure stays retryable | @s8 |
| Success flips row (stays listed) | @s9 |
| New upload appears | @s10 |
| Delete only for un-generated PDFs (+ confirm, purge) | @s11, @s12, @s13 |
| Empty state | @s14 |
| Loading / Error states | @s15, @s16 |
| Only successfully-extracted PDFs listed | @s17 |
| Own documents only (RLS read + delete) | @s18, @s19 |
| i18n / a11y (cross-cutting) | @s20, @s21 |

## Scenario → primary test kind (how the implementator consumes it)

| Scenario | Primary test |
|---|---|
| @s1, @s2, @s3, @s4, @s5, @s6, @s7, @s11, @s14 | `pdf-document-list-item.test.tsx` / `pdf-document-list.test.tsx` (Content/Empty render, per-status label+action, delete-visibility) |
| @s4, @s17, @s18, @s19 | `pdf-documents.dao.test.ts` + `pdf-documents.service.test.ts` (view query + status derivation + RLS-scoped delete, mocked Supabase) + migration RLS/view note |
| @s5, @s6, @s7 | `pdf-documents.test.tsx` (raises `onGenerate`/`onOpenLesson`) + `upload` integration test (targets doc; no re-upload) |
| @s8, @s9, @s10 | `use-pdf-documents.test.ts` (refetch after events) + upload integration test + `lesson-generation.persist` failure/link test |
| @s12, @s13 | `pdf-document-list.test.tsx` (Dialog confirm/dismiss) + `pdf-documents.dao`/`service` delete-purge tests + `use-pdf-documents.test.ts` |
| @s15, @s16 | `pdf-document-list.test.tsx` (Loading/Error render) + `use-pdf-documents.test.ts` (states) |
| @s20 | `pdf-document-list.test.tsx` (strings from `t()`) + localization coverage test (en/es/pt/de) |
| @s21 | `pdf-document-list.test.tsx` (roles/labels/announcements) + Playwright e2e |
