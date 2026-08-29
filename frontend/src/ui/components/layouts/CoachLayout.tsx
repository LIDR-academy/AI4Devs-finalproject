import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/infrastructure/context/AuthContext";
import { NotificationBell } from "@/ui/components/NotificationBell";
import { PushNotificationPrompt } from "@/ui/components/PushNotificationPrompt";

const navItems = [
  {
    to: "/coach/today",
    label: "Today",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    to: "/coach/calendar",
    label: "Calendar",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    to: "/coach/coachees",
    label: "Coachees",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
];

export function CoachLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r shrink-0">
        <div className="flex items-center h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">Coacher</h1>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <svg
                className="w-5 h-5"
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
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between h-16 px-4 lg:px-6 bg-white border-b shrink-0">
          <h1 className="text-lg font-bold text-blue-600 lg:hidden">Coacher</h1>

          <div className="flex items-center gap-4 ml-auto">
            <NotificationBell />
            <span className="text-sm text-gray-600 hidden sm:block">{user?.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 pb-20 lg:p-6 lg:pb-6">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-10 shrink-0 lg:hidden">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map((item) => (
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
