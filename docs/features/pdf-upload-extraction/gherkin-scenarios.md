---
feature: pdf-upload-extraction
status: approved
---

# Gherkin scenarios — pdf-upload-extraction

The signed contract. Every `@s` tag is the traceability key the `implementer` and reviewers use;
each maps to ≥ 1 concrete test. Every acceptance criterion in `spec.md` maps to ≥ 1 scenario here.

```gherkin
Feature: PDF upload and backend content extraction
  As a learner, I want to upload a PDF and have the backend extract its readable
  text and embedded images, so that I have everything needed to generate a lesson
  from it, regardless of the device or platform I'm using.

  Background:
    Given I am an authenticated learner
    And extraction runs in the backend Edge Function, never on the client

  @s1
  Scenario: Whole document is extracted successfully
    Given a PDF that contains selectable text and embedded images
    When I upload it
    Then the backend processes every page of the document
    And it extracts the selectable text and the embedded images
    And it returns success to the client

  @s2
  Scenario: Embedded images are downscaled, stored, and associated with their location
    Given a PDF that contains embedded images
    When extraction runs
    Then each image is downscaled and recompressed
    And each image is persisted to storage
    And each image is associated with the page and position it came from

  @s3
  Scenario: Mixed pages are captured in document order
    Given a PDF with some text-only pages, some text-and-image pages, and some image-only figure pages
    When extraction runs
    Then text and images are captured from across all pages
    And the extracted content preserves the document's page order

  @s4
  Scenario: Extraction is performed by the backend, not the client
    Given I am on any supported platform
    When I upload a PDF
    Then the client uploads the file and triggers the backend
    And the client does not parse the PDF itself
    And the extracted result comes back from the backend identically across platforms

  @s5
  Scenario: The upload flow shows a loading state while extracting
    Given I have chosen a valid PDF
    When the upload and extraction are in flight
    Then the flow shows a loading state
    And the upload control is disabled until the request resolves

  @s6
  Scenario: Successful extraction shows a summary of the source
    Given extraction has succeeded for my PDF
    When the result returns
    Then I see a summary with the filename, the page count, and the number of images extracted
    And I see an affordance to continue

  @s7
  Scenario: Pristine upload screen shows an empty state with constraints
    Given I have not chosen a file yet
    Then I see a "choose a PDF" affordance
    And I see the maximum file size and page count I can upload
    And the upload control is disabled
    And no error is shown

  @s8
  Scenario: A scanned or image-only PDF is rejected as unreadable
    Given a scanned or image-only PDF whose text is not selectable
    When extraction runs
    Then I see a clear error that the file can't be used because its text can't be read
    And no usable lesson source is retained for it

  @s9
  Scenario: A non-PDF file is rejected before upload
    Given a file that is not a PDF
    When I attempt to upload it
    Then it is rejected before any upload with a clear "only PDF files are supported" message

  @s10
  Scenario: A file over the size limit is rejected before upload
    Given a file larger than the maximum allowed size
    When I attempt to upload it
    Then it is rejected before any upload with a clear message stating the size limit
    And no upload occurs

  @s11
  Scenario: A PDF with too many pages is rejected by the backend
    Given a PDF whose page count exceeds the maximum allowed
    When extraction runs
    Then I see a clear error stating the page limit
    And no usable lesson source is retained for it

  @s12
  Scenario: A corrupt or unreadable PDF is rejected
    Given a PDF that is corrupt, password-protected, or otherwise unreadable
    When extraction runs
    Then I see a clear error that the file couldn't be opened
    And no partial or usable source is retained for it

  @s13
  Scenario: A transient network failure is retryable
    Given I have chosen a valid PDF
    And the network is unavailable
    When I attempt to upload
    Then I see a retryable network error
    When the connection is restored and I retry
    Then extraction completes
    And I see the success summary

  @s14
  Scenario: Extracted content is private to the uploader
    Given two different learners have each uploaded a PDF
    When extraction persists the raw file, images, and rows
    Then each learner's document, images, and rows are scoped to their own account
    And one learner cannot access another learner's extracted content
    And an unauthenticated request cannot upload or extract

  @s15
  Scenario: All user-facing strings are localized
    Given the app locale is set to a supported language
    When I view the upload flow in any state
    Then all labels, hints, button text, progress copy, and error messages are rendered from the active locale bundle
    And no user-facing string is hardcoded

  @s16
  Scenario: The upload flow is accessible
    Given I am on the upload screen
    Then the file picker and upload controls expose accessible labels and roles
    And the loading progress is announced to assistive technology
    And any error is announced to assistive technology

  @s17
  Scenario: The extraction lifecycle emits PII-free analytics
    Given analytics is enabled for the upload flow
    When an upload starts and extraction then succeeds or fails
    Then a PII-free "upload started" event is recorded when the upload begins
    And a PII-free "extraction succeeded" event is recorded on success
    And a PII-free "extraction failed" event carrying the error code is recorded on failure
    And no event payload contains the filename, the file contents, or any personal data
```

