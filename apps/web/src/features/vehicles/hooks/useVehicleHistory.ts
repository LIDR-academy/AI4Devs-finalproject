import { useQuery } from '@tanstack/react-query';
import { vehiclesApi } from '../services/vehiclesApi';

export function useVehicleHistory(id: string) {
  return useQuery({
    queryKey: ['vehicles', id, 'history'],
    queryFn: () => vehiclesApi.getHistory(id),
    enabled: id.length > 0,
  });
}
