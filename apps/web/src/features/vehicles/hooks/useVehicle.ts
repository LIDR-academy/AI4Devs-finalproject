import { useQuery } from '@tanstack/react-query';
import { vehiclesApi } from '../services/vehiclesApi';

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => vehiclesApi.getById(id),
    enabled: id.length > 0,
  });
}
