import { useQuery } from '@tanstack/react-query';
import { historyApi } from '../services/historyApi';

export function useClientProfile(clientId: string) {
  return useQuery({
    queryKey: ['clients', clientId, 'profile'],
    queryFn: () => historyApi.getClientProfile(clientId),
    enabled: clientId.length > 0,
  });
}
