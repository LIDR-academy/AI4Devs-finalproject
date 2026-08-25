import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/infrastructure/context/AuthContext";
import {
  PullToRefreshProvider,
  usePullToRefreshContext,
} from "@/infrastructure/context/PullToRefreshContext";
import { PullToRefreshIndicator } from "@/ui/components/coachee/PullToRefreshIndicator";
import { NotificationBell } from "@/ui/components/NotificationBell";
import { PushNotificationPrompt } from "@/ui/components/PushNotificationPrompt";

const bottomNavItems = [
  {
    to: "/coachee/home",
    label: "Home",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    to: "/coachee/calendar",
    label: "Calendar",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    to: "/coachee/notifications",
    label: "Notifications",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  },
];

export function CoacheeLayout() {
  return (
    <PullToRefreshProvider>
      <CoacheeLayoutInner />
    </PullToRefreshProvider>
  );
}

function CoacheeLayoutInner() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { scrollContainerRef, gesture } = usePullToRefreshContext();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex items-center justify-between h-14 px-4 bg-white border-b shrink-0">
        <h1 className="text-lg font-bold text-blue-600">Coacher</h1>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>

      <main ref={scrollContainerRef} className="flex-1 overflow-auto p-4 pb-20 relative">
        <PullToRefreshIndicator gesture={gesture} />
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-10 shrink-0">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <PushNotificationPrompt />
    </div>
  );
}
