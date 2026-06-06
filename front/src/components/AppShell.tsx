import { Link, useLocation } from "@tanstack/react-router";
import { Home, Plus, BarChart3, Settings as SettingsIcon, ChefHat } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/pantry", label: "Pantry", icon: Home },
  { to: "/recipes", label: "Recipes", icon: ChefHat },
  { to: "/add", label: "Add", icon: Plus },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppShell({ children, title, rightSlot }: { children: ReactNode; title?: string; rightSlot?: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-4xl pb-28">
        {title && (
          <header className="ios-blur sticky top-0 z-30 flex items-center justify-between px-5 pt-6 pb-3 border-b border-border/60">
            <h1 className="text-[28px] font-bold tracking-tight">{title}</h1>
            <div>{rightSlot}</div>
          </header>
        )}
        <main className="px-5 pt-4">{children}</main>
      </div>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="ios-blur flex items-center gap-1 rounded-full border border-border/60 px-2 py-1.5 shadow-ios-lg">
          {tabs.map((t) => {
            const active = pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-full px-4 py-2 text-[11px] font-medium transition-all",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-5" strokeWidth={2.2} />
                <span>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
