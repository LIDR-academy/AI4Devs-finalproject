import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAllAsRead } from "@/domain/usecases/listNotifications";

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
