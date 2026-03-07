# UI/UX Audit Report #005

**Date:** January 8, 2026  
**Auditor:** Architect UI/X  
**Scope:** HomePage with new dashboard design (Saldos and Gastos Recientes), BalanceCard, RecentExpenseCard  

## Summary
- 🔴 Critical: 0 issues
- 🟠 High: 1 issue
- 🟡 Medium: 2 issues
- 🟢 Low: 3 issues

---

## 🟠 High Priority Issues

### 1. Missing Interactive States on Cards

> 🟠 **UX Issue:** BalanceCard and RecentExpenseCard lack hover, active, and focus states, making them feel non-interactive despite being prepared for future navigation
>
> **Location:** 
> - `Frontend/src/components/molecules/BalanceCard.tsx` around line 29
> - `Frontend/src/components/molecules/RecentExpenseCard.tsx` around line 56
>
> **Description:**
> Both components have TODO comments indicating they will be clickable in the future (`onClick` handlers are commented out), but they currently lack any visual feedback for hover or active states. The Design System Guide explicitly requires all interactive components to have `:hover`, `:active`, `:focus-visible`, and `:disabled` states defined.
> 
> Even though the onClick functionality isn't implemented yet, the visual hover states should be present to:
> 1. Indicate to users that these cards will be interactive
> 2. Provide visual feedback when hovering over them
> 3. Follow consistent interaction patterns across the app
>
> **Impact:**
> Users cannot tell if these cards are clickable or just static information displays. When navigation is implemented, users may not realize they can click on these cards. This creates an inconsistent user experience and reduces discoverability of future functionality.
>
> **Fix Prompt:**
> In `Frontend/src/components/molecules/BalanceCard.tsx` around line 29, update the className to include hover and transition effects:
> ```tsx
> className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-200 cursor-default"
> ```
> 
> In `Frontend/src/components/molecules/RecentExpenseCard.tsx` around line 56, apply the same pattern:
> ```tsx
> className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-200 cursor-default"
> ```
> 
> Use `cursor-default` for now since onClick is not implemented. When onClick is added, change to `cursor-pointer` and uncomment the onClick handler.

---

## 🟡 Medium Priority Issues

### 1. Icon Size Inconsistency with Design System

> 🟡 **Visual Issue:** Icons in BalanceCard use `size={20}` and RecentExpenseCard uses `size={20}` and `size={16}`, which don't match the Design System Guide standard sizes
>
> **Location:**
> - `Frontend/src/components/molecules/BalanceCard.tsx` around line 40
> - `Frontend/src/components/molecules/RecentExpenseCard.tsx` around lines 18 and 83
>
> **Description:**
> The Design System Guide specifies standard icon sizes: 20px (buttons), 24px (header), 64px (empty states). The ArrowRight icon in BalanceCard uses 20px which is correct, but it's used in content context, not a button. The Users icon in RecentExpenseCard uses 16px which is not a standard size. Both should use 24px for content-level icons or stick strictly to the 20px/24px standard.
>
> **Impact:**
> Slight visual inconsistency that may make the interface feel less polished. Not critical, but maintaining standard sizes throughout the app improves visual coherence and makes the design system easier to maintain.
>
> **Fix Prompt:**
> In `Frontend/src/components/molecules/BalanceCard.tsx` around line 40, keep `size={20}` since this is appropriate for inline content icons (not critical to change).
> 
> In `Frontend/src/components/molecules/RecentExpenseCard.tsx` around line 18, verify that category icons at `size={20}` are appropriate for the circular background context. Consider increasing to `size={24}` if the circular container feels cramped.
> 
> In `Frontend/src/components/molecules/RecentExpenseCard.tsx` around line 83, change the Users icon from `size={16}` to `size={20}` to match other content-level icons:
> ```tsx
> <Users size={20} aria-hidden="true" />
> ```

### 2. Array Key Using Index Instead of Stable ID

> 🟡 **Architecture Issue:** MOCK_BALANCES uses array index as key in map function, which is an anti-pattern in React
>
> **Location:** `Frontend/src/pages/HomePage.tsx` around line 243
>
> **Description:**
> The BalanceCard components are being rendered using `key={idx}` where idx is the array index. This is a React anti-pattern because:
> 1. If the array order changes, React will re-render incorrectly
> 2. Component state can get mixed up between re-renders
> 3. It's a sign of missing proper unique identifiers
> 
> While this is mock data and will be replaced with real API data (which should have IDs), it's good practice to use stable keys even for mock data.
>
> **Impact:**
> Currently minimal since the array is static mock data. However, when replaced with real API data, if Balance objects don't have unique IDs, the same pattern will persist and cause potential rendering issues when balances are reordered or updated.
>
> **Fix Prompt:**
> In `Frontend/src/types/trip.types.ts`, add an `id` field to the Balance interface:
> ```typescript
> export interface Balance {
>   id: string; // Add unique identifier
>   fromName: string;
>   toName: string;
>   amount: number;
>   badgeColor: 'red' | 'green' | 'blue';
> }
> ```
> 
> In `Frontend/src/pages/HomePage.tsx` around line 14, update MOCK_BALANCES to include IDs:
> ```typescript
> const MOCK_BALANCES: Balance[] = [
>   {
>     id: '1',
>     fromName: 'Juan',
>     toName: 'Pedro',
>     amount: 50000,
>     badgeColor: 'red',
>   },
>   {
>     id: '2',
>     fromName: 'Carlos',
>     toName: 'Juan',
>     amount: 25000,
>     badgeColor: 'green',
>   },
>   {
>     id: '3',
>     fromName: 'María',
>     toName: 'Pedro',
>     amount: 15000,
>     badgeColor: 'blue',
>   },
> ];
> ```
> 
> In `Frontend/src/pages/HomePage.tsx` around line 243, change the key:
> ```tsx
> {MOCK_BALANCES.map((balance) => (
>   <BalanceCard key={balance.id} balance={balance} />
> ))}
> ```

