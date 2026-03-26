/**
 * Custom hook to fetch and aggregate data for HomePage
 * Fetches trips, balances, and expenses from all user trips
 */

import { useQuery, useQueries } from '@tanstack/react-query';
import { useAuthContext } from '@/contexts/AuthContext';
import { getUserTrips } from '@/services/trip.service';
import { getTripSettledBalances } from '@/services/balance.service';
import { getExpensesByTrip } from '@/services/expense.service';
import {
  aggregateBalancesFromTrips,
  getTotalSpentFromTrips,
  getRecentTrips,
} from '@/utils/homePageData';
import type { TripListItem } from '@/types/trip.types';
import type { Balance } from '@/types/trip.types';
import type { SettleResponse } from '@/types/balance.types';
import type { ExpenseListItem } from '@/types/expense.types';

interface UseHomePageDataResult {
  trips: TripListItem[];
  recentTrips: TripListItem[];
  balances: Balance[];
  recentExpenses: Array<{ expense: ExpenseListItem; currency: string }>;
  totalSpent: number;
  isLoading: boolean;
  balancesLoading: boolean;
  expensesLoading: boolean;
  error: unknown;
  refetch: () => void;
}

/**
 * Custom hook to fetch homepage data
 * Aggregates data from all user trips for dashboard display
 *
 * @returns Object with trips, balances, expenses, loading states, and refetch function
 */
export function useHomePageData(): UseHomePageDataResult {
  const { isAuthenticated, token, user } = useAuthContext();

  // Query to get all user trips
  const {
    data: trips = [],
    isLoading: tripsLoading,
    error: tripsError,
    refetch: refetchTrips,
  } = useQuery({
    queryKey: ['user-trips'],
    queryFn: () => getUserTrips(),
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get recent trips (max 3) for optimization
  const recentTrips = getRecentTrips(trips, 3);

  // Query to get settled balances for each trip (only recent trips for performance)
  const balancesQueries = useQueries({
    queries: recentTrips.map(trip => ({
      queryKey: ['trip-settled-balances', trip.id],
      queryFn: () => getTripSettledBalances(trip.id),
      enabled: isAuthenticated && !!token && !!trip.id,
      staleTime: 30 * 1000, // 30 seconds
      retry: 1,
    })),
  });

  // Query to get recent expenses for each trip (only recent trips for performance)
  const expensesQueries = useQueries({
    queries: recentTrips.map(trip => ({
      queryKey: ['expenses', trip.id, { page: 1, limit: 10 }],
      queryFn: () => getExpensesByTrip(trip.id, { page: 1, limit: 10 }),
      enabled: isAuthenticated && !!token && !!trip.id,
      staleTime: 30 * 1000, // 30 seconds
      retry: 1,
    })),
  });

  // Process balances
  const balancesLoading = balancesQueries.some(query => query.isLoading);
  const balancesError = balancesQueries.find(query => query.error)?.error;

  const settleResponses = balancesQueries
    .map((query, index) => {
      const trip = recentTrips[index];
      if (!query.data || !trip) return null;

      return {
        tripId: trip.id,
        tripName: trip.name,
        transactions: (query.data as SettleResponse).transactions,
      };
    })
    .filter((response): response is NonNullable<typeof response> => response !== null);

  const balances =
    user?.id && settleResponses.length > 0
      ? aggregateBalancesFromTrips(settleResponses, user.id)
      : [];

  // Process expenses
  const expensesLoading = expensesQueries.some(query => query.isLoading);
  const expensesError = expensesQueries.find(query => query.error)?.error;

  // Combine all expenses from all trips
  const allExpenses: Array<{ expense: ExpenseListItem; tripName: string; currency: string }> = [];

  expensesQueries.forEach((query, index) => {
    const trip = recentTrips[index];
    if (!query.data || !trip) return;

    const expenses = query.data.expenses || [];
    expenses.forEach(expense => {
      allExpenses.push({
        expense,
        tripName: trip.name,
        currency: trip.currency || 'COP',
      });
    });
  });

  // Sort expenses by date (most recent first) and take top 3
  const sortedExpenses = allExpenses.sort((a, b) => {
    const dateA = new Date(
      typeof a.expense.expense_date === 'string'
        ? a.expense.expense_date
        : a.expense.expense_date instanceof Date
          ? a.expense.expense_date
          : a.expense.createdAt,
    ).getTime();

    const dateB = new Date(
      typeof b.expense.expense_date === 'string'
        ? b.expense.expense_date
        : b.expense.expense_date instanceof Date
          ? b.expense.expense_date
          : b.expense.createdAt,
    ).getTime();

    return dateB - dateA; // Descending order (most recent first)
  });

  const top3Expenses = sortedExpenses.slice(0, 3);

  // Return ExpenseListItem with currency for ExpenseCard compatibility
  const recentExpenses = top3Expenses.map(({ expense, currency }) => ({
    expense,
    currency: currency as 'COP' | 'USD',
  }));

  // Calculate total spent
  const totalSpent = getTotalSpentFromTrips(trips);

  // Combined loading state
  const isLoading = tripsLoading || balancesLoading || expensesLoading;

  // Combined error (prioritize trips error as it's the main query)
  const error = tripsError || balancesError || expensesError;

  // Refetch function
  const refetch = () => {
    refetchTrips();
    balancesQueries.forEach(query => query.refetch());
    expensesQueries.forEach(query => query.refetch());
  };

  return {
    trips,
    recentTrips,
    balances,
    recentExpenses,
    totalSpent,
    isLoading,
    balancesLoading,
    expensesLoading,
    error,
    refetch,
  };
}
