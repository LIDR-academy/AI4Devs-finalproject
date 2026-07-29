# Data Model Documentation

Data model for **Reading Analytics Platform**: personal reading library, progress tracking, and catalog metadata. Persistence uses **PostgreSQL** and **TypeORM** (`backend/src/`).

## Overview

| Entity | Table | Description |
|--------|-------|-------------|
| **User** | `users` | Account identified by email (MVP: dev-login, optional password later) |
| **Book** | `books` | User library link to a shared catalog edition (reading list membership) |
| **CatalogEdition** | `catalog_editions` | Shared bibliographic metadata (title, ISBN, cover URL, provenance) |
| **UserBookOverride** | `user_book_overrides` | Sparse per-user overrides for bibliographic fields |
| **ReadingRecord** | `reading_records` | 1:1 reading state and progress for a book |
| **MonthlyTbrList** | `monthly_tbr_lists` | One TBR list per user per calendar month |
| **TbrEntry** | `tbr_entries` | Book on a monthly TBR with sort order and completion |
| **AnnualReadingGoal** | `annual_reading_goals` | Numeric annual book target per user and year |
| **ImportJob** | `import_jobs` | Background Goodreads CSV import + enrichment job state |
| **Audience** | `audiences` | User-configurable audience label (e.g. Adulto, Juvenil, Infantil) |
| **Format** | `formats` | User-configurable read format label (e.g. Físico, Ebook, Audio) |
| **Genre** | `genres` | User-configurable genre label (e.g. Fantasía, Thriller) |
| **UserProfile** | `user_profiles` | Per-user preferences (theme palette, future UI settings) |

All user-owned books are scoped by `user_id`. Deleting a user cascades to books, reading records, TBR lists, annual goals, import jobs, audiences, formats, genres, and user profile.

## Entity definitions

### User

Represents a reader account.

| Field | Column | Type | Constraints |
|-------|--------|------|-------------|
| id | `id` | UUID | PK, default `gen_random_uuid()` |
| email | `email` | VARCHAR(320) | NOT NULL, UNIQUE |
| passwordHash | `password_hash` | VARCHAR(255) | NULL (reserved for future auth) |
| createdAt | `created_at` | TIMESTAMPTZ | NOT NULL |
| updatedAt | `updated_at` | TIMESTAMPTZ | NOT NULL |

**Relationships:** one user has many `books`; one user has one `user_profiles` row (optional until first preferences access).

### UserProfile

Stores per-user UI preferences (KAN-80).

| Field | Column | Type | Constraints |
|-------|--------|------|-------------|
| userId | `user_id` | UUID | PK, FK → `users.id`, ON DELETE CASCADE |
| preferences | `preferences` | JSONB | NOT NULL, default `{}` |
| createdAt | `created_at` | TIMESTAMPTZ | NOT NULL |
| updatedAt | `updated_at` | TIMESTAMPTZ | NOT NULL |

**`preferences` keys (MVP):**

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `theme_palette_id` | string enum | `veranda` | Preset palette slug applied app-wide |

### CatalogEdition

Shared canonical metadata for a book edition. Not scoped by `user_id`. Populated on catalog import, Goodreads import, and `POST /v1/books`.

| Field | Column | Type | Constraints |
|-------|--------|------|-------------|
| id | `id` | UUID | PK |
| title | `title` | TEXT | NOT NULL |
| authors | `authors` | TEXT | NOT NULL |
| isbn13 | `isbn_13` | VARCHAR(13) | NULL |
| isbn10 | `isbn_10` | VARCHAR(10) | NULL |
| coverImageUrl | `cover_image_url` | TEXT | NULL |
| pageCount | `page_count` | INTEGER | NULL |
| seriesName | `series_name` | VARCHAR(255) | NULL |
| publicationYear | `publication_year` | SMALLINT | NULL |
| catalogGenre | `catalog_genre` | VARCHAR(255) | NULL (raw provider genre) |
| dataSource | `data_source` | VARCHAR(32) | NOT NULL |
| externalProviderId | `external_provider_id` | VARCHAR(128) | NULL |
| createdAt | `created_at` | TIMESTAMPTZ | NOT NULL |
| updatedAt | `updated_at` | TIMESTAMPTZ | NOT NULL |

