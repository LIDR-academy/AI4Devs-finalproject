## 1. Project Setup

- [x] 1.1 Create `Aura.Workers.SSG` BackgroundWorker project.
- [x] 1.2 Add necessary dependencies (`RazorLight`, `Minio`, Redis/StackExchange.Redis, etc.) to the project.
- [x] 1.3 Add Dockerfile for `Aura.Workers.SSG`.

## 2. Worker Infrastructure

- [x] 2.1 Implement `StaticSiteGeneratorWorker` BackgroundService to BRPOP messages from `ssg:queue` in Redis.
- [x] 2.2 Create `MinioUploader` service to handle MinIO connection and file uploads to `static-sites/{event-slug}/`.
- [x] 2.3 Create `CdnInvalidator` service to call Cloudflare API for cache purging (`/e/{event-slug}/*`).

## 3. Template Rendering

- [x] 3.1 Setup `TemplateRenderer` using `RazorLightEngine`.
- [x] 3.2 Create Razor layouts and views for the 3 templates (Classic Elegance, Modern Minimal, Rustic Charm) under `templates/{name}/index.cshtml`.
- [x] 3.3 Create a shared `styles.cshtml` that injects the event's `PrimaryColor`, `SecondaryColor`, and `FontFamily` into the CSS.
- [x] 3.4 Create the shared `app.js` file for handling RSVP links, directions, and Calendar generation.

## 4. Integration

- [x] 4.1 In the `StaticSiteGeneratorWorker`, implement fetching the event data via `ApplicationDbContext` (or an appropriate Repository).
- [x] 4.2 Connect the data to the `TemplateRenderer` to generate HTML and CSS strings.
- [x] 4.3 Upload the generated `index.html`, `styles.css`, and `app.js` via `MinioUploader`.
- [x] 4.4 If the event type is "updated", trigger `CdnInvalidator.PurgeCacheAsync()`.

## 5. Testing & Validation

- [x] 5.1 Write unit tests for `TemplateRenderer` to verify correct Razor rendering and data binding.
- [x] 5.2 Write unit tests for `MinioUploader` (mocking MinioClient).
- [x] 5.3 Write unit tests for `CdnInvalidator` (mocking HttpClient).
- [x] 5.4 Test locally that publishing an event adds a message to the queue and the worker creates files in MinIO.
