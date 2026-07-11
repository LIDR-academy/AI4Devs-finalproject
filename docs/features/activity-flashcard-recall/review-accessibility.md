# Review — Accessibility (WCAG 2.2 AA)

**Status:** Round 2 re-review — MAJOR finding resolved. No new findings.

---

## Round-1 MAJOR Finding — RESOLVED

**File:** `libs/activities/src/organisms/flashcard/use-flashcard.ts:26–29`

**Original issue:** Announce effect broadcast only `labels.answerHeading` ("Answer") instead of the actual revealed answer content (`slide.back`).

**Fix verified:**

The effect now announces `` `${labels.answerHeading}: ${slide.back}` `` (e.g., "Answer: Chlorophyll"):

```ts
useEffect(() => {
  if (!isRevealed || Platform.OS === 'android') return;
  AccessibilityInfo.announceForAccessibility(`${labels.answerHeading}: ${slide.back}`);
}, [isRevealed, labels.answerHeading, slide.back]);
```

- ✓ Announces the actual answer text (`slide.back`), not just a generic heading
- ✓ Effect dependencies correctly include `slide.back` to re-announce on answer change
- ✓ Test (`use-flashcard.test.ts:97–108`) verifies the announced string contains both `slide.back` and `labels.answerHeading` via `expect.stringContaining`

**Satisfies spec & rubric:**
- Spec @s10: "the revealed answer is announced to assistive technology" — the answer content is now part of the announcement ✓
- WCAG 4.1.3 (Status Messages, AA): the status announcement is meaningful; screen reader users now hear what the answer is without manual tree navigation ✓
- Sibling pattern: matches `matching` and `fill-in-the-blank` organisms which announce meaningful domain content ✓

---

## Rest of Rubric — No Regressions

Verified no accessibility changes outside the announce string. All rubric items remain passing:

✓ Roles/labels: reveal button and self-mark buttons unchanged; button roles and labels still present (`flashcard.test.tsx:306–327`)
✓ Color contrast & touch targets: unchanged; still use theme tokens and `minHeight: layout.touchTarget`
✓ Focus/reading order: unchanged; no custom focus management introduced
✓ Dynamic type support: unchanged; still using theme.typography tokens and minHeight containers
✓ State changes: announce effect fix improves conveyance; no regression to locked-state label change or disabled state

---

## Verdict

**RESOLVED** — MAJOR finding addressed. Announce string now conveys the actual revealed answer to assistive technology, satisfying spec @s10 and WCAG 4.1.3. No regressions to remaining rubric coverage.
