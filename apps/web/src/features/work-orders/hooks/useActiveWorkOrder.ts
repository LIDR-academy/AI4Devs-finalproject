import { useQuery } from '@tanstack/react-query';
import { workOrdersApi } from '../services/workOrdersApi';

export function useActiveWorkOrder(vehicleId: string | null) {
  return useQuery({
    queryKey: ['work-orders', 'active', vehicleId],
    queryFn: () => workOrdersApi.getActiveByVehicle(vehicleId!),
    enabled: !!vehicleId,
  });
}
