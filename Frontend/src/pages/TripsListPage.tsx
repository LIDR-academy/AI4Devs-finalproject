import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Map as MapIcon, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Header } from '@/components';
import { EmptyState } from '@/components/molecules/EmptyState';
import { TripCard } from '@/components/molecules/TripCard';
import { ErrorState } from '@/components/molecules/ErrorState';
import { Toast } from '@/components';
import { Button } from '@/components/atoms/Button';
import { JoinTripButton } from '@/components/molecules/JoinTripButton';
import { useAuthContext } from '@/contexts/AuthContext';
import { getUserTrips } from '@/services/trip.service';
import type { TripResponse } from '@/types/trip.types';

/**
 * Loading state component
 * Shows skeleton while trips are loading
 */
const LoadingState = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Mis Viajes" />
      <main className="flex-1 px-6 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-slate-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

/**
 * TripsListPage
 * Displays all trips for the authenticated user
 * Allows creation of new trips via "Crear Viaje" button
 *
 * States:
 * - Loading: Shows skeleton
 * - Error: Shows error message with retry button
 * - Empty: Shows empty state with "Crear mi primer viaje" button
 * - Success: Shows list of TripCard components
 */
// Delay to show success toast before navigation
const NAVIGATION_DELAY_MS = 1500;

/**
 * Helper function to clean error messages from backend
 * Translates technical errors to user-friendly messages
 */
const cleanErrorMessage = (error: unknown): string => {
  const message = (error as { message?: string })?.message || '';

  // Remove technical parts and translate common errors
  if (message.includes('Validation failed') || message.includes('must be')) {
    return 'Los datos ingresados no son válidos';
  }
  if (message.includes('Bad Request')) {
    return 'Solicitud inválida. Verifica los datos e intenta nuevamente';
  }
  if (message.includes('Unauthorized') || message.includes('401')) {
    return 'Tu sesión ha expirado. Inicia sesión nuevamente';
  }
  if (message.includes('Not Found') || message.includes('404')) {
    return 'No se encontró el recurso solicitado';
  }
  if (message.includes('Forbidden') || message.includes('403')) {
    return 'No tienes permisos para realizar esta acción';
  }

  return message || 'Ocurrió un error. Intenta nuevamente';
};

export function TripsListPage() {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuthContext();
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  // Use ref to prevent state updates after unmount (important for setTimeout callbacks)
  const isMountedRef = useRef(true);

  // Query to get all user trips
  const {
    data: trips,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user-trips'],
    queryFn: () => getUserTrips(),
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Handle successful join
  const handleJoinSuccess = (trip: TripResponse) => {
    setIsJoining(true);
    setToastType('success');
    setToastMessage(`Te uniste al viaje "${trip.name}"`);
    setShowToast(true);

    // Refetch trips and only navigate on success
    refetch()
      .then(result => {
        if (result.isError) {
          throw result.error;
        }

        setTimeout(() => {
          if (isMountedRef.current) {
            navigate(`/trips/${trip.id}`);
          }
        }, NAVIGATION_DELAY_MS);
      })
      .catch(err => {
        console.error('Failed to refetch trips after join:', err);
        if (isMountedRef.current) {
          setToastType('error');
          setToastMessage(
            'Te uniste al viaje exitosamente, pero hubo un problema al actualizar la lista. Puedes recargar la página o navegar manualmente al viaje.',
          );
          setShowToast(true);
        }
      })
      .finally(() => {
        if (isMountedRef.current) {
          setIsJoining(false);
        }
      });
  };

  // Handle join trip error
  const handleJoinError = (error: unknown) => {
    const errorMessage = cleanErrorMessage(error);
    setToastType('error');
    setToastMessage(errorMessage || 'No pudimos unirte al viaje. Intenta nuevamente.');
    setShowToast(true);
  };

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header title="Mis Viajes" />
        <main className="flex-1 flex items-center justify-center px-6">
          <ErrorState
            message="No pudimos cargar tus viajes. Intenta de nuevo."
            onRetry={() => refetch()}
          />
        </main>
      </div>
    );
  }

  // Empty state - No trips
  if (!trips || trips.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header title="Mis Viajes" />
        <main className="flex-1">
          <EmptyState
            icon={<MapIcon size={64} />}
            title="¿Planeando una escapada?"
            description="Crea tu primer viaje para empezar a dividir gastos fácilmente"
            action={
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/trips/new')}
              >
                + Crear mi primer viaje
              </Button>
            }
          />
        </main>
      </div>
    );
  }

  // Success state - Show trips list
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <Header
        title="Mis Viajes"
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/trips/new')}
            className="flex items-center gap-2"
            aria-label="Crear nuevo viaje"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Crear Viaje</span>
          </Button>
        }
      />
      <main className="flex-1 px-6 py-8">
        {/* Mobile-first: Content centered on desktop to simulate app experience */}
        <div className="max-w-md mx-auto">
          <div className="space-y-6">
            {/* Join Trip Button */}
            <JoinTripButton
              onSuccess={handleJoinSuccess}
              onError={handleJoinError}
              disabled={isJoining}
            />

            {/* Loading state during join */}
            {isJoining && (
              <div className="space-y-4 animate-pulse">
                {[1, 2].map(i => (
                  <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
                ))}
              </div>
            )}

            {/* Trips List */}
            {!isJoining && (
              <ul className="space-y-4" aria-label="Lista de viajes">
                {trips.map(trip => (
                  <li key={trip.id}>
                    <TripCard trip={trip} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {/* Success Toast */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
