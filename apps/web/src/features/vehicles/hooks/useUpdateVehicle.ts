import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '../services/vehiclesApi';
import type { UpdateVehicleRequest } from '../types/vehicle.types';

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehicleRequest }) =>
      vehiclesApi.update(id, data),
    onSuccess: (vehicle) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.setQueryData(['vehicles', vehicle.id], vehicle);
    },
  });
}
