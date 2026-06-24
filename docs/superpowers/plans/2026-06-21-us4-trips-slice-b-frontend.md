# US4 — My Trips & Cancellation (Slice B: Frontend) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the "My Trips" UI — a trips list (filterable upcoming/past/cancelled), a trip-detail page with cancellation, the `TripCard` and `CancellationModal` components, the `tripsService` hooks, and enable the confirmation page's "View My Trips" button — consuming the Slice A backend.

**Architecture:** TanStack Query hooks in `services/tripsService.ts` call the authenticated endpoints through the shared `apiClient` (JWT auto-attached by its request interceptor). Pages are `'use client'` orchestrators that fetch and distribute data to props-driven display components (`TripCard`, `CancellationModal`). The cancel mutation invalidates the trips + detail query keys so the UI reflects the new state.

**Tech Stack:** Next.js 15 (App Router) + React 19 + TypeScript (strict) + TanStack Query v5 + Tailwind + lucide-react; vitest + React Testing Library.

**Scope:** Slice B of 3 (`docs/superpowers/specs/2026-06-20-us4-my-trips-cancellation-design.md`). Slice A (backend) is merged. **Slice C** adds the Playwright cancellation journey (the mandated browser E2E for this new journey) — NOT in this slice. Issues: #72–#76 (T071–T075).

**Branch:** `issue-72-us4-trips-frontend` (create before the first commit; one PR for the slice — never commit to `main`).

**Already in place (do NOT recreate):**
- All TS types exist in `src/types/index.ts`: `BookingStatus` (`"confirmed"|"cancelled"|"completed"`), `RefundStatus` (`"full_refund"|"no_refund"`), `Pagination`, `BookingSummary`, `MyTripsResponse`, `BookingDetailResponse`, `BookingPropertyRef`, `PriceBreakdown`, `CancellationResponse`, `UUID`/`IsoDate`/`IsoDateTime`.
- `apiClient` (`src/services/apiClient.ts`) auto-attaches the JWT (`Bearer <localStorage.auth_token>`) via a request interceptor and normalizes errors to `NormalizedApiError { message, code, status?, details?, traceId? }`. Hooks must NOT handle tokens manually.
- Existing hook pattern: `src/services/searchService.ts` / `bookingService.ts` (`useQuery`/`useMutation`, `queryKey`, `enabled`, `staleTime`/`gcTime`). Existing mutations do NOT invalidate — US4's cancel hook must (via `useQueryClient`).
- Component pattern: `src/components/search/PropertyCard.tsx` (props-driven, Tailwind, no internal fetch) + co-located `.test.tsx`. **No modal/dialog infra exists** — `CancellationModal` is built from scratch.
- Confirmation page `src/app/confirmation/[id]/page.tsx` has a DISABLED `data-testid="view-trips-button"` "View My Trips (coming soon)" button to enable.
- Test idioms: `createWrapper()` QueryClientProvider; `vi.mock('@/services/...')`; `vi.mock('next/navigation', ...)`. Commands: `npm run test` (vitest run), `npm run build` (next build).

---

### Task 1: tripsService hooks (#72)

**Files:**
- Create: `frontend/src/services/tripsService.ts`
- Test: `frontend/src/services/tripsService.test.ts`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/services/tripsService.test.ts`:

```ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}));

import { apiClient } from './apiClient';
import { useMyTrips, useBookingDetail, useCancelBooking } from './tripsService';

const mockedGet = apiClient.get as unknown as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as unknown as ReturnType<typeof vi.fn>;

