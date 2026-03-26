import { useQuery } from '@tanstack/react-query';
import { getExpensesByTrip } from '@/services/expense.service';
import type { ExpenseListResponse, ExpenseListQuery } from '@/types/expense.types';

interface UseExpensesListOptions {
  page?: number;
  limit?: number;
  category_id?: number;
}

interface UseExpensesListResult {
  expenses: ExpenseListResponse['expenses'];
  meta: ExpenseListResponse['meta'];
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
}

/**
 * Custom hook to fetch expenses list for a trip.
 * Encapsulates query keys and pagination defaults.
 *
 * @param tripId - ID of the trip
 * @param options - Optional query parameters (page, limit, category_id)
 * @returns Expenses list data, loading state, error, and refetch function
 */
export function useExpensesList(
  tripId: string | undefined,
  options: UseExpensesListOptions = {},
): UseExpensesListResult {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const category_id = options.category_id;

  const query: ExpenseListQuery = {
    page,
    limit,
    ...(category_id && { category_id }),
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['expenses', tripId, query],
    queryFn: () => getExpensesByTrip(tripId!, query),
    enabled: !!tripId,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });

  return {
    expenses: data?.expenses ?? [],
    meta: data?.meta ?? {
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false,
    },
    isLoading,
    error,
    refetch,
  };
}