## AC → scenario coverage

| AC | Scenario(s) |
|---|---|
| AC1 (whole document, all pages, text + images, success) | @s1 |
| AC2 (images downscaled, stored, associated with page/position) | @s2 |
| AC3 (mixed pages, document order) | @s3 |
| AC4 (server-side, platform-agnostic, client never parses) | @s4 |
| AC5 (Loading state) | @s5 |
| AC6 (Content / success summary) | @s6 |
| AC7 (Empty / pristine state) | @s7 |
| AC8 (scanned / image-only → error) | @s8 |
| AC9 (non-PDF type → client reject) | @s9 |
| AC10 (over size limit → client reject) | @s10 |
| AC11 (too many pages → server reject) | @s11 |
| AC12 (corrupt / encrypted → error) | @s12 |
| AC13 (network error + retry) | @s13 |
| AC14 (auth + RLS scoping) | @s14 |
| AC15 (i18n) | @s15 |
| AC16 (accessibility) | @s16 |
| _(no numbered AC)_ — analytics is an **added, human-approved scope item** locked at the gate (see spec *Resolved decisions → [Analytics]*), not tied to a story AC | @s17 |

## Scenario → primary test kind (how the implementer consumes it)

| Scenario | Primary test |
|---|---|
| @s1 | `pdf-extraction.service.test.ts` + `pdf-upload.dao.test.ts` + integration (hook→service→DAO, mocked `functions.invoke`) + Edge Function Deno unit test (adapter → ordered text + images) |
| @s2 | Edge Function Deno unit tests (downscale target dims/format; image row carries page + position) + `document_images` schema/migration assertions |
| @s3 | Edge Function Deno unit test (mixed-page fixture → all pages present, in order) + service result-shape test |
| @s4 | `pdf-upload.dao.test.ts` (only uploads + invokes; no parsing) + `pdf-extraction.service.test.ts` + integration (client receives backend result) |
| @s5 | `pdf-upload-panel.test.tsx` (Loading render, control disabled) + `use-pdf-extraction.test.ts` (`stage === 'processing'`) |
| @s6 | `pdf-upload-panel.test.tsx` (Content summary render) + `use-pdf-extraction.test.ts` (success result) |
| @s7 | `pdf-upload-panel.test.tsx` (Empty/pristine → control disabled, constraints shown, no error) |
| @s8 | Edge Function Deno unit test (scanned-detection heuristic → `scanned_or_image_only`) + `pdf-extraction.service.test.ts` (error normalization) + `pdf-upload-panel.test.tsx` (error render) |
| @s9 | `pdf-extraction.service.test.ts` (client type pre-check → `unsupported_file_type`) + `pdf-upload-panel.test.tsx` |
| @s10 | `pdf-extraction.service.test.ts` (client size pre-check → `file_too_large`) + `pdf-upload-panel.test.tsx` |
| @s11 | Edge Function Deno unit test (page-count guard → `too_many_pages`) + `pdf-extraction.service.test.ts` |
| @s12 | Edge Function Deno unit test (parse failure → `corrupt_or_unreadable`) + `pdf-extraction.service.test.ts` |
| @s13 | `pdf-extraction.service.test.ts` (transport failure → `network_error`) + `use-pdf-extraction.test.ts` (retry) + `pdf-upload-panel.test.tsx` (retry affordance) + Playwright e2e |
| @s14 | Migration RLS assertions (Supabase Test Helpers) + storage-policy check + `pdf-extraction.service.test.ts`/`use-pdf-extraction.test.ts` (`unauthenticated`) |
| @s15 | `pdf-upload-panel.test.tsx` (strings from `t()`) + localization coverage test (en/es/pt/de key alignment) |
| @s16 | `pdf-upload-panel.test.tsx` (roles/labels, progress + error announcement) + Playwright e2e |
| @s17 | `pdf-extraction.service.test.ts` (success + failure events fire with a PII-free payload) + wiring test (`pdf_upload_started` on upload begin) |
