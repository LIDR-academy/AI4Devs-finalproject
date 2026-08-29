import { useNavigate } from "react-router-dom";
import { useAuth } from "@/infrastructure/context/AuthContext";
import { useUnreadCount } from "@/infrastructure/hooks/useUnreadCount";

interface NotificationBellProps {
  unreadCountOverride?: number;
}

export function NotificationBell({ unreadCountOverride }: NotificationBellProps) {
  const unreadCount = useUnreadCount();
  const count = unreadCountOverride ?? unreadCount;
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/${user?.role.toLowerCase()}/notifications`)}
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
  );
}