**Uniqueness:** partial unique on `isbn_13` (when not null) and on `(data_source, external_provider_id)` (when provider id set).

**Goodreads import title normalization:** When mapping the Goodreads `Title` column, trailing parenthetical groups (e.g. `The Raven Scholar (Eternal Path Trilogy, #1)`) are stripped into a clean `title` plus optional `series_name` (volume markers like `, #1` removed). Mid-title parentheses are kept.

### UserBookOverride

Sparse per-user bibliographic overrides. `overridden_fields` tracks which columns are active; unset fields inherit from `catalog_editions`.

| Field | Column | Type | Constraints |
|-------|--------|------|-------------|
| userBookId | `user_book_id` | UUID | PK, FK → `books.id`, ON DELETE CASCADE |
| overriddenFields | `overridden_fields` | TEXT[] | NOT NULL, default `{}` |
| title | `title` | TEXT | NULL |
| authors | `authors` | TEXT | NULL |
| coverImageUrl | `cover_image_url` | TEXT | NULL |
| pageCount | `page_count` | INTEGER | NULL |
| seriesName | `series_name` | VARCHAR(255) | NULL |
| publicationYear | `publication_year` | SMALLINT | NULL |
| updatedAt | `updated_at` | TIMESTAMPTZ | NOT NULL |

### Book

User library membership for a catalog edition. API responses expose **effective** bibliographic fields (`override` merged over `catalog_editions`) via `BookMetadataResolver`.

| Field | Column | Type | Constraints |
|-------|--------|------|-------------|
| id | `id` | UUID | PK |
| userId | `user_id` | UUID | FK → `users.id`, ON DELETE CASCADE |
| catalogEditionId | `catalog_edition_id` | UUID | FK → `catalog_editions.id`, ON DELETE RESTRICT, NOT NULL |
| genreId | `genre_id` | UUID | NULL, FK → `genres.id`, ON DELETE SET NULL |
| notes | `notes` | TEXT | NULL |
| audience | `audience` | VARCHAR(32) | NULL; legacy enum |
| audienceId | `audience_id` | UUID | NULL, FK → `audiences.id`, ON DELETE SET NULL |
| createdAt | `created_at` | TIMESTAMPTZ | NOT NULL |
| updatedAt | `updated_at` | TIMESTAMPTZ | NOT NULL |

**Uniqueness:** `UNIQUE (user_id, catalog_edition_id)`.

**Relationships:** many-to-one `user`; many-to-one `catalogEdition`; optional one-to-one `override`; optional many-to-one `genre`; one-to-one `readingRecord`.

**Index:** `idx_books_user_id` on `user_id`; `idx_books_catalog_edition_id` on `catalog_edition_id`.

### Audience

User-owned audience classification label for books (KAN-64 / KAN-65). Seeded on account creation with defaults: Adulto, Juvenil, Infantil.

| Field | Column | Type | Constraints |
|-------|--------|------|-------------|
| id | `id` | UUID | PK |
| userId | `user_id` | UUID | FK → `users.id`, ON DELETE CASCADE, NOT NULL |
| name | `name` | VARCHAR(100) | NOT NULL |
| isDefault | `is_default` | BOOLEAN | NOT NULL, DEFAULT false |
| createdAt | `created_at` | TIMESTAMPTZ | NOT NULL |
| updatedAt | `updated_at` | TIMESTAMPTZ | NOT NULL |

**Uniqueness:** `UNIQUE (user_id, lower(name))` — case-insensitive name per user.

**Relationships:** many-to-one `user`; referenced by `books.audience_id`.

### Format

User-owned read format label for reading records (KAN-70 / KAN-71). Seeded on account creation with defaults: Audio, Ebook, Físico.

| Field | Column | Type | Constraints |
|-------|--------|------|-------------|
| id | `id` | UUID | PK |
| userId | `user_id` | UUID | FK → `users.id`, ON DELETE CASCADE, NOT NULL |
| name | `name` | VARCHAR(100) | NOT NULL |
| isDefault | `is_default` | BOOLEAN | NOT NULL, DEFAULT false |
| createdAt | `created_at` | TIMESTAMPTZ | NOT NULL |
| updatedAt | `updated_at` | TIMESTAMPTZ | NOT NULL |

