import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ListNotificationsResponse } from "@/domain/types/notification";
import { fetchNotifications } from "@/domain/usecases/listNotifications";

interface UseNotificationsParams {
  today_only?: boolean;
  unread_only?: boolean;
  limit?: number;
  cursor?: string;
}

export function useNotifications(params: UseNotificationsParams = {}) {
  return useQuery<ListNotificationsResponse>({
    queryKey: [
      "notifications",
      params.today_only ?? false,
      params.unread_only ?? false,
      params.limit ?? 20,
      params.cursor ?? null,
    ],
    queryFn: () => fetchNotifications(params),
    placeholderData: keepPreviousData,
  });
}
