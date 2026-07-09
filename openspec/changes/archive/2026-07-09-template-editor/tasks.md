## 1. Backend Changes

- [x] 1.1 Add MinIO dependency and configure `MinioObjectStorageService`.
- [x] 1.2 Implement `POST /api/events/{slug}/upload-hero-image` endpoint in `EventsController`.
- [x] 1.3 Ensure `PUT /api/events/{slug}` correctly handles updating `PrimaryColor`, `SecondaryColor`, `FontFamily`, and `HeroImageUrl`.
- [x] 1.4 Write unit tests for the upload endpoint validating size limit and file types (JPG/PNG).

## 2. Frontend Services & Routing

- [x] 2.1 Update `EventService` in Angular to include the `uploadHeroImage` API call.
- [x] 2.2 Update `event.model.ts` to include `heroImageUrl` and other new design fields.
- [x] 2.3 Set up routing for `features/events/pages/edit-event.page.ts`.

## 3. Frontend UI Components

- [x] 3.1 Build the Template Editor page (`edit-event.page.ts`).
- [x] 3.2 Add template selector, color pickers, and font family dropdown to the editor UI.
- [x] 3.3 Create the hero image upload component with drag-and-drop, progress bar, and validation.
- [x] 3.4 Integrate the real-time preview iframe/component that reflects signal changes immediately.

## 4. Frontend Logic & Auto-Save

- [x] 4.1 Implement auto-save logic in `edit-event.page.ts` using Angular signals and a 2-second RxJS debounce.
- [x] 4.2 Add UI indicators for save state ("Saved", "Saving...", "Unsaved changes").
- [x] 4.3 Implement `canDeactivate` guard to force an immediate save when navigating away with unsaved changes.
