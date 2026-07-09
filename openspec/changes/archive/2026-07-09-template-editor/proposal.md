## Why

We need to provide event hosts with a visual editor to customize their invitation template. This will allow them to change colors, fonts, and upload a hero image while seeing a real-time preview of their changes. This represents a core feature of the MVP, fulfilling the requirement for user customization.

## What Changes

- Implement a new frontend page: Template Editor (`features/events/pages/edit-event.page.ts`).
- Add template selection, color pickers, and font family dropdown to the editor UI.
- Add hero image upload UI with drag-and-drop support, progress indication, and error handling.
- Embed a real-time preview iframe/component that reflects the user's customizations.
- Implement an auto-save mechanism with a 2-second debounce using Angular signals and RxJS.
- Add a "Saved" / "Saving..." / "Unsaved changes" indicator.
- Add a `canDeactivate` guard to force-save any pending changes before navigating away.
- Implement a backend endpoint `POST /api/events/{slug}/upload-hero-image` to accept and upload images to MinIO.
- Ensure the existing `PUT /api/events/{slug}` endpoint handles updates for `PrimaryColor`, `SecondaryColor`, `FontFamily`, and `HeroImageUrl`.

## Capabilities

### New Capabilities
- `template-editor`: The visual template editor UI allowing hosts to customize their event's appearance with auto-save and real-time preview, including hero image upload and updates to event details.

### Modified Capabilities


## Impact

- **Frontend**: Adds the edit-event page, updates routing, adds new components for customization (color picker, font dropdown, image upload).
- **Backend API**: Adds the image upload endpoint to `EventsController` and integrates MinIO SDK.
- **Infrastructure**: Requires configuring MinIO connection parameters and bucket creation (`static-sites` or `uploads`).
