import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Search, UserCheck, UserX, Loader2 } from 'lucide-react';
import { addTripParticipants } from '@/services/trip.service';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { API_BASE_URL } from '@/config/api';
import { useAuthContext } from '@/contexts/AuthContext';

interface SearchResult {
  email: string;
  name: string;
  exists: boolean;
}

interface AddParticipantsModalProps {
  tripId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal to add participants to a trip by email.
 * Only registered users can be added. Search by email, add to list, then submit.
 */
export function AddParticipantsModal({
  tripId,
  isOpen,
  onClose,
  onSuccess,
}: AddParticipantsModalProps) {
  const { token } = useAuthContext();
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [emailsToAdd, setEmailsToAdd] = useState<string[]>([]);
  const [rootError, setRootError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const savedFocusRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      savedFocusRef.current = document.activeElement as HTMLElement;
    } else if (savedFocusRef.current) {
      savedFocusRef.current.focus();
      savedFocusRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearchUser = useCallback(async () => {
    const trimmedEmail = searchEmail.trim().toLowerCase();
    if (!trimmedEmail || !token) return;

    setIsSearching(true);
    setSearchResult(null);
    setRootError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/search?email=${encodeURIComponent(trimmedEmail)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.status === 404) {
        setSearchResult({ email: trimmedEmail, name: '', exists: false });
        return;
      }

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setSearchResult({
        email: data.email ?? trimmedEmail,
        name: data.nombre ?? data.name ?? trimmedEmail.split('@')[0],
        exists: true,
      });
    } catch {
      setSearchResult(null);
      setRootError('No pudimos buscar el usuario. Intenta nuevamente.');
    } finally {
      setIsSearching(false);
    }
  }, [searchEmail, token]);

  const handleAddToList = useCallback(() => {
    if (!searchResult || !searchResult.exists) return;
    if (emailsToAdd.includes(searchResult.email)) {
      setRootError('Este participante ya está en la lista');
      return;
    }
    setEmailsToAdd((prev: string[]) => [...prev, searchResult.email]);
    setSearchEmail('');
    setSearchResult(null);
    setRootError('');
  }, [searchResult, emailsToAdd]);

  const handleRemoveFromList = useCallback((email: string) => {
    setEmailsToAdd((prev: string[]) => prev.filter((e: string) => e !== email));
    setRootError('');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (emailsToAdd.length === 0) return;

    setIsSubmitting(true);
    setRootError('');

    try {
      await addTripParticipants(tripId, emailsToAdd);
      onSuccess();
      handleClose();
    } catch (err) {
      const error = err as { statusCode?: number; message?: string };
      setRootError(error.message || 'Error al agregar participantes');
    } finally {
      setIsSubmitting(false);
    }
  }, [tripId, emailsToAdd, onSuccess]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;

    if (emailsToAdd.length > 0) {
      const confirmed = window.confirm(
        'Tienes participantes pendientes en la lista. ¿Seguro que deseas cerrar? Se perderán los cambios.',
      );
      if (!confirmed) return;
    }

    setSearchEmail('');
    setSearchResult(null);
    setEmailsToAdd([]);
    setRootError('');
    onClose();
  }, [isSubmitting, emailsToAdd.length, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-participants-title"
      >
        <button
          type="button"
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 disabled:opacity-50"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <h2
          id="add-participants-title"
          className="font-heading text-xl font-bold text-slate-900 mb-2"
        >
          Agregar participantes
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Busca por correo y agrega usuarios registrados al viaje
        </p>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              ref={searchInputRef}
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
              variant="secondary"
              size="md"
              onClick={handleSearchUser}
              disabled={isSearching || !searchEmail.trim()}
            >
              <Search size={18} />
              Buscar
            </Button>
          </div>

          {searchResult && (
            <div className="rounded-xl p-3 flex items-center justify-between border border-slate-200">
              <div className="flex items-center gap-3">
                {searchResult.exists ? (
                  <UserCheck className="text-emerald-600 shrink-0" size={20} />
                ) : (
                  <UserX className="text-red-600 shrink-0" size={20} />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {searchResult.exists ? 'Usuario encontrado' : 'Usuario no registrado'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{searchResult.email}</p>
                </div>
              </div>
              <Button
                variant={searchResult.exists ? 'primary' : 'secondary'}
                size="sm"
                onClick={handleAddToList}
                disabled={!searchResult.exists}
              >
                Agregar
              </Button>
            </div>
          )}

          {emailsToAdd.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">
                Participantes a agregar ({emailsToAdd.length})
              </p>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {emailsToAdd.map((email: string) => (
                  <li
                    key={email}
                    className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg"
                  >
                    <span className="text-sm text-slate-900 truncate">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromList(email)}
                      className="p-1 text-slate-400 hover:text-slate-600 shrink-0"
                      aria-label="Quitar"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rootError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{rootError}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:flex-1"
              disabled={emailsToAdd.length === 0 || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Agregando...
                </span>
              ) : (
                `Agregar (${emailsToAdd.length})`
              )}
            </Button>
            <Button
              className="w-full sm:flex-1"
              variant="secondary"
              size="lg"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
