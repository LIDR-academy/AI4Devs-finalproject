import { useQuery } from '@tanstack/react-query';
import { deliveryApi } from '../services/deliveryApi';

export function useDeliveryReadyList(options?: { enablePolling?: boolean }) {
  return useQuery({
    queryKey: ['delivery', 'ready'],
    queryFn: () =>
      deliveryApi.listReady({ sort: 'checkedInAt', order: 'asc' }),
    refetchInterval: options?.enablePolling ? 60_000 : false,
    refetchIntervalInBackground: false,
  });
}
