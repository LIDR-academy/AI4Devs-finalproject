# UI/UX Audit Report

**Date:** 2026-01-09
**Scope:** TripDetailPage (Frontend/src/pages/TripDetailPage.tsx)
**Design Sources:** docs/ui-ux/DESIGN_SYSTEM_GUIDE.md, Frontend/tailwind.config.ts

## Summary
- 🔴 Critical: 0 issues
- 🟠 High: 1 issue
- 🟡 Medium: 2 issues
- 🟢 Low: 0 issues

## Findings

> 🟠 **UX Architecture:** Tabs not sticky as required by UI flow
>
> **Location:** [Frontend/src/pages/TripDetailPage.tsx#L92-L121](Frontend/src/pages/TripDetailPage.tsx#L92-L121)
>
> **Description:** The tabs bar scrolls away with content. The design spec (TripDetailPage) calls for sticky tabs to keep navigation visible while browsing gastos/saldos/participantes.
>
> **Impact:** Users lose tab navigation when scrolling long content, increasing effort to switch sections and breaking the expected flow.
>
> **Fix Prompt:** Make the tabs container sticky with a surface background: wrap the tabs div in a container with `className="sticky top-0 z-20 bg-slate-50 pt-1"` and keep the tab bar styled `bg-white rounded-xl p-2 shadow-sm border border-slate-200 flex gap-2`. Ensure the main area has top padding so the sticky bar doesn’t overlap content.

> 🟡 **Layout / Visual:** Main container misses design-system sizing and safe-area padding
>
> **Location:** [Frontend/src/pages/TripDetailPage.tsx#L70-L161](Frontend/src/pages/TripDetailPage.tsx#L70-L161)
>
> **Description:** The page uses `min-h-screen bg-slate-50 flex flex-col` but lacks the `max-w-md mx-auto` and `pb-24` safe-area padding defined as the standard main container for mobile (Design System §2.1). Content can span wide on desktop and may sit under the BottomTabBar.
>
> **Impact:** Inconsistent width vs. other screens and potential overlap with the bottom nav on small viewports.
>
> **Fix Prompt:** On the root div/main, apply `className="min-h-screen bg-slate-50 max-w-md mx-auto relative pb-24 flex flex-col"`. If wrapping with an outer container, ensure both wrapper and main respect this sizing.

> 🟡 **Accessibility:** Tabs and buttons lack focus-visible treatment
>
> **Location:** [Frontend/src/pages/TripDetailPage.tsx#L92-L121](Frontend/src/pages/TripDetailPage.tsx#L92-L121)
>
> **Description:** Tab buttons only change color on hover/active. There is no `focus-visible` ring. Design system expects clear focus affordance for keyboard users.
>
> **Impact:** Keyboard users may miss which tab is focused, reducing accessibility compliance.
>
> **Fix Prompt:** Add focus ring classes to interactive elements in the tabs: `className="... focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2"`. Apply similarly to the back button and action buttons to keep consistent feedback.