function wrapperWith(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

function newClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('tripsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useMyTrips calls my-trips with status/page/size params', async () => {
    mockedGet.mockResolvedValue({
      data: { bookings: [], pagination: { page: 1, size: 10, total_results: 0, total_pages: 0 } },
    });

    const { result } = renderHook(() => useMyTrips('upcoming', 2, 10), {
      wrapper: wrapperWith(newClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGet).toHaveBeenCalledWith('/api/v1/bookings/my-trips', {
      params: { status: 'upcoming', page: 2, size: 10 },
    });
  });

  it('useBookingDetail is disabled when id is undefined and enabled when set', async () => {
    mockedGet.mockResolvedValue({ data: { id: 'b1' } });

    const { result, rerender } = renderHook(
      ({ id }: { id?: string }) => useBookingDetail(id),
      { wrapper: wrapperWith(newClient()), initialProps: { id: undefined } },
    );
    // disabled → no fetch
    expect(mockedGet).not.toHaveBeenCalled();

    rerender({ id: 'b1' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGet).toHaveBeenCalledWith('/api/v1/bookings/b1');
  });

  it('useCancelBooking posts cancel with reason and invalidates trips + detail queries', async () => {
    mockedPost.mockResolvedValue({
      data: { booking_id: 'b1', status: 'cancelled', refund_amount_eur: 386, refund_status: 'full_refund' },
    });
    const client = newClient();
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

    const { result } = renderHook(() => useCancelBooking(), { wrapper: wrapperWith(client) });

    await result.current.mutateAsync({ bookingId: 'b1', reason: 'plans changed' });

    expect(mockedPost).toHaveBeenCalledWith('/api/v1/bookings/b1/cancel', { reason: 'plans changed' });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['myTrips'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['bookingDetail', 'b1'] });
  });

  it('useCancelBooking posts an empty body when no reason is given', async () => {
    mockedPost.mockResolvedValue({
      data: { booking_id: 'b1', status: 'cancelled', refund_amount_eur: 0, refund_status: 'no_refund' },
    });
    const { result } = renderHook(() => useCancelBooking(), { wrapper: wrapperWith(newClient()) });

    await result.current.mutateAsync({ bookingId: 'b1' });

    expect(mockedPost).toHaveBeenCalledWith('/api/v1/bookings/b1/cancel', {});
  });
});
```

- [ ] **Step 2: Run it, expect failure**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- src/services/tripsService.test.ts`
Expected: FAIL — `tripsService` module not found.

- [ ] **Step 3: Implement the hooks**

Create `frontend/src/services/tripsService.ts`:

```ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { apiClient } from './apiClient';
import type { NormalizedApiError } from './apiClient';
import type {
  BookingDetailResponse,
  CancellationResponse,
  MyTripsResponse,
} from '@/types';

/** Status filter for the My Trips list (matches the backend `status` query param). */
export type TripFilter = 'all' | 'upcoming' | 'past' | 'cancelled';

/** Paginated list of the authenticated guest's trips, filtered by [status]. */
export function useMyTrips(
  status: TripFilter = 'all',
  page = 1,
  size = 10,
): UseQueryResult<MyTripsResponse, NormalizedApiError> {
  return useQuery({
    queryKey: ['myTrips', status, page, size],
    queryFn: async () => {
      const response = await apiClient.get<MyTripsResponse>('/api/v1/bookings/my-trips', {
        params: { status, page, size },
      });
      return response.data;
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
}

/** Full detail for one booking the guest owns. Disabled until [bookingId] is set. */
export function useBookingDetail(
  bookingId: string | undefined,
): UseQueryResult<BookingDetailResponse, NormalizedApiError> {
  return useQuery({
    queryKey: ['bookingDetail', bookingId],
    queryFn: async () => {
      const response = await apiClient.get<BookingDetailResponse>(`/api/v1/bookings/${bookingId}`);
      return response.data;
    },
    enabled: !!bookingId,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
}

export interface CancelBookingVariables {
  bookingId: string;
  reason?: string;
}

/** Cancels a booking; on success invalidates the trips list and this booking's detail. */
export function useCancelBooking(): UseMutationResult<
  CancellationResponse,
  NormalizedApiError,
  CancelBookingVariables
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, reason }: CancelBookingVariables) => {
      const response = await apiClient.post<CancellationResponse>(
        `/api/v1/bookings/${bookingId}/cancel`,
        reason ? { reason } : {},
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myTrips'] });
      queryClient.invalidateQueries({ queryKey: ['bookingDetail', variables.bookingId] });
    },
  });
}
```

- [ ] **Step 4: Run the test, expect PASS**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- src/services/tripsService.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(trips): tripsService hooks (useMyTrips/useBookingDetail/useCancelBooking) (#72)"
```

**Note:** The test file is `.test.ts` but contains JSX (the wrapper). vitest + the project's esbuild handle `.ts` with JSX via the React 19 automatic runtime, but if the JSX in `.ts` causes a parse error, rename the test to `tripsService.test.tsx` (keep the same path otherwise) and re-run. Prefer `.test.ts`; only rename if it fails to parse.

---

### Task 2: TripCard component (#73)

**Files:**
- Create: `frontend/src/components/booking/TripCard.tsx`
- Test: `frontend/src/components/booking/TripCard.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/components/booking/TripCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import type { BookingSummary } from '@/types';
import { TripCard } from './TripCard';

const trip: BookingSummary = {
  id: '11111111-2222-3333-4444-555555555555',
  reference_number: 'BK-20300101-ABC123',
  property_title: 'Cosy Eixample Apartment',
  property_photo_url: 'https://img/1.jpg',
  city: 'Barcelona',
  check_in: '2030-06-10',
  check_out: '2030-06-13',
  status: 'confirmed',
  total_eur: 386,
};

describe('TripCard', () => {
  it('renders title, city, reference, total and a status badge', () => {
    render(<TripCard trip={trip} onClick={vi.fn()} />);
    expect(screen.getByText('Cosy Eixample Apartment')).toBeInTheDocument();
    expect(screen.getByText(/Barcelona/)).toBeInTheDocument();
    expect(screen.getByText('BK-20300101-ABC123')).toBeInTheDocument();
    expect(screen.getByText('€386.00')).toBeInTheDocument();
    expect(screen.getByText('confirmed')).toBeInTheDocument();
  });

  it('calls onClick with the booking id when activated', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<TripCard trip={trip} onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith(trip.id);
  });
});
```

- [ ] **Step 2: Run it, expect failure**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- src/components/booking/TripCard.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the component**

Create `frontend/src/components/booking/TripCard.tsx`:

```tsx
'use client';

import { MapPin } from 'lucide-react';
import type { BookingSummary, BookingStatus } from '@/types';

interface TripCardProps {
  trip: BookingSummary;
  onClick: (bookingId: string) => void;
}

const STATUS_STYLES: Record<BookingStatus, string> = {
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function TripCard({ trip, onClick }: TripCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(trip.id)}
      aria-label={`View booking ${trip.reference_number}`}
      data-testid="trip-card"
      data-booking-id={trip.id}
      className="group flex w-full gap-4 overflow-hidden rounded-lg bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
        <img
          src={trip.property_photo_url}
          alt={`Photo of ${trip.property_title}`}
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/200x200?text=No+Image';
          }}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-gray-900">{trip.property_title}</h3>
          <span
            data-testid="trip-status"
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[trip.status]}`}
          >
            {trip.status}
          </span>
        </div>
        <p className="flex items-center gap-1 text-xs text-gray-600">
          <MapPin className="h-3 w-3" aria-hidden />
          {trip.city}
        </p>
        <p className="text-xs text-gray-600">
          {formatDate(trip.check_in)} → {formatDate(trip.check_out)}
        </p>
        <p className="text-xs text-gray-500">{trip.reference_number}</p>
        <p className="mt-auto text-sm font-bold text-gray-900">€{trip.total_eur.toFixed(2)}</p>
      </div>
    </button>
  );
}
```

