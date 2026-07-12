# Fix seed photos — real interior images (V12)

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Data/migration fix. Verified by the Testcontainers test run + a live check. No app code changes.

## Problem
The V11 seed photos use LoremFlickr keyworded URLs (`loremflickr.com/800/600/apartment,interior?lock=N`). LoremFlickr's keyword matching is loose → it returns random Flickr photos tagged with the word, many of which are **not interiors/flats**. User reported the pics don't look like flats.

## Fix
`V11__more_seed_data.sql` is **already merged + applied** → it's frozen (Flyway checksum; must NOT be edited or regenerated). So add a NEW migration **`V12__fix_seed_photos.sql`** that `UPDATE`s the `photos` JSONB of **all 120 properties** (the 105 new `dddddddd-…` + the 15 existing `cccccccc-…`) to a **curated pool of real Unsplash interior/property photos** (all HTTP-200 verified). Update the generator so the pool is the source of truth for future migrations too.

## Curated pool (ALL verified HTTP 200 with `?w=800&q=80&auto=format&fit=crop`)
URL template: `https://images.unsplash.com/photo-{id}?w=800&q=80&auto=format&fit=crop`

- **LIVING** (caption "Living room"): `1631679706909-1844bbd07221`, `1618220179428-22790b461013`, `1616047006789-b7af5afb8c20`, `1598928506311-c55ded91a20c`, `1605774337664-7a846e9cdf17`, `1632829882891-5047ccc421bc`, `1554995207-c18c203602cb`, `1618221195710-dd6b41faaea6`, `1583847268964-b28dc8f51f92`, `1560448204-e02f11c3d0e2`
- **BEDROOM** (caption "Bedroom"): `1502672260266-1c1ef2d93688`, `1522708323590-d24dbb6b0267`, `1586023492125-27b2c045efd7`, `1493809842364-78817add7ffb`, `1512918728675-ed5a9ecdebfd`, `1585128792020-803d29415281`
- **KITCHEN** (caption "Kitchen"): `1600489000022-c2086d79f9d4`, `1556911220-bff31c812dba`, `1617228069096-4638a7ffc906`, `1622372738946-62e02505feb3`, `1565538810643-b5bdb714032a`, `1507089947368-19c1da9775ae`, `1632583824020-937ae9564495`, `1556912167-f556f1f39fdf`, `1588854337221-4cf9fa96059c`, `1600684388091-627109f3cd60`, `1484154218962-a197022b5858`
- **INTERIOR** (caption "Interior"): `1564078516393-cf04bd966897`, `1613575831056-0acd5da8f085`, `1675279200694-8529c73b1fd0`, `1628592102751-ba83b0314276`, `1665249934445-1de680641f50`, `1556020685-ae41abfc9365`
- **EXTERIOR** (caption "Terrace"): `1580587771525-78b9dba3b914`, `1613490493576-7fde63acd811`, `1531971589569-0d9370cbe1e5`, `1512917774080-9991f1c4c750`, `1505843513577-22bb7d21e455`, `1706808849780-7a04fbac83ef`, `1582268611958-ebfd161ef9cf`, `1600596542815-ffad4c1539a9`, `1544984243-ec57ea16fe25`

## Per-property photo set (deterministic)
For each property, by stable global index `g` (0-based, in the same order the generator iterates: existing 15 first or new 105 — any fixed order, just be deterministic) and property_type:
- photo 1 = LIVING[g % len]  → "Living room", order 1
- photo 2 = BEDROOM[g % len] → "Bedroom", order 2
- photo 3 = KITCHEN[g % len] → "Kitchen", order 3
- photo 4 = INTERIOR[(g+1) % len] → "Interior", order 4  (apartments/studios stop here = 4 photos; studios may stop at 3)
- photo 5 = EXTERIOR[g % len] → "Terrace", order 5  (only for house/villa/cabin → 5 photos)
Vary count 3–5 by type so galleries differ. Use a small per-bucket offset (e.g. `+1`) so different properties don't always land on parallel indices. Captions MUST match the bucket.

---

### Task 1: update generator + emit `V12`
**Files:** `backend/src/main/resources/db/migration/scripts/generate_v11_seed.py` (extend) and NEW `backend/src/main/resources/db/migration/V12__fix_seed_photos.sql` (committed).
- **Do NOT modify or regenerate `V11__more_seed_data.sql`** (it's applied; editing it breaks Flyway validation). Leave that file byte-for-byte unchanged.
- In the generator: add the curated `UNSPLASH_POOL` (the buckets above) + a `build_unsplash_photos(global_index, property_type)` function returning the `[{url,caption,order}]` array per the spec. Add a `generate_v12()` entrypoint that re-derives ALL 120 property IDs (reuse the existing `dddddddd-…` derivation for the 105 + the known `EXISTING_PROPERTIES` 15 `cccccccc-…` list) and emits `V12__fix_seed_photos.sql` = one `UPDATE property SET photos='…'::jsonb WHERE id='…'::uuid;` per property (120 statements). Keep the existing V11 code path intact and untouched (so re-running it would still produce the identical frozen V11 — but you won't run it).
- Make it deterministic (re-running `generate_v12()` produces an identical file). Escape JSON properly; ensure each photos array length ≥ 1 (it'll be 3–5).
- Section comment at top of V12 explaining it replaces the LoremFlickr photos with curated Unsplash interiors.

**Verify:**
- `python3 …/scripts/generate_v11_seed.py --v12` (or however you wire the entrypoint) writes V12; re-run → identical (deterministic).
- `backend/gradlew -p backend test` → green. Testcontainers applies V11 then V12 on a fresh Postgres; any bad SQL fails here. (No test asserts photo content.)
- Grep V12: exactly 120 `UPDATE property SET photos` statements; every URL is `https://images.unsplash.com/photo-`; no `loremflickr`.
Commit: `fix(seed): replace seed photos with curated real interior images (V12)`

### Task 2: live verify + PR
- Apply V12 to dev DB (restart backend: `backend/gradlew -p backend bootRun` reruns Flyway). Then:
  - `curl` a new Sevilla property (`dddddddd-dddd-dddd-dddd-000000040001`) and an existing one (`cccccccc-cccc-cccc-cccc-000000001001`) → photos are `images.unsplash.com` URLs (≥3), captions match.
  - `curl -sI` the first photo URL of each → HTTP 200.
- Push + PR (base main).

## Notes
- These are real, hotlinked Unsplash CDN URLs (reliable, unlike the deprecated source.unsplash.com). Fine for a demo; for a real product, mirror them into your own object storage/CDN.
- Photos repeat across the 120 properties (pool of ~42) — acceptable for a demo; the rotation + per-type variation keeps galleries from looking identical.
