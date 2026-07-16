# Mutation Testing Report — pending-pdfs-generate

## Pre-review final verify (after round-2 kills + equivalents)
**Base-ref:** `bc82822` · **Score: 93.95% (388/413 detected)** | **25 survivors** | **PASS** (all equivalents)

Threshold = 100% killed on changed lines. Met via Equivalents: **0 unjustified survivors**.

Progress: r1 76.43%/95 → r2 92.25%/32 → **final 93.95%/25 (all justified)**.

Skipped: `@helsoft/services`, `@helsoft/logging-in-out`, `@helsoft/activities` (no changed mutate-able source).

| Lib | Killed | Timeout | Survived | Score |
|---|---|---|---|---|
| `@helsoft/supabase-services` | 55 | 0 | 0 | 100.00% |
| `@helsoft/hooks` | 24 | 8 | 11 | 74.42% |
| `@helsoft/components` | 163 | 0 | 13 | 92.61% |
| `@helsoft/study-buddy` | 138 | 0 | 1 | 99.28% |
| **TOTAL** | **380** | **8** | **25** | **93.95%** |

Detected = killed + timeout. Score = detected / (detected + survived).

### Per-file (changed source)

#### `@helsoft/supabase-services`
| File | Killed | Timeout | Survived | Score |
|---|---|---|---|---|
| `pdf-documents.dao.ts` | 31 | 0 | 0 | 100.00% |
| `lesson-generation.persist.ts` | 13 | 0 | 0 | 100.00% |
| `pdf-documents.service.ts` | 11 | 0 | 0 | 100.00% |

#### `@helsoft/hooks`
| File | Killed | Timeout | Survived | Score |
|---|---|---|---|---|
| `use-pdf-documents.reducer.ts` | 8 | 1 | 0 | 100.00% |
| `use-pdf-documents.ts` | 16 | 7 | 11 | 67.65% |

#### `@helsoft/components`
| File | Killed | Timeout | Survived | Score |
|---|---|---|---|---|
| `button.tsx` | 52 | 0 | 11 | 82.54% |
| `pdf-document-list-item.tsx` | 37 | 0 | 0 | 100.00% |
| `pdf-document-list.tsx` | 52 | 0 | 2 | 96.30% |
| `use-pdf-document-list.ts` | 22 | 0 | 0 | 100.00% |

#### `@helsoft/study-buddy`
| File | Killed | Timeout | Survived | Score |
|---|---|---|---|---|
| `lesson-generation.tsx` | 59 | 0 | 1 | 98.33% |
| `pdf-documents.helpers.ts` | 48 | 0 | 0 | 100.00% |
| `pdf-documents.tsx` | 31 | 0 | 0 | 100.00% |

---

## Survivors (unjustified / killable)

None.

---

## Equivalents (25)

Still reported by Stryker; count toward threshold only with these justifications. Killable r2 items (DAO guards, list flex/bg, button default-variant fg, null `lessonId` trim optional-chain, StyleSheet `info`/`root`/`list`/`errorBanner`) now killed.

### `@helsoft/hooks` (`use-pdf-documents.ts`) (11)
- `:19` cleanup → `undefined` / cleanup body `{}` / `:20` `isMounted=false→true` — React 19 no longer warns on setState-after-unmount; unobservable after unmount (race guards still tested while mounted).
- `:22`/`:41`/`:65` `useCallback`/`useEffect` deps `[] → ["Stryker was here"]` — unused dep; bodies close over refs/setters only (identity thrash asserted elsewhere does not change observed load/delete outcomes when dep is unused).
- `:26` `++requestId → --requestId` — both yield unique monotonic ids; staleness compare identical.
- `:45`/`:49` `useEffect([load]) → []` / `refetch([load]) → []` — `load` identity stable (`useCallback([])`); empty deps equivalent.
- `:54`/`:57` delete `isMounted` guards — same React-19 silent setState-after-unmount; not observable in RTL.

### `@helsoft/components` (13)
- `button.tsx:71` `useVariants({variant})→{}` + `:155–165` emptied `variants`/`variant`/`filled`/`tonal`/`elevated`/`outlined`/`text` ObjectLiterals + transparent `""` — Unistyles under Jest does **not** put `backgroundColor`/`borderWidth` on the flattened Pressable style (probe: layout/padding/minHeight only). Painted chrome covered by Playwright e2e.
- `button.tsx:81` `fgByVariant` deps `[theme]→[]` — theme is a stable Unistyles singleton in tests; colors never go stale.
- `pdf-document-list.tsx:37` `keyExtractor` deps `[]→["Stryker…"]` — unused dep; extractor closes over `item.id` only.
- `pdf-document-list.tsx:140` `listContent: {}` StyleSheet empty — layout-only padding; unit tests assert structure/a11y/behavior, not Unistyles tokens (brittle RN style asserts). Same prior-feature StyleSheet equivalent policy.

### `@helsoft/study-buddy` (1)
- `lesson-generation.tsx:68` composition `useCallback` deps `[]→["Stryker…"]` — unused dep; callback closes over setter only.

