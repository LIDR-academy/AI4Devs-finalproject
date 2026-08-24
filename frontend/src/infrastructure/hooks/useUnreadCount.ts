import { useQuery } from "@tanstack/react-query";
import type { ListNotificationsResponse } from "@/domain/types/notification";
import { fetchNotifications } from "@/domain/usecases/listNotifications";

export function useUnreadCount() {
  const { data } = useQuery<ListNotificationsResponse>({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      return fetchNotifications({ limit: 1, unread_only: true });
    },
    refetchInterval: 30_000,
  });

  return data?.meta.unreadCount ?? 0;
}
