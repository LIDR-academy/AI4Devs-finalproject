## Context

KAN-40 grid has four pie slots. Genre uses horizontal bars; format uses a list; audience and rating are placeholders. Stats API returns `genre_distribution` and `format_distribution` only.

## Goals / Non-Goals

**Goals:** API extensions; accessible SVG pie charts for all four slots; token-based slice colors with text legends.

**Non-Goals:** Bar charts (KAN-42); `recharts` dependency.

## Decisions

- **SVG pie slices** over CSS `conic-gradient` for per-slice `aria` and legend pairing.
- **Reuse `StatsService.distribution()`** for audience (`b.audience`); new `ratingDistribution()` grouping `rr.rating` where not null, rounded to half-star steps.
- **Rating labels** formatted via existing `formatRatingLabel` / locale number (e.g. `3.5`).
- **Empty slices:** chart slot shows placeholder when distribution array is empty.

## Risks / Trade-offs

- **[Many genre labels]** → cap legend scroll in card body; pie still renders all slices.
- **[Color-only meaning]** → mitigated by legend text + `aria-label` summary.
