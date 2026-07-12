# Design: Preserve Search Dates on Property Navigation

**Date:** 2026-07-12
**Status:** Approved

## Problem

When a user searches for properties with specific check-in/check-out dates and clicks a property card, the property detail page opens without those dates. The user must re-enter the same dates in the booking widget before seeing availability and pricing.

## Goal

Pre-fill the property detail page's booking widget with the dates already selected on the search page.

## Scope

Search → property detail only (forward direction). Back-navigation and the return link to search results are out of scope.

## Solution

Forward the search dates as URL query parameters when navigating from a property card to the detail page.

### Change

**File:** `frontend/src/app/search/page.tsx`
**Function:** `handlePropertyClick`

**Before:**
```typescript
const handlePropertyClick = useCallback(
  (propertyId: string) => {
    router.push(`/property/${propertyId}`);
  },
  [router],
);
```

**After:**
```typescript
const handlePropertyClick = useCallback(
  (propertyId: string) => {
    const params = new URLSearchParams();
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    if (checkIn) params.set('check_in', checkIn);
    if (checkOut) params.set('check_out', checkOut);
    const qs = params.toString();
    router.push(`/property/${propertyId}${qs ? `?${qs}` : ''}`);
  },
  [router, searchParams],
);
```

`searchParams` is already available in the component. No changes are needed to the property detail page — it already reads `check_in`/`check_out` from the URL and uses them to pre-populate the calendar and trigger price calculation.

### URL convention

The search page stores dates as `checkIn`/`checkOut` (camelCase). The property detail page expects `check_in`/`check_out` (snake_case). The conversion happens in this one place, consistent with the existing pattern in the codebase.

## Edge Cases

- **No dates in search URL:** Both `params.set` calls are guarded; if dates are absent the navigation falls back to `/property/${propertyId}` with no query string, preserving existing behaviour.
- **Partial dates (only check-in):** Each date is forwarded independently, so partial state is handled correctly.

## Testing

One new Playwright E2E scenario:

1. Navigate to search with a location, check-in, and check-out date.
2. Click a property card from the results.
3. Assert the property detail URL contains `check_in` and `check_out` matching the search dates.
4. Assert the booking widget displays those dates pre-filled.

No unit tests needed — this is a navigation side effect best verified end-to-end.
