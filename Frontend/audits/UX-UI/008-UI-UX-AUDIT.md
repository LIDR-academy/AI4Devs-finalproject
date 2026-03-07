# UI/UX Audit Report

**Date:** 2026-01-16  
**Scope:** Comprehensive audit of frontend components, services, and type definitions  
**Design Sources:** docs/ui-ux/DESIGN_SYSTEM_GUIDE.md, Frontend/tailwind.config.ts

## Summary
- 🔴 Critical: 0 issues
- 🟠 High: 2 issues
- 🟡 Medium: 4 issues
- 🟢 Low: 1 issue

## Findings

### 🔴 Critical Issues

*No critical issues found in this audit.*

---

### 🟠 High Priority Issues

> 🟠 **Architecture Issue:** Header component does not follow Design System Guide pattern `[←] Título [Acciones]` with standard height and layout
>
> **Location:** `Frontend/src/components/organisms/Header.tsx` around lines 28-74
>
> **Description:**
> The Header component uses a different layout pattern than specified in the Design System Guide. The DSG requires:
> - Pattern: `[←] Título [Acciones]` (back button, title, actions)
> - Height: 64px (h-16)
> - Padding: 24px horizontal (px-6)
> - Background: White (bg-white)
> - Border: 1px slate-200 inferior (border-b)
> - Sticky: top-0 z-40 when applicable
>
> The current implementation uses `max-w-md md:max-w-7xl` which is inconsistent with the mobile-first design, and the layout structure doesn't match the required pattern. The component also includes authentication logic that should be handled at the page level, not in the component itself.
>
> **Impact:**
> Inconsistent header appearance across pages breaks visual consistency and user expectations. The responsive breakpoint (`md:max-w-7xl`) contradicts the mobile-first approach specified in the Design System Guide. Users may experience confusion when navigating between pages with different header layouts.
>
> **Fix Prompt:**
> Refactor `Frontend/src/components/organisms/Header.tsx` to follow the Design System Guide pattern. Remove authentication logic from the component (move it to pages that use Header). Update the component to accept props: `title?: string`, `showBackButton?: boolean`, `backHref?: string`, `actions?: ReactNode`. Use `h-16` for height, `px-6` for horizontal padding, `bg-white border-b border-slate-200` for styling. Remove `max-w-md md:max-w-7xl` and use `max-w-md mx-auto` instead. Ensure the back button uses a Link component with proper navigation. Update all pages that use Header to pass the appropriate props.