---

## 🟢 Low Priority Issues

### 1. Missing aria-label for Interactive Link

> 🟢 **Accessibility Issue:** "Ver todos" link lacks descriptive aria-label to indicate what "todos" refers to
>
> **Location:** `Frontend/src/pages/HomePage.tsx` around line 255
>
> **Description:**
> The "Ver todos" link doesn't have an aria-label, so screen reader users will only hear "Ver todos" without context about what they're viewing. While the context is somewhat clear from the section heading ("Gastos Recientes"), adding an explicit aria-label improves accessibility.
>
> **Impact:**
> Minor accessibility improvement. Screen reader users will have slightly better context, but the current implementation is still functional.
>
> **Fix Prompt:**
> In `Frontend/src/pages/HomePage.tsx` around line 255, add an aria-label to the Link:
> ```tsx
> <Link
>   to={`/trips/${activeTrip.id}`}
>   className="text-sm text-violet-600 font-medium hover:underline"
>   aria-label="Ver todos los gastos recientes"
> >
>   Ver todos
> </Link>
> ```

### 2. Section Headings Could Use Better Semantic HTML

> 🟢 **Architecture Issue:** Section titles use `<h3>` which is semantically correct, but the HomePage structure could benefit from clearer heading hierarchy
>
> **Location:** `Frontend/src/pages/HomePage.tsx` around lines 241 and 251
>
> **Description:**
> The HomePage uses `<h3>` for "Saldos" and "Gastos Recientes" section headings, which is semantically correct. However, there's no `<h1>` or `<h2>` on the authenticated HomePage with trips state (the page title is implicit in the Header component). Adding a visually hidden `<h1>` would improve semantic structure and accessibility.
>
> **Impact:**
> Very minor. The current structure is functional and semantically acceptable. This is a polish improvement for better HTML semantics and screen reader navigation.
>
> **Fix Prompt:**
> In `Frontend/src/pages/HomePage.tsx` around line 236, add a visually hidden page title after the Header:
> ```tsx
> <main className="px-6 py-8">
>   <h1 className="sr-only">Resumen general de viajes</h1>
>   
>   {/* Saldos Section */}
>   <section className="mb-8">
>     <h2 className="text-lg font-heading font-semibold text-slate-900 mb-4">
>       Saldos
>     </h2>
> ```
> 
> Change `<h3>` to `<h2>` for section headings to maintain proper heading hierarchy. Add Tailwind's `sr-only` class for the hidden h1.

### 3. TODO Comments Should Include More Context

> 🟢 **Code Quality:** TODO comments in BalanceCard and RecentExpenseCard lack context about when/how navigation will be implemented
>
> **Location:**
> - `Frontend/src/components/molecules/BalanceCard.tsx` around lines 7-8 and 31-33
> - `Frontend/src/components/molecules/RecentExpenseCard.tsx` around lines 9-10 and 58-60
>
> **Description:**
> The TODO comments mention adding onClick handlers but don't provide context about:
> 1. What page/view the navigation should go to
> 2. What API endpoint or data structure is needed
> 3. Any prerequisites for implementing the functionality
> 
> More detailed TODOs make it easier for developers to implement the feature later.
>
> **Impact:**
> Minimal. This is purely about code maintainability and developer experience. The current TODOs are functional, just less informative than they could be.
>
> **Fix Prompt:**
> In `Frontend/src/components/molecules/BalanceCard.tsx` around lines 7-8, update the TODO comment:
> ```tsx
> // TODO: Add onClick handler for navigation to balance detail
> // Should navigate to /trips/:tripId/balances/:balanceId or similar
> // Requires backend endpoint: GET /trips/:tripId/balances/:balanceId
> // onClick?: () => void;
> ```
> 
> In `Frontend/src/components/molecules/RecentExpenseCard.tsx` around lines 9-10, update similarly:
> ```tsx
> // TODO: Add onClick handler for navigation to expense detail
> // Should navigate to /trips/:tripId/expenses/:expenseId
> // Requires backend endpoint: GET /expenses/:expenseId
> // onClick?: () => void;
> ```