- [ ] **Step 4: Run the test, expect PASS**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- src/components/booking/TripCard.test.tsx`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(trips): TripCard display component (#73)"
```

---

### Task 3: CancellationModal component (#74)

**Files:**
- Create: `frontend/src/components/booking/CancellationModal.tsx`
- Test: `frontend/src/components/booking/CancellationModal.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/components/booking/CancellationModal.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CancellationModal } from './CancellationModal';

const baseProps = {
  isOpen: true,
  policy: 'Full refund if cancelled 48+ hours before check-in',
  refundAmountEur: 386,
  isCancelling: false,
  error: null as string | null,
  onConfirm: vi.fn(),
  onClose: vi.fn(),
};

describe('CancellationModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<CancellationModal {...baseProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the policy and the refund amount', () => {
    render(<CancellationModal {...baseProps} />);
    expect(screen.getByText(/Full refund if cancelled/)).toBeInTheDocument();
    expect(screen.getByText('€386.00')).toBeInTheDocument();
  });

  it('shows a no-refund message when refund is zero', () => {
    render(<CancellationModal {...baseProps} refundAmountEur={0} />);
    expect(screen.getByText(/no refund/i)).toBeInTheDocument();
  });

  it('fires onConfirm and onClose from the buttons', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<CancellationModal {...baseProps} onConfirm={onConfirm} onClose={onClose} />);
    await user.click(screen.getByTestId('confirm-cancel-button'));
    expect(onConfirm).toHaveBeenCalledOnce();
    await user.click(screen.getByTestId('dismiss-cancel-button'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('disables the confirm button and shows progress while cancelling', () => {
    render(<CancellationModal {...baseProps} isCancelling />);
    expect(screen.getByTestId('confirm-cancel-button')).toBeDisabled();
  });

  it('renders an error message when provided', () => {
    render(<CancellationModal {...baseProps} error="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it, expect failure**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- src/components/booking/CancellationModal.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the component**

Create `frontend/src/components/booking/CancellationModal.tsx`:

```tsx
'use client';

