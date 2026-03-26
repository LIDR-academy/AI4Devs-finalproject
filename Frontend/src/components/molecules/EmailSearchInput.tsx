import { useState } from 'react';
import { Search, Mail, UserPlus, X } from 'lucide-react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { API_BASE_URL } from '@/config/api';

interface EmailSearchInputProps {
  onAdd: (email: string) => void;
  onInvite?: (email: string) => void;
  existingEmails?: string[];
  className?: string;
}

/**
 * EmailSearchInput molecule component
 * Allows searching and adding users by email
 * Follows Design System Guide: Active Help pattern for unregistered users
 */
export const EmailSearchInput = ({
  onAdd,
  onInvite,
  existingEmails = [],
  className = '',
}: EmailSearchInputProps) => {
  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    email: string;
    user?: { id: string; nombre: string; email: string };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSearch = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Por favor, ingresa un correo electrónico');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Por favor, ingresa un correo electrónico válido');
      return;
    }

    if (existingEmails.includes(trimmedEmail)) {
      setError('Este usuario ya está en la lista');
      return;
    }

    setError(null);
    setIsSearching(true);

    try {
      // TODO: Implementar búsqueda en backend
      // Por ahora, simulamos la búsqueda
      const response = await fetch(
        `${API_BASE_URL}/users/search?email=${encodeURIComponent(trimmedEmail)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('travelsplit_token')}`,
          },
        },
      );

      if (response.ok) {
        const user = await response.json();
        setSearchResult({ found: true, email: trimmedEmail, user });
      } else if (response.status === 404) {
        setSearchResult({ found: false, email: trimmedEmail });
      } else {
        throw new Error('Error al buscar usuario');
      }
    } catch {
      // Si el endpoint no existe, simulamos que el usuario no está registrado
      setSearchResult({ found: false, email: trimmedEmail });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = () => {
    if (searchResult?.found && searchResult.user) {
      onAdd(searchResult.user.id);
      setEmail('');
      setSearchResult(null);
      setError(null);
    }
  };

  const handleInvite = () => {
    if (searchResult?.email) {
      onInvite?.(searchResult.email);
      setEmail('');
      setSearchResult(null);
      setError(null);
    }
  };

  const handleClear = () => {
    setEmail('');
    setSearchResult(null);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              setSearchResult(null);
              setError(null);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Buscar por correo electrónico"
            error={error || undefined}
            className="pr-10"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleSearch}
          disabled={isSearching || !email.trim()}
          className="flex-shrink-0"
        >
          <Search size={20} />
        </Button>
      </div>

      {searchResult && (
        <div
          className={`p-4 rounded-xl border ${
            searchResult.found
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          {searchResult.found && searchResult.user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <Mail size={20} className="text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{searchResult.user.nombre}</p>
                  <p className="text-xs text-slate-600">{searchResult.user.email}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAdd}
                className="flex items-center gap-2"
              >
                <UserPlus size={16} />
                <span>Agregar</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 mb-1">Usuario no registrado</p>
                  <p className="text-xs text-yellow-700">
                    El usuario <strong>{searchResult.email}</strong> no está registrado en
                    TravelSplit.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-yellow-600 hover:text-yellow-700 flex-shrink-0"
                  aria-label="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>
              {onInvite && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleInvite}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Mail size={16} />
                    <span>Enviar invitación</span>
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={handleClear}>
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
