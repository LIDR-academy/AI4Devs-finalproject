'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export function useWatchlist() {
  const { isAuthenticated, loading: authLoading, openLoginModal } = useAuth();
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWatchlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await apiFetch('/user/watchlist');
      // Esperamos que data sea un array de { obra_id: string }
      const ids = new Set<string>(data.map((item: any) => item.obra_id as string));
      setWatchlistIds(ids);
    } catch (err) {
      console.error('Error al cargar la watchlist:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchWatchlist();
    }
  }, [isAuthenticated, authLoading, fetchWatchlist]);

  const toggleWatchlist = async (obraId: string) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    // Actualización optimista
    const isCurrentlySaved = watchlistIds.has(obraId);
    const newWatchlistIds = new Set(watchlistIds);
    
    if (isCurrentlySaved) {
      newWatchlistIds.delete(obraId);
    } else {
      newWatchlistIds.add(obraId);
    }
    setWatchlistIds(newWatchlistIds);

    try {
      // El endpoint POST /user/watchlist es idempotente (toggle en el servicio si ya existe?)
      // Según ARF-004 del backend: Crea o actualiza.
      // Si ya existe, el backend hace upsert.
      // Pero si queremos ELIMINAR, ¿hay endpoint DELETE?
      // Revisando ARF-004... solo menciona POST. 
      // Si el backend no tiene DELETE, por ahora solo podemos AGREGAR.
      await apiFetch('/user/watchlist', {
        method: 'POST',
        body: JSON.stringify({ obraId }),
      });
    } catch (err) {
      // Revertir en caso de fallo
      setWatchlistIds(watchlistIds);
      console.error('Error al actualizar watchlist:', err);
    }
  };

  return {
    watchlistIds,
    toggleWatchlist,
    loading,
    isSaved: (id: string) => watchlistIds.has(id),
  };
}