**Uniqueness:** `UNIQUE (user_id, lower(name))` — case-insensitive name per user.

**Relationships:** many-to-one `user`; referenced by `reading_records.format_id`.

### Genre

User-owned genre label for books (KAN-59 / KAN-58). Seeded on account creation with defaults: Fantasía, Thriller, Ciencia ficción, Romance, Histórica, Ficción, No ficción.

| Field | Column | Type | Constraints |
|-------|--------|------|-------------|
| id | `id` | UUID | PK |
| userId | `user_id` | UUID | FK → `users.id`, ON DELETE CASCADE, NOT NULL |
| name | `name` | VARCHAR(100) | NOT NULL |
| isDefault | `is_default` | BOOLEAN | NOT NULL, DEFAULT false |
| createdAt | `created_at` | TIMESTAMPTZ | NOT NULL |
| updatedAt | `updated_at` | TIMESTAMPTZ | NOT NULL |

**Uniqueness:** `UNIQUE (user_id, lower(name))` — case-insensitive name per user.

**Relationships:** many-to-one `user`; referenced by `books.genre_id`.

### ReadingRecord

Reading status and progress for a single book (1:1 with book).

| Field | Column | Type | Constraints |
|-------|--------|------|-------------|
| bookId | `book_id` | UUID | PK, FK → `books.id`, ON DELETE CASCADE |
| status | `status` | VARCHAR(20) | NOT NULL; see enum below |
| currentPage | `current_page` | INTEGER | NULL |
| progressPercent | `progress_percent` | NUMERIC(5,2) | NULL |
| rating | `rating` | NUMERIC(2,1) | NULL, 0.5–5.0 in 0.5 steps if set |
| formatId | `format_id` | UUID | NULL, FK → `formats.id`, ON DELETE SET NULL |
| startedOn | `started_on` | DATE | NULL |
| finishedOn | `finished_on` | DATE | NULL |
| updatedAt | `updated_at` | TIMESTAMPTZ | NOT NULL |

**status enum:** `pendiente` | `leyendo` | `leido` | `dnf`

**API `read_format` (derived):** legacy response field mapped from linked `formats.name` (`fisico` | `ebook` | `audio` for defaults).

**Default on book create:** new books get `reading_records.status = 'pendiente'`.

### MonthlyTbrList

Monthly To Be Read list (UC-05). At most one list per user per `(year, month)`.

| Field | Column | Type | Constraints |
|-------|--------|------|-------------|
| id | `id` | UUID | PK |
| userId | `user_id` | UUID | FK → `users.id`, ON DELETE CASCADE |
| year | `year` | SMALLINT | NOT NULL |
| month | `month` | SMALLINT | NOT NULL, 1–12 |
| listStatus | `list_status` | VARCHAR(20) | NOT NULL, default `active` |
| autoCreated | `auto_created` | BOOLEAN | NOT NULL, default `false` |
| createdAt | `created_at` | TIMESTAMPTZ | NOT NULL |
| updatedAt | `updated_at` | TIMESTAMPTZ | NOT NULL |

**Uniqueness:** `UNIQUE (user_id, year, month)`.

### TbrEntry

A book on a monthly TBR checklist.

| Field | Column | Type | Constraints |
|-------|--------|------|-------------|
| id | `id` | UUID | PK |
| monthlyTbrId | `monthly_tbr_id` | UUID | FK → `monthly_tbr_lists.id`, ON DELETE CASCADE |
| bookId | `book_id` | UUID | FK → `books.id`, ON DELETE CASCADE |
| sortOrder | `sort_order` | INTEGER | NOT NULL |
| completed | `completed` | BOOLEAN | NOT NULL, default `false` |
| completedAt | `completed_at` | VARCHAR(30) | NULL; ISO 8601 timestamp when completed |
| addedAt | `added_at` | TIMESTAMPTZ | NOT NULL |

**Uniqueness:** `UNIQUE (monthly_tbr_id, book_id)`.

### AnnualReadingGoal

Numeric target of books to read in a calendar year (UC-06). Progress is computed from `reading_records` (`status = leido`, `finished_on` in year); not stored on this row.

