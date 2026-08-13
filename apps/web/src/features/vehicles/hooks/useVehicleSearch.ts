import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@/features/clients/hooks/useDebouncedValue';
import { vehiclesApi } from '../services/vehiclesApi';

export function useVehicleSearch(query: string) {
  const debouncedQ = useDebouncedValue(query, 300);

  return useQuery({
    queryKey: ['vehicles', 'search', debouncedQ],
    queryFn: () => vehiclesApi.search({ q: debouncedQ }),
    enabled: debouncedQ.length >= 2,
  });
}
