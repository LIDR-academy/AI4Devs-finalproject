import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExpenseCategories } from '@/services/expense.service';
import { useTripParticipants } from './useTripParticipants';
import type { ExpenseCategory } from '@/types/expense.types';
import type { TripParticipant } from '@/types/trip.types';

interface User {
  id: string;
  nombre: string;
  email: string;
}

/**
 * Mock data for development when backend is not available
 */
const MOCK_CATEGORIES: ExpenseCategory[] = [
  { id: 1, name: 'Comida', icon: 'comida', is_active: true },
  { id: 2, name: 'Transporte', icon: 'transporte', is_active: true },
  { id: 3, name: 'Alojamiento', icon: 'alojamiento', is_active: true },
  { id: 4, name: 'Entretenimiento', icon: 'entretenimiento', is_active: true },
  { id: 5, name: 'Compras', icon: 'compras', is_active: true },
  { id: 6, name: 'Varios', icon: 'varios', is_active: true },
];

/**
 * Creates mock participants based on current user
 */
function createMockParticipants(user: User | null, tripId?: string): TripParticipant[] {
  if (!user) return [];

  return [
    {
      id: 'mock-1',
      trip_id: tripId || 'mock-trip',
      user_id: user.id,
      role: 'CREATOR' as const,
      joined_at: new Date().toISOString(),
      is_active: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
      },
    },
  ];
}

interface UseExpenseFormDataOptions {
  tripId?: string;
  user: User | null;
}

interface UseExpenseFormDataReturn {
  categories: ExpenseCategory[];
  participants: TripParticipant[];
  isUsingMockData: boolean;
  isLoading: boolean;
  errors: {
    categories: Error | null;
    participants: Error | null;
  };
  refetch: {
    categories: () => void;
    participants: () => void;
  };
}

/**
 * Hook to manage expense form data (categories and participants)
 * Handles both real data from API and mock data for development
 * @param options - Configuration options
 * @returns Form data, loading states, errors, and refetch functions
 */
export function useExpenseFormData({
  tripId,
  user,
}: UseExpenseFormDataOptions): UseExpenseFormDataReturn {
  // Fetch real categories from API
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: getExpenseCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry if backend is not available
    placeholderData: MOCK_CATEGORIES, // Use mock as placeholder
  });

  // Fetch real participants from API
  const {
    participants: fetchedParticipants = [],
    isLoading: isLoadingParticipants,
    error: participantsError,
    refetch: refetchParticipantsData,
  } = useTripParticipants(tripId);

  // Create mock participants
  const mockParticipants = useMemo(() => createMockParticipants(user, tripId), [user, tripId]);

  // Determine if we should use mock data
  // Use mock if: no tripId OR backend errors OR no data available
  const shouldUseMockData = useMemo(() => {
    const hasCategoriesError = categoriesError !== null;
    const hasParticipantsError = participantsError !== null;
    const noCategories = categories.length === 0;
    const noParticipants = fetchedParticipants.length === 0;

    return (
      !tripId || // No tripId = development mode
      hasCategoriesError || // Backend error for categories
      hasParticipantsError || // Backend error for participants
      (noCategories && hasCategoriesError) || // No categories and error
      (noParticipants && hasParticipantsError && !tripId) // No participants, error, and no tripId
    );
  }, [tripId, categoriesError, participantsError, categories.length, fetchedParticipants.length]);

  // Select final data (mock or real)
  const finalCategories = useMemo(() => {
    if (shouldUseMockData && (categories.length === 0 || categoriesError)) {
      return MOCK_CATEGORIES;
    }
    return categories;
  }, [shouldUseMockData, categories, categoriesError]);

  const finalParticipants = useMemo(() => {
    if (shouldUseMockData && (fetchedParticipants.length === 0 || participantsError) && user) {
      return mockParticipants;
    }
    return fetchedParticipants;
  }, [shouldUseMockData, fetchedParticipants, participantsError, user, mockParticipants]);

  // Determine loading state (only if not using mock data)
  const isLoading = useMemo(() => {
    return !shouldUseMockData && (isLoadingCategories || isLoadingParticipants);
  }, [shouldUseMockData, isLoadingCategories, isLoadingParticipants]);

  return {
    categories: finalCategories,
    participants: finalParticipants,
    isUsingMockData: shouldUseMockData,
    isLoading,
    errors: {
      categories: categoriesError as Error | null,
      participants: participantsError as Error | null,
    },
    refetch: {
      categories: () => {
        void refetchCategories();
      },
      participants: () => {
        void refetchParticipantsData();
      },
    },
  };
}
