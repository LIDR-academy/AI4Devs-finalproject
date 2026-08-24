import { useNavigate } from "react-router-dom";
import type { Notification } from "@/domain/types/notification";
import { useAuth } from "@/infrastructure/context/AuthContext";
import { useToast } from "@/infrastructure/context/ToastContext";
import { useMarkNotificationAsRead } from "@/infrastructure/hooks/useMarkNotificationAsRead";
import { useNotifications } from "@/infrastructure/hooks/useNotifications";
import { useUnreadCount } from "@/infrastructure/hooks/useUnreadCount";

interface NotificationBellProps {
  unreadCountOverride?: number;
}

export function NotificationBell({ unreadCountOverride }: NotificationBellProps) {
  const unreadCount = useUnreadCount();
  const count = unreadCountOverride ?? unreadCount;
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const markAsRead = useMarkNotificationAsRead();

  const isCoachee = user?.role === "COACHEE";

  const { data: notificationsData, isLoading } = useNotifications({
    today_only: !isCoachee,
    limit: 20,
  });

  const notifications = notificationsData?.data ?? [];

  const handleClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id, {
        onError: () => {
          showToast("Failed to mark notification as read", "error");
        },
      });
    }
    if (notification.classId) {
      navigate(`/${user?.role.toLowerCase()}/calendar`);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {!isCoachee && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">No notifications today</div>
          ) : (
            <ul className="max-h-96 overflow-y-auto divide-y">
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleClick(n)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      !n.isRead ? "bg-blue-50" : ""
                    }`}
                  >
                    <p className="text-sm text-gray-900">{n.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(n.sentAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