---

## Notes
- Final pre-review re-measure after round-2 killer tests + equivalent documentation.
- 25/25 survivors justified as equivalents; 0 killable.
- StyleSheet / unused-dep / React-19-silent-unmount / Unistyles-Jest-invisible-paint survivors justified above — not silently ignored.
- Timeouts (hooks×8) count as detected.

## Files measured
```
libs/supabase-services/src/dao/pdf-documents.dao.ts
libs/supabase-services/src/services/lesson-generation.persist.ts
libs/supabase-services/src/services/pdf-documents.service.ts
libs/hooks/src/hooks/use-pdf-documents.reducer.ts
libs/hooks/src/hooks/use-pdf-documents.ts
libs/hooks/src/hooks/use-pdf-documents.types.ts
libs/components/src/atoms/button/button.tsx
libs/components/src/molecules/pdf-document-list-item/pdf-document-list-item.tsx
libs/components/src/molecules/pdf-document-list-item/pdf-document-list-item.types.ts
libs/components/src/organisms/pdf-document-list/pdf-document-list.tsx
libs/components/src/organisms/pdf-document-list/pdf-document-list.types.ts
libs/components/src/organisms/pdf-document-list/use-pdf-document-list.ts
libs/study-buddy/src/components/lesson-generation/lesson-generation.tsx
libs/study-buddy/src/components/lesson-generation/lesson-generation.types.ts
libs/study-buddy/src/components/pdf-documents/pdf-documents.helpers.ts
libs/study-buddy/src/components/pdf-documents/pdf-documents.tsx
libs/study-buddy/src/components/pdf-documents/pdf-documents.types.ts
```

---

## Prior rounds
- **r1:** 76.43% / 95 survivors · FAIL
- **r2:** 92.25% / 32 survivors · FAIL (killables then addressed)

## Equivalent survivor inventory (audit)

### `@helsoft/hooks`
- `src/hooks/use-pdf-documents.ts:19:17` [BlockStatement] `() => () => { → () => () => {},`
- `src/hooks/use-pdf-documents.ts:20:27` [BooleanLiteral] `isMounted.current = false; → isMounted.current = true;`
- `src/hooks/use-pdf-documents.ts:19:5` [ArrowFunction] `() => () => { → () => undefined,`
- `src/hooks/use-pdf-documents.ts:22:5` [ArrayDeclaration] `[], → ["Stryker was here"],`
- `src/hooks/use-pdf-documents.ts:26:16` [UpdateOperator] `const id = ++requestId.current; → const id = --requestId.current;`
- `src/hooks/use-pdf-documents.ts:41:6` [ArrayDeclaration] `}, []); → }, ["Stryker was here"]);`
- `src/hooks/use-pdf-documents.ts:45:6` [ArrayDeclaration] `}, [load]); → }, []);`
- `src/hooks/use-pdf-documents.ts:49:6` [ArrayDeclaration] `}, [load]); → }, []);`
- `src/hooks/use-pdf-documents.ts:54:11` [ConditionalExpression] `if (!isMounted.current) return; → if (false) return;`
- `src/hooks/use-pdf-documents.ts:57:11` [ConditionalExpression] `if (isMounted.current) { → if (true) {`
- `src/hooks/use-pdf-documents.ts:65:6` [ArrayDeclaration] `}, []); → }, ["Stryker was here"]);`

### `@helsoft/components`
- `src/atoms/button/button.tsx:81:5` [ArrayDeclaration] `[theme], → [],`
- `src/atoms/button/button.tsx:71:22` [ObjectLiteral] `styles.useVariants({ variant }); → styles.useVariants({});`
- `src/atoms/button/button.tsx:155:15` [ObjectLiteral] `variants: { → variants: {},`
- `src/atoms/button/button.tsx:156:16` [ObjectLiteral] `variant: { → variant: {},`
- `src/atoms/button/button.tsx:157:17` [ObjectLiteral] `filled: { backgroundColor: theme.colors.primary }, → filled: {},`
- `src/atoms/button/button.tsx:158:16` [ObjectLiteral] `tonal: { backgroundColor: theme.colors.secondaryContainer }, → tonal: {},`
- `src/atoms/button/button.tsx:159:19` [ObjectLiteral] `elevated: { backgroundColor: theme.colors.surfaceContainerLow }, → elevated: {},`
- `src/atoms/button/button.tsx:160:19` [ObjectLiteral] `outlined: { → outlined: {},`
- `src/atoms/button/button.tsx:161:28` [StringLiteral] `backgroundColor: 'transparent', → backgroundColor: "",`
- `src/atoms/button/button.tsx:165:15` [ObjectLiteral] `text: { backgroundColor: 'transparent' }, → text: {},`
- `src/atoms/button/button.tsx:165:34` [StringLiteral] `text: { backgroundColor: 'transparent' }, → text: { backgroundColor: "" },`
- `src/organisms/pdf-document-list/pdf-document-list.tsx:37:80` [ArrayDeclaration] `const keyExtractor = useCallback((item: PdfDocumentListItemData) => item.id, []); → const keyExtractor = useCallback((item: PdfDocumentLi…`
- `src/organisms/pdf-document-list/pdf-document-list.tsx:140:16` [ObjectLiteral] `listContent: { → listContent: {},`

