# Mutation Testing Report — signup-and-lesson-persistence

## Pre-review final verify (after documentId-guard killer)
**Base-ref:** `9ff80d7` · **Score: 89.62% (328/366 detected)** | **38 survivors** | **PASS** (all equivalents)

Threshold = 100% killed on changed lines. Met via Equivalents: 0 unjustified survivors. Prior killable (`lesson-generation.tsx:36` `if (!documentId)→false`) now killed.

Prior pass: 89.34% / 39 survivors (1 killable + 38 equivalents). This re-run: that killable gone; 38 remaining all justified below.

Skipped: `@helsoft/services`, `@helsoft/logging-in-out`, `@helsoft/activities` (no changed mutate-able source).

| Lib | Total | Killed | Timeout | Survived | Score |
|---|---|---|---|---|---|
| `@helsoft/supabase-services` | 89 | 85 | 0 | 4 | 95.51% |
| `@helsoft/hooks` | 43 | 24 | 8 | 11 | 74.42% |
| `@helsoft/components` | 68 | 56 | 0 | 12 | 82.35% |
| `@helsoft/study-buddy` | 166 | 155 | 0 | 11 | 93.37% |
| **TOTAL** | **366** | **320** | **8** | **38** | **89.62%** |

Detected = killed + timeout. Score = detected / (detected + survived).

### Per-file (changed source)

#### `@helsoft/supabase-services`
| File | Total | Killed | Survived | Score |
|---|---|---|---|---|
| `lessons.dao.ts` | 15 | 15 | 0 | 100% |
| `lesson-generation.errors.ts` | 36 | 33 | 3 | 91.67% |
| `lesson-generation.persist.ts` | 6 | 6 | 0 | 100% |
| `lesson-generation.service.ts` | 14 | 13 | 1 | 92.86% |
| `lessons.service.ts` | 18 | 18 | 0 | 100% |

#### `@helsoft/hooks`
| File | Total | Killed | Timeout | Survived | Score |
|---|---|---|---|---|---|
| `use-lessons.ts` | 43 | 24 | 8 | 11 | 74.42% |

#### `@helsoft/components`
| File | Total | Killed | Survived | Score |
|---|---|---|---|---|
| `lesson-list-item.tsx` | 11 | 4 | 7 | 36.36% |
| `lesson-list.tsx` | 38 | 33 | 5 | 86.84% |
| `use-lesson-list.ts` | 19 | 19 | 0 | 100% |

#### `@helsoft/study-buddy`
| File | Total | Killed | Survived | Score |
|---|---|---|---|---|
| `lesson-generation.helpers.ts` | 56 | 56 | 0 | 100% |
| `lesson-generation.tsx` | 47 | 41 | 6 | 87.23% |
| `saved-lessons.helpers.ts` | 29 | 29 | 0 | 100% |
| `saved-lessons.tsx` | 34 | 29 | 5 | 85.29% |

---

## Survivors (unjustified / killable)

None.

---

## Equivalents

Still reported by Stryker; count toward threshold only with these justifications. Prior killable now removed: `lesson-generation.tsx:36` documentId guard.

### `@helsoft/supabase-services` (4)
- `lesson-generation.errors.ts:20` `typeof statusCode === 'number' → true` — non-number statusCode never matches later `=== 401|403|429`; same fallback `generation_failed`.
- `lesson-generation.errors.ts:32` `instanceof GenerationSchemaError → false` / branch emptied — schema branch returns same `{ generation_failed, 502 }` as final fallback.
- `lesson-generation.service.ts:49` `body?.errorCode → body.errorCode` — nullish body throws into existing `catch` → same `generation_failed`.

### `@helsoft/hooks` (`use-lessons.ts`) (11)
- `:21` cleanup emptied / `:21` cleanup → `() => undefined` / `:22` `isMounted=false→true` — React 19 no longer warns on setState-after-unmount; unobservable after unmount (race guards still tested while mounted).
- `:28` `++requestId → --requestId` — both yield unique monotonic ids; staleness compare identical.
- `:24`/`:44`/`:66` `useCallback` deps `[] → ["Stryker was here"]` — unused dep; callback body closes over nothing unstable.
- `:48`/`:52` `useEffect([load]) → []` / `refetch([load]) → []` — `load` identity stable (`useCallback([])`); empty deps equivalent.
- `:57`/`:61` delete `isMounted` guards — same React-19 silent setState-after-unmount; attempted console.error spies cannot observe.

### `@helsoft/components` (12)
- `lesson-list-item.tsx:36–56` StyleSheet object/string empties — layout-only; unit tests assert structure/a11y/behavior, not Unistyles tokens (brittle RN style asserts).
- `lesson-list.tsx:109–122` StyleSheet empties — same.
- `lesson-list.tsx:99` `onDelete?.(id) → onDelete(id)` — Dialog confirm only reachable when `onDelete` was provided to set `pendingDeleteId`; optional call unreachable when undefined.

### `@helsoft/study-buddy` (11)
- `saved-lessons.tsx:60–72` StyleSheet empties — layout-only; same as components.
- `lesson-generation.tsx:46` recovery fallback `'none'→""` / `:70` `recovery==='none'→false?` / `:70` `===""` — `'none'` has no action-label key; forced else still yields falsy label → no button (document_not_ready already asserts no action).
- `lesson-generation.tsx:51` `recovery==='signIn'→true` — after retry/settings branches only `none` remains; `none` has no action control to invoke.
- `lesson-generation.tsx:55` `isLessonComposition→true` — panel only emits valid composition values; invalid path unreachable without mocking the panel.
- `lesson-generation.tsx:56` composition `useCallback` deps `[]→["Stryker…"]` — unused dep; callback closes over setter only.

---

## Notes
- Final pre-review re-measure after documentId-guard killer.
- 38/38 survivors justified as equivalents; 0 killable.
- StyleSheet / unused-dep / React-19-silent-unmount survivors justified above — not silently ignored.

## Files measured
```
libs/supabase-services/src/dao/lessons.dao.ts
libs/supabase-services/src/services/lesson-generation.errors.ts
libs/supabase-services/src/services/lesson-generation.persist.ts
libs/supabase-services/src/services/lesson-generation.service.ts
libs/supabase-services/src/services/lessons.service.ts
libs/hooks/src/hooks/use-lessons.ts
libs/hooks/src/hooks/use-lessons.types.ts
libs/components/src/molecules/lesson-list-item/lesson-list-item.tsx
libs/components/src/molecules/lesson-list-item/lesson-list-item.types.ts
libs/components/src/organisms/lesson-list/lesson-list.tsx
libs/components/src/organisms/lesson-list/lesson-list.types.ts
libs/components/src/organisms/lesson-list/use-lesson-list.ts
libs/study-buddy/src/components/lesson-generation/lesson-generation.helpers.ts
libs/study-buddy/src/components/lesson-generation/lesson-generation.tsx
libs/study-buddy/src/components/saved-lessons/saved-lessons.helpers.ts
libs/study-buddy/src/components/saved-lessons/saved-lessons.tsx
```
