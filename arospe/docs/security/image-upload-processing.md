# Image Upload & Server-Side Image Processing

Rules established by story **0019**'s Phase 4 audit and re-audit (the Shared Media Gallery — the
first feature in this repo that accepts a file from a user and then *decodes* it server-side).
Everything here is measured against this project's own installed stack (PHP 8.5 NTS, Imagick
`ImageMagick 7.1.2-8 Q16-HDRI`, `intervention/image-laravel ^4.1`, Flysystem 3.35) rather than
reasoned from documentation — the numbers are reproducible, and the reproduction method is stated
with each one.

Every later upload surface (PRD Epic 2's Products, Epic 4's Blog) inherits this page.

## Table of Contents

- [A pixel-dimension cap does not bound decode memory](#a-pixel-dimension-cap-does-not-bound-decode-memory)
- [The two limit layers do different jobs — keep both](#the-two-limit-layers-do-different-jobs--keep-both)
- [Imagick resource limits are process-global, not request-scoped](#imagick-resource-limits-are-process-global-not-request-scoped)
- [Never let the storage layer infer the extension of a web-served file](#never-let-the-storage-layer-infer-the-extension-of-a-web-served-file)
- [`mimes:` alone is content-sniffed only when finfo is conclusive](#mimes-alone-is-content-sniffed-only-when-finfo-is-conclusive)
- [`Storage::put()` returns `false` — it does not throw](#storageput-returns-false--it-does-not-throw)
- [An imaging-library exception must never reach the user](#an-imaging-library-exception-must-never-reach-the-user)
- [Confirmed safe — verified mechanics not to re-derive](#confirmed-safe--verified-mechanics-not-to-re-derive)

## A pixel-dimension cap does not bound decode memory

`dimensions:max_width=…,max_height=…` bounds **pixels**, and a decoder allocates **bytes**.
Bytes-per-pixel is a property of the installed ImageMagick build — not a constant, and nothing in
Laravel's validation knows it. This project's Q16-HDRI build measures **~35 bytes per pixel** for a
decode-plus-encode cycle, an order of magnitude above the naive 4 (8-bit RGBA) a dimension cap
implicitly assumes.

Measured on this stack, with **no** resource limits applied (i.e. what the first implementation did),
peak RSS read from `/proc/self/status`'s `VmHWM` — `memory_get_peak_usage()` cannot see Imagick's
C-level allocations and will report a few MB while the process holds gigabytes:

| Input (uniform-colour PNG) | On disk | Wall | Peak RSS | Bytes/pixel |
| --- | --- | --- | --- | --- |
| 4000×4000 | 2,080 B | 3.87 s | 554.8 MB | 36.4 |
| 5000×5000 | 3,170 B | 5.53 s | 846.2 MB | 35.5 |
| 6000×6000 | 4,504 B | 6.79 s | 1,200.1 MB | 35.0 |

An **8000×8000 PNG is 7,898 bytes on disk** — 0.1% of the 8 MB size cap — and extrapolates to
~2.2 GB. A size cap and a dimension cap together still let one HTTP request allocate more memory
than the container has.

**The rule: whenever the app decodes a user-supplied image, the decoder must enforce the same
ceiling the validator promises.** Do not treat the validation rule as the control; it is a cheap
header check that runs first and rejects the common case.

✅ Good — the shipped guard, derived from the *same constant* the validation rule uses, so the two
cannot drift:

```php
// app/Actions/Media/GenerateImageConversions.php
private function applyImagickResourceLimits(): void
{
    $byteCeiling = self::MAX_DIMENSION * self::MAX_DIMENSION * self::BYTES_PER_PIXEL_CEILING;

    Imagick::setResourceLimit(Imagick::RESOURCETYPE_WIDTH, self::MAX_DIMENSION);
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_HEIGHT, self::MAX_DIMENSION);
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_AREA, $byteCeiling);
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_MEMORY, $byteCeiling);
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_MAP, $byteCeiling);
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_DISK, 0);
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_TIME, self::TIME_LIMIT_SECONDS);
}
```

❌ Bad — the shape this replaced: a `dimensions:` rule in `MediaValidationRules` and nothing else,
on the assumption that a rejected header means a bounded decode.

Note the constant is read through the trait (`use MediaValidationRules;` on the action) rather than
copied — PHP forbids `MediaValidationRules::MAX_DIMENSION` on a trait directly, and a hand-copied
literal is exactly the drift this rule exists to prevent.

> **There is no `policy.xml` on this project's ImageMagick install** (`/etc/ImageMagick-7/policy.xml`
> does not exist), so the process defaults are effectively unlimited — `WIDTH`/`HEIGHT` are
> 2^55, `DISK` and `TIME` are `PHP_INT_MAX`. Nothing outside the app is bounding this. Do not assume
> a hardened system policy is present just because production images often ship one.

## The two limit layers do different jobs — keep both

`WIDTH`/`HEIGHT` and the byte ceiling are not redundant. Measured by applying each set alone against
the same fixtures:

| Limits applied | 4000² (legitimate) | 6000² bomb | 8000² bomb |
| --- | --- | --- | --- |
| none | decoded, 404.8 MB | decoded, 862.6 MB | decoded, 1,503.5 MB |
| `WIDTH`/`HEIGHT` only | decoded, 404.8 MB | **refused, 0.00 s, 38.5 MB** | **refused, 0.00 s, 38.5 MB** |
| byte ceiling only | decoded, 404.8 MB | decoded, 862.6 MB | refused, 0.77 s, **528.7 MB** |
| **shipped (both)** | decoded, 404.8 MB | **refused, 0.00 s, 38.5 MB** | **refused, 0.00 s, 38.5 MB** |

- **`WIDTH`/`HEIGHT` refuse at header-parse time**, before a single pixel is allocated — which is why
  the refusal costs 0.00 s and no memory. This is the sharp layer.
- **The byte ceiling is coarser and slower** (it must start allocating before it notices) but it is
  the only layer that sees an input whose *per-frame* dimensions are legal. A 60-frame animated
  image at 3900×3900 — every frame under the cap — is refused by the byte ceiling at
  **965.9 MB / 1.89 s**, where with no limits the same input reached **2,823.1 MB** before
  ImageMagick gave up. `config/intervention-image.php` sets `'decodeAnimation' => true`, so this is
  a live consideration, not a hypothetical.
- **`DISK => 0`** is what makes the byte ceiling bite instead of silently spilling the pixel cache to
  disk and turning a memory exhaustion into a disk exhaustion.

**The rule: cap dimensions *and* bytes *and* disk *and* time. Removing any one of them is removing a
distinct failure mode, not trimming a redundancy.**

## Imagick resource limits are process-global, not request-scoped

`Imagick::setResourceLimit()` is a `static` method mutating MagickCore's process-wide state. Verified:
a `new Imagick` instance created afterwards, anywhere in the process, reports the limits this app set.

This is **not** a concurrency hazard on this stack — PHP here is NTS (`PHP_ZTS` is false), there is no
Octane/Swoole/RoadRunner in `composer.json`, and PHP-FPM workers and queue workers each handle one
request/job at a time. There is no interleaving to race.

What it *is* is **sequential contamination**: once a request in a long-lived worker runs a conversion,
every later request served by that same worker inherits `WIDTH=4000`, `MEMORY=1 GB`, `DISK=0`,
`TIME=60`. Today that is harmless because `App\Actions\Media\GenerateImageConversions` is the only
class in `app/` that touches Imagick or Intervention (verified by grep).

> ⚠️ **The day a second Imagick consumer is added — a PDF thumbnailer, an avatar cropper, a
> different-format pipeline — it will silently inherit these limits, and `DISK => 0` in particular
> turns "slow but works" into "fails".** A second consumer must set its own limits at the top of its
> own entry point (as this one does) rather than assume the process defaults. Do not "optimise" the
> call away by caching it or moving it to a service provider: calling it per-invocation is what makes
> it correct under contamination, and it is idempotent.

## Never let the storage layer infer the extension of a web-served file

`Storage::putFile()` names the stored file with `$file->hashName()`, whose extension comes from
`guessExtension()` — i.e. from the *sniffed content*. That is fine as a convenience and unsafe as a
gate: files under `storage/app/public` are served directly by the web server once `storage:link` has
run, so the extension chosen there decides how a browser interprets the bytes. A sniffed
`image/svg+xml` becomes `.svg` and a sniffed `text/html` becomes `.html` — both stored XSS from the
application's own origin.

✅ Good — an explicit allow-listed map from the *already-validated* MIME, with a server-generated
random basename:

```php
// app/Actions/Media/StoreUploadedImage.php
$extension = $this->extensionForValidatedMimeType($photo->getMimeType());

$path = $disk->putFileAs('media', $photo, Str::random(40).'.'.$extension) ?: throw new RuntimeException(
    'Failed to store the uploaded image on the public disk.'
);
```

```php
private function extensionForValidatedMimeType(?string $mimeType): string
{
    return match ($mimeType) {
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        default => throw new RuntimeException(
            "Unexpected MIME type [{$mimeType}] reached storage after validation passed."
        ),
    };
}
```

❌ Bad — `putFile()` alone, letting the sniffed type pick the extension.

Two properties this shape needs, both easy to lose:

- **No user-supplied string may reach the path.** `Str::random(40)` uses `random_bytes()`, and the
  client filename is discarded entirely. Verified: a `../../../../evil.jpg` client name and a
  NUL-byte client name both stored as `media/<40 random chars>.jpg`.
- **The map must be exhaustive against what validation can pass, and the `default` arm must be a
  fail-loud backstop rather than a real branch.** Prove it rather than assert it — see below.

### Proving the `default` arm is unreachable

Laravel's `mimes:` rule passes iff `guessExtension()` ∈ the parameter list (with `jpg`/`jpeg` merged),
and `guessExtension()` is `MimeTypes::getExtensions(getMimeType())[0]`. So the set of MIME types that
can reach the `match` is exactly `{ M : getExtensions(M)[0] ∈ {jpg, jpeg, png} }`. Enumerated over
Symfony's full 1,848-entry table, that set is:

```
image/jpeg    first ext: jpg
image/pjpeg   first ext: jpg     <-- NOT covered by the match arms
image/png     first ext: png
```

`image/pjpeg` is a genuine hole in the mapping *in principle* — and unreachable in practice on this
stack, because nothing can produce it: libmagic emits `image/jpeg` for baseline **and** progressive
JPEGs (verified against real fixtures of both), and Flysystem's extension fallback map resolves
`.jfif` → `image/jpeg`, never `image/pjpeg`. The reverse-direction entry `'image/pjpeg' => ['jfif']`
exists only in the mime→extension table, which detection never consults.

**The rule: when a `match` over a sniffed value has a `default => throw`, enumerate the reachable
input set rather than asserting unreachability** — and re-run that enumeration if the detector stack
changes (a custom `MimeTypeDetector`, a different magic file, a new Symfony mime table). Even then the
outcome is a fail-loud 500, never a bypass, which is the correct direction for the arm to fail in.

## `mimes:` alone is content-sniffed only when finfo is conclusive

In production the uploaded object is `Livewire\...\TemporaryUploadedFile`, whose `getMimeType()` is
**overridden** to `Storage::disk(...)->mimeType($path)` — Flysystem's
`FallbackMimeTypeDetector(FinfoMimeTypeDetector)`. That detector falls back to an **extension-based**
lookup whenever finfo returns an inconclusive type (`application/octet-stream`, `text/plain`,
`inode/x-empty`, `application/x-empty`, `text/x-asm`).

Measured consequence: 2 KB of `random_bytes()` saved as `garbage.jpg` is reported as **`image/jpeg`**,
and a zero-byte `empty.jpg` likewise. Both therefore satisfy `image` and `mimes:jpg,jpeg,png`.

What closes it is the **`dimensions:` rule**, which is content-based on every path
(`TemporaryUploadedFile::dimensions()` runs `getimagesize()` over the real bytes and returns `false`
for a non-image). Verified end to end: both fixtures are rejected, and the error bag contains
*"The photo field has invalid image dimensions."*

**The rule: `image` + `mimes:` is not by itself a content check for a Livewire temporary upload —
always pair it with `dimensions:`, which is the rule that actually reads the pixels.** This is a
second, independent reason to keep `dimensions:` beyond the memory ceiling above.

## `Storage::put()` returns `false` — it does not throw

`config/filesystems.php` sets `'throw' => false` on the `public` disk, so
`FilesystemAdapter::put()` catches Flysystem's `UnableToWriteFile` and **returns `false`**. Verified
directly against a read-only directory: `Storage::disk('public')->put(...)` returned `false`, no
exception.

An ignored return value here commits a `media` row whose `webp_path` / `avif_path` point at files
that were never written — a database that lies about the filesystem.

✅ Good — every write's return value is checked, in the same `?:` idiom already used for the original:

```php
// app/Actions/Media/GenerateImageConversions.php
$disk->put($webpPath, $image->encode(new WebpEncoder)->toString()) ?: throw new RuntimeException(
    "Failed to write the .webp conversion to [{$webpPath}]."
);
$written[] = $webpPath;
```

❌ Bad — `$disk->put($webpPath, …);` as a bare statement.

**The rule: on a disk configured `'throw' => false`, treat every `Storage` write as a function
returning a status you must inspect.** Grep for bare `->put(`/`->putFile(`/`->copy(`/`->move(`
statements when auditing a storage path.

### Testing this: make the *second* write fail, not the first

A read-only directory makes the **first** write fail, so the accumulator that tracks
already-written files stays empty and the cleanup loop never iterates — a test built that way asserts
"nothing was left behind" **vacuously**. To exercise the real partial-write path, let the `.webp`
write succeed and make only the `.avif` write fail:

```php
// occupy the .avif path with a DIRECTORY so only the second write fails
mkdir(Storage::disk('public')->path('media/p.avif'), 0755, true);
```

Verified with that fixture: the action raises `RuntimeException: Failed to write the .avif
conversion to [media/p.avif]` and the already-written `media/p.webp` **is** deleted. This is the same
"prove the test can actually fail" discipline [errors-log.md](../errors-log.md) records for vacuous
`arch()` rules and unscoped count assertions.

## An imaging-library exception must never reach the user

A refused decode surfaces as an `Intervention\Image\Exceptions\ImageException` subclass, and
Intervention wraps the underlying `ImagickException` — whose message routinely carries absolute
filesystem paths and internal source locations
(`cache resources exhausted '/srv/app/storage/magick-XYZ' @ error/cache.c/OpenPixelCache/4128`).

✅ Good — translate to a constant, deliberately uninformative message on the field, after cleaning up
every file the call wrote:

```php
// app/Actions/Media/StoreUploadedImage.php
if ($e instanceof ImageException) {
    throw ValidationException::withMessages([
        'photo' => trans('media.upload_rejected'),
    ]);
}

throw $e;
```

Verified by injecting an `ImageDecoderException` whose message contained a path and a sentinel string:
the user-visible bag was exactly
`{"photo":["This image could not be processed. Please try a different file."]}`, with no library text,
no path and no sentinel — and zero files and zero rows left behind.

Two details that make this correct rather than approximately correct:

- **Catch the base `ImageException`, not a leaf.** Every relevant class —
  `ImageDecoderException`, `DecoderException`, `EncoderException`, `DriverException` — extends it
  (verified by reflection). A resource-limit refusal arrives as `ImageDecoderException` on the
  header-cap path and as `DriverException` on the byte-cap path; catching only the former would let
  the latter surface as a 500.
- **The message names nothing.** `lang/{en,es}/media.php`'s `upload_rejected` / `upload_throttled`
  mention neither Imagick, nor a resource limit, nor a rate-limit window — a pathological upload gets
  an ordinary-sounding validation error rather than a hint about which control it tripped. Both
  locales are key-for-key identical (verified).

## Confirmed safe — verified mechanics not to re-derive

Checked during the story-0019 re-audit and found correct; do not spend a future audit round on these
unless the surrounding code changes.

- **Livewire's temporary-upload path cannot be pointed at an arbitrary file.**
  `WithFileUploads::_finishUpload()` verifies an HMAC over the path
  (`TemporaryUploadedFile::extractPathFromSignedPath()`) and `abort(403)`s on mismatch. The
  unsigned-looking `FileUploadSynth` hydration route is still confined by
  `FileUploadConfiguration::path()`, which runs Flysystem's `WhitespacePathNormalizer` — verified to
  throw `PathTraversalDetected` on `../../etc/passwd` and `a/../../b`. The upload endpoint itself is
  signed (`abort_unless(request()->hasValidSignature(), 401)`), as is the preview endpoint.
- **`livewire.temporary_file_upload.rules` really is enforced.** `FileUploadController::validateAndStore()`
  applies `FileUploadConfiguration::rules()` via `Validator::make(...)->validate()` before storing.
  Publishing the config with `['required', 'file', 'mimes:jpg,jpeg,png', 'max:8192']` replaces
  Livewire's unrestricted vendor default (`['required', 'file', 'max:12288']` — 12 MB, **no** type
  check), which otherwise lets anyone holding only `media.view` stage an arbitrary file type at a
  looser ceiling than the app's own rules. Note this key is **global to every Livewire upload in the
  app** — a future component needing PDFs or CSVs has to widen it, and widening it weakens this one.
- **A polyglot is stored inert.** A valid PNG with PHP appended after `IEND` passes validation (it
  *is* a valid PNG) and is stored as `.png`, so the web server serves it as an image and the trailing
  bytes never execute. This is the expected outcome, not a gap — the control that makes it safe is
  the allow-listed extension above, so it stops being true the moment the extension can be influenced.
- **Guests cannot reach an authenticated-only rate-limit bucket.** Where a limiter key falls back to
  a shared literal for unauthenticated callers
  (`'media-upload:'.(Auth::id() ?? 'unauthenticated')`), that bucket must be proven unreachable, or
  every guest shares one allowance and any one of them can exhaust it for all. Here it is:
  `Gate::authorize('create', Media::class)` runs first, `Gate::forUser(null)->allows('create', Media::class)`
  is `false`, and `AppServiceProvider`'s `Gate::before` returns `null` (declines) for any non-`User`.
  **Verify this rather than assume it whenever you write a `?? 'unauthenticated'` key** — the
  companion hazard to [a limiter keyed on the target](authorization-patterns.md#a-rate-limit-keyed-on-the-target-alone-becomes-an-attack-on-the-target-the-moment-a-second-caller-exists).
- **CI installs the extension above the credential step.** `.github/workflows/tests.yml` adds
  `extensions: imagick` to the already-SHA-pinned `shivammathur/setup-php` step, which runs before
  the step writing Flux credentials to disk — the ordering rule
  [ci-workflow-hardening.md](ci-workflow-hardening.md) establishes, satisfied without a new
  unpinned `run:` step.

_Last updated: 2026-08-27 — Created during story 0019's Phase 4 **re-audit** (Media Library upload
and conversions — backend), from the verification of findings F-1 (decompression bomb), F-2
(extension/MIME confusion), F-3 (unchecked `Storage::put()` return) and F-5 (unrestricted Livewire
temporary-upload endpoint). Every measurement in this page was taken against the shipped code in this
worktree, not reproduced from the original audit's notes; the reproduction fixtures were removed
afterwards. Written as ❌/✅ pairs describing the **shipped** state from the outset, per
[errors-log.md](../errors-log.md#a-security-page-documented-the-vulnerable-code-as-current-because-it-was-written-before-its-own-fix--2026-08-20)'s
rule for an audit-authored page._
