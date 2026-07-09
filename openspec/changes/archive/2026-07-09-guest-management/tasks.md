## 1. Backend Core & Services

- [x] 1.1 Add `CsvHelper` NuGet package to the `Aura.Core` or `Aura.Infrastructure` project (or wherever parsing happens).
- [x] 1.2 Create DTOs: `AddGuestRequest`, `ImportGuestsRequest`, `GuestResponse`, and `ImportResult`.
- [x] 1.3 Implement FluentValidation validators for `AddGuestRequest` and CSV row imports.
- [x] 1.4 Create `IGuestService` interface with CRUD and Import methods.
- [x] 1.5 Implement `GuestService` with manual add, CSV parsing, duplicate detection, and free-tier limits.
- [x] 1.6 Implement soft delete cascade (Guest -> Invitation) in the service or DbContext overriding `SaveChanges`.

## 2. API Endpoints

- [x] 2.1 Create `GuestsController` under `Aura.Api/Controllers`.
- [x] 2.2 Add `GET /api/events/{slug}/guests` endpoint (with pagination/filters).
- [x] 2.3 Add `POST /api/events/{slug}/guests` endpoint.
- [x] 2.4 Add `POST /api/events/{slug}/guests/import` endpoint for CSV uploads.
- [x] 2.5 Add `DELETE /api/events/{slug}/guests/{id}` endpoint.

## 3. Frontend Integration

- [x] 3.1 Create `GuestService` in Angular (`core/services/guest.service.ts`) to wrap the new endpoints.
- [x] 3.2 Create `guest-import.component.ts` for handling drag-and-drop CSV upload and parsing errors preview.
- [x] 3.3 Create `guest-table.component.ts` for rendering sortable/filterable lists of guests.

## 4. Frontend Pages

- [x] 4.1 Create `guest-manager.page.ts` under `features/events/pages`.
- [x] 4.2 Integrate the table, the import component, and the manual add form into the page.
- [x] 4.3 Add category filter tabs (All, Family, Friends, Colleagues, Other) and search bar.
- [x] 4.4 Handle free-tier limit warnings in the UI when attempting to add guests beyond the limit.

## 5. Testing & Verification

- [x] 5.1 Write unit tests for `GuestService` verifying duplicate email detection and free tier limit blocks.
- [x] 5.2 Write unit tests for CSV validation logic.
- [x] 5.3 Test the full import flow from the UI.
