import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, Settings, Crown, User, Receipt } from 'lucide-react';
import { Header } from '@/components';
import { ErrorState } from '@/components/molecules/ErrorState';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ExpenseCard } from '@/components/molecules/ExpenseCard';
import { BalanceCard } from '@/components/molecules/BalanceCard';
import { ParticipantBalanceCard } from '@/components/molecules/ParticipantBalanceCard';
import { TripSettingsModal } from '@/components/organisms/TripSettingsModal';
import { Button } from '@/components/atoms/Button';
import { Skeleton } from '@/components/atoms/Skeleton';
import { useTripDetail } from '@/hooks/useTripDetail';
import { useExpensesList } from '@/hooks/useExpensesList';
import { useTripBalances } from '@/hooks/useTripBalances';
import { useAuthContext } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { formatRelativeDate } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';
import type { TripParticipantDetail, TripCurrency, TripResponse } from '@/types/trip.types';
import type { ExpenseListItem } from '@/types/expense.types';

type StatCardProps = {
  label: string;
  value: string | number;
};

const StatCard = ({ label, value }: StatCardProps) => (
  <div className="rounded-lg border border-slate-200 p-4 bg-white shadow-sm">
    <p className="text-xs text-slate-500 mb-1">{label}</p>
    <p className="text-lg font-semibold text-slate-900">{value}</p>
  </div>
);

/**
 * Loading state component
 * Shows skeleton while trip details are loading
 */
const LoadingState = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Cargando..." />
      <main className="flex-1 px-6 py-8">
        <div className="space-y-6 animate-pulse">
          <div className="h-32 bg-slate-200 rounded-xl"></div>
          <div className="h-48 bg-slate-200 rounded-xl"></div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </main>
    </div>
  );
};

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

/**
 * TripDetailPage
 * Displays detailed information about a specific trip
 * Shows trip info, participants, expenses, and balances
 *
 * States:
 * - Loading: Shows skeleton
 * - Error: Shows error message with retry button
 * - Success: Shows trip details with participants and expenses
 */
