import { useNavigate, Link } from 'react-router-dom';
import { Map as MapIcon, Users, Receipt, Calculator, Camera, DollarSign } from 'lucide-react';
import { Header } from '@/components';
import { EmptyState } from '@/components/molecules/EmptyState';
import { BalanceCard } from '@/components/molecules/BalanceCard';
import { ExpenseCard } from '@/components/molecules/ExpenseCard';
import { TripCard } from '@/components/molecules/TripCard';
import { ErrorState } from '@/components/molecules/ErrorState';
import { Button } from '@/components/atoms/Button';
import { Skeleton } from '@/components/atoms/Skeleton';
import { useAuthContext } from '@/contexts/AuthContext';
import { useHomePageData } from '@/hooks/useHomePageData';
import { formatCurrency } from '@/utils/currency';
import type { TripCurrency } from '@/types/trip.types';

/**
 * Loading state component
 * Shows skeleton or spinner while data is loading
 */
const LoadingState = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex items-center justify-center flex-1">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded-lg mx-auto mb-4"></div>
            <div className="h-4 w-64 bg-slate-200 rounded-lg mx-auto"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

/**
 * HomePage - Not Authenticated State (Landing Page)
 * Attractive landing page with information about TravelSplit and benefits
 * Follows Design System Guide: Modern Friendly, clear CTAs
 */
const HomePageNotAuthenticated = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <Users className="w-6 h-6 text-violet-600" aria-hidden="true" />,
      title: 'Invita a tus amigos',
      description: 'Agrega participantes a tu viaje y divide gastos de forma transparente',
    },
    {
      icon: <Receipt className="w-6 h-6 text-violet-600" aria-hidden="true" />,
      title: 'Registra todos los gastos',
      description: 'Sube recibos, categoriza gastos y mantén un registro completo',
    },
    {
      icon: <Calculator className="w-6 h-6 text-violet-600" aria-hidden="true" />,
      title: 'Cálculo automático',
      description: 'El sistema calcula quién debe a quién, sin complicaciones',
    },
    {
      icon: <Camera className="w-6 h-6 text-violet-600" aria-hidden="true" />,
      title: 'Evidencia de gastos',
      description: 'Guarda fotos de recibos para tener respaldo de cada gasto',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-12 md:py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-violet-100 rounded-full p-4">
                <MapIcon className="w-12 h-12 text-violet-600" aria-hidden="true" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">
              Divide gastos de viaje sin complicaciones
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              TravelSplit te ayuda a gestionar los gastos de tus viajes grupales de forma simple y
              transparente. Sin hojas de cálculo, sin confusiones.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => navigate('/register')}
              >
                Empezar ahora
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => navigate('/login')}
              >
                Iniciar sesión
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-6 py-12 bg-white">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-heading font-bold text-slate-900 text-center mb-8">
              Todo lo que necesitas para dividir gastos
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {benefits.map(benefit => (
                <div key={benefit.title} className="bg-slate-50 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">{benefit.icon}</div>
                    <div>
                      <h3 className="text-xl font-heading font-semibold text-slate-900 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-slate-600 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-12 pb-16">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">
              ¿Listo para tu próximo viaje?
            </h2>
            <p className="text-slate-600 mb-6">
              Únete a TravelSplit y disfruta de dividir gastos sin estrés
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => navigate('/register')}
              >
                Empezar ahora
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => navigate('/login')}
              >
                Ya tengo cuenta
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

/**
 * HomePage - Empty State (Authenticated but no trips)
 * Shows empty state with button to create first trip
 */
const HomePageEmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
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
};

/**
 * HomePage - With Trips State
 * Shows dashboard with balances and recent expenses for authenticated users with trips
 * Displays general overview of all user's active debts and recent expenses across all trips
 */