> 🟠 **Architecture Issue:** EmailSearchInput makes direct API calls instead of using service layer, violating separation of concerns
>
> **Location:** `Frontend/src/components/molecules/EmailSearchInput.tsx` around lines 60-85
>
> **Description:**
> The EmailSearchInput component directly calls `fetch()` to search for users by email, bypassing the service layer architecture. According to the architectural principles, components should never contain API calls directly. All API communication must go through service files.
>
> **Impact:**
> Violates the separation of concerns principle and makes the code harder to maintain. If the API endpoint changes or error handling needs to be updated, it must be changed in multiple places. This also makes testing more difficult and prevents reusability of the search functionality in other components.
>
> **Fix Prompt:**
> Create a new function `searchUserByEmail(email: string)` in `Frontend/src/services/user.service.ts` (or create the file if it doesn't exist). Move the fetch logic from `EmailSearchInput.tsx` lines 60-85 to this service function. Update `EmailSearchInput.tsx` to import and use the service function instead of making direct fetch calls. Ensure the service function follows the same error handling pattern as other services (using ApiError type, cleaning error messages, etc.).

---

### 🟡 Medium Priority Issues

> 🟡 **Architecture Issue:** `CreateExpenseResponse` interface duplicates `Expense` fields instead of reusing the type
>
> **Location:** `Frontend/src/types/expense.types.ts` around lines 52-63
>
> **Description:**
> The `CreateExpenseResponse` interface (lines 52-63) has almost identical fields to the `Expense` interface (lines 20-39), except `CreateExpenseResponse` doesn't include `deleted_at` and some relation fields. This creates code duplication and maintenance burden.
>
> **Impact:**
> Code duplication increases maintenance burden. If field definitions change in `Expense`, they must be manually updated in `CreateExpenseResponse`, increasing the risk of inconsistencies and bugs. This violates DRY (Don't Repeat Yourself) principles.
>
> **Fix Prompt:**
> In `Frontend/src/types/expense.types.ts` around lines 52-63, replace the entire `CreateExpenseResponse` interface definition with: `export type CreateExpenseResponse = Omit<Expense, 'deleted_at' | 'category' | 'payer'>;`. This reuses the `Expense` type and eliminates duplication. Verify that all imports of `CreateExpenseResponse` continue to work correctly (they should, as the type shape remains the same).

> 🟡 **Architecture Issue:** `ExpenseCategory` type name conflict - two different types with the same name
>
> **Location:** `Frontend/src/types/trip.types.ts` around line 119 and `Frontend/src/types/expense.types.ts` around line 5
>
> **Description:**
> There are two different types named `ExpenseCategory`:
> 1. In `trip.types.ts` (line 119): A type union `'food' | 'transport' | 'lodging' | 'entertainment' | 'other'`
> 2. In `expense.types.ts` (line 5): An interface with `id`, `name`, `icon`, `is_active` fields
>
> This creates naming conflicts and confusion. TypeScript will use the one that's imported last, which can lead to unexpected type errors.
>
> **Impact:**
> Type name conflicts can cause compilation errors and make the codebase harder to understand. Developers may accidentally use the wrong type, leading to runtime errors or incorrect type checking.
>
> **Fix Prompt:**
> Rename the type union in `Frontend/src/types/trip.types.ts` from `ExpenseCategory` to `ExpenseCategoryType` (line 119). Update all imports and usages of this type in the codebase. Alternatively, if the type union is no longer used, remove it entirely. Verify that `ExpenseCategory` in `expense.types.ts` is the correct one to keep (it matches the backend API response structure).

> 🟡 **UI Issue:** `active:scale-98` uses arbitrary value instead of standard Tailwind class
>
> **Location:** `Frontend/src/components/atoms/CategoryPill.tsx` around lines 22-23
>
> **Description:**
> The CategoryPill component uses `active:scale-98` which is an arbitrary Tailwind value. According to the Design System Guide and audit rules, we should avoid "magic numbers" and use standard Tailwind utility classes or theme tokens.
>
> **Impact:**
> Arbitrary values make the codebase less maintainable and harder to understand. If the scale value needs to be consistent across components, it should be defined in the Tailwind config as a custom utility or use a standard class like `active:scale-95` (which is a standard Tailwind class).
>
> **Fix Prompt:**
> In `Frontend/src/components/atoms/CategoryPill.tsx` around lines 22-23, replace `active:scale-98` with `active:scale-95` (standard Tailwind class) or define a custom scale value in `Frontend/tailwind.config.ts` under `theme.extend.scale` if a specific value is required. Update all other components that use `active:scale-98` to use the same standard value.

> 🟡 **UX Architecture Issue:** PayerSelector uses native `<select>` which may not have all required visual states
>
> **Location:** `Frontend/src/components/molecules/PayerSelector.tsx` around lines 24-39
>
> **Description:**
> The PayerSelector component uses a native HTML `<select>` element. While it has some states defined (`:hover`, `:focus`, `:active`), native select elements have limited styling capabilities and may not provide the same visual feedback as custom components. The Design System Guide emphasizes consistent interaction patterns and visual feedback.
>
> **Impact:**
> Native select elements have inconsistent appearance across browsers and limited customization options. They may not match the visual design of other form elements (like Input and Button components) and may not provide the same level of accessibility and user feedback.
>
> **Fix Prompt:**
> Consider creating a custom Select component that matches the design system (similar to Input and Button components) or use a library component (like from shadcn/ui) that provides better styling control and consistency. The custom select should have the same visual states as other form elements: `:hover`, `:active`, `:focus-visible`, and `:disabled`. Ensure it maintains the same height (`min-h-[48px]`) and styling as the Input component for consistency.

---

### 🟢 Low Priority Issues

> 🟢 **Architecture Issue:** ExpenseForm uses `alert()` for invitation feedback instead of proper UI component
>
> **Location:** `Frontend/src/components/molecules/ExpenseForm.tsx` around line 137
>
> **Description:**
> The `handleInviteByEmail` function uses `alert()` to show feedback when an invitation would be sent. This is a temporary implementation (marked with TODO) but should use a proper UI component like a Toast or Modal for better user experience.
>
> **Impact:**
> Using `alert()` creates a poor user experience with blocking dialogs that don't match the application's design. It also doesn't follow the Design System Guide patterns for user feedback.
>
> **Fix Prompt:**
> In `Frontend/src/components/molecules/ExpenseForm.tsx` around line 137, replace the `alert()` call with a proper Toast notification or Modal component. Use the Toast component from the design system to show a success message like "Invitación enviada a [email]". If a Modal is needed for more complex interactions, use the Modal component pattern from the Design System Guide. Remove the TODO comment once implemented.

---

## Notes

- The CategorySelector component appears to have been properly fixed with `inline-flex`, `touch-action: pan-x`, and proper padding, which is good.
- The BottomTabBar uses `grid grid-cols-3` for symmetric distribution, which follows the design system correctly.
- The Button and Input components have proper states defined, though Button could benefit from explicit `:disabled` state styling.
- Services are correctly using appropriate headers (GET requests without Content-Type, POST requests with Content-Type, FormData without Content-Type).
- The `ApiError` type is properly centralized in `api.types.ts`, which is good.

---

## Recommendations

1. **Priority 1:** Refactor Header component to match Design System Guide pattern
2. **Priority 2:** Move EmailSearchInput API calls to service layer
3. **Priority 3:** Consolidate duplicate type definitions using TypeScript utility types
4. **Priority 4:** Replace native select with custom component for better design consistency
5. **Priority 5:** Replace `alert()` with proper Toast/Modal components

---

**Audit completed by:** Architect UI/X  
**Next audit recommended:** After implementing Priority 1 and 2 fixes
