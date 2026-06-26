import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../services/clientsApi';

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