const HomePageWithTrips = () => {
  const navigate = useNavigate();
  const {
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
  } = useHomePageData();

  // Determine currency (use first trip's currency or default to COP)
  const defaultCurrency: TripCurrency = trips[0]?.currency || 'COP';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <Header />
      <main className="px-6 py-8">
        <div className="max-w-md mx-auto space-y-8">
          <h1 className="sr-only">Resumen general de viajes</h1>

          {/* Total Gastado Section */}
          <section>
          <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-6 h-6 text-violet-200 flex-shrink-0" aria-hidden="true" />
              <h2 className="text-lg font-heading font-semibold text-white">Total Gastado</h2>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {formatCurrency(totalSpent, defaultCurrency)}
            </p>
            <p className="text-sm text-violet-200">
              En {trips.length} {trips.length === 1 ? 'viaje' : 'viajes'}
            </p>
          </div>
        </section>

        {/* Viajes Recientes Section */}
        {recentTrips.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-heading font-semibold text-slate-900">Viajes Recientes</h2>
              {trips.length > 3 && (
                <Link
                  to="/trips"
                  className="text-sm text-violet-600 font-medium hover:underline focus-visible:outline-2 focus-visible:outline-violet-600 focus-visible:outline-offset-2 rounded-lg px-2 py-1"
                  aria-label="Ver todos mis viajes"
                >
                  Ver todos
                </Link>
              )}
            </div>
            <div className="space-y-4">
              {recentTrips.map(trip => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </section>
        )}

        {/* Saldos Section */}
        {balancesLoading ? (
          <section>
            <h2 className="text-lg font-heading font-semibold text-slate-900 mb-4">Saldos</h2>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </section>
        ) : balances.length > 0 ? (
          <section>
            <h2 className="text-lg font-heading font-semibold text-slate-900 mb-4">Saldos</h2>
            <div className="space-y-3">
              {balances.map(balance => (
                <BalanceCard
                  key={balance.id}
                  balance={balance}
                  currency={balance.tripId ? trips.find(t => t.id === balance.tripId)?.currency : defaultCurrency}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* Gastos Recientes Section */}
        {expensesLoading ? (
          <section>
            <h2 className="text-lg font-heading font-semibold text-slate-900 mb-4">Gastos Recientes</h2>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          </section>
        ) : recentExpenses.length > 0 ? (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-heading font-semibold text-slate-900">Gastos Recientes</h2>
              {trips.length > 0 && (
                <Link
                  to="/trips"
                  className="text-sm text-violet-600 font-medium hover:underline focus-visible:outline-2 focus-visible:outline-violet-600 focus-visible:outline-offset-2 rounded-lg px-2 py-1"
                  aria-label="Ver todos mis viajes"
                >
                  Ver todos
                </Link>
              )}
            </div>
            <div className="space-y-3">
              {recentExpenses.map(({ expense, currency }) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  currency={(currency as TripCurrency) || defaultCurrency}
                  onClick={() => {
                    if (expense.trip_id) {
                      navigate(`/trips/${expense.trip_id}`);
                    }
                  }}
                />
              ))}
            </div>
          </section>
        ) : null}

          {/* Error State */}
          {error && (
            <section>
              <ErrorState
                message="Hubo un problema al cargar algunos datos. Intenta de nuevo."
                onRetry={() => refetch()}
              />
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

/**
 * Home page component
 * Implements 3 states:
 * 1. Not authenticated - Shows login/register buttons
 * 2. Authenticated without trips - Shows empty state with create trip button
 * 3. Authenticated with trips - Shows summary and recent trips
 */
export const HomePage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { trips, isLoading, error, refetch } = useHomePageData();

  // Loading state
  if (authLoading) {
    return <LoadingState />;
  }

  // State 1: Not authenticated - Show landing page
  if (!isAuthenticated) {
    return <HomePageNotAuthenticated />;
  }

  // Error state - Only show if authenticated (query was enabled)
  if (error && trips.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <ErrorState
            message="No pudimos cargar tus viajes. Intenta de nuevo."
            onRetry={() => refetch()}
          />
        </main>
      </div>
    );
  }

  // Loading state - Show loading indicator during fetch/refetch
  if (isLoading && trips.length === 0) {
    return <LoadingState />;
  }

  // State 2: Authenticated without trips
  if (!trips || trips.length === 0) {
    return <HomePageEmptyState />;
  }

  // State 3: Authenticated with trips
  return <HomePageWithTrips />;
};
