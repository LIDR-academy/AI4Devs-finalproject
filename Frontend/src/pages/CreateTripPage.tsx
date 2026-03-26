import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, UserCheck, UserX, X, Info } from 'lucide-react';
import { Header } from '@/components';
import { createTripSchema } from '@/schemas/trip.schema';

/** Form input type (currency optional before default is applied). */
interface CreateTripFormInput {
  name: string;
  currency?: 'COP' | 'USD';
}
import { createTrip } from '@/services/trip.service';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { CurrencySelector } from '@/components/molecules/CurrencySelector';
import { useAuthContext } from '@/contexts/AuthContext';
import type { ApiError } from '@/types/api.types';
import { API_BASE_URL } from '@/config/api';
import type { TripCurrency } from '@/types/trip.types';

interface Participant {
  email: string;
  name: string;
  isCreator: boolean;
}

interface SearchResult {
  email: string;
  name: string;
  exists: boolean;
}

/**
 * CreateTripPage
 * Form to create a new trip with name, currency selection, and participants
 * Currency can be selected between COP (Colombian Peso) or USD (US Dollar)
 * Default currency is COP if not specified
 *
 * Features:
 * - Select trip currency (COP or USD)
 * - Search users by email
 * - Add existing users as participants
 * - Invite non-registered users
 * - Creator is automatically added
 *
 * On success: Invalidates trip queries and navigates to trips list
 * On error: Displays user-friendly error message
 */
export function CreateTripPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, token } = useAuthContext();

  // Search state
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Participants state - Creator is added by default
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (!user) return;

    setParticipants(prev => {
      if (prev.some(p => p.isCreator)) return prev;

      const creator: Participant = {
        email: user.email,
        name: user.nombre || 'Tú',
        isCreator: true,
      };

      return [creator, ...prev];
    });
  }, [user]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
  } = useForm<CreateTripFormInput>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      currency: 'COP',
    },
  });

  const selected_currency = watch('currency') as TripCurrency;

  // Mutation for creating trip
  const mutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      // Invalidate trips query to refetch updated list
      queryClient.invalidateQueries({ queryKey: ['user-trips'] });
      // Navigate back to trips list
      navigate('/trips');
    },
    onError: (error: ApiError) => {
      // Display user-friendly error message
      setError('root', {
        type: 'manual',
        message: error.message || 'No pudimos crear el viaje. Intenta de nuevo.',
      });
    },
  });

  // Search user by email (mock implementation - should call API)
  const handleSearchUser = async () => {
    const trimmedEmail = searchEmail.trim().toLowerCase();
    if (!trimmedEmail) return;

    if (!token) {
      setError('root', {
        type: 'manual',
        message: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
      });
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/search?email=${encodeURIComponent(trimmedEmail)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 404) {
        setSearchResult({ email: trimmedEmail, name: '', exists: false });
        return;
      }

      if (!response.ok) {
        throw new Error('No se pudo buscar el usuario');
      }

      const data = await response.json();
      setSearchResult({
        email: data.email ?? trimmedEmail,
        name: data.nombre ?? data.name ?? trimmedEmail.split('@')[0],
        exists: true,
      });
    } catch (err) {
      setSearchResult(null);
      setError('root', {
        type: 'manual',
        message:
          err instanceof Error ? err.message : 'No pudimos buscar el usuario. Intenta nuevamente.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Add participant to list
  const handleAddParticipant = () => {
    if (!searchResult) return;

    // Check if already added
    if (participants.some(p => p.email === searchResult.email)) {
      setError('root', {
        type: 'manual',
        message: 'Este participante ya fue agregado',
      });
      return;
    }

    setParticipants([
      ...participants,
      {
        email: searchResult.email,
        name: searchResult.name || searchResult.email.split('@')[0],
        isCreator: false,
      },
    ]);

    // Clear search
    setSearchEmail('');
    setSearchResult(null);
  };

  // Remove participant from list
  const handleRemoveParticipant = (email: string) => {
    setParticipants(participants.filter(p => p.email !== email));
  };

  const onSubmit = (data: CreateTripFormInput) => {
    const creator = participants.find(p => p.isCreator && p.email);

    if (!creator) {
      setError('root', {
        type: 'manual',
        message: 'Agrega el creador antes de crear el viaje',
      });
      return;
    }

    // Add participant emails to the request
    const memberEmails = participants.filter(p => !p.isCreator).map(p => p.email);

    mutation.mutate({
      name: data.name,
      currency: data.currency ?? 'COP',
      memberEmails: memberEmails.length > 0 ? memberEmails : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <Header title="Crear Viaje" showBackButton={true} />

      <main className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Card wrapper */}
            <div className="bg-white rounded-xl p-6 space-y-6">
              {/* Trip name input */}
              <div>
                <Input
                  {...register('name')}
                  label="Nombre del viaje"
                  placeholder="Ej: Viaje a Cartagena"
                  error={errors.name?.message}
                  autoFocus
                />
              </div>

              {/* Currency selector */}
              <div>
                <CurrencySelector
                  selected_currency={selected_currency}
                  on_select={(currency: TripCurrency) => setValue('currency', currency)}
                  error={errors.currency?.message}
                />
              </div>

              {/* Information about code generation */}
              <div className="space-y-2">
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Info size={16} className="text-slate-400 shrink-0" />
                  <span>Se generará un código único para invitar</span>
                </p>
              </div>

              {/* Separator */}
              <div className="border-b border-slate-200" />

              {/* Participants section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-900">Participantes</h3>

                {/* Search by email */}
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">Agregar por correo</p>

                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="maria@example.com"
                      value={searchEmail}
                      onChange={e => setSearchEmail(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchUser();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={handleSearchUser}
                      disabled={isSearching || !searchEmail.trim()}
                    >
                      <Search size={18} />
                      Buscar
                    </Button>
                  </div>

                  {/* Search result */}
                  {searchResult && (
                    <div className="rounded-xl p-3 flex items-center justify-between border">
                      <div className="flex items-center gap-3">
                        {searchResult.exists ? (
                          <UserCheck className="text-emerald-600" size={20} />
                        ) : (
                          <UserX className="text-red-600" size={20} />
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {searchResult.exists ? 'Usuario encontrado' : 'Usuario no registrado'}
                          </p>
                          <p className="text-xs text-slate-500">{searchResult.email}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant={searchResult.exists ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={handleAddParticipant}
                      >
                        {searchResult.exists ? 'Agregar' : 'Invitar'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Participants list */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Participantes agregados:</p>
                  <ul className="space-y-2">
                    {participants.map(participant => (
                      <li
                        key={participant.email}
                        className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm text-slate-900 truncate">
                            {participant.name}
                            {participant.isCreator && ' (Tú)'}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                              participant.isCreator
                                ? 'bg-violet-100 text-violet-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {participant.isCreator ? 'Creador' : 'Participante'}
                          </span>
                        </div>
                        {!participant.isCreator && (
                          <button
                            type="button"
                            onClick={() => handleRemoveParticipant(participant.email)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            aria-label="Eliminar participante"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Root error message (from API) */}
            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600 font-medium">{errors.root.message}</p>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Creando viaje...' : 'Crear Viaje'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