export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'gastos' | 'saldos' | 'participantes'>('gastos');
  const [expenses_page, set_expenses_page] = useState(1);
  const [all_expenses, set_all_expenses] = useState<ExpenseListItem[]>([]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const {
    trip,
    tripLoading: isLoading,
    tripError: error,
    refetchTrip: refetch,
  } = useTripDetail(id, { participantsPage: 1, participantsLimit: 20 });

  // Fetch balances
  const {
    balances,
    balancesLoading,
    balancesError,
    refetchBalances,
    settledBalances,
    settledLoading,
    settledError,
    refetchSettled,
    isLoading: balancesIsLoading,
  } = useTripBalances(id);

  // Fetch expenses list
  const {
    expenses,
    meta: expenses_meta,
    isLoading: expenses_loading,
    error: expenses_error,
    refetch: refetch_expenses,
  } = useExpensesList(id, { page: expenses_page, limit: 20 });

  // Reset accumulated expenses when trip changes
  useEffect(() => {
    set_all_expenses([]);
    set_expenses_page(1);
  }, [id]);

  // Accumulate expenses when page changes or expenses data changes
  useEffect(() => {
    // Only process if we have a valid trip ID
    if (!id) {
      set_all_expenses([]);
      return;
    }

    // If we're on page 1, always reset (even if expenses is empty)
    // This ensures we clear previous trip's expenses
    if (expenses_page === 1) {
      set_all_expenses(expenses);
      return;
    }

    // For subsequent pages, append new expenses (avoid duplicates)
    // Only append if we have new expenses to avoid unnecessary updates
    if (expenses.length > 0) {
      set_all_expenses(prev => {
        // If previous list is empty, just set the new expenses
        if (prev.length === 0) {
          return expenses;
        }
        // Otherwise, append avoiding duplicates
        const existing_ids = new Set(prev.map(e => e.id));
        const new_expenses = expenses.filter(e => !existing_ids.has(e.id));
        return new_expenses.length > 0 ? [...prev, ...new_expenses] : prev;
      });
    }
  }, [expenses, expenses_page, id]);

  // Handle load more expenses
  const handle_load_more = () => {
    if (expenses_meta.hasMore && !expenses_loading) {
      set_expenses_page(prev => prev + 1);
    }
  };

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header title="Error" />
        <main className="flex-1 px-6 py-8">
          <ErrorState
            message={cleanErrorMessage(error) || 'No se pudo cargar la información del viaje'}
            onRetry={() => refetch()}
          />
        </main>
      </div>
    );
  }

  // No trip found
  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header title="Viaje no encontrado" />
        <main className="flex-1 px-6 py-8">
          <ErrorState
            message="El viaje que buscas no existe o no tienes acceso a él"
            onRetry={() => navigate('/trips')}
          />
        </main>
      </div>
    );
  }

  const totalAmount = trip.totalAmount ?? 0;
  const createdDate = formatRelativeDate(trip.createdAt);
  const participants = trip.participants ?? [];
  const participantCount = trip.participantsMeta?.total ?? participants.length;
  const trip_currency = (trip.currency as TripCurrency) || 'COP';

  const handleSettingsSuccess = (updatedTrip: TripResponse) => {
    // Invalidate queries to refetch trip data
    queryClient.invalidateQueries({ queryKey: ['trip', id] });
    queryClient.invalidateQueries({ queryKey: ['user-trips'] });
    // Update the trip in cache immediately for instant UI update
    queryClient.setQueryData(['trip', id, { participantsPage: 1, participantsLimit: 20 }], updatedTrip);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title={trip.name} showBackButton={true} onBack={() => navigate('/trips')} />

      <main className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Trip Info Card */}
          <div className="bg-white rounded-xl p-6 shadow-md space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-bold text-slate-900">{trip.name}</h2>
              <p className="text-sm text-slate-500">Código: {trip.code}</p>
            </div>
            {trip.userRole === 'CREATOR' && (
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                disabled={isSettingsModalOpen}
                className="p-2 text-slate-400 hover:text-slate-600 active:scale-95 active:bg-slate-100 rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-violet-600 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Configuración"
              >
                <Settings size={20} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Participantes</p>
                <p className="text-lg font-semibold text-slate-900">{participantCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total gastado</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatCurrency(totalAmount, trip_currency)}
                  <span className="text-xs text-slate-500 ml-1">({trip_currency})</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 border-t border-slate-200 pt-6">
            <Calendar className="w-4 h-4" />
            <span>Creado {createdDate}</span>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                trip.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {trip.status === 'ACTIVE' ? 'Activo' : 'Cerrado'}
            </span>
          </div>
        </div>
        </div>

        {/* Tabs - Sticky with max-w-md for consistency */}
        <div className="sticky top-16 z-30 bg-slate-50">
          <div className="max-w-md mx-auto bg-white rounded-t-xl border-b border-slate-200 shadow-sm">
            <nav role="tablist" className="flex px-6">
              {[
                { key: 'gastos', label: 'Gastos' },
                { key: 'saldos', label: 'Saldos' },
                { key: 'participantes', label: 'Participantes' },
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  aria-controls={`${tab.key}-panel`}
                  id={`${tab.key}-tab`}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex-1 px-3 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-violet-600 focus-visible:outline-offset-2 ${
                    activeTab === tab.key
                      ? 'text-violet-600 font-semibold border-b-2 border-violet-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Expenses Section */}
        {activeTab === 'gastos' && (
          <div className="max-w-md mx-auto space-y-6">
            <section
              role="tabpanel"
              id="gastos-panel"
              aria-labelledby="gastos-tab"
              className="bg-white rounded-xl p-6 shadow-md"
            >
            <div className="flex items-center justify-between mb-4">
              <h3 id="expenses-heading" className="text-lg font-heading font-semibold text-slate-900">
                Gastos
              </h3>
              <Button size="sm" onClick={() => navigate(`/trips/${id}/expenses/new`)}>
                Agregar Gasto
              </Button>
            </div>

            {/* Loading state */}
            {expenses_loading && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <Skeleton className="h-20 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {expenses_error && !expenses_loading && (
              <ErrorState
                message={cleanErrorMessage(expenses_error) || 'No se pudieron cargar los gastos'}
                onRetry={() => refetch_expenses()}
              />
            )}

            {/* Empty state */}
            {!expenses_loading &&
              !expenses_error &&
              all_expenses.length === 0 &&
              expenses.length === 0 && (
                <EmptyState
                  icon={<Receipt size={64} className="text-slate-300" />}
                  title="Todo tranquilo por aquí"
                  description="Toca el botón 'Agregar Gasto' arriba para agregar el primer gasto"
                />
              )}

            {/* Expenses list */}
            {!expenses_loading && !expenses_error && all_expenses.length > 0 && (
              <>
                <div className="space-y-4 pt-2">
                  {all_expenses.map(expense => (
                    <div key={expense.id} className="w-full">
                      <ExpenseCard
                        expense={expense}
                        currency={trip_currency}
                        onClick={() => {
                          // TODO: Navigate to expense detail when implemented
                          // navigate(`/trips/${id}/expenses/${expense.id}`);
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Load more button */}
                {expenses_meta.hasMore && (
                  <div className="mt-6 pt-4 border-t border-slate-200 flex justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handle_load_more}
                      disabled={expenses_loading}
                    >
                      {expenses_loading ? 'Cargando...' : 'Cargar más'}
                    </Button>
                  </div>
                )}

                {/* Total count info */}
                {expenses_meta.total > 0 && (
                  <p className="mt-6 pt-4 border-t border-slate-200 text-center text-sm text-slate-500">
                    Mostrando {all_expenses.length} de {expenses_meta.total} gastos
                  </p>
                )}
              </>
            )}
          </section>
          </div>
        )}

        {/* Statistics Section */}
        {activeTab === 'saldos' && (
          <div className="max-w-md mx-auto space-y-6">
            <section
              role="tabpanel"
              id="saldos-panel"
              aria-labelledby="saldos-tab"
              className="space-y-6"
            >
            {/* Summary Section */}
            <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 id="balances-heading" className="text-lg font-heading font-semibold text-slate-900">
                  Resumen
                </h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    refetchBalances();
                    refetchSettled();
                  }}
                  disabled={balancesIsLoading}
                >
                  {balancesIsLoading ? 'Actualizando...' : 'Actualizar'}
                </Button>
              </div>

              {balancesError ? (
                <ErrorState
                  message={cleanErrorMessage(balancesError) || 'No pudimos cargar los saldos'}
                  onRetry={() => {
                    refetchBalances();
                    refetchSettled();
                  }}
                />
              ) : balancesLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-16 bg-slate-100 rounded-lg" />
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-20 bg-slate-100 rounded-lg" />
                    ))}
                  </div>
                </div>
              ) : balances ? (
                <>
                  {/* User Balance */}
                  {(() => {
                    const userBalance = balances.balances.find(
                      b => b.user_id === user?.id,
                    )?.balance ?? 0;
                    return (
                      <div
                        className={`rounded-lg p-4 border text-sm font-medium flex items-center justify-between ${
                          userBalance >= 0
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}
                      >
                        <span>Tu balance</span>
                        <span>{formatCurrency(userBalance, trip_currency)}</span>
                      </div>
                    );
                  })()}

                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 gap-3">
                    <StatCard
                      label="Gastos"
                      value={formatCurrency(
                        balances.total_expenses ?? 0,
                        trip_currency,
                      )}
                    />
                    <StatCard
                      label="Monto total"
                      value={formatCurrency(
                        balances.total_expenses ?? 0,
                        trip_currency,
                      )}
                    />
                    <StatCard
                      label="Participantes"
                      value={balances.participant_count ?? 0}
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">Sin datos de saldo disponibles.</p>
              )}
            </div>

            {/* Participant Balances Section */}
            {balances && balances.balances.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
                <h3 className="text-lg font-heading font-semibold text-slate-900">
                  Balances por Participante
                </h3>
                {balancesLoading ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-32 bg-slate-100 rounded-xl" />
                    ))}
                  </div>
                ) : balancesError ? (
                  <ErrorState
                    message={
                      cleanErrorMessage(balancesError) ||
                      'No pudimos cargar los balances de los participantes'
                    }
                    onRetry={() => refetchBalances()}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {balances.balances.map(participantBalance => (
                      <ParticipantBalanceCard
                        key={participantBalance.user_id}
                        participantBalance={participantBalance}
                        currency={trip_currency}
                        isCurrentUser={participantBalance.user_id === user?.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settled Balances Section */}
            {settledBalances && settledBalances.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
                <h3 className="text-lg font-heading font-semibold text-slate-900">
                  Saldos Simplificados
                </h3>
                <p className="text-sm text-slate-500">
                  Transacciones necesarias para equilibrar todas las cuentas
                </p>
                {settledLoading ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2].map(i => (
                      <div key={i} className="h-16 bg-slate-100 rounded-xl" />
                    ))}
                  </div>
                ) : settledError ? (
                  <ErrorState
                    message={
                      cleanErrorMessage(settledError) ||
                      'No pudimos cargar los saldos simplificados'
                    }
                    onRetry={() => refetchSettled()}
                  />
                ) : (
                  <div className="space-y-3">
                    {settledBalances.map(balance => (
                      <BalanceCard key={balance.id} balance={balance} currency={trip_currency} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty State for Balances */}
            {(!balances || balances.balances.length === 0) &&
              (!settledBalances || settledBalances.length === 0) &&
              !balancesLoading &&
              !settledLoading &&
              !balancesError &&
              !settledError && (
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <EmptyState
                    icon={<DollarSign size={48} className="text-slate-400" />}
                    title="Sin saldos"
                    description="Aún no hay gastos registrados en este viaje"
                  />
                </div>
              )}
          </section>
          </div>
        )}

        {/* Participants Section */}
        {activeTab === 'participantes' && (
          <div className="max-w-md mx-auto space-y-6">
            <section
              role="tabpanel"
              id="participantes-panel"
              aria-labelledby="participantes-tab"
              className="bg-white rounded-xl p-6 shadow-md"
            >
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-slate-100 rounded-lg" />
                ))}
              </div>
            ) : participants.length === 0 ? (
              <EmptyState
                icon={<Users size={64} className="text-slate-300" />}
                title="Aún no hay participantes"
                description={
                  trip.userRole === 'CREATOR'
                    ? 'Invita a tus amigos para empezar a dividir gastos'
                    : 'El creador del viaje puede invitar participantes'
                }
                action={
                  trip.userRole === 'CREATOR' ? (
                    <Button onClick={() => {/* TODO: Open invite modal */}}>
                      Invitar Participante
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <ul className="space-y-3">
                {participants.map((participant: TripParticipantDetail) => (
                  <li
                    key={participant.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-500" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {participant.user?.nombre || participant.user?.email}
                        </p>
                        <p className="text-xs text-slate-500">{participant.user?.email}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        participant.role === 'CREATOR'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {participant.role === 'CREATOR' ? <Crown size={14} /> : null}
                      {participant.role === 'CREATOR' ? 'Creador' : 'Miembro'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          </div>
        )}
      </main>

      {/* Trip Settings Modal */}
      {trip && (
        <TripSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          trip={trip}
          onSuccess={handleSettingsSuccess}
        />
      )}
    </div>
  );
}
