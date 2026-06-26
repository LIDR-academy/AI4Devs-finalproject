import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, Cloud, User, Shield, Palette, Info, ChevronRight, LogOut, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { clearSession, getSessionUser } from "@/features/auth/session";
import {
  requireAuthBeforeLoad,
  useRequireAuthRedirect,
} from "@/features/auth/route-guard";
import {
  getAutoExpirySettings,
  getNotificationPreferences,
  updateAutoExpirySettings,
  updateNotificationPreferences,
} from "@/features/notifications/notifications.api";

export const Route = createFileRoute("/settings")({
  beforeLoad: requireAuthBeforeLoad,
  component: SettingsPage,
});

export function SettingsPage() {
  const authed = useRequireAuthRedirect();

  if (!authed) {
    return null;
  }

  const navigate = useNavigate();
  const currentUser = getSessionUser();
  const [notificationPreferences, setNotificationPreferences] = useState({
    expirationEnabled: true,
    priceDropEnabled: true,
    foodConsumedByOthersEnabled: true,
  });
  const [loadingPreference, setLoadingPreference] = useState(true);
  const [savingPreference, setSavingPreference] = useState(false);
  const [preferenceMessage, setPreferenceMessage] = useState<string | null>(null);
  const [preferenceError, setPreferenceError] = useState<string | null>(null);
  const [autoExpiry, setAutoExpiry] = useState({ enabled: true, thresholdDays: 14 });
  const [savingAutoExpiry, setSavingAutoExpiry] = useState(false);
  const [autoExpiryError, setAutoExpiryError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPreferences() {
      setLoadingPreference(true);
      setPreferenceError(null);
      try {
        const prefs = await getNotificationPreferences();
        if (mounted) {
          setNotificationPreferences(prefs);
        }
      } catch (apiError) {
        if (mounted) {
          setPreferenceError(
            apiError instanceof Error
              ? apiError.message
              : "Could not load notification preferences.",
          );
        }
      } finally {
        if (mounted) {
          setLoadingPreference(false);
        }
      }
    }

    void loadPreferences();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleTogglePreference(
    key: keyof typeof notificationPreferences,
  ) {
    if (loadingPreference || savingPreference) {
      return;
    }

    const nextPreferences = {
      ...notificationPreferences,
      [key]: !notificationPreferences[key],
    };

    setSavingPreference(true);
    setPreferenceError(null);
    setPreferenceMessage(null);

    try {
      const updated = await updateNotificationPreferences(nextPreferences);
      setNotificationPreferences(updated);
      setPreferenceMessage("Notification preferences saved.");
    } catch (apiError) {
      setPreferenceError(
        apiError instanceof Error
          ? apiError.message
          : "Could not save notification preferences.",
      );
    } finally {
      setSavingPreference(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    getAutoExpirySettings()
      .then((settings) => {
        if (mounted) setAutoExpiry(settings);
      })
      .catch(() => {
        // Non-blocking: fall back to defaults if settings cannot be loaded.
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function saveAutoExpiry(next: { enabled: boolean; thresholdDays: number }) {
    setSavingAutoExpiry(true);
    setAutoExpiryError(null);
    const previous = autoExpiry;
    setAutoExpiry(next);
    try {
      const updated = await updateAutoExpirySettings(next);
      setAutoExpiry(updated);
    } catch (apiError) {
      setAutoExpiry(previous);
      setAutoExpiryError(
        apiError instanceof Error ? apiError.message : "Could not save auto-expiry settings.",
      );
    } finally {
      setSavingAutoExpiry(false);
    }
  }

  function handleToggleAutoExpiry() {
    if (savingAutoExpiry) return;
    void saveAutoExpiry({ ...autoExpiry, enabled: !autoExpiry.enabled });
  }

  function handleThresholdChange(value: number) {
    if (Number.isNaN(value) || value < 7 || value > 60) return;
    void saveAutoExpiry({ ...autoExpiry, thresholdDays: value });
  }

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
        <Link
          to="/notifications"
          className="flex items-center justify-between px-4 py-3.5"
        >
          <p className="text-[14.5px] font-medium">Notification center</p>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
        <Toggle
          label="Food expiration"
          on={notificationPreferences.expirationEnabled}
          onToggle={() => {
            void handleTogglePreference("expirationEnabled");
          }}
          disabled={loadingPreference || savingPreference}
          testId="notification-expiration-toggle"
        />
        <Toggle
          label="Price drop"
          on={notificationPreferences.priceDropEnabled}
          onToggle={() => {
            void handleTogglePreference("priceDropEnabled");
          }}
          disabled={loadingPreference || savingPreference}
          testId="notification-price-drop-toggle"
        />
        <Toggle
          label="Food consumed by others"
          on={notificationPreferences.foodConsumedByOthersEnabled}
          onToggle={() => {
            void handleTogglePreference("foodConsumedByOthersEnabled");
          }}
          disabled={loadingPreference || savingPreference}
          testId="notification-food-consumed-toggle"
        />
        <Toggle
          label="Auto-expire stale items"
          on={autoExpiry.enabled}
          onToggle={handleToggleAutoExpiry}
          disabled={savingAutoExpiry}
          testId="auto-expiry-toggle"
        />
        <div className="flex items-center justify-between px-4 py-3.5">
          <div>
            <p className="text-[14.5px] font-medium">Auto-expire after</p>
            <p className="text-[12px] text-muted-foreground">
              Items expired for more than this many days are automatically marked as wasted.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <input
              type="number"
              min={7}
              max={60}
              value={autoExpiry.thresholdDays}
              disabled={!autoExpiry.enabled || savingAutoExpiry}
              onChange={(e) => handleThresholdChange(Number(e.target.value))}
              data-testid="auto-expiry-threshold"
              className="w-16 rounded-lg border border-border bg-surface px-2 py-1 text-right text-[14px] text-foreground outline-none focus:border-primary disabled:opacity-50"
            />
            <span className="text-[13.5px]">days</span>
          </div>
        </div>
      </Group>

      {autoExpiryError && (
        <p
          data-testid="auto-expiry-error"
          className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-[12px] text-destructive"
        >
          {autoExpiryError}
        </p>
      )}

      {preferenceMessage && (
        <p
          data-testid="notification-preference-message"
          className="mb-4 rounded-xl border border-success/20 bg-success/10 px-3 py-2 text-[12px] text-success"
        >
          {preferenceMessage}
        </p>
      )}
      {preferenceError && (
        <p
          data-testid="notification-preference-error"
          className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-[12px] text-destructive"
        >
          {preferenceError}
        </p>
      )}

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

function Toggle({
  label,
  defaultChecked,
  on,
  onToggle,
  disabled,
  testId,
}: {
  label: string;
  defaultChecked?: boolean;
  on?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
  testId?: string;
}) {
  const [internalOn, setInternalOn] = useState(!!defaultChecked);
  const resolvedOn = typeof on === "boolean" ? on : internalOn;

  function handleClick() {
    if (disabled) {
      return;
    }

    if (onToggle) {
      onToggle();
      return;
    }

    setInternalOn(!resolvedOn);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-[14.5px]">{label}</span>
      <button
        data-testid={testId}
        onClick={handleClick}
        className={`relative h-7 w-11 rounded-full transition ${resolvedOn ? "bg-primary" : "bg-muted"} ${disabled ? "opacity-60" : ""}`}
        aria-pressed={resolvedOn}
        aria-label={label}
        disabled={disabled}
      >
        <span className={`absolute top-0.5 size-6 rounded-full bg-white shadow-ios transition-all ${resolvedOn ? "left-[18px]" : "left-0.5"}`} />
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