### `@helsoft/study-buddy`
- `src/components/lesson-generation/lesson-generation.tsx:68:6` [ArrayDeclaration] `}, []); → }, ["Stryker was here"]);`

---

## Post-review final verify (r2 — after killable fixes)
**Base-ref:** `8781bee2c998ee2165691bc906210fcaff7392bd` · **Score: 97.65% (208/213 detected)** | **5 survivors** | **PASS** (all equivalents)

Threshold = 100% killed on changed lines since pre-review sha. Met via Equivalents: **0 unjustified survivors**.

Progress: post-review r1 95.74%/4 killable → **r2 97.65%/5 (all justified)**.

Skipped: `@helsoft/services`, `@helsoft/hooks`, `@helsoft/logging-in-out`, `@helsoft/activities` (no changed mutate-able source since base-ref). Localization out of Stryker lib set.

| Lib | Killed | Timeout | Survived | No cov | Score |
|---|---|---|---|---|---|
| `@helsoft/supabase-services` | 59 | 7 | 0 | 0 | 100.00% |
| `@helsoft/components` | 68 | 26 | 5 | 0 | 94.95% |
| `@helsoft/study-buddy` | 41 | 7 | 0 | 0 | 100.00% |
| **TOTAL** | **168** | **40** | **5** | **0** | **97.65%** |

Detected = killed + timeout. Score = detected / (detected + survived + no-cov).

### Per-file (review-touched source)

#### `@helsoft/supabase-services`
| File | Killed | Timeout | Survived | No cov | Score |
|---|---|---|---|---|---|
| `pdf-documents.dao.ts` | 26 | 5 | 0 | 0 | 100.00% |
| `lesson-generation.persist.ts` | 15 | 2 | 0 | 0 | 100.00% |
| `pdf-documents.service.ts` | 18 | 0 | 0 | 0 | 100.00% |

#### `@helsoft/components`
| File | Killed | Timeout | Survived | No cov | Score |
|---|---|---|---|---|---|
| `pdf-document-list-item.tsx` | 12 | 26 | 0 | 0 | 100.00% |
| `pdf-document-list.tsx` | 56 | 0 | 5 | 0 | 91.80% |

#### `@helsoft/study-buddy`
| File | Killed | Timeout | Survived | No cov | Score |
|---|---|---|---|---|---|
| `pdf-documents.tsx` | 41 | 7 | 0 | 0 | 100.00% |

---

## Survivors (unjustified / killable) — post-review

None.

### Killed since post-review r1
1. `pdf-documents.dao.ts:51` NoCoverage `?? []` — null-data → `[]` test.
2. `pdf-document-list.tsx:39` `handleOpenLesson` deps → `[]` — latest `onOpenLesson` after prop update.
3. `pdf-documents.tsx:57` announce effect deps → `[]` — content → content+error transition announce.
4. `pdf-documents.tsx:90` StyleSheet `deleteError` empty — now killed (was r1 equivalent; suite bites paint/tokens here).

---

## Equivalents (5) — post-review r2

All in `@helsoft/components` (`pdf-document-list.tsx`):

- `:41` [OptionalChaining] `onRequestDelete?.(item.id) → onRequestDelete(item.id)` — `handleDelete` only wired when `onRequestDelete` truthy; `?.` unobservable.
- `:42` [ArrayDeclaration] `handleDelete` deps `[onRequestDelete, item.id] → []` — when provided, `onRequestDelete` is stable `handleRequestDelete` (`setPendingDeleteId`); FlatList `keyExtractor` remounts rows on id change so fresh `[]` closure still sees current `item.id` (document-replace test cannot observe emptied deps).
- `:87` [ArrayDeclaration] `handleRequestDelete` deps `[setPendingDeleteId] → []` — React setState identity stable.
- `:81` [ArrayDeclaration] `keyExtractor` deps `[] → ["Stryker was here"]` — unused dep; closes over `item.id` only.
- `:178` [ObjectLiteral] `listContent: { gap… } → {}` — Unistyles layout token; unit tests assert structure/a11y/behavior, not StyleSheet paint.

---

## Files measured (post-review scope)
```
libs/supabase-services/src/dao/pdf-documents.dao.ts
libs/supabase-services/src/services/lesson-generation.persist.ts
libs/supabase-services/src/services/pdf-documents.service.ts
libs/components/src/molecules/pdf-document-list-item/pdf-document-list-item.tsx
libs/components/src/organisms/pdf-document-list/pdf-document-list.tsx
libs/study-buddy/src/components/pdf-documents/pdf-documents.tsx
```

## Notes
- Post-review r2 re-measure vs `8781bee2` after implementer killable fixes.
- 5/5 remaining survivors justified as equivalents; 0 killable.
- Timeouts count as detected (components×26, study-buddy×7, supabase×7).
- Post-review r1 (95.74% / 4 killable) superseded by this section.
