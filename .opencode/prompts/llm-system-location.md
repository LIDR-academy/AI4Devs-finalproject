# Prompt-Run: llm-system-location

## Status: DEPRECATED (removed per FR-016)

This prompt is **kept for historical reference only**. It is NOT used in the current implementation.

## Why deprecated

The original spec assumed an LLM Vision adapter (`LLMVisionLocationAdapter`) that would look at the listing photos and infer the address. Critical review during Entrega 1 identified this as technically infeasible:

> Photos of apartment interiors (bathrooms, kitchens, hallways) do not contain visual GPS signal. Neither LLMs nor any vision model can reliably infer a Spanish street address from a photo of a tiled kitchen.

Per **FR-016** (revised in the critical review commit), the location resolver chain was simplified to:

1. `DeclaredLocationAdapter` — extract address from the listing HTML
2. `GeocodingAdapter` — convert address to coordinates via Nominatim

If no declared address is found, the system marks `catastro: null` and continues the listing analysis without cadastral verification. The listing analysis itself remains valid (other red flags still apply).

## Original prompt (for historical reference)

```
You are a location-inference specialist. Given a set of real-estate listing photos, identify visual clues about the property's location.

Look for:
- Street signs (in Spanish)
- License plates (format indicates region)
- Shop signs or landmarks
- Architectural style (regional indicators)
- Mountain or sea views
- Sky/vegetation indicators

Return a JSON object with:
{
  "inferredNeighbourhood": "<best guess, or null>",
  "inferredCity": "<best guess, or null>",
  "confidence": <0.0 to 1.0>,
  "visualClues": ["<list of clues observed>"]
}
```

## Why this never worked

- Photos rarely contain identifying text
- License plates are typically not visible
- Architectural style alone is insufficient at street level
- The model hallucinated addresses with high confidence

## Migration

The location resolver was rewritten in commit `c8c8546` (fix: location resolver chain from 3 to 2 adapters). The `LLMVisionLocationAdapter` was removed from the codebase.

## Reference

- FR-016 in `specs/001-realista-mvp/spec.md`
- ADR-004 in `docs/adr/`
- Commit history: `c8c8546 fix(prompts): update location resolver chain from 3 to 2 adapters`
