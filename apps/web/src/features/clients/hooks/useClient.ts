import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '../services/clientsApi';

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsApi.getById(id),
    enabled: id.length > 0,
  });
}
