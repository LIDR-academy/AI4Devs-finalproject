# [0032] Seed the three-level shipping geography catalog (countries / comunidades autónomas / municipios)

## Description
Create and seed the read-only geography catalog that future shipping zones are assembled from,
at three levels of granularity: **all ISO countries**, **Spain's 17 comunidades autónomas**, and
**all ~8,100 Spanish municipios at INE granularity**. The data ships as a CSV fixture bundled in
this repository under `database/data/`, loaded by a chunked seeder. This is pure schema + seed
infrastructure — no admin CRUD, no Livewire component, no picker UI, and no `shipping_zones`
table; those belong to the follow-up stories. The catalog is **physically independent** of the
future `sales_regions` (fiscal) catalog: no shared table and no foreign key between them, per
[PRD assumption 4](../../docs/PRD/PRD.md#assumptions--confirmed-decisions), reaffirmed in the
rewritten [§2.4 Shipping](../../docs/PRD/PRD.md#24-shipping).

## Type
backend | includes database-expert: yes

**PRD coverage.** [§2.4 Shipping](../../docs/PRD/PRD.md#24-shipping) (rewritten 2026-08-17). This
story has **no Gherkin scenarios of its own in the PRD** — the zone CRUD and picker scenarios
there belong to the follow-up stories. It enables exactly one PRD acceptance criterion:

> - [ ] A **geography catalog is seeded** at three levels — all ISO countries, Spain's 17 autonomous
>       communities, and all ~8,100 Spanish municipios (INE granularity) — from a CSV/JSON fixture
>       bundled in this repository (`database/data/`). Administrators cannot add entries to it.

and partially underwrites the "kept independent from the Sales Region (fiscal) catalog" criterion
in the same list.

**Boundaries with the sibling Epic 2 stories** (all still unwritten — referenced by planned id, no
task file exists for any of them yet):

- **0016 — Sales Regions / tax catalog seed.** Owns `sales_regions` entirely. It is *expected to
  read the same bundled ISO-country fixture file* this story introduces, for its own country rows.
  That shared **file** is the only permitted coupling: no shared table, no FK, no shared model.
- **0022 — the shared searchable server-side-filtered multi-select component.** Owns the picker
  widget itself.
- **0033 — shipping zones CRUD.** Owns the `shipping_zones` table, the zone↔catalog pivot, the
  zone-deletion rules, and the `shipping.*` permission gating.
- **0034 — the zone geography picker.** Owns the search query, the level grouping, and the
  "no results" empty state, built on 0022's component over this story's catalog.

**Granularity is settled, not negotiable.** Municipio-level (~8,100 entries) was chosen explicitly
by the product owner over the coarser alternatives (52 provinces, or provincial capitals only),
because Spanish carrier rates are commonly quoted at municipal level. Do not propose a coarser
default in Phase 2 or Phase 3.

## Gherkin
```gherkin
Feature: Seeded shipping geography catalog

  Scenario: Seeding an empty database populates the catalog at all three levels
    Given a platform operator deploying Arospe against an empty database
    When they run the database seeders
    Then the geography catalog holds one entry per ISO country, one per Spain's 17 comunidades
      autónomas, and one per Spanish municipio in the bundled INE fixture

  Scenario: Every municipio is reported under its comunidad autónoma
    Given a platform operator who has seeded the geography catalog
    When they look up the municipio "Gijón"
    Then it is reported under the comunidad autónoma "Asturias"

  Scenario: Every comunidad autónoma is reported under Spain
    Given a platform operator who has seeded the geography catalog
    When they look up the comunidad autónoma "Asturias"
    Then it is reported under the country "España"

  Scenario: Spanish names keep their accents and ñ
    Given a platform operator who has seeded the geography catalog
    When they look up the municipio "A Coruña"
    Then its name is stored and read back exactly as written in the fixture

  Scenario: Re-seeding an already-seeded database creates no duplicates
    Given a platform operator whose database already carries the seeded geography catalog
    When they run the database seeders a second time
    Then the catalog still holds exactly one entry per country, comunidad autónoma and municipio

  Scenario: A missing fixture file aborts the seed without writing partial data
    Given a platform operator whose bundled geography fixture file is absent
    When they run the geography catalog seeder
    Then the seeder stops with a message naming the missing file
    And the geography catalog is left empty rather than half-populated

  Scenario: A malformed fixture row aborts the seed without writing partial data
    Given a platform operator whose bundled geography fixture contains a row with a missing INE code
    When they run the geography catalog seeder
    Then the seeder stops with a message identifying the offending row
    And the geography catalog is left empty rather than half-populated

  Scenario: The catalog ships with no way for an administrator to add to it
    Given a shipping administrator signed in to the panel
    When they look for a way to create, edit or delete a geography catalog entry
    Then no such route, screen or permission exists — the catalog is seeded data only

  Scenario: Seeding the geography catalog leaves the Sales Region catalog untouched
    Given a platform operator deploying Arospe
    When they run the database seeders
    Then no Sales Region (fiscal) entry, rate or default flag is created or changed by the
      geography catalog seeder

  Scenario: Name search at a given level is backed by a dedicated index
    Given a platform operator who has seeded the geography catalog
    When the catalog is inspected for the index the future zone geography picker filters by
    Then an index covering the search column exists on the catalog table
```

> **Why the last scenario leaks a technical term.** [gherkin-guidelines.md rule 2](../../docs/testing/frontend/gherkin-guidelines.md)
> asks scenarios to stay out of implementation detail. This story's whole deliverable *is*
> implementation detail — there is no user-facing behaviour to describe — so it follows the
> precedent set by [0014](done/0014-drop-redundant-users-uuid-unique-index.md), whose scenarios name
> indexes directly. Every other scenario above is still written declaratively with a named actor.

## Documented functional decisions

### D-N1 — `normalized_name` is computed by the **shared** text normalizer, never by a rule this story owns. CONFIRMED 2026-08-18.

Search-term normalization (case folding and accent folding, so a search for `Nino` finds `Niño`)
must be **identical** across every story that searches this geography catalog or the sales-region
catalog: **0022** (the shared searchable multi-select), **0026** (product↔region resolver),
**0032/0033** (this catalog and its zones), and **0034** (the zone geography picker). Confirmed by
the product owner across the Epic 2 Phase 1 debates on 2026-08-18.

The rule itself is therefore **not defined here**. This story consumes the project's centralized
text-normalizer utility — a single function that is the one source of truth for what "normalized"
means — introduced by story [0022](0022-searchable-multi-select-component.md): the invokable
**`App\Actions\NormalizeForSearch`**, at `app/Actions/NormalizeForSearch.php`, with the signature
`__invoke(string $value): string`, implemented as trim → `Str::lower` → `Str::ascii` → collapse
whitespace. Three obligations follow:

1. **The seeder writes `normalized_name` by calling that utility**, on the same `name` string it
   persists — it must not inline a `Str::lower()` + `iconv()`/transliterator pipeline of its own,
   even a one-liner.
2. **Live search normalizes the administrator's query with the exact same function call** (0034's
   picker, over this column). This is the actual bug class being prevented: if seed time folds
   accents and search time only lowercases, `Niño` is stored as `nino` while the query stays
   `niño`, and the row is unfindable — a silent zero-results bug that no test on either side alone
   catches, because each side is internally consistent. **Both call sites must resolve to the same
   function so they cannot drift apart.**
3. **Any change to the normalizer is a re-seed event.** Folding rules and stored `normalized_name`
   values are one unit; changing the utility without recomputing this column reintroduces exactly
   the divergence point 2 forbids. Record this in the Phase 6 docs pass.

This is what closes **OQ-6**'s normalization half: `normalized_name` exists so that search
correctness never depends on the database collation (SQLite/CI `BINARY` vs MySQL/production
`utf8mb4_unicode_ci` — the same reasoning [errors-log.md](../../docs/errors-log.md) already records
for the deleted-user token revocation query, *"never let a case-insensitive collation be the thing
that makes a query match"*). A single shared normalizer is what makes that guarantee hold on both
engines at once. The **collation** half of OQ-6 remains open and is unaffected.

## Files to create/modify

### Schema

- `database/migrations/<timestamp>_create_geography_entries_table.php` — **new**. One table with a
  `level` discriminator and a nullable self-referencing `parent_id`. `down()` is
  `Schema::dropIfExists('geography_entries')`, per [migrations.md](../../docs/database/migrations.md#structure).

  Column set agreed in the debate:

  | Column | Type | Notes |
  | --- | --- | --- |
  | `id` | `bigint` auto-increment PK | **confirmed** — the one deliberate exception to this project's UUIDv7 policy; see *Primary-key type* below |
  | `level` | `VARCHAR(20)` | cast to `App\Enums\GeographyLevel`; string + PHP enum, never a native MySQL `enum`, per [migrations.md](../../docs/database/migrations.md#when-the-new-columns-default-is-wrong-for-existing-rows-backfill-in-the-same-up) |
  | `parent_id` | nullable, self-FK, `restrictOnDelete` | null for countries; country for comunidades; comunidad for municipios |
  | `name` | `VARCHAR(255)` | display name exactly as sourced |
  | `normalized_name` | `VARCHAR(255)` | the search column, computed once at seed time by the project's centralized text-normalizer utility, **`App\Actions\NormalizeForSearch`** (`app/Actions/NormalizeForSearch.php`) — this story defines **no normalization rule of its own**; see **D-N1** |
  | `ine_code` | `VARCHAR(10)`, nullable, unique | comunidades + municipios only |
  | `iso_alpha2` | `CHAR(2)`, nullable, unique | countries only |
  | `province_name` | `VARCHAR(255)`, nullable | denormalized on municipio rows — **not** a level (see OQ-5) |
  | `created_at` / `updated_at` | timestamps | consistency with every other table here |

  Indexes: `PRIMARY(id)`; `UNIQUE(iso_alpha2)` and `UNIQUE(ine_code)` — both nullable-unique, the
  pattern `users.pending_email` already establishes ([schema.md](../../docs/database/schema.md#users):
  MySQL and SQLite both allow unlimited `NULL`s in a unique index), which is what makes "no
  duplicate entries" a *database* invariant rather than a seeder-only one; an explicit
  `INDEX(parent_id)` following this repo's be-explicit-about-FK-indexes convention
  (`create_passkeys_table`'s `$table->index('user_id')`); and the picker index
  **`INDEX(level, normalized_name)`** — equality on `level`, prefix range-scan on
  `normalized_name`, which is exactly the shape of the three bounded per-level queries story 0034
  will run.

  `parent_id` must **not** cascade on delete. There is no admin CRUD on this table in this story
  or any planned one, and `restrictOnDelete` makes it structurally impossible for a future
  maintenance script to wipe a comunidad's ~200 municipios by removing one parent row.

- `app/Enums/GeographyLevel.php` — **new**. Backed enum, TitleCase keys / lowercase values per
  project `CLAUDE.md`: `Country = 'country'`, `Community = 'community'`, `Municipality =
  'municipality'`. Mirrors `App\Enums\UserStatus`, including a `label()` reading from `lang/`.

### Model

- `app/Models/GeographyEntry.php` — **new**. Attribute-based `#[Fillable]` / `casts()` style per
  [base-standards.md](../../docs/conventions/base-standards.md#model-conventions) and
  `app/Models/User.php`. `casts()` carries `'level' => GeographyLevel::class`. Relations:
  `parent()` (`belongsTo` self) and `children()` (`hasMany` self).

  **`#[Fillable]` is deliberately empty here.** No form ever writes these rows and the seeder
  inserts through the query builder, so there is nothing legitimate to mass-assign; an empty list
  is the same omission-as-guard convention `users.status` uses, applied to the whole table.

- `database/factories/GeographyEntryFactory.php` — **new**, small. Not used to load the catalog
  (that comes from the fixture), but stories 0033/0034 will need a handful of entries without
  seeding thousands. Include `country()` / `community()` / `municipality()` states.

### Fixture

- `database/data/iso-countries.csv` — **new**. Columns: `iso_alpha2`, `name`. Deliberately a
  **standalone, reusable artifact**: story 0016's `sales_regions` seeder is expected to read this
  same file for its own country rows. Nothing about its shape may assume this story's table.
- `database/data/es-municipalities.csv` — **new**. Expected columns: `ine_code`, `name`,
  `province_name`, `community_ine_code`, `community_name`. **See OQ-1 — this file is not sourced
  yet and the column list above is the *expected* shape, not a description of an existing file.**

  Only two files, not three: the 17 comunidades are derived by de-duplicating
  `(community_ine_code, community_name)` while streaming the municipality file, so there is no
  third fixture to keep in sync with the second.

### Seeder

- `database/seeders/GeographyCatalogSeeder.php` — **new**. Named `<Noun>Seeder`, matching
  `RolePermissionSeeder`. Streams each CSV with `SplFileObject` / `fgetcsv` (O(1) memory) and
  writes with `DB::table('geography_entries')->upsert($chunk, [...])` in batches of **500**,
  parent-level-first (countries → comunidades → municipios) so `parent_id` always resolves.

  `upsert()` keyed on the natural key (`iso_alpha2` for countries, `ine_code` otherwise) is the
  idempotency strategy, chosen over truncate-and-reload **specifically because of story 0033**:
  once the zone pivot carries FKs into this table, a `TRUNCATE` either fails outright or orphans
  every zone assignment. Choosing upsert now avoids rewriting the seeder then.

  **`normalized_name` is computed inside the chunk loop by calling the shared text-normalizer
  utility** (D-N1) on the row's `name`, never by an inline fold written into this seeder. The same
  function is what 0034's picker applies to the administrator's live query, which is the only thing
  guaranteeing the two can never diverge.

  Progress reporting uses the nullsafe `$this->command?->info(...)` pattern
  `RolePermissionSeeder` already uses (lines 92, 149, 176), so the seeder still works when invoked
  outside an Artisan context.

  **The fixture path must be overridable** — a `protected function fixturePath(string $file):
  string` defaulting to `database_path("data/{$file}")`. This is a hard design requirement of this
  story, not an implementation detail: without it the test suite must either seed all ~8,100 rows
  on every `RefreshDatabase` test or cannot test the seeder in isolation at all (see the Tests
  section). `RolePermissionSeeder` has no analogous hook because it seeds constants, not a file.

- `database/seeders/DatabaseSeeder.php` — **modify**. Add `$this->call(GeographyCatalogSeeder::class);`
  **unconditionally**, next to the existing `RolePermissionSeeder` call. This is real reference
  data that shipping is non-functional without in every environment — not the
  `app()->environment(['local','testing'])`-gated `test@example.com` fixture user. It extends the
  precedent [schema.md](../../docs/database/schema.md#roles-permissions-model_has_roles-model_has_permissions-role_has_permissions)
  already records (seeding is a required deployment step); it does not create a new one.

  The seeder must also be independently runnable as
  `php artisan db:seed --class=GeographyCatalogSeeder`, so refreshing an INE vintage does not
  require re-running the whole chain.

### Not touched

No route, no Livewire component, no Blade view, no policy, and **no new permission** — `shipping`
is already one of `RolePermissionSeeder::MODULES`, and a read-only seeded catalog with no admin
surface needs no `.view`/`.create`/`.edit`/`.delete` entry of its own.

### Schema shape — the debate, and the dissent

`database-expert` and `backend-expert` disagreed. `backend-expert` proposed **three tables**
(`geography_countries` / `geography_regions` / `geography_municipalities`); `database-expert`
proposed **one table with a `level` discriminator**. This story adopts the **single table**, on
`database-expert`'s decisive argument: story 0033's zone pivot then needs one plain
`geography_entry_id` FK column, whereas three tables force either three nullable FKs with an
app-level "exactly one is set" invariant, or a genuine polymorphic pivot. This repo has direct,
expensive history with a polymorphic morph key — [ADR 0001](../../docs/decisions/0001-uuid-primary-keys.md)
records the two-step config-rename-then-retype migration the UUID conversion needed just to keep
`spatie/laravel-permission`'s *existing* morph column working. Introducing a second polymorphic
relationship voluntarily, when a single FK avoids it, is not a trade this project should make.

The dissent is recorded here rather than dropped: if Phase 2 rejects the single-table shape, the
seeder's chunk/upsert design survives unchanged but the model layer, the pivot design in 0033 and
several test assertions do not.

## Tests to perform

The fixture-path hook above is what makes this plan possible; if Phase 2 removes it, this whole
section has to be renegotiated.

**Fixture strategy (decided in debate): a small representative subset for the seeder's behavioural
tests, plus one separate structural check against the real bundled file.** Seeding ~8,100 rows
inside every `RefreshDatabase` transaction would turn a seconds-long suite into a minutes-long one
for no extra behavioural signal — and `tests/Feature/Seeders/RolePermissionSeederTest.php` already
shows how many tests call `$this->seed(...)` in this repo. The subset fixture lives under
`tests/Fixtures/geography/` and **must exceed the chunk size by at least one row** (chunk 500 →
≥501 municipio rows), because a subset smaller than one chunk cannot prove anything about chunk
boundaries.

- [ ] Integration test (`tests/Feature/Seeders/GeographyCatalogSeederTest.php`): seeding creates a
      country row for every country row in the fixture — count asserted against the fixture's own
      **parsed** row count, never a hardcoded literal (see OQ-1).
- [ ] Integration test: seeding creates exactly **17** comunidad-autónoma rows. This is the one
      count safe to hardcode — it is a fact about Spain, not about the unsourced file.
- [ ] Integration test: every seeded municipio has a non-null `parent_id` resolving to an existing
      comunidad row, and every comunidad's `parent_id` resolves to the country "España".
- [ ] Integration test: the landmark row "Gijón" resolves through its parent chain to "Asturias".
- [ ] Edge case: a municipio name carrying accents or ñ ("A Coruña", "Ourense") round-trips
      byte-for-byte. Note this runs on **SQLite** in CI ([database-strategy.md](../../docs/testing/backend/database-strategy.md));
      MySQL collation behaviour is a known untested gap, recorded in OQ-6, not silently assumed.
- [ ] Edge case: a seeded row's `normalized_name` equals the shared normalizer applied to that
      row's own `name` — assert against a **call to the utility**, never against a hardcoded
      `'a coruna'` literal. A literal passes even if the seeder inlined its own divergent fold,
      which is precisely the drift **D-N1** exists to prevent.
- [ ] Edge case: a fixture field containing a comma or a quoted name parses as one field.
- [ ] Edge case: the row exactly at a chunk boundary (`N mod 500 == 0`) **and** the row at `N+1`
      both exist after seeding — the classic gap between two chunk writes.
- [ ] Negative test: running the seeder twice leaves the row count unchanged (idempotency).
- [ ] Negative test: a duplicate `ine_code` in the source is refused rather than silently creating
      two rows.
- [ ] Negative test: a missing fixture file makes the seeder throw with an actionable message and
      leaves the table at **zero** rows — no half-commit.
- [ ] Negative test: a malformed row (wrong column count / missing INE code) aborts the whole seed
      transaction, not just that row — same zero-rows assertion.
- [ ] Index test: `Schema::getIndexes('geography_entries')` reports an index covering the search
      column. **Assert existence only, never performance.** A wall-clock budget is flaky on shared
      CI runners, and an `EXPLAIN`-shaped assertion is engine-coupled — the suite runs on SQLite
      while production is MySQL, so a plan proven on one planner says nothing about the other's.
      This follows [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)'s
      framework/engine-internals principle; real picker latency belongs to story 0034 with
      realistic volume, not to a Pest assertion here.
- [ ] Unit test (`tests/Unit/...`, mirroring wherever the CSV parsing helper lands): row/column
      parsing, comma and quote handling, and duplicate-code detection, with no database.
- [ ] Fixture-integrity test, in its own file so it can be excluded from a fast run: parse the
      **real** bundled files directly with no database and assert header shape, no duplicate INE
      codes or ISO codes, and referential closure (every municipio's `community_ine_code` appears
      among the derived comunidad rows).
- [ ] Independence test, expressed honestly: `sales_regions` does not exist yet, so assert
      `Schema::hasTable('sales_regions')` is still **false** after this story's migration — proving
      no accidental coupling was introduced — **plus** a deliberately skipped stub naming its
      blocker, `->skip('sales_regions does not exist yet — see story 0016')`, so the PRD's
      "Creating a shipping zone leaves the Sales Region catalog untouched" scenario has a
      placeholder a future story is forced to un-skip. A test that trivially passes because the
      thing it protects does not exist is worse than a named skip.
- [ ] Regression: the full existing suite still passes, including
      `tests/Feature/Seeders/DatabaseSeederTest.php`, which asserts what `DatabaseSeeder` does in a
      faked production environment and will now also run this seeder.

**Deliberately not covered here** (belongs to 0033/0034): zone CRUD, the picker's search and
level-grouping behaviour, its "no results" empty state, zone↔catalog assignment, and the
zone-deletion-block rule (itself still marked *pending Phase 1 confirmation* in the PRD).

## Expected outcome
After `php artisan db:seed` on a fresh database, `geography_entries` holds one row per ISO country,
17 comunidad-autónoma rows parented to España, and one row per Spanish municipio parented to its
comunidad — roughly 8,300 rows total, loaded in ~17 bulk statements with flat memory use rather
than ~8,100 individual inserts. Re-running the seeder changes nothing. Nothing in the UI changes:
there is no screen for this data yet. Story 0033 can then create `shipping_zones` and a pivot with
a single `geography_entry_id` FK, and story 0034 can filter the catalog by name at each level over
a purpose-built index.

## Acceptance criteria
- [ ] A single `geography_entries` table exists with a `level` discriminator and a nullable
      self-referencing `parent_id`, and **no** foreign key or shared table with `sales_regions`.
- [ ] Seeding populates all three levels from the bundled fixture: every ISO country, Spain's 17
      comunidades autónomas, and every municipio in the fixture.
- [ ] Each municipio is linked to its comunidad autónoma, and each comunidad to España.
- [ ] The seeder is **chunked** (batched writes, streamed reads) — no per-row `Model::create()` and
      no whole-file `json_decode` into memory.
- [ ] Re-running the seeder is idempotent: no duplicate rows, enforced by a **unique index** on the
      natural key, not by seeder logic alone.
- [ ] A missing or malformed fixture aborts the seed with an actionable message and leaves no
      partial data.
- [ ] An index exists on the column the future picker filters by, and the story documents which
      column that is and why.
- [ ] `normalized_name` is written by calling the project's **centralized text-normalizer utility**
      (D-N1) — no fold logic is inlined in the seeder — so seed-time normalization and 0034's
      search-time normalization are literally the same function and cannot drift apart.
- [ ] The fixture path is overridable so tests can point the seeder at a smaller file.
- [ ] `database/data/iso-countries.csv` is a standalone file with no dependency on this story's
      table, so story 0016 can consume it unchanged.
- [ ] The seeder is called unconditionally from `DatabaseSeeder` and is independently runnable via
      `db:seed --class=`.
- [ ] No route, component, view, policy or new permission is added — the catalog has no admin write
      surface.
- [ ] `geography_entries.id` is a `bigint` auto-increment — no `HasUuids` on the model — and ADR
      0001 records this table as the single documented exception to the UUIDv7 policy.
- [ ] OQ-1 (INE dataset sourced, licence vetted, vintage recorded) is **resolved and recorded**
      before this story is closed.

## Definition of Done
- [ ] Tests written and green, plus the **full** suite per [contracts.md](../../docs/contracts.md)'s
      Full Test Suite Gate Rule.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor). Expected focus: that the bundled fixture is treated as
      trusted-but-validated input (a malformed row must fail closed, not write partial data), and
      that adding a seeder to the unconditional `DatabaseSeeder` path stays consistent with
      [security/seeder-safety.md](../../docs/security/seeder-safety.md)'s production-reachability
      reasoning.
- [ ] Documentation updated (docs-keeper): a new `geography_entries` section plus ER-diagram entry
      in [database/schema.md](../../docs/database/schema.md); the fixture/seeder convention in
      [database/migrations.md](../../docs/database/migrations.md) if the chunked-upsert pattern is
      worth generalizing; `database/data/` added to the directory listing in
      [conventions/base-standards.md](../../docs/conventions/base-standards.md#directory-structure);
      and an addendum to [ADR 0001](../../docs/decisions/0001-uuid-primary-keys.md) recording
      `geography_entries` as the one confirmed exception to the UUIDv7 policy, with the reason
      (high-volume internal lookup table, no independent business identity, never URL-exposed).
- [ ] Acceptance criteria met.

## Dependencies, risks, open technical questions

**Dependencies:** none within Epic 2. This story is foundational for 0033 (and transitively 0034),
and shares one fixture file with 0016.

---

**OQ-1 — the INE dataset is not sourced, and this is a hard prerequisite. (blocking)**

No geography fixture exists in this repository today; `database/data/` does not exist. Nothing in
this document should be read as describing a real file: the column lists above are the **expected**
shape, deliberately stated as an expectation rather than a fact. Before or during Phase 3, someone
must:

1. Locate an actual INE (Instituto Nacional de Estadística) municipality dataset and record its
   exact URL, publication vintage, and download date.
2. **Verify its licence permits redistribution**, since the file is checked into this repository —
   this is the part most likely to force a different source, and it must be answered before the
   file is committed, not after.
3. Record its real format: delimiter (INE exports are frequently semicolon-separated, not comma),
   encoding (Latin-1 vs UTF-8 — this determines whether `fgetcsv` needs a transcode step for
   accented names), and exact column set, including whether comunidad autónoma is present at all
   or must be derived from the province code.
4. Record the real municipio count for that vintage. It changes between vintages as municipalities
   merge or split, which is exactly why **no test may hardcode a municipio count** — every
   count assertion resolves against the fixture's own parsed row count instead.

An equivalent open question applies to the ISO-country list: which source, and does its licence
permit bundling. Do **not** resolve either by inventing plausible values.

**Primary-key type — `bigint` auto-increment. CONFIRMED 2026-08-17, not an open question.**

`geography_entries.id` is a plain `bigint` auto-increment, exactly as `database-expert`
recommended. The project-wide policy remains **UUIDv7 for every new Epic 2 business entity**; this
catalog is the **one deliberate exception**, on three grounds: it is a pure high-volume internal
lookup table (~8,300 rows), its entries have no independent business identity, and they are never
exposed in a URL. [ADR 0001](../../docs/decisions/0001-uuid-primary-keys.md)'s rationale is
enumeration-safe identifiers *exposed publicly*, which does not apply here, while its accepted cost
— a larger index/FK footprint — would land twice: once on the catalog's own PKs and again on every
row of story 0033's zone pivot.

Implementation notes that follow from this: the model uses **no** `HasUuids` trait, `@property int
$id`, and story 0033's pivot carries a `bigint` `geography_entry_id`. The exception must be written
into ADR 0001 as an addendum during Phase 6 so the next person adding an Epic 2 table reads the
rule and its single carve-out in one place — see the Definition of Done.

**OQ-3 — table and model naming. (recommendation, low risk)**

`geography_entries` / `GeographyEntry` **(recommended)**: the catalog is generic reference data and
a future story could legitimately reuse it (customer addresses, for one) without a rename. The
alternative, `shipping_geography_entries`, makes the independence boundary from `sales_regions`
self-documenting at the schema level, which is the thing PRD assumption 4 most worries about — at
the cost of a name that lies the first time anything but shipping reads it. Proceeding with the
recommendation unless Phase 2 objects.

**OQ-4 — single table vs. three tables.** Resolved in the debate in favour of the single table; the
dissent and the argument are recorded above under *Files to create/modify*. Flagged here so Phase 2
reviews it as a decision rather than inheriting it silently.

**OQ-5 — province is a column, not a level.** The PRD explicitly rejected province granularity for
zones, so no `Province` level is created. But the INE fixture carries province data, so it is kept
as a denormalized nullable `province_name` on municipio rows — free at query time, and available if
a future story needs to disambiguate two same-named municipios in different provinces. Adding a
province *level* later would mean re-parenting every municipio row; that is an accepted, recorded
risk of this choice.

**OQ-6 — collation is decided now or expensively later. (normalization half RESOLVED 2026-08-18;
collation half still open)** Choose the table collation (`utf8mb4_0900_ai_ci` or equivalent) with
the migration: changing it after FK-referenced data exists is a locking, costly `ALTER`. Note also
that the suite runs on **SQLite** while production runs MySQL, so accent/case-folding behaviour is
genuinely untested by CI. The `normalized_name` column exists precisely so that search correctness
does not depend on collation — the same reasoning [errors-log.md](../../docs/errors-log.md) already
records for the deleted-user token revocation query ("never let a case-insensitive collation be the
thing that makes a query match").

> **Resolved — how `normalized_name` is computed is no longer this story's question.** Per **D-N1**
> (2026-08-18), both the seed-time computation and every live search normalize through the *same*
> centralized text-normalizer utility, so the two can never fold differently. What remains open here
> is only the physical table/column **collation** choice for the migration.

Note for Phase 3: [0033](0033-shipping-zones-backend.md)'s **OQ-A** asks the same "extract the
normalizer once" question from the zone-name-uniqueness side. Both are answered by the same shared
utility; do not resolve them separately.

**Other risks:**

- **The `sales_regions` independence assertion is unverifiable today** and survives only as a named
  skip. If nobody un-skips it when 0016 lands, the gap is indistinguishable from "tested and fine".
  Story 0016's Definition of Done should carry the obligation to un-skip it.
- **Chunk size 500 is an estimate**, chosen to stay well under MySQL's `max_allowed_packet` at ~9
  columns. Verify against the real row width in Phase 3; the tests' chunk-boundary case must track
  whatever value is chosen.
- **A hardcoded municipio count is the most likely mistake in Phase 3** — see OQ-1.

## Provenance
Written in Phase 1 (Three Amigos) on 2026-08-17 for Epic 2, from the [§2.4 Shipping](../../docs/PRD/PRD.md#24-shipping)
section rewritten the same day. Participants: `product-owner`, `backend-expert`, `backend-qa`,
`database-expert` (added per [workflow.md](../../docs/workflow.md)'s classification rule, since the
task creates a table and a seeder). No application code was written in this phase.