| Field | Column | Type | Constraints |
|-------|--------|------|-------------|
| id | `id` | UUID | PK |
| userId | `user_id` | UUID | FK → `users.id`, ON DELETE CASCADE |
| year | `year` | SMALLINT | NOT NULL |
| targetBookCount | `target_book_count` | INTEGER | NOT NULL, CHECK > 0 |
| createdAt | `created_at` | TIMESTAMPTZ | NOT NULL |
| updatedAt | `updated_at` | TIMESTAMPTZ | NOT NULL |

**Uniqueness:** `UNIQUE (user_id, year)`.

### ImportJob

Background Goodreads import job (KAN-51). Progress exposed via `GET /v1/import/jobs/{jobId}`.

| Field | Column | Type | Constraints |
|-------|--------|------|-------------|
| id | `id` | UUID | PK |
| userId | `user_id` | UUID | FK → `users.id`, ON DELETE CASCADE |
| status | `status` | VARCHAR(20) | NOT NULL; `queued` \| `parsing` \| `importing` \| `enriching` \| `completed` \| `failed` |
| phase | `phase` | VARCHAR(20) | NOT NULL; same enum as status while running |
| processedCount | `processed_count` | INTEGER | NOT NULL, default 0 |
| totalCount | `total_count` | INTEGER | NOT NULL, default 0 |
| csvContent | `csv_content` | TEXT | NOT NULL |
| result | `result` | JSONB | NULL; full import payload when completed |
| errorMessage | `error_message` | TEXT | NULL |
| createdAt | `created_at` | TIMESTAMPTZ | NOT NULL |
| updatedAt | `updated_at` | TIMESTAMPTZ | NOT NULL |

**Index:** `idx_import_jobs_user_id` on `user_id`.

## Entity-relationship diagram

```mermaid
erDiagram
    users ||--o{ books : owns
    books ||--|| reading_records : tracks

    users {
        uuid id PK
        varchar email UK
        varchar password_hash
        timestamptz created_at
        timestamptz updated_at
    }

    books {
        uuid id PK
        uuid user_id FK
        text title
        text authors
        varchar isbn_13
        varchar isbn_10
        text cover_image_url
        int page_count
        varchar genre
        varchar series_name
        smallint publication_year
        varchar data_source
        varchar external_provider_id
        text notes
        timestamptz created_at
        timestamptz updated_at
    }

    reading_records {
        uuid book_id PK_FK
        varchar status
        int current_page
        numeric progress_percent
        smallint rating
        varchar read_format
        date started_on
        date finished_on
        timestamptz updated_at
    }
```

## Catalog (shared + external)

`catalog_editions` stores bibliographic metadata reused across users. `CatalogService` queries the local table before Open Library / Google Books; new API hits are upserted into `catalog_editions`. Search responses may include `catalog_edition_id` when persisted.

User edits to bibliographic fields via `PATCH /v1/books/{id}` write to `user_book_overrides` and never mutate shared catalog rows. API `BookDto` fields are **effective** values (`override` > catalog).

## API field naming

JSON uses **snake_case** (`user_id`, `cover_image_url`, `reading_status`) to match API responses and frontend `api/types.ts`. TypeORM entity properties use **camelCase** in TypeScript; mapping happens in services (`toBookDto`).

## Migrations

Canonical migration: `backend/src/migrations/1735689600000-CreateBooksAndReadingRecords.ts`

Run: `npm run migration:run` from `backend/`.

## Computed (not persisted)

Monthly reading statistics (UC-07, KAN-15) are **computed on read** from `reading_records` joined to `books` (`status = leido`, `finished_on` within the month) and exposed at `GET /v1/stats/{year}/{month}`. There is no statistics table; nothing is denormalized or stored.

## Planned extensions (not in schema yet)

Document in OpenSpec before adding tables: **tags** (custom labels per book). The `import_jobs` table is implemented for Goodreads CSV import. Keep `docs/data-model.md` and `docs/api-spec.yml` in sync when implementing.

## Related documentation

- `docs/api-spec.yml` — REST operations
- `docs/product/use-cases.md` — product flows (UC-01 add book, etc.)
- `backend/src/books/entities/` — TypeORM source of truth
