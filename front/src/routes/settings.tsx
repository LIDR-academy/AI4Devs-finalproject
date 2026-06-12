import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, Cloud, User, Shield, Palette, Info, ChevronRight, LogOut, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { clearSession, getSessionUser } from "@/features/auth/session";
import {
  requireAuthBeforeLoad,
  useRequireAuthRedirect,
} from "@/features/auth/route-guard";

export const Route = createFileRoute("/settings")({
  beforeLoad: requireAuthBeforeLoad,
  component: SettingsPage,
});

function SettingsPage() {
  const authed = useRequireAuthRedirect();

  if (!authed) {
    return null;
  }

  const navigate = useNavigate();
  const currentUser = getSessionUser();

  function handleSignOut() {
    clearSession();
    navigate({ to: "/auth" });
  }

  return (
    <AppShell title="Settings">
      <ProfileCard email={currentUser?.email} />

      <Group title="Shared Pantry" icon={<Users className="size-4" />}>
        <Link to="/sharing" className="flex items-center justify-between px-4 py-3.5">
          <div>
            <p className="text-[14.5px] font-medium">Manage sharing</p>
            <p className="text-[12px] text-muted-foreground">3 members · 1 pending invite</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </Group>

      <Group title="Notifications" icon={<Bell className="size-4" />}>
        <Toggle label="Food expiration" defaultChecked />
        <Toggle label="Price drop" defaultChecked />
        <Toggle label="Food consumed by others" />
      </Group>

      <Group title="Cloud Sync" icon={<Cloud className="size-4" />}>
        <Row label="Sync provider" value="iCloud" />
        <Row label="Last sync" value="2 min ago" />
      </Group>

      <Group title="Profile" icon={<User className="size-4" />}>
        <Row label="Name" value="Alex" />
        <Row label="Family name" value="Garcia" />
        <Row label="Age" value="32" />
        <Row label="Email" value="alex@example.com" />
        <Row label="Address" value="Madrid, 28001, ES" />
      </Group>

      <Group title="Privacy & Security" icon={<Shield className="size-4" />}>
        <Row label="Ad privacy" value="Customize" />
        <Row label="Change password" />
        <Row label="Delete account" danger />
      </Group>

      <Group title="Appearance" icon={<Palette className="size-4" />}>
        <ThemePicker />
      </Group>

      <Group title="App info" icon={<Info className="size-4" />}>
        <Row label="Version" value="1.0.0 (beta)" />
        <Row label="Contact developer" value="Email" />
      </Group>

      <button
        onClick={handleSignOut}
        className="mt-6 w-full rounded-2xl bg-destructive/10 text-destructive py-4 font-semibold text-[15px] flex items-center justify-center gap-2"
      >
        <LogOut className="size-4" /> Sign out
      </button>
    </AppShell>
  );
}

function ProfileCard({ email }: { email?: string }) {
  return (
    <div className="ios-card flex items-center gap-4 p-4 mb-5">
      <div className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground text-xl font-semibold">A</div>
      <div className="flex-1">
        <p className="font-semibold text-[16px]">Alex Garcia</p>
        <p className="text-[12.5px] text-muted-foreground">{email ?? "alex@example.com"}</p>
      </div>
      <ChevronRight className="size-4 text-muted-foreground" />
    </div>
  );
}

function Group({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h2 className="px-2 mb-2 flex items-center gap-1.5 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
        {icon} {title}
      </h2>
      <div className="ios-card divide-y divide-border overflow-hidden">{children}</div>
    </section>
  );
}

function Row({ label, value, danger }: { label: string; value?: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className={`text-[14.5px] ${danger ? "text-destructive font-medium" : ""}`}>{label}</span>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {value && <span className="text-[13.5px]">{value}</span>}
        <ChevronRight className="size-4" />
      </div>
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-[14.5px]">{label}</span>
      <button
        onClick={() => setOn(!on)}
        className={`relative h-7 w-11 rounded-full transition ${on ? "bg-primary" : "bg-muted"}`}
        aria-pressed={on}
      >
        <span className={`absolute top-0.5 size-6 rounded-full bg-white shadow-ios transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function ThemePicker() {
  const [v, setV] = useState<"light" | "dark" | "system">("system");
  return (
    <div className="p-3">
      <div className="grid grid-cols-3 gap-2 rounded-xl bg-secondary p-1">
        {(["light", "dark", "system"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setV(t)}
            className={`py-2 rounded-lg text-[13px] font-medium capitalize transition ${v === t ? "bg-surface shadow-ios" : "text-muted-foreground"}`}
          >
            {t === "system" ? "Device" : t}
          </button>
        ))}
      </div>
    </div>
  );
}
