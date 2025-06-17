import { useState, useEffect, useCallback } from 'react';
import { teamService } from '../services/api';
import { TeamCapacityResponse } from '../types';

interface UseTeamCapacityResult {
  data: TeamCapacityResponse | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export const useTeamCapacity = (): UseTeamCapacityResult => {
  const [data, setData] = useState<TeamCapacityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamCapacity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await teamService.getTeamCapacity();
      
      if (response.success) {
        // Convertir las fechas de string a Date
        const processedData: TeamCapacityResponse = {
          ...response.data,
          fechaConsulta: new Date(response.data.fechaConsulta),
          periodoAnalisis: {
            desde: new Date(response.data.periodoAnalisis.desde),
            hasta: new Date(response.data.periodoAnalisis.hasta)
          },
          equipos: response.data.equipos.map((equipo: any) => ({
            ...equipo,
            proximaFechaDisponible: new Date(equipo.proximaFechaDisponible),
            tareasActuales: equipo.tareasActuales.map((tarea: any) => ({
              ...tarea,
              fechaInicio: tarea.fechaInicio ? new Date(tarea.fechaInicio) : null,
              fechaFin: tarea.fechaFin ? new Date(tarea.fechaFin) : null,
              fechaAsignacion: new Date(tarea.fechaAsignacion)
            }))
          }))
        };
        
        setData(processedData);
      } else {
        setError(response.message || 'Error al obtener datos de capacidad');
      }
    } catch (err: any) {
      console.error('Error fetching team capacity:', err);
      setError(err.response?.data?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchTeamCapacity();
  }, [fetchTeamCapacity]);

  useEffect(() => {
    fetchTeamCapacity();
  }, [fetchTeamCapacity]);

  return {
    data,
    loading,
    error,
    refreshData
  };
}; 