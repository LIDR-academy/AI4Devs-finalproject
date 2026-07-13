# Accessibility Review — ai-lesson-generation

**Verdict: CONDITIONAL PASS** (1 critical regression + 1 pre-existing touch-target concern)

---

## Critical Finding: RadioGroup Selection State Not Exposed

**File**: `libs/components/src/molecules/radio-group/radio-group.tsx:46`  
**Severity**: CRITICAL  
**Criterion**: WCAG 4.1.2 (Name, Role, State)  
**Impact**: Selection state (`aria-checked`) not propagated to screen readers on React Native Web.

### Issue
RadioGroup renders individual radio options using `aria-checked={selected}` (line 46):
```tsx
<Pressable
  accessibilityRole="radio"
  aria-checked={selected}    // ❌ HTML-only attribute
  disabled={disabled}
  ...
/>
```

React Native does not recognize HTML-only attributes like `aria-checked`. The component's `accessibilityState` prop is not set, so React Native Web cannot derive `aria-checked` for the resulting DOM element. The corresponding test (`radio-group.test.tsx:20–25`) expects `accessibilityState.checked`, confirming the regression:
```tsx
expect(selectedOption.props.accessibilityState).toMatchObject({
  checked: true,   // Test expects this
  disabled: false,
  selected: undefined,
});
```

### Fix Required
Replace `aria-checked={selected}` with proper React Native property:
```tsx
<Pressable
  accessibilityRole="radio"
  accessibilityState={{ checked: selected, disabled }}
  disabled={disabled}
  ...
/>
```

---

## Verified: Radiogroup Role + Group Label

**File**: `libs/components/src/molecules/radio-group/radio-group.tsx:36–37`  
**Status**: ✓ PASS  
**Criterion**: WCAG 1.3.1 (Info and Relationships)

The View container correctly exposes `accessibilityRole="radiogroup"` and forwards `accessibilityLabel` (task-15 addition, lines 13–15, 37). `LessonGenerationPanel` passes `accessibilityLabel={t('generation.composition.heading')}` (line 65 of lesson-generation-panel.tsx). Both RTL tests and Playwright e2e verify this:
- `radio-group.test.tsx:40–52` — group accessible label assertion via `getByLabelText()`
- `lesson-generation-panel.test.tsx:109–122` — picker group label assertion
- `lesson-generation-panel.e2e.js:99–108` — e2e verifies `[role="radiogroup"]` with `aria-label`

---

## Verified: Generation Progress Live Region

**File**: `libs/components/src/molecules/generation-progress/generation-progress.tsx:53–59`  
**Status**: ✓ PASS  
**Criterion**: WCAG 4.1.3 (Status Messages)

Current step announced via polite live region (not assertive, as specified in task-15):
```tsx
<Text
  testID={GENERATION_PROGRESS_ANNOUNCEMENT_TEST_ID}
  accessibilityLiveRegion="polite"  // ✓ Correct: polite, not assertive
>
  {currentLabel}
</Text>
```

Test assertion confirmed (`generation-progress.test.tsx:47–52`): `accessibilityLiveRegion="polite"`.

---

## Verified: Error State Alert Role + Assertive Live Region

**File**: `libs/components/src/organisms/lesson-generation-panel/lesson-generation-panel.tsx:92–95`  
**Status**: ✓ PASS  
**Criterion**: WCAG 4.1.3 (Status Messages)

Error state uses assertive live region correctly:
```tsx
{state === 'error' ? (
  <View accessibilityRole="alert">
    <Text accessibilityLiveRegion="assertive">  // ✓ Correct: assertive for errors
      {errorMessage}
    </Text>
  </View>
) : null}
```

Test assertion confirmed (`lesson-generation-panel.test.tsx:216–231`): parent has `accessibilityRole="alert"`, text has `accessibilityLiveRegion="assertive"`.

---

## Verified: Button Accessible Name + Disabled State

