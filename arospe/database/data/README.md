# `database/data/`

Bundled, version-controlled fixture data — not a `database/seeders/` class, but a
data source one or more seeders read. Per [PRD §2.4](../../docs/PRD/PRD.md#24-shipping),
this app ships country fixtures as JSON files under this directory rather than pulling
them from a Composer package (`league/iso3166`, `symfony/intl`), so the exact list is
reviewable in a diff and needs no dependency approval.

## `iso-3166-countries.json`

**Provenance.** A snapshot of the ISO 3166-1 alpha-2 country code list, hand-compiled
against the current published standard on 2026-08-19 for story 0016. 249 entries, one
JSON object per line for reviewable diffs. Each entry carries only identity — no rate,
default flag, fiscal, or shipping data:

```json
{"alpha2": "ES", "name_es": "España", "name_en": "Spain"}
```

- `alpha2` — the ISO 3166-1 alpha-2 code, uppercase, two letters.
- `name_es` — the Spanish common name, written into `sales_regions.name` by
  [`database/seeders/SalesRegionSeeder.php`](../seeders/SalesRegionSeeder.php)
  (this store's install-default content language — see D6 in the story).
- `name_en` — the English common name, carried as forward insurance for a future
  locale-aware display; no seeder writes it into any column today.

**Deliberately excluded:**

- Retired/superseded ISO 3166-1 codes (`UK`, `AN`, `CS`, `YU`) and the EU are not
  entries in this standard and must never appear here.
- Spain's five fiscal sub-territories (Península, Baleares, Canarias, Ceuta, Melilla)
  are **not** ISO 3166-1 entities — they are a `public const` on `SalesRegionSeeder`,
  not rows in this file. Spain itself (`ES`) is an ordinary country entry here.

**Ownership.** Story 0016 owns this file; story 0032 (shipping geography catalog)
consumes it **read-only** as a shared identity source, per
[`contracts.md`](../../docs/contracts.md#parallel-agent-file-ownership-rule).

**Refreshing the list.** This is a committed snapshot, not a live lookup — a country
that changes its name or is removed from the standard is not autodetected. To refresh:
regenerate the file (keeping the one-object-per-line format so the diff stays
reviewable), verify it against `tests/Feature/Seeders/SalesRegionSeederTest.php`'s
shape/blacklist/anchor assertions, then re-run the seeder — `SalesRegionSeeder` always
overwrites `name` on re-seed, so a corrected name reaches an already-deployed install
on the next deploy with no extra migration.
