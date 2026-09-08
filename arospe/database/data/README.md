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

## `es-municipalities.csv`

**Provenance.** Story 0032 (shipping geography catalog). Spain's municipio-level
administrative division at INE (Instituto Nacional de Estadística) granularity, sourced
2026-09-06 from [codeforspain/ds-organizacion-administrativa](https://github.com/codeforspain/ds-organizacion-administrativa)
(`municipios.csv`, `provincias.csv`, `autonomias.csv`) — a civic-tech community mirror
of INE's own official municipality-code publication (INEbase, "Relación de municipios y
sus códigos por provincias"). The underlying data is Spanish public sector information
(administrative codes and official names), reusable per Spain's `Ley 37/2007` /
`Real Decreto 1495/2011` and INE's own reuse notice at
[ine.es/aviso_legal](https://www.ine.es/aviso_legal) — the same reasoning this project
already applies to `iso-3166-countries.json` above (a snapshot of a public standard,
not a licensed third-party product). **Stated plainly rather than left implicit**: the
source repository itself carries no `LICENSE` file (checked via the GitHub API,
`"license": null`) — the redistribution argument above rests entirely on the
*underlying* data's own public-sector-information status, not on any license grant
from that repository. If this reasoning is ever challenged, the fallback is to
re-derive this file directly from INE's own official "Relación de municipios y sus
códigos por provincias" publication rather than through this intermediary. 8,130
municipio rows, one comunidad autónoma (never a third "provincia" file) and one
country column embedded per row:

```csv
ine_code,name,province_name,community_ine_code,community_name
15030,A Coruña,A Coruña,12,Galicia
```

- `ine_code` — the real INE municipio code (province code + municipio code, 5 digits),
  globally unique across the whole file.
- `name` — the municipio's display name. Source names using INE's own
  alphabetization convention (trailing article, `"Coruña, A"`) were rewritten to
  natural Spanish word order (`"A Coruña"`) at build time — see "Deliberate
  transformations" below.
- `province_name` — denormalized on the municipio row (a column, never a fourth
  catalog level — see [database/schema.md](../../docs/database/schema.md#geography_entries));
  same word-order rewrite applied.
- `community_ine_code` / `community_name` — the parent comunidad autónoma's own
  2-digit code (`01`–`17`) and display name. `GeographyCatalogSeeder` derives the 17
  comunidad rows by de-duplicating these two columns while streaming this file, so
  there is no separate comunidades fixture to keep in sync with it.

**Deliberate transformations, all applied at build time, not at seed time:**

- **Ceuta and Melilla are excluded.** They are autonomous cities, not comunidades
  autónomas, and the PRD's own acceptance criterion fixes the community count at
  **17** — not 19. Their two provinces (`51`, `52`) and their one municipio each are
  dropped from the source before this file is written. This is why the municipio count
  here (8,130) is two below the source's raw 8,132.
- **INE's trailing-article alphabetization order was rewritten to natural word order**
  (`"Coruña, A"` → `"A Coruña"`, `"Rioja, La"` → `"La Rioja"`) for every affected
  municipio, province and comunidad name (486 municipio names affected) — so a seeded
  name reads the way an administrator would actually type or read it, and so it matches
  this story's own Gherkin scenario verbatim ("look up the municipio 'A Coruña'").
- **Mojibake (double-encoded UTF-8) in the source `autonomias.csv` was corrected**
  before any name was written here — verified by inspecting the raw bytes, not
  assumed from how the text rendered.
- **Comunidad autónoma display names are the common/natural form**, not INE's own
  disambiguated form (`"Asturias"`, not `"Asturias, Principado de"`; `"Región de
  Murcia"`, not `"Murcia, Región de"`) — chosen to match this story's own Gherkin
  wording and to read naturally in a picker.

**Province → comunidad autónoma mapping** is standard, well-known Spanish territorial
organization (50 mainland/island provinces, 17 comunidades autónomas) and is not
itself sourced from the CSVs above — it is a hand-verified `public const`-shaped
mapping table in the one-off build script this file's provenance describes, not
re-derivable from `es-municipalities.csv` alone without also trusting that mapping.

**Ownership.** Story 0032 owns this file exclusively — unlike `iso-3166-countries.json`
above, no other story reads it.

**Refreshing the list.** This is a committed snapshot tied to a specific INE
publication vintage (accessed 2026-09-06), not a live lookup — a municipio that
merges, splits or is renamed after that date is not autodetected. `GeographyCatalogSeeder`
always refreshes every seeder-owned column (`name`, `parent_id`, `province_name`) on
re-seed (see [database/seeders/GeographyCatalogSeeder.php](../seeders/GeographyCatalogSeeder.php)),
so a corrected name reaches an already-deployed install on the next deploy with no
extra migration. No test in this repo hardcodes the municipio count — every count
assertion resolves against this file's own parsed row count, since it changes between
INE vintages as municipalities merge or split.
