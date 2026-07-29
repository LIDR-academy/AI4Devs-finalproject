# Command: /analyze-listing

## Description

Runs the full Listing Lens analysis on a URL: fetch HTML → extract text → resolve location → LLM analysis → catastro cross-reference → return TransparencyReport.

## Usage

```
/analyze-listing <url>
```

## Example

```
/analyze-listing https://www.idealista.com/inmueble/12345678/
```

## What it does

1. Validate URL (must be a portal domain in the allowlist, see `.env.example` → `ALLOWED_PORTALS`).
2. `CheerioAdapter.fetch(url)` — fetch and parse HTML. Fallback to `.m.` subdominium if blocked (FR-027).
3. `DeclaredLocationAdapter.extract(html)` — extract declared address.
4. `GeocodingAdapter.geocode(address)` — convert to coordinates (Nominatim).
5. If coordinates resolved: `CatastroAdapter.lookup(coords)` — cross-reference.
6. `OpenRouterAdapter.analyze(text)` — LLM system prompt → JSON with red flags, `reasoning` per flag, transparency score.
7. `SnapshotHash.compute(canonicalListing)` — SHA-256 of canonical content.
8. `DiffService.diff(newSnapshot, previousSnapshot)` — if re-analysis.
9. Persist `AnalyzedListing` (FR-011: no HTML/text stored).
10. Emit progress events: `fetching_html` → `resolving_location` → `analyzing` → `cross_referencing_cadastro` (FR-018).
11. Return `TransparencyReport` + `processSummary` (FR-014).

## Timeout

SLA: 15 seconds (SC-001). Parallelise fetch + location resolution with `Promise.all` (T037f).

## Errors

| Error | Response |
|---|---|
| URL invalid / 404 | 400 with `error: 'INVALID_URL'` |
| Portal blocked (3+ consecutive failures) | 503 with `error: 'PORTAL_BLOCKED'` and suggestion to paste text manually |
| LLM returns malformed JSON after 2 retries | 502 with `error: 'LLM_MALFORMED_RESPONSE'` and manual-paste CTA |
| Catastro SEC down | 200 with `cadastro: null` and `warning: 'cadastro_unavailable'` |
| Rate limit exceeded (20/day) | 429 with `error: 'RATE_LIMIT_EXCEEDED'` |
