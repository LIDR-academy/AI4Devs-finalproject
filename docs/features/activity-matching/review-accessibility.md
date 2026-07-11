# review-accessibility — activity-matching (FULL review, Round 2)

**Verdict: APPROVED**

Scope: `Matching` organism + a11y tests + `MatchingActivity` wiring. Rubric §5 (WCAG 2.2 AA) + @s17 / AC17. Re-verified Round 1 B1 + M1.

---

## Round 1 findings — verified fixed

### B1 (blocker) — FIXED — correct-item label contrast (WCAG 1.4.3)

`matching.tsx:281-282` (`itemLabel` when `state === 'correct'`) now uses `theme.colors.onTertiaryContainer` on `mixHex(tertiaryContainer, surface, 0.55)` (`:253-256`).

Measured contrast:
| Theme | fg / bg | Ratio |
|---|---|---|
| Light | `#300f02` on `#fdeae1` | **~15.1:1** |
| Dark | `#ffded1` on `#472416` | **~10.9:1** |

Both ≥ 4.5:1. Old `onTertiary` pairing remains ~1.16 / ~1.03 — no longer used. Test assert: `matching.test.tsx:706`.

### M1 (major) — FIXED — pending vs paired distinct a11y state (@s17)

`matching.tsx:163-167`:

```ts
accessibilityState={{
  disabled: locked,
  selected: state === 'pending',
  checked: state === 'paired',
}}
```

Pending → `selected: true, checked: false`; paired → `selected: false, checked: true`. Distinct interaction outcomes are now distinguishable without color (WCAG 4.1.2). Test: `matching.test.tsx:347-360`.

---

## Full rubric re-check (no new findings)

| Check | Evidence |
|---|---|
| Button role + label | `matching.tsx:161-162`; tests `:340-345` |
| Pending ≠ paired via state | `:163-167`; test `:347-360` |
| Correctness not color-only | Icon `check_circle`/`cancel` + label suffix `correctPair`/`incorrectPair` (`:148-149`, `:155-173`); tests `:362-373` |
| Result announced | iOS/web: `AccessibilityInfo.announceForAccessibility` (`:84-90`); Android skip + live region (`:192-198`); tests `:376-455` |
| Touch targets ≥44pt/48dp | `minHeight: theme.layout.touchTarget` (48) `:237`; test `:316-318` |
| Contrast ≥4.5:1 (all item states) | pending ~13.3, paired ~13.6, correct ~15.1, incorrect ~12.7, default ~16.5 (light); dark all ≥7.6 |
| Submit control | `Button` + label; disabled until all paired (`:185-188`) |
| Unavailable / empty / error | Non-interactive notice; no buttons (`:93-98`) |
| Focus / reading order | Prompt → left → right → Submit → banner → explanation |
| Dynamic type | Theme typography; no `allowFontScaling={false}` / clamp on item/prompt/banner |
| Wrapper a11y | `MatchingActivity` injects `t()` labels + result only; no regressions |

---

## Disposition

0 open findings. B1 + M1 resolved with file:line + measured contrast evidence. **APPROVED.**
