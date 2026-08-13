import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '../services/vehiclesApi';

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehiclesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
