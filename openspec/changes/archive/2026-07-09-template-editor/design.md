## Context

The Event Manager requires a visual editor for users to customize event templates (colors, fonts, hero image). The backend provides a foundation for updating event details, but we need to implement a frontend editor with real-time preview, an auto-save mechanism, and a new endpoint to handle multipart image uploads to MinIO.

## Goals / Non-Goals

**Goals:**
- Provide a WYSIWYG-like experience for editing event template parameters.
- Ensure customizations are auto-saved seamlessly (debounced).
- Implement hero image upload directly into MinIO S3-compatible storage.

**Non-Goals:**
- Allowing fully custom CSS or HTML input from users.
- Supporting video or other media types besides JPG/PNG for the hero image.

## Decisions

- **Auto-save Mechanism**: Use Angular `Signal` for form state combined with `toObservable` and `debounceTime(2000)` to trigger the `PUT /api/events/{slug}` API. This reduces backend load while ensuring changes are saved automatically.
- **Image Upload Integration**: Create a specific `POST /api/events/{slug}/upload-hero-image` endpoint. It will accept a `IFormFile`, validate size/type, and use `MinioObjectStorageService` to upload the image to a `static-sites` or `uploads` bucket, returning the public URL.
- **Real-time Preview**: Use an embedded component or iframe that reacts to the signal state immediately, updating CSS variables dynamically for previewing colors and fonts.

## Risks / Trade-offs

- **Risk**: Users navigating away before the 2-second debounce triggers, losing their latest change.
  **Mitigation**: Implement a `canDeactivate` guard that detects pending changes and triggers an immediate save before allowing navigation.
- **Risk**: Malicious file uploads.
  **Mitigation**: Strict server-side validation of file extensions (JPG/PNG), MIME types, and a 5MB size limit.