interface CancellationModalProps {
  isOpen: boolean;
  policy: string;
  refundAmountEur: number | null | undefined;
  isCancelling: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function CancellationModal({
  isOpen,
  policy,
  refundAmountEur,
  isCancelling,
  error,
  onConfirm,
  onClose,
}: CancellationModalProps) {
  if (!isOpen) {
    return null;
  }

  const willRefund = (refundAmountEur ?? 0) > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
      data-testid="cancellation-modal"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 id="cancel-modal-title" className="text-lg font-semibold text-gray-900">
          Cancel this booking?
        </h2>

        <p className="mt-3 text-sm text-gray-600">{policy}</p>

        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
          {willRefund ? (
            <p className="text-gray-900">
              You will be refunded{' '}
              <span className="font-bold" data-testid="refund-amount">
                €{(refundAmountEur ?? 0).toFixed(2)}
              </span>
              .
            </p>
          ) : (
            <p className="text-gray-900" data-testid="refund-amount">
              This cancellation is within 48 hours of check-in, so you will receive{' '}
              <span className="font-bold">no refund</span>.
            </p>
          )}
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            data-testid="dismiss-cancel-button"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Keep booking
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isCancelling}
            data-testid="confirm-cancel-button"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isCancelling ? 'Cancelling…' : 'Confirm cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test, expect PASS**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- src/components/booking/CancellationModal.test.tsx`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(trips): CancellationModal component (#74)"
```

---

### Task 4: My Trips list page `/trips` (#75)

**Files:**
- Create: `frontend/src/app/trips/page.tsx`
- Test: `frontend/src/app/trips/page.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/app/trips/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams({ status: 'upcoming' }),
}));

const useMyTrips = vi.fn();
vi.mock('@/services/tripsService', () => ({
  useMyTrips: (...args: unknown[]) => useMyTrips(...args),
}));

import TripsPage from './page';

const trip = {
  id: 'b1',
  reference_number: 'BK-1',
  property_title: 'Cosy Eixample Apartment',
  property_photo_url: 'https://img/1.jpg',
  city: 'Barcelona',
  check_in: '2030-06-10',
  check_out: '2030-06-13',
  status: 'confirmed',
  total_eur: 386,
};

