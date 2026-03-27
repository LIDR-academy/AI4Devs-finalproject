'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useObrasFiltradas() {
  const [obras, setObras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const duracionMax = searchParams.get('duracion_max');
  const mood = searchParams.get('mood');

  useEffect(() => {
    const fetchObras = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (duracionMax) queryParams.append('duracion_max', duracionMax);
        if (mood) queryParams.append('mood', mood);

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${baseUrl}/obras?${queryParams.toString()}`);
        
        if (!response.ok) throw new Error('Error al cargar las obras');
        
        const data = await response.json();
        setObras(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchObras();
  }, [duracionMax, mood]);

  return { obras, loading, error };
}
