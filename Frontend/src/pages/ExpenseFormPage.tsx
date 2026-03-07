import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@/contexts/AuthContext';
import { ExpenseForm } from '@/components/molecules/ExpenseForm';
import { useExpenseForm } from '@/hooks/useExpenseForm';
import { useExpenseFormData } from '@/hooks/useExpenseFormData';
import { getTripById } from '@/services/trip.service';
import { Card } from '@/components/molecules/Card';
import { Skeleton } from '@/components/atoms/Skeleton';
import { Toast } from '@/components/atoms/Toast';
import { DevIndicator } from '@/components/atoms/DevIndicator';
import { ErrorState } from '@/components/molecules/ErrorState';
import type { TripCurrency } from '@/types/trip.types';

/**
 * ExpenseFormPage component
 * Complete expense form page with mobile-first layout
 */
export const ExpenseFormPage = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useAuthContext();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch trip data to get currency
  const { data: trip_data } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => (tripId ? getTripById(tripId) : null),
    enabled: !!tripId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const trip_currency: TripCurrency = (trip_data?.currency as TripCurrency) || 'COP';

  // Use custom hook to manage form data (categories and participants)
  const { categories, participants, isUsingMockData, isLoading, errors, refetch } =
    useExpenseFormData({
      tripId,
      user,
    });

  const {
    submitExpense,
    isLoading: isSubmitting,
    error: expenseError,
  } = useExpenseForm({
    tripId: tripId || '',
    onSuccess: () => {
      window.history.back();
    },
    onSuccessMessage: message => {
      setSuccessMessage(message);
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card>
          <p className="text-center text-slate-600">Debes iniciar sesión para crear gastos</p>
        </Card>
      </div>
    );
  }

  // Show loading only if we're not using mock data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <div className="max-w-md mx-auto px-6 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Card>
            <div className="space-y-6">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="flex gap-3 overflow-x-auto pb-2">
                  <Skeleton className="h-20 w-20 rounded-xl flex-shrink-0" />
                  <Skeleton className="h-20 w-20 rounded-xl flex-shrink-0" />
                  <Skeleton className="h-20 w-20 rounded-xl flex-shrink-0" />
                </div>
              </div>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card>
          <p className="text-center text-slate-600">
            No hay participantes en este viaje. Invita a tus amigos primero.
          </p>
          {!tripId && import.meta.env.DEV && (
            <p className="text-center text-sm text-slate-500 mt-2">
              Nota: Estás en modo desarrollo. El formulario requiere un tripId para funcionar
              completamente.
            </p>
          )}
        </Card>
      </div>
    );
  }

  if (categories.length === 0 && errors.categories && !isUsingMockData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card>
          <ErrorState
            message="No se pudieron cargar las categorías. Por favor, verifica tu conexión o intenta más tarde."
            onRetry={() => refetch.categories()}
          />
        </Card>
      </div>
    );
  }

  if (participants.length === 0 && errors.participants && !isUsingMockData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card>
          <ErrorState
            message="No se pudieron cargar los participantes. Por favor, verifica tu conexión o intenta más tarde."
            onRetry={() => refetch.participants()}
          />
        </Card>
      </div>
    );
  }

  return (
    <>
      {successMessage && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage(null)}
          duration={3500}
        />
      )}
      <div className="min-h-screen bg-slate-50 pb-24">
        <div className="max-w-md mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-heading font-bold text-slate-900">Nuevo Gasto</h1>
            <DevIndicator isUsingMockData={isUsingMockData} />
          </div>
          <Card>
            <ExpenseForm
              tripId={tripId || 'mock-trip'}
              categories={categories}
              participants={participants}
              currentUserId={user.id}
              currency={trip_currency}
              onSubmit={submitExpense}
              isLoading={isSubmitting}
              error={expenseError}
            />
          </Card>
        </div>
      </div>
    </>
  );
};
