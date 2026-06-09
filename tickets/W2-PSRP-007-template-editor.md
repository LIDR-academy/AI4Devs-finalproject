## PSRP-007: feat(templates): template-editor

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W2
**Dependencies:** PSRP-006

## Feature Summary
Implementar el editor visual de plantillas que permite a los hosts personalizar su invitación: seleccionar entre 3 plantillas predefinidas, personalizar los colores primarios/secundarios mediante selector de color, cambiar la familia de fuentes, subir una imagen hero a MinIO (máx 5MB, JPG/PNG), y ver los cambios en tiempo real mediante un iframe de preview embebido. El auto-guardado con debounce de 2 segundos guarda los cambios en la base de datos. Esto cubre la funcionalidad del editor de plantillas del PRD.

## Requirements
- [ ] Implement hero image upload endpoint: `POST /api/events/{slug}/upload-hero-image` — accepts multipart form, validates file type (JPG/PNG) and size (max 5MB), uploads to MinIO bucket, returns public URL
- [ ] Implement `PUT /api/events/{slug}` update for template fields: TemplateId, PrimaryColor, SecondaryColor, FontFamily, HeroImageUrl
- [ ] Implement auto-save endpoint or use existing PUT with debounce: frontend sends changes after 2 seconds of inactivity
- [ ] Implement template editor page (`features/events/pages/edit-event.page.ts`) with: template selector (3 presets with previews), color pickers (primary, secondary), font family dropdown, hero image upload with preview, real-time preview panel
- [ ] Implement `TemplateEditorComponent` with real-time preview using an iframe or embedded render that reflects current customization
- [ ] Implement auto-save with 2-second debounce using Angular signals and rxjs debounceTime
- [ ] Implement "Saved" / "Saving..." / "Unsaved changes" indicator in the UI
- [ ] Implement image upload with drag-and-drop and click-to-browse, progress indicator, error handling (size limit, format)
- [ ] Implement force-save on navigation away (canDeactivate guard)
- [ ] Write unit tests for auto-save debounce logic and image upload validation

## Technical Notes
- **Backend:**
  - Image upload uses MinIO S3 SDK (AWSSDK.S3 or Minio NuGet). Bucket: `static-sites` or dedicated `uploads` bucket
  - Image path format: `uploads/{event-slug}/hero.{ext}`
  - Return public URL or MinIO presigned URL for frontend display
- **Frontend:**
  - Color picker: native `<input type="color">` or a lightweight library
  - Font dropdown: list from allowed fonts (Playfair Display, Inter, Montserrat, Lora, etc.)
  - Preview: iframe loading a preview URL or a live-rendered component
  - Auto-save: signal-based form state → debounceTime(2000) → PUT /api/events/{slug}
- **Database:** Events table (TemplateId, PrimaryColor, SecondaryColor, FontFamily, HeroImageUrl)
- **Integrations:** MinIO (hero image upload)
- **Key files:**
  - `backend/src/Aura.Api/Controllers/EventsController.cs` (upload endpoint)
  - `backend/src/Aura.Core/Interfaces/Services/IObjectStorageService.cs`
  - `backend/src/Aura.Infrastructure/Services/MinioObjectStorageService.cs`
  - `frontend/src/app/features/events/pages/edit-event.page.ts`
  - `frontend/src/app/features/events/components/template-editor.component.ts`
  - `frontend/src/app/core/services/event.service.ts`

## Acceptance Criteria
- [ ] AC1: Given the user is on the template editor, when they select a different preset template, then the preview updates immediately and the change is auto-saved after 2 seconds
- [ ] AC2: Given the user changes the primary color, when the color picker value changes, then the preview updates in real-time and the color is auto-saved
- [ ] AC3: Given the user uploads a hero image (JPG, 3MB), when the upload completes, then the image is stored in MinIO, the Event.HeroImageUrl is updated, and the preview shows the new image
- [ ] AC4: Given the user tries to upload a 6MB image, when they select the file, then an error message is shown: "Image must be under 5MB"
- [ ] AC5: Given the user makes changes and navigates away before auto-save triggers, when the canDeactivate guard fires, then changes are force-saved before navigation
- [ ] AC6: Given auto-save is in progress, when the UI shows "Saving...", then after the save completes, the indicator changes to "Saved"

## Related Items
- **PRD section:** 06-mvp-features.md (6.1.1 Template Editor, US-T-01 through US-T-05, AC-T-01 through AC-T-05)
- **Architecture:** 02-components.md (Host Dashboard — Template editor)
- **Data model:** entities.md (Events, Templates)

## Blockers
Blocked by: PSRP-006

## Branch Name
`feature/PSRP-007-template-editor`

(End of file - total 61 lines)