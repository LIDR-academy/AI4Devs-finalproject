import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAsRead } from "@/domain/usecases/listNotifications";

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
