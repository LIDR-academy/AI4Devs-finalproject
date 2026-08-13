import { useQuery } from '@tanstack/react-query';
import { deliveryApi } from '../services/deliveryApi';

export function useDeliveryReadyDetail(workOrderId: string | null) {
  return useQuery({
    queryKey: ['delivery', 'ready', workOrderId],
    queryFn: () => deliveryApi.getReadyDetail(workOrderId!),
    enabled: !!workOrderId,
  });
}