describe('TripsPage', () => {
  beforeEach(() => {
    push.mockClear();
    useMyTrips.mockReset();
  });

  it('renders a list of trips', () => {
    useMyTrips.mockReturnValue({
      data: { bookings: [trip], pagination: { page: 1, size: 10, total_results: 1, total_pages: 1 } },
      isLoading: false,
      error: null,
    });
    render(<TripsPage />);
    expect(screen.getByText('Cosy Eixample Apartment')).toBeInTheDocument();
  });

  it('shows an empty state when there are no trips', () => {
    useMyTrips.mockReturnValue({
      data: { bookings: [], pagination: { page: 1, size: 10, total_results: 0, total_pages: 0 } },
      isLoading: false,
      error: null,
    });
    render(<TripsPage />);
    expect(screen.getByText(/no trips/i)).toBeInTheDocument();
  });

  it('shows a loading state', () => {
    useMyTrips.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<TripsPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('navigates to the trip detail when a card is clicked', async () => {
    const user = userEvent.setup();
    useMyTrips.mockReturnValue({
      data: { bookings: [trip], pagination: { page: 1, size: 10, total_results: 1, total_pages: 1 } },
      isLoading: false,
      error: null,
    });
    render(<TripsPage />);
    await user.click(screen.getByTestId('trip-card'));
    expect(push).toHaveBeenCalledWith('/trips/b1');
  });
});
```

- [ ] **Step 2: Run it, expect failure**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- src/app/trips/page.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the page**

Create `frontend/src/app/trips/page.tsx`:

```tsx
'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TripCard } from '@/components/booking/TripCard';
import { useMyTrips, type TripFilter } from '@/services/tripsService';

const FILTERS: { key: TripFilter; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'all', label: 'All' },
];

function parseFilter(raw: string | null): TripFilter {
  if (raw === 'upcoming' || raw === 'past' || raw === 'cancelled' || raw === 'all') {
    return raw;
  }
  return 'upcoming';
}

function TripsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = parseFilter(searchParams.get('status'));

  const { data, isLoading, error } = useMyTrips(filter, 1, 50);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>

      <div className="mt-4 flex gap-2 border-b border-gray-200" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            data-testid={`trips-filter-${f.key}`}
            onClick={() => router.push(`/trips?status=${f.key}`)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              filter === f.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-gray-600">
            <div className="mr-3 h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600" />
            Loading your trips…
          </div>
        )}

        {error && !isLoading && (
          <p className="py-12 text-center text-red-600" role="alert">
            We couldn&apos;t load your trips. Please try again.
          </p>
        )}

        {!isLoading && !error && data && data.bookings.length === 0 && (
          <p className="py-12 text-center text-gray-600" data-testid="trips-empty">
            You have no trips here yet.
          </p>
        )}

        {!isLoading && !error && data && data.bookings.length > 0 && (
          <ul className="flex flex-col gap-3" data-testid="trips-list">
            {data.bookings.map((trip) => (
              <li key={trip.id}>
                <TripCard trip={trip} onClick={(id) => router.push(`/trips/${id}`)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export default function TripsPage() {
  return (
    <Suspense>
      <TripsPageContent />
    </Suspense>
  );
}
```

- [ ] **Step 4: Run the test, expect PASS**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- src/app/trips/page.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(trips): My Trips list page with status filter (#75)"
```

---

### Task 5: Trip detail + cancel page `/trips/[id]` (#76)

**Files:**
- Create: `frontend/src/app/trips/[id]/page.tsx`
- Test: `frontend/src/app/trips/[id]/page.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/app/trips/[id]/page.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'b1' }),
  useRouter: () => ({ push: vi.fn() }),
}));

const useBookingDetail = vi.fn();
const mutateAsync = vi.fn();
const useCancelBooking = vi.fn(() => ({ mutateAsync, isPending: false, error: null }));
vi.mock('@/services/tripsService', () => ({
  useBookingDetail: (...a: unknown[]) => useBookingDetail(...a),
  useCancelBooking: () => useCancelBooking(),
}));

import TripDetailPage from './page';

const detail = {
  id: 'b1',
  reference_number: 'BK-20300101-ABC123',
  property: { id: 'p1', title: 'Cosy Eixample Apartment', photo_url: 'https://img/1.jpg', city: 'Barcelona', country: 'Spain', address: 'Carrer 1', host_name: 'Maria' },
  check_in: '2030-06-10',
  check_out: '2030-06-13',
  guest_count: 2,
  status: 'confirmed',
  price_breakdown: { nights: 3, nightly_rate_eur: 100, subtotal_eur: 300, cleaning_fee_eur: 50, service_fee_eur: 36, tax_eur: 0, total_eur: 386 },
  cancellation_policy: 'Full refund if cancelled 48+ hours before check-in',
  can_cancel: true,
  refund_amount_eur: 386,
  created_at: '2026-01-01T10:00:00Z',
};

describe('TripDetailPage', () => {
  beforeEach(() => {
    useBookingDetail.mockReset();
    mutateAsync.mockReset();
    useCancelBooking.mockReturnValue({ mutateAsync, isPending: false, error: null });
  });

  it('renders booking detail with property, dates and price', () => {
    useBookingDetail.mockReturnValue({ data: detail, isLoading: false, error: null });
    render(<TripDetailPage />);
    expect(screen.getByText('Cosy Eixample Apartment')).toBeInTheDocument();
    expect(screen.getByText('BK-20300101-ABC123')).toBeInTheDocument();
    expect(screen.getByText('€386.00')).toBeInTheDocument();
  });

  it('shows a 404 message when the booking is not found', () => {
    useBookingDetail.mockReturnValue({ data: undefined, isLoading: false, error: { status: 404 } });
    render(<TripDetailPage />);
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });

  it('hides the cancel button when can_cancel is false', () => {
    useBookingDetail.mockReturnValue({ data: { ...detail, can_cancel: false }, isLoading: false, error: null });
    render(<TripDetailPage />);
    expect(screen.queryByTestId('open-cancel-button')).not.toBeInTheDocument();
  });

  it('opens the modal and confirms cancellation', async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue({ booking_id: 'b1', status: 'cancelled', refund_amount_eur: 386, refund_status: 'full_refund' });
    useBookingDetail.mockReturnValue({ data: detail, isLoading: false, error: null });

    render(<TripDetailPage />);
    await user.click(screen.getByTestId('open-cancel-button'));
    expect(screen.getByTestId('cancellation-modal')).toBeInTheDocument();
    await user.click(screen.getByTestId('confirm-cancel-button'));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ bookingId: 'b1', reason: undefined }));
  });
});
```

- [ ] **Step 2: Run it, expect failure**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- "src/app/trips/[id]/page.test.tsx"`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the page**

Create `frontend/src/app/trips/[id]/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import { CancellationModal } from '@/components/booking/CancellationModal';
import { useBookingDetail, useCancelBooking } from '@/services/tripsService';
import type { BookingStatus } from '@/types';

const STATUS_STYLES: Record<BookingStatus, string> = {
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = typeof params.id === 'string' ? params.id : undefined;

  const { data, isLoading, error } = useBookingDetail(bookingId);
  const cancelBooking = useCancelBooking();

  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center text-gray-600">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        Loading your booking…
      </main>
    );
  }

  if (error || !data) {
    const notFound = (error as { status?: number } | null)?.status === 404;
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-gray-700" role="alert">
          {notFound ? 'Booking not found.' : 'We couldn’t load this booking.'}
        </p>
        <button
          type="button"
          onClick={() => router.push('/trips')}
          className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
        >
          Back to My Trips
        </button>
      </main>
    );
  }

  const pb = data.price_breakdown;

  async function handleConfirmCancel() {
    if (!bookingId) return;
    try {
      await cancelBooking.mutateAsync({ bookingId, reason: undefined });
      setModalOpen(false);
    } catch {
      // error surfaced via cancelBooking.error in the modal
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <button
        type="button"
        onClick={() => router.push('/trips')}
        className="mb-4 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> My Trips
      </button>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <img
          src={data.property.photo_url}
          alt={`Photo of ${data.property.title}`}
          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/600x300?text=No+Image'; }}
          className="h-48 w-full object-cover"
        />
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-gray-900">{data.property.title}</h1>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[data.status]}`}>
              {data.status}
            </span>
          </div>

          <p className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="h-4 w-4" aria-hidden />
            {data.property.city}, {data.property.country}
            {data.property.address ? ` · ${data.property.address}` : ''}
          </p>
          {data.property.host_name && (
            <p className="text-sm text-gray-600">Hosted by {data.property.host_name}</p>
          )}

          <p className="text-sm text-gray-500">Reference: {data.reference_number}</p>
          <p className="text-sm text-gray-700">
            {formatDate(data.check_in)} → {formatDate(data.check_out)} · {data.guest_count} guest
            {data.guest_count === 1 ? '' : 's'}
          </p>

          <div className="mt-2 border-t border-gray-100 pt-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>€{pb.nightly_rate_eur.toFixed(2)} × {pb.nights} nights</span>
              <span>€{pb.subtotal_eur.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Cleaning fee</span><span>€{pb.cleaning_fee_eur.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Service fee</span><span>€{pb.service_fee_eur.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 font-bold text-gray-900">
              <span>Total</span><span>€{pb.total_eur.toFixed(2)}</span>
            </div>
          </div>

          {data.cancellation_policy && (
            <p className="mt-2 text-xs text-gray-500">{data.cancellation_policy}</p>
          )}

          {data.can_cancel && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              data-testid="open-cancel-button"
              className="mt-3 self-start rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Cancel booking
            </button>
          )}
        </div>
      </div>

      <CancellationModal
        isOpen={modalOpen}
        policy={data.cancellation_policy ?? 'Full refund if cancelled 48+ hours before check-in'}
        refundAmountEur={data.refund_amount_eur}
        isCancelling={cancelBooking.isPending}
        error={cancelBooking.error ? cancelBooking.error.message : null}
        onConfirm={handleConfirmCancel}
        onClose={() => setModalOpen(false)}
      />
    </main>
  );
}
```

- [ ] **Step 4: Run the test, expect PASS**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- "src/app/trips/[id]/page.test.tsx"`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(trips): trip detail page with cancellation flow (#76)"
```

---

### Task 6: Enable the confirmation "View My Trips" button

**Files:**
- Modify: `frontend/src/app/confirmation/[id]/page.tsx`
- Modify (if it asserts the disabled state): `frontend/src/app/confirmation/[id]/page.test.tsx`

- [ ] **Step 1: Enable the button**

In `frontend/src/app/confirmation/[id]/page.tsx`, replace the disabled "View My Trips" button:

```tsx
{/* "View My Trips" — coming soon in US4 */}
<button
  type="button"
  disabled
  title="Coming soon"
  className="py-3 px-6 border border-gray-300 text-gray-400 font-semibold rounded-xl cursor-not-allowed"
  data-testid="view-trips-button"
>
  View My Trips
  <span className="ml-2 text-xs font-normal">(coming soon)</span>
</button>
```

with:

```tsx
{/* "View My Trips" */}
<button
  type="button"
  onClick={() => router.push('/trips')}
  className="py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
  data-testid="view-trips-button"
>
  View My Trips
</button>
```

(`router` is already in scope on that page.)

- [ ] **Step 2: Update the test if needed**

Run the confirmation page test: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- "src/app/confirmation/[id]/page.test.tsx"`.
If a test asserts the button is `disabled` or contains "coming soon", update ONLY that assertion to reflect the now-enabled button (e.g. assert it is enabled and, if practical, that clicking it pushes `/trips`). Do not change unrelated assertions. If no test references the button, skip this step. Re-run until green.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(trips): enable 'View My Trips' button on confirmation page (#75)"
```

---

### Task 7: Verify (test + build) + PR

- [ ] **Step 1: Full frontend test suite**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test`
Expected: all tests pass — no `N failed`.

- [ ] **Step 2: Production build (TypeScript strict)**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run build`
Expected: build succeeds (no type errors). `/trips` and `/trips/[id]` appear in the route output.

- [ ] **Step 3: Manual smoke (optional but recommended)**

If the dev stack is available: `npm run dev`, log in, open `/trips`, switch filter tabs (URL `?status=` updates), open a trip, open the cancellation modal. Confirm Network calls hit `:8080/api/v1/bookings/...` with an `Authorization` header and there are no console errors. (Full journey automation is Slice C / Playwright.)

- [ ] **Step 4: Push and open the PR**

```bash
git push -u origin issue-72-us4-trips-frontend
gh pr create --title "US4 Slice B — My Trips & Cancellation frontend (#72-#76)" --body "$(cat <<'EOF'
## What
Frontend for **US4 — My Trips & Cancellation**:
- `services/tripsService.ts` — `useMyTrips` / `useBookingDetail` / `useCancelBooking` (cancel invalidates trips + detail queries)
- `components/booking/TripCard.tsx` + `CancellationModal.tsx`
- `app/trips/page.tsx` (list + status filter tabs) and `app/trips/[id]/page.tsx` (detail + cancel)
- Enabled the confirmation page's "View My Trips" button → `/trips`

## Why
US4 (spec.md). Design: `docs/superpowers/specs/2026-06-20-us4-my-trips-cancellation-design.md`; plan: `docs/superpowers/plans/2026-06-21-us4-trips-slice-b-frontend.md`. Consumes the Slice A backend (PR #149).

## Impact
- No new types (all existed in `src/types/index.ts`). JWT auto-attached by the existing `apiClient` interceptor.
- Adds routes `/trips` and `/trips/[id]`. No global nav added (deferred).

## Tests
- vitest unit/component tests for the hooks, `TripCard`, `CancellationModal`, and both pages (loading/empty/error/navigation/cancel-flow). Full suite + `next build` green.
- **The end-to-end browser journey (book → My Trips → cancel) is Slice C** (Playwright) — per the flow-testing strategy, the new journey lands there.

## References
- User Story: US4 — Manage Bookings (spec.md) · Tasks T071–T075 · Issues #72 #73 #74 #75 #76

## Checklist
- [x] `'use client'` on hook/state components; data fetched by pages, passed as props to display components
- [x] No hardcoded API URLs (via `apiClient`); snake_case contract types
- [x] vitest green + `next build` green
- [ ] Journey E2E (Playwright) — tracked for Slice C
- [x] No secrets/PII in code or logs
EOF
)"
```

- [ ] **Step 5: Report** the test count, build result, and PR URL. Do **not** close the issues (the user closes them).

---

## Self-review

- **Spec coverage:** tripsService 3 hooks + invalidation ✓ (T1); TripCard ✓ (T2); CancellationModal ✓ (T3); `/trips` list + filter + loading/empty/error ✓ (T4); `/trips/[id]` detail + price breakdown + policy + cancel modal flow + 404 ✓ (T5); confirmation button enabled ✓ (T6); build/test gate ✓ (T7). Playwright journey explicitly deferred to Slice C (design's rollout).
- **Placeholder scan:** every step has complete code; the one conditional (Task 6 test update) is gated on whether an assertion exists, with explicit instructions.
- **Type/identifier consistency:** hooks return `MyTripsResponse`/`BookingDetailResponse`/`CancellationResponse` (existing types); `TripFilter` = `'all'|'upcoming'|'past'|'cancelled'`; query keys `['myTrips', …]` / `['bookingDetail', id]` are the exact keys the cancel mutation invalidates; `TripCard` props `{ trip: BookingSummary, onClick }`; `CancellationModal` props `{ isOpen, policy, refundAmountEur, isCancelling, error?, onConfirm, onClose }`; pages use `useMyTrips`/`useBookingDetail`/`useCancelBooking` exactly as exported. `data-testid`s (`trip-card`, `cancellation-modal`, `confirm-cancel-button`, `open-cancel-button`, `view-trips-button`) are stable hooks for the Slice C Playwright journey.