**File**: `libs/components/src/atoms/button/button.tsx:109–125`  
**Status**: ✓ PASS  
**Criterion**: WCAG 4.1.2, 3.2.1 (Name, Role, State)

Button component properly conveys:
- **Role**: `accessibilityRole="button"` (line 110)
- **Disabled state**: `disabled={disabled}` prop (line 111) + visual opacity (line 145)
- **Accessible name**: Label text via children

Tests in `lesson-generation-panel.test.tsx` verify disabled/enabled states via role queries:
```tsx
screen.getByRole('button', { name: 'generation.generate', disabled: true })
screen.getByRole('button', { name: 'generation.generate', disabled: false })
```

---

## Verified: Touch Targets (Button)

**File**: `libs/components/src/atoms/button/button.tsx:41–48`  
**Status**: ✓ PASS  
**Criterion**: WCAG 2.5.5 (Target Size, AAA level)

Button implements 48dp touch target (AAA) via `hitSlop` expansion:
```typescript
const layout = { touchTarget: 48 }  // spacing.ts:35
const HIT_SLOP: Record<ButtonSize, Insets> = …
  Math.max(0, (layout.touchTarget - height) / 2)  // Expands visual size
```

---

## Pre-existing Concern: RadioGroup Touch Target

**File**: `libs/components/src/molecules/radio-group/radio-group.tsx:67–81`  
**Severity**: MEDIUM  
**Criterion**: WCAG 2.5.5 (Target Size, AA level minimum = 44pt)  
**Status**: Pre-existing (not a regression)

The Pressable wrapping each radio option (`styles.option`, lines 67–73) has no explicit `minHeight` or `hitSlop`. The visual ring is hardcoded to `20 × 20` (lines 75–81), and the label height depends on typography. The overall Pressable touch target size is not guaranteed to reach 44pt minimum. This is not a new regression (pre-dates this feature) but should be addressed in a future a11y hardening pass.

Mitigation: Consider adding `minHeight: layout.touchTarget` (or at least 44) and/or `hitSlop` to `styles.option`.

---

## Verified: Dynamic Type Support

**File**: `libs/components/src/atoms/button/button.tsx:147–150`  
**Status**: ✓ PASS  
**Criterion**: WCAG 1.4.4 (Resize Text)

Button uses `minHeight` (not `height`), allowing enlarged Dynamic Type labels to grow the box without clipping. Typography tokens are applied via `theme.typography.*`, which scale with system settings.

RadioGroup label similarly uses `theme.typography.bodyLarge` (line 90–92 of radio-group.tsx), supporting dynamic scaling.

---

## Verified: Color Contrast

**Status**: ✓ PASS (MD3 design system)  
**Criterion**: WCAG 1.4.3 (Contrast, AA minimum = 4.5:1)

All text colors use Material Design 3 theme tokens (palette colors pre-calculated for contrast compliance). Light and dark color schemes provided (`colors.ts:138–210`). No custom color values or hardcoded hex override safe defaults.

---

## Verified: Focus & Reading Order

**Status**: ✓ PASS  
**Criterion**: WCAG 2.4.3, 1.3.2 (Focus Order, Reading Order)

- RadioGroup options render in document order (single-select, no custom focus order required)
- GenerationProgress steps render as a list (`accessibilityRole="list"`) with individual step items labeled
- LessonGenerationPanel layout uses semantic sections; error banner positioned last (after content)
- Button focus indicators are handled by state-layer machinery (WCAG 2.4.7 visible focus indicator via `focus` handler + state layer)

---

## Summary

- **4 a11y features verified** ✓ (group label, live regions, alert role, button states)
- **1 critical regression** ❌ (RadioGroup `aria-checked` vs `accessibilityState.checked`)
- **1 pre-existing touch-target concern** ⚠ (RadioGroup options < 44pt, not a new regression)

**Blocking Issue**: RadioGroup selection state not exposed. Test-to-code mismatch must be resolved before merge.
