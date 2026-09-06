import { useQuery } from '@tanstack/react-query';
import { historyApi } from '../services/historyApi';

export function useVehicleHistory(vehicleId: string) {
  return useQuery({
    queryKey: ['vehicles', vehicleId, 'history'],
    queryFn: () => historyApi.getVehicleHistory(vehicleId),
    enabled: vehicleId.length > 0,
  });
}
