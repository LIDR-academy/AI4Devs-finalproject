import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '../services/vehiclesApi';

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehiclesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
