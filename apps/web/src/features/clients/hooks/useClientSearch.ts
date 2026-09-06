import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '../services/clientsApi';
import { useDebouncedValue } from './useDebouncedValue';

export function useClientSearch(query: string) {
  const debouncedQ = useDebouncedValue(query, 300);

  return useQuery({
    queryKey: ['clients', 'search', debouncedQ],
    queryFn: () => clientsApi.search({ q: debouncedQ }),
    enabled: debouncedQ.length >= 2,
  });
}

export function useClientSearchByNationalId(nationalId: string, enabled = true) {
  const trimmed = nationalId.trim();

  return useQuery({
    queryKey: ['clients', 'search', 'nationalId', trimmed],
    queryFn: () => clientsApi.search({ nationalId: trimmed }),
    enabled: enabled && trimmed.length >= 5,
  });
}
