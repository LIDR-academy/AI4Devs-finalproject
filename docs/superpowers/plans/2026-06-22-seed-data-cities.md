# Richer seed data — more properties + real photos

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development. A data/migration task: a deterministic generator emits a new Flyway migration `V11`. Verified by the Testcontainers test run (which applies V11) + a live dev-DB check. No app code changes.

## Goal
Grow the catalog to **30 properties per city** for **Barcelona, Madrid, Sevilla, Lisbon** (Sevilla is new; keep Lisbon), each with **several real photos**, and **upgrade the existing 15** properties from `placehold.co` gray boxes to real photos.

## Verified facts (scope-shaping)
- `property.location` is `GEOGRAPHY(Point,4326)` → insert via `ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography` (lng first).
- `photos` is JSONB, non-null, **array length ≥ 1**, items `{url, caption, order}`.
- **Availability is sparse AND the search query does not filter by date** (only bbox + `is_active` + price/type/bedrooms/guests). So new properties need **no availability rows** to appear in search.
- **No test asserts a seeded property count** (the `total_results==1` assertions are mocked unit tests / per-guest trips). Adding 120 properties is safe.
- Existing IDs: `cccccccc-cccc-cccc-cccc-0000000{1|2|3}{001..005}` (1=BCN, 2=MAD, 3=LIS), 5 per city. Hosts: `aaaaaaaa-…-0000000000{01,02,03}`.
- `property_type` CHECK ∈ {apartment, house, villa, cabin, studio}; `bathrooms>0`, `bedrooms>=0`, `max_guests>0`, `nightly_rate_eur>0`, `avg_rating` NULL or 1.0–5.0.

## Photo source (decided)
**LoremFlickr keyworded + stable `lock`** — reliability-tested (HTTP 200), topical, deterministic, zero-curation: `https://loremflickr.com/800/600/{keywords}?lock={n}`. Rotate keywords by property type + room (e.g. `apartment,interior`, `villa,pool`, `bedroom`, `kitchen`, `living-room`, `terrace,view`). Unique `lock` per (property, photo index) so images are distinct + stable. (Picsum `https://picsum.photos/seed/{seed}/800/600` is a one-line fallback if LoremFlickr ever flakes — note it in the generator.)

---

### Task 1: generator + `V11` migration
**New files:** `backend/src/main/resources/db/migration/scripts/generate_v11_seed.py` (the generator) and its output `backend/src/main/resources/db/migration/V11__more_seed_data.sql` (committed). READ `V7__seed_sample_data.sql` first to match the exact `property` INSERT column order + style.

The generator must be **pure/deterministic** (no `random` without a fixed seed; prefer index-derived values) so re-running produces identical SQL. It emits one `V11__more_seed_data.sql` containing:

**A. 105 new properties** reaching 30/city (BCN +25, MAD +25, LIS +25, SEV +30):
- IDs: `dddddddd-dddd-dddd-dddd-0000000{c}{nnn}` (c: 1=BCN,2=MAD,3=LIS,4=SEV; nnn zero-padded index). Distinct from existing `cccc…` IDs.
- `host_id`: rotate the 3 existing hosts (`aaaaaaaa-…-01/02/03`).
- `location`: city centre + deterministic jitter (±~0.03°). Centres: BCN 41.3874,2.1686 (Catalonia, ES); MAD 40.4168,-3.7038 (Madrid, ES); SEV 37.3891,-5.9845 (Andalusia, ES); LIS 38.7223,-9.1393 (Lisboa, PT).
- `title`: templated, varied + plausible (e.g. "{Sunny|Cosy|Modern|Charming|Elegant} {neighbourhood} {Apartment|Loft|Studio|Villa|Townhouse}"); per-city neighbourhood lists. Avoid duplicates.
- `property_type`: rotate within the allowed enum (weight apartments/studios higher).
- `city/region/country/address`: per city; address templated (street + number + postcode).
- `max_guests` 1–8, `bedrooms` 0–4 (0 only for studios), `bathrooms` 1–3, `nightly_rate_eur` ~45–320, `cleaning_fee_eur` ~15–80 — all deterministic from index, respecting CHECKs.
- `amenities`: deterministic subset of a realistic pool (wifi, kitchen, air_conditioning, heating, washer, pool, parking, tv, workspace, balcony, elevator). `house_rules`: subset (no_smoking, no_parties, no_pets, quiet_hours).
- `photos`: 3–5 LoremFlickr URLs (keywords vary by type + room slot; unique `lock`), proper `{url,caption,order}` with captions like "Living room"/"Bedroom"/"Kitchen"/"View".
- `avg_rating`: deterministic 4.0–5.0 (one decimal). `review_count`: 0 (mirror V7 — keeps the rating display consistent without seeding review rows; do NOT invent review_count without matching review rows). `is_active` true. `created_at/updated_at` fixed timestamps.

**B. UPDATE the existing 15** properties' `photos` (those `cccc…` IDs whose photos are `placehold.co`) → fresh LoremFlickr arrays (3–4 photos each, same shape), via 15 explicit `UPDATE property SET photos = '…'::jsonb WHERE id = '…'::uuid;` statements keyed on the known IDs.

The SQL must be idempotent-safe for Flyway (a normal forward migration; no `IF NOT EXISTS` needed since it runs once). Wrap inserts in a single `INSERT … VALUES (...),(...);` per city or one big statement — match V7's style.

**Verify:**
- `./gradlew -p backend test` → green. This is the key check: the Testcontainers integration tests run **all** migrations incl. V11 on a fresh Postgres, so any SQL error / constraint violation fails fast. Confirm ArchUnit + integration tests still pass (none assert property counts).
- Commit the generator script AND the generated `V11__more_seed_data.sql`.
Commit: `feat(seed): add ~105 properties across BCN/MAD/SEV/LIS + real photos (V11)`

### Task 2: live verification + PR
- Apply V11 to the running dev DB: restart the backend (`backend/gradlew -p backend bootRun` re-runs Flyway) OR run the flyway migrate task; then:
  - `curl "http://localhost:8080/api/v1/properties/search?sw_lat=37.2&sw_lng=-6.1&ne_lat=37.5&ne_lng=-5.8&check_in=2026-08-01&check_out=2026-08-04"` → expect ~30 Sevilla results.
  - `curl` one new property → photos are loremflickr URLs (≥3).
  - Optional: open the app, search Sevilla, confirm cards + map markers + gallery show real photos.
- `git push` + PR (base main). Note: closes/implements the "more seed data" request; existing 15 photos upgraded too.

## Notes
- No availability/booking/review rows for new properties (search ignores dates; review_count=0 keeps UI consistent). A future pass could seed reviews + some booked dates for realism.
- If LoremFlickr proves slow in the browser, switch the generator's `photo_url()` to Picsum (`https://picsum.photos/seed/{seed}/800/600`) and regenerate — one-function change.