---

## ✅ Positive Findings

### Excellent Design System Compliance

The new components demonstrate excellent adherence to the Design System Guide:

1. **✅ Color Usage:** All colors use standard Tailwind classes (slate-50, slate-900, violet-600, red-50, emerald-50, blue-50)
2. **✅ Typography:** Proper use of font-heading for titles, correct font weights (font-medium, font-semibold)
3. **✅ Spacing:** Consistent use of standard spacing classes (p-4, mb-4, gap-3, space-y-3)
4. **✅ Border Radius:** Consistent rounded-xl for cards, rounded-full for badges/icons
5. **✅ Shadow:** Proper use of shadow-sm for subtle elevation
6. **✅ Zero Magic Numbers:** No arbitrary values like `w-[350px]` - all spacing uses standard Tailwind classes
7. **✅ Responsive Padding:** HomePage uses px-6 py-8 for mobile-friendly spacing with pb-24 for BottomTabBar clearance
8. **✅ Icon Usage:** All icons from lucide-react with aria-hidden="true" for accessibility
9. **✅ Layout Structure:** Proper use of flexbox with flex-shrink-0, min-w-0 for text truncation, items-center for alignment
10. **✅ Semantic HTML:** Good use of `<section>`, `<h3>`, `<p>` tags for proper document structure

### Clean Code Architecture

1. **✅ Type Safety:** Proper TypeScript interfaces for Balance and RecentExpense with clear field definitions
2. **✅ Component Separation:** Clear separation between BalanceCard, RecentExpenseCard, and HomePage
3. **✅ Helper Functions:** Well-organized utility functions (getCategoryIcon, formatShortDate) within components
4. **✅ Comments:** Excellent component documentation explaining purpose, layout, and design system compliance
5. **✅ Future-Proof:** TODO comments prepared for future navigation functionality

### Strong User Experience Patterns

1. **✅ Visual Hierarchy:** Clear section headings with proper spacing
2. **✅ Information Density:** Appropriate amount of information per card without overwhelming users
3. **✅ Color Semantics:** Red for debt, green for credit, blue for neutral - clear meaning
4. **✅ Truncation Handling:** RecentExpenseCard uses `truncate` and `min-w-0` to prevent text overflow
5. **✅ Icon Consistency:** Appropriate category icons (Utensils, Car, Bed, Film, Package) that are universally recognizable
6. **✅ Date Formatting:** Short date format (16 ene) is concise and readable
7. **✅ Currency Formatting:** Uses formatCurrency utility for consistent number display

---

## Recommendations

### Priority Implementation Order

1. **Immediate (Next Session):**
   - Add hover/transition states to BalanceCard and RecentExpenseCard
   - Add unique IDs to Balance interface and MOCK_BALANCES

2. **Short Term (This Week):**
   - Standardize Users icon size to 20px
   - Add aria-label to "Ver todos" link
   - Improve TODO comment context

3. **Medium Term (Before Production):**
   - Implement onClick navigation when TripDetailPage is ready
   - Replace mock data with real API endpoints
   - Add loading and error states for data fetching

### Future Enhancements

Once the backend endpoints are available:

1. **Balance Detail View:** Create a page/modal to show detailed balance information including transaction history
2. **Expense Detail View:** Show full expense details with photo, all beneficiaries, and edit/delete options
3. **Empty States:** Add empty state designs for when there are no balances or no recent expenses
4. **Loading States:** Add skeleton screens while fetching balances and expenses
5. **Error Handling:** Show appropriate error messages if balance/expense data fails to load
6. **Pull to Refresh:** Consider adding pull-to-refresh functionality for mobile users to update data

---

## Conclusion

The new HomePage dashboard implementation with Saldos and Gastos Recientes sections demonstrates **excellent design system compliance and code quality**. The components are well-structured, properly typed, and follow best practices for React and Tailwind CSS.

**Key Strengths:**
- Perfect adherence to Design System Guide (zero magic numbers, consistent spacing, proper colors)
- Clean component architecture with good separation of concerns
- Excellent TypeScript type safety
- Strong accessibility foundation with semantic HTML and aria-labels

**Areas for Improvement:**
- Add interactive states (hover, transition) to cards for better UX feedback
- Use stable keys instead of array indices for React rendering optimization
- Minor icon size standardization

**Overall Grade: 🟢 A- (Excellent)**

The implementation is production-ready once the one high-priority issue (interactive states) is addressed. The codebase is maintainable, scalable, and ready for integration with backend APIs.

---

**Next Steps:**
1. Address the 🟠 high priority issue (add hover states)
2. Implement the 🟡 medium priority improvements (IDs, icon sizes)
3. Consider the 🟢 low priority polish items as time permits
4. Begin backend integration planning for balance and expense endpoints
