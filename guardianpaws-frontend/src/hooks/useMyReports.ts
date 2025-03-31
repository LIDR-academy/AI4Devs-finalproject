import { useState, useEffect } from 'react';
import { reporteService } from '@/services/reporte.service';
import { Report } from '@/types';

export const useMyReports = (currentUserEmail: string) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUserEmail) {
      setLoading(false);
      return;
    }

    const loadReports = async () => {
      try {
        const userReports = await reporteService.obtenerReportes(currentUserEmail);
        
        // Ordenar por fecha de creación (más recientes primero)
        const sortedReports = userReports.sort((a: Report, b: Report) => b.createdAt - a.createdAt);
        
        setReports(sortedReports);
      } catch (error) {
        console.error('Error al cargar reportes:', error);
        setError(error instanceof Error ? error.message : 'Error al cargar los reportes');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [currentUserEmail]);

  return {
    reports,
    loading,
    error,
  };
}; 