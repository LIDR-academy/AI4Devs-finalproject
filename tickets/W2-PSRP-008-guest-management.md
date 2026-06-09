## PSRP-008: feat(guests): guest-management

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W2
**Dependencies:** PSRP-006

## Feature Summary
Implementar el sistema completo de gestión de invitados: CRUD en backend con entrada manual, importación CSV con validación/deduplicación/vista previa de errores, categorización (family/friends/colleagues/other), búsqueda/filtro, paginación y soft delete. Página de gestión de invitados en frontend con tabla de invitados, formulario de añadir/editar, subida CSV con vista previa de errores, pestañas de filtro por categoría, barra de búsqueda, y aplicación del límite de modo gratuito (máx 5 invitados para eventos en draft).

## Requirements
- [ ] Implement `IGuestService` and `GuestService` in Aura.Core/Services/ with methods: AddGuestAsync, ImportGuestsFromCsvAsync, GetGuestsByEventAsync (with filter/search/pagination), SoftDeleteGuestAsync, GetGuestCountAsync
- [ ] Implement `GuestsController` with endpoints: `POST /api/events/{slug}/guests` (add single), `POST /api/events/{slug}/guests/import` (CSV import), `GET /api/events/{slug}/guests` (list with filters), `DELETE /api/events/{slug}/guests/{id}` (soft delete)
- [ ] Implement CSV parsing and validation: required columns (name), optional (email, phone, category). Validate email format, phone format (E.164 preferred), category enum. Return validation errors per row
- [ ] Implement duplicate detection: email uniqueness per event (WHERE EventId = @eventId AND Email = @email AND IsDeleted = false). Return duplicates for user decision (skip or update)
- [ ] Implement free mode limit: if Event.Status == 'draft' and guest count >= 5, reject new guests with upgrade prompt message
- [ ] Implement FluentValidation for AddGuestRequest (name: 1-200 chars, email: valid format, phone: E.164, category: enum)
- [ ] Implement soft delete cascade: when guest is soft-deleted, related invitations are also soft-deleted
- [ ] Implement guest manager page (`features/events/pages/guest-manager.page.ts`) with: guest table (name, email, phone, category, status, actions), add guest form/modal, CSV upload area, category filter tabs, search bar, pagination
- [ ] Implement CSV import flow: upload → validate → preview (with error highlighting) → confirm import → result summary
- [ ] Implement `GuestService` in Angular frontend for API calls
- [ ] Write unit tests for GuestService (CSV validation, deduplication, free mode limit, soft delete)

## Technical Notes
- **Backend:**
  - CSV parsing: use `CsvHelper` NuGet package. Accept UTF-8 encoded files
  - CSV columns: `name` (required), `email` (optional), `phone` (optional), `category` (optional, default 'other')
  - Import response: `{ total: int, imported: int, skipped: int, errors: [{row, field, message}] }`
  - Free mode check: `if (event.Status == "draft" && guestCount >= 5) throw new GuestLimitExceededException()`
  - Soft delete cascade: `Guest.IsDeleted = true` → `Invitation.IsDeleted = true` for related invitations
- **Frontend:**
  - Guest table with sortable columns, category badge colors
  - CSV upload: drag-and-drop zone, file type validation (.csv only)
  - Error preview: table with red-highlighted error rows, inline error messages
  - Category filter tabs: All, Family, Friends, Colleagues, Other
  - Search: debounced text search on name and email
- **Database:** Guests table (soft delete filter), Invitations table (cascade soft delete)
- **Integrations:** N/A
- **Key files:**
  - `backend/src/Aura.Core/Interfaces/Services/IGuestService.cs`
  - `backend/src/Aura.Core/Services/GuestService.cs`
  - `backend/src/Aura.Api/Controllers/GuestsController.cs`
  - `backend/src/Aura.Core/DTOs/Guests/AddGuestRequest.cs`
  - `backend/src/Aura.Core/DTOs/Guests/ImportGuestsRequest.cs`
  - `backend/src/Aura.Core/DTOs/Guests/GuestResponse.cs`
  - `backend/src/Aura.Core/DTOs/Guests/ImportResult.cs`
  - `backend/src/Aura.Core/Services/CsvParserService.cs`
  - `frontend/src/app/features/events/pages/guest-manager.page.ts`
  - `frontend/src/app/features/events/components/guest-import.component.ts`
  - `frontend/src/app/features/events/components/guest-table.component.ts`
  - `frontend/src/app/core/services/guest.service.ts`

## Acceptance Criteria
- [ ] AC1: Given the user is on the guest manager, when they fill in name, email, phone, category and click "Add", then the guest is added and appears in the guest table
- [ ] AC2: Given a valid CSV (all rows valid), when the user uploads and confirms import, then all guests are added and the result shows `imported: N, errors: 0`
- [ ] AC3: Given a CSV with invalid emails and missing names, when the user uploads, then error rows are highlighted with specific error messages, and the user can fix and re-upload or skip invalid rows
- [ ] AC4: Given a draft event with 5 guests, when the user tries to add a 6th guest, then the action is blocked with message: "Publish your event to add unlimited guests"
- [ ] AC5: Given a CSV with duplicate emails (already in event), when the user uploads, then duplicates are flagged with a warning and the user can choose to skip or update
- [ ] AC6: Given the user clicks "Delete" on a guest and confirms, then the guest is soft-deleted and removed from the list (global query filter excludes IsDeleted=true)

## Related Items
- **PRD section:** 06-mvp-features.md (6.1.2 Guest Manager, US-GM-01 through US-GM-06, AC-GM-01 through AC-GM-06)
- **Architecture:** 02-components.md (Host Dashboard — Guest manager), 03-project-structure.md
- **Data model:** entities.md (Guests, Invitations), README.md (soft delete pattern)

## Blockers
Blocked by: PSRP-006

## Branch Name
`feature/PSRP-008-guest-management`

(End of file - total 71 lines)