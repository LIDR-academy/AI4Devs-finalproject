import { useState } from "react";
import type { Notification } from "@/domain/types/notification";
import { useToast } from "@/infrastructure/context/ToastContext";
import { useMarkAllNotificationsAsRead } from "@/infrastructure/hooks/useMarkAllNotificationsAsRead";
import { useMarkNotificationAsRead } from "@/infrastructure/hooks/useMarkNotificationAsRead";
import { useNotifications } from "@/infrastructure/hooks/useNotifications";

export function NotificationsPage() {
  const { showToast } = useToast();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const { data, isLoading, isFetching } = useNotifications({
    unread_only: unreadOnly,
    limit: 20,
    cursor,
  });

  const notifications = data?.data ?? [];
  const hasMore = data?.meta.hasMore ?? false;

  const handleClick = (notification: Notification) => {
    if (markAsRead.isPending) return;
    if (!notification.isRead) {
      markAsRead.mutate(notification.id, {
        onError: () => {
          showToast("Failed to mark notification as read", "error");
        },
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      showToast("All notifications marked as read.", "success");
    } catch {
      showToast("Failed to mark notifications as read", "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        <div className="flex items-center gap-3">
          {notifications.some((n) => !n.isRead) && (
            <button
              type="button"
              onClick={() => void handleMarkAllAsRead()}
              disabled={markAsRead.isPending || markAllAsRead.isPending}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mark all as read
            </button>
          )}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => {
                setUnreadOnly(e.target.checked);
                setCursor(undefined);
              }}
              className="rounded border-gray-300"
            />
            Unread only
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            className="w-12 h-12 text-gray-300 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <p className="text-gray-500 text-sm">No notifications yet</p>
        </div>
      ) : (
        <>
          <ul className="divide-y rounded-lg border bg-white">
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    !n.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-900 flex-1">{n.content}</p>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(n.sentAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          {hasMore && (
            <button
              type="button"
              onClick={() => {
                if (data?.meta.nextCursor) {
                  setCursor(data.meta.nextCursor);
                }
              }}
              disabled={isFetching}
              className="mt-4 w-full py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50"
            >
              {isFetching ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
