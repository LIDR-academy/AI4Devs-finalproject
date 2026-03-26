import { useQuery } from '@tanstack/react-query';
import {
  getTripBalances,
  getTripSettledBalances,
  mapSettleTransactionsToBalances,
} from '@/services/balance.service';
import type { BalancesResponse } from '@/types/balance.types';
import type { Balance } from '@/types/trip.types';

interface UseTripBalancesResult {
  balances?: BalancesResponse;
  balancesLoading: boolean;
  balancesError: unknown;
  refetchBalances: () => Promise<unknown>;
  settledBalances?: Balance[];
  settledLoading: boolean;
  settledError: unknown;
  refetchSettled: () => Promise<unknown>;
  isLoading: boolean;
}

/**
 * Custom hook to fetch trip balances and settled balances.
 * Encapsulates query keys and state management for balances.
 *
 * @param tripId - Trip ID (undefined to disable queries)
 * @returns Object with balances data, loading states, errors, and refetch functions
 */
export function useTripBalances(tripId: string | undefined): UseTripBalancesResult {
  // Query for detailed balances
  const {
    data: balances,
    isLoading: balancesLoading,
    error: balancesError,
    refetch: refetchBalances,
  } = useQuery({
    queryKey: ['trip-balances', tripId],
    queryFn: () => getTripBalances(tripId!),
    enabled: !!tripId,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });

  // Query for settled balances (simplified transactions)
  const {
    data: settleResponse,
    isLoading: settledLoading,
    error: settledError,
    refetch: refetchSettled,
  } = useQuery({
    queryKey: ['trip-settled-balances', tripId],
    queryFn: () => getTripSettledBalances(tripId!),
    enabled: !!tripId,
    staleTime: 30 * 1000, // 30 seconds (shorter because it's calculated)
    retry: 1,
  });

  // Map settled transactions to Balance format
  const settledBalances = settleResponse
    ? mapSettleTransactionsToBalances(settleResponse.transactions)
    : undefined;

  const isLoading = balancesLoading || settledLoading;

  return {
    balances,
    balancesLoading,
    balancesError,
    refetchBalances,
    settledBalances,
    settledLoading,
    settledError,
    refetchSettled,
    isLoading,
  };
}
