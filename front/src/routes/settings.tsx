import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, User, Shield, Info, ChevronRight, LogOut, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { clearSession, getSessionUser, type SessionUser } from "@/features/auth/session";
import { changePassword, deleteAccount, getCurrentUser, updateProfile } from "@/features/auth/auth.api";
import {
  requireAuthBeforeLoad,
  useRequireAuthRedirect,
} from "@/features/auth/route-guard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getAutoExpirySettings,
  getNotificationPreferences,
  updateAutoExpirySettings,
  updateNotificationPreferences,
} from "@/features/notifications/notifications.api";
import {
  ExpiryPreference,
  getExpiryPreferences,
  resetExpiryPreference,
  resetAllExpiryPreferences,
} from "@/features/pantry/pantry.api";

export const Route = createFileRoute("/settings")({
  beforeLoad: requireAuthBeforeLoad,
  component: SettingsPage,
});

type EditableProfileField = "firstName" | "lastName" | "age" | "address";

const PROFILE_FIELD_LABELS: Record<EditableProfileField, string> = {
  firstName: "Name",
  lastName: "Family name",
  age: "Age",
  address: "Address",
};

function profileFieldValue(profile: SessionUser | null, field: EditableProfileField): string {
  if (!profile) return "";
  const value = profile[field];
  return value === null || value === undefined ? "" : String(value);
}

export function SettingsPage() {
  const authed = useRequireAuthRedirect();

  if (!authed) {
    return null;
  }

  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<SessionUser | null>(null);
  const [editingField, setEditingField] = useState<EditableProfileField | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
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
  const [expiryPreferences, setExpiryPreferences] = useState<ExpiryPreference[]>([]);
  const [loadingExpiryPreferences, setLoadingExpiryPreferences] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  useEffect(() => {
    // Read client-only (localStorage-backed) session data after mount, not during render — doing
    // it synchronously in the render body would make the client's first paint diverge from the
    // server-rendered HTML (which has no access to localStorage), triggering a React hydration
    // mismatch that discards and regenerates this whole subtree, wiping any state (e.g. an
    // in-progress profile edit) set in the window before that regeneration completes.
    setCurrentUser(getSessionUser());
  }, []);

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((user) => {
        if (mounted) setProfile(user);
      })
      .catch(() => {
        // Non-blocking: the rest of the settings page still works without a loaded profile.
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSaveProfileField(field: EditableProfileField, rawValue: string) {
    setSavingProfile(true);
    setProfileError(null);
    try {
      const payload =
        field === "age"
          ? { age: rawValue === "" ? undefined : Number(rawValue) }
          : { [field]: rawValue };
      const updated = await updateProfile(payload);
      setProfile(updated);
      setEditingField(null);
    } catch (apiError) {
      setProfileError(apiError instanceof Error ? apiError.message : "Could not save profile.");
    } finally {
      setSavingProfile(false);
    }
  }

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

  useEffect(() => {
    let mounted = true;
    setLoadingExpiryPreferences(true);
    getExpiryPreferences()
      .then((res) => {
        if (mounted) setExpiryPreferences(res.preferences);
      })
      .catch(() => {
        // Non-blocking: show empty state on failure.
      })
      .finally(() => {
        if (mounted) setLoadingExpiryPreferences(false);
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

  async function handleResetExpiryPreference(category: string) {
    await resetExpiryPreference(category).catch(() => undefined);
    getExpiryPreferences()
      .then((res) => setExpiryPreferences(res.preferences))
      .catch(() => undefined);
  }

  async function handleResetAllExpiryPreferences() {
    await resetAllExpiryPreferences().catch(() => undefined);
    getExpiryPreferences()
      .then((res) => setExpiryPreferences(res.preferences))
      .catch(() => undefined);
  }

  async function handleChangePassword(currentPassword: string, newPassword: string) {
    setSavingPassword(true);
    setPasswordError(null);
    try {
      await changePassword({ currentPassword, newPassword });
      setChangingPassword(false);
    } catch (apiError) {
      setPasswordError(
        apiError instanceof Error ? apiError.message : "Could not change password.",
      );
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true);
    setDeleteAccountError(null);
    try {
      await deleteAccount();
      clearSession();
      navigate({ to: "/auth" });
    } catch (apiError) {
      setDeleteAccountError(
        apiError instanceof Error ? apiError.message : "Could not delete account.",
      );
    } finally {
      setDeletingAccount(false);
    }
  }

  function handleSignOut() {
    clearSession();
    navigate({ to: "/auth" });
  }

  function handleContactDeveloper() {
    const subject = encodeURIComponent("Request contact from RealSaveFooding");
    window.location.href = `mailto:jesramgue@gmail.com?subject=${subject}`;
  }

  return (
    <AppShell title="Settings">
      <ProfileCard
        firstName={profile?.firstName}
        lastName={profile?.lastName}
        email={profile?.email ?? currentUser?.email}
        onClick={() =>
          document.getElementById("profile-section")?.scrollIntoView({ behavior: "smooth" })
        }
      />

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

      <ExpiryLearningSection
        preferences={expiryPreferences}
        loading={loadingExpiryPreferences}
        onReset={handleResetExpiryPreference}
        onResetAll={handleResetAllExpiryPreferences}
      />

      <Group id="profile-section" title="Profile" icon={<User className="size-4" />}>
        <Row
          label="Name"
          value={profileFieldValue(profile, "firstName")}
          onClick={() => setEditingField("firstName")}
          testId="profile-row-firstName"
        />
        <Row
          label="Family name"
          value={profileFieldValue(profile, "lastName")}
          onClick={() => setEditingField("lastName")}
          testId="profile-row-lastName"
        />
        <Row
          label="Age"
          value={profileFieldValue(profile, "age")}
          onClick={() => setEditingField("age")}
          testId="profile-row-age"
        />
        <Row label="Email" value={profile?.email ?? currentUser?.email} />
        <Row
          label="Address"
          value={profileFieldValue(profile, "address")}
          onClick={() => setEditingField("address")}
          testId="profile-row-address"
        />
      </Group>

      {profileError && (
        <p
          data-testid="profile-error"
          className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-[12px] text-destructive"
        >
          {profileError}
        </p>
      )}

      <EditProfileFieldDialog
        open={editingField !== null}
        label={editingField ? PROFILE_FIELD_LABELS[editingField] : ""}
        initialValue={profileFieldValue(profile, editingField ?? "firstName")}
        inputType={editingField === "age" ? "number" : "text"}
        saving={savingProfile}
        onCancel={() => {
          setEditingField(null);
          setProfileError(null);
        }}
        onSave={(value) => {
          if (editingField) {
            void handleSaveProfileField(editingField, value);
          }
        }}
      />

      <Group title="Privacy & Security" icon={<Shield className="size-4" />}>
        <Row
          label="Change password"
          onClick={() => setChangingPassword(true)}
          testId="change-password-row"
        />
        <Row
          label="Delete account"
          danger
          onClick={() => setConfirmingDelete(true)}
          testId="delete-account-row"
        />
      </Group>

      <ChangePasswordDialog
        open={changingPassword}
        saving={savingPassword}
        error={passwordError}
        onCancel={() => {
          setChangingPassword(false);
          setPasswordError(null);
        }}
        onSave={(currentPassword, newPassword) => {
          void handleChangePassword(currentPassword, newPassword);
        }}
      />

      <AlertDialog open={confirmingDelete} onOpenChange={(next) => !next && setConfirmingDelete(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all associated data — pantry items,
              receipts, notifications, and shared pantry memberships. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteAccountError && (
            <p
              data-testid="delete-account-error"
              className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-[12px] text-destructive"
            >
              {deleteAccountError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="delete-account-cancel" disabled={deletingAccount}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-testid="delete-account-confirm"
              disabled={deletingAccount}
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteAccount();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Group title="App info" icon={<Info className="size-4" />}>
        <Row label="Version" value="1.0.0 (beta)" showChevron={false} />
        <Row
          label="Contact developer"
          value="Email"
          onClick={handleContactDeveloper}
          testId="contact-developer-row"
        />
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

function formatDelta(delta: number): string {
  const rounded = Math.round(delta);
  if (rounded >= 0) return `+${rounded} days`;
  return `−${Math.abs(rounded)} days`;
}

function ExpiryLearningSection({
  preferences,
  loading,
  onReset,
  onResetAll,
}: {
  preferences: ExpiryPreference[];
  loading: boolean;
  onReset: (category: string) => void;
  onResetAll: () => void;
}) {
  return (
    <section className="mb-5">
      <h2 className="px-2 mb-2 flex items-center gap-1.5 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
        Expiry Learning
      </h2>
      <div className="ios-card divide-y divide-border overflow-hidden">
        {!loading && preferences.length === 0 ? (
          <p
            data-testid="expiry-learning-empty"
            className="px-4 py-3.5 text-[13.5px] text-muted-foreground"
          >
            No expiry preferences learned yet. Override a few expiry suggestions to get started.
          </p>
        ) : (
          preferences.map((pref) => (
            <div key={pref.category} className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-[14.5px] font-medium capitalize">{pref.category}</p>
                <p className="text-[12px] text-muted-foreground">
                  You prefer {formatDelta(pref.averageDelta)} · {pref.sampleCount} override
                  {pref.sampleCount !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                data-testid={`reset-expiry-preference-${pref.category}`}
                onClick={() => onReset(pref.category)}
                className="text-[13px] text-destructive font-medium px-3 py-1 rounded-lg hover:bg-destructive/10 transition"
              >
                Reset
              </button>
            </div>
          ))
        )}
        {!loading && preferences.length > 0 && (
          <div className="px-4 py-3.5">
            <button
              data-testid="reset-all-expiry-preferences"
              onClick={onResetAll}
              className="w-full text-[13.5px] text-destructive font-medium py-2 rounded-lg hover:bg-destructive/10 transition"
            >
              Reset all
            </button>
          </div>
        )}
        {loading && (
          <p className="px-4 py-3.5 text-[13.5px] text-muted-foreground">Loading…</p>
        )}
      </div>
    </section>
  );
}

function ProfileCard({
  firstName,
  lastName,
  email,
  onClick,
}: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  onClick: () => void;
}) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const initial = (firstName ?? email ?? "?").charAt(0).toUpperCase();

  return (
    <div
      className="ios-card flex items-center gap-4 p-4 mb-5 cursor-pointer active:bg-muted/50"
      onClick={onClick}
      role="button"
      tabIndex={0}
      data-testid="profile-card"
    >
      <div className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground text-xl font-semibold">
        {initial}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-[16px]">{fullName || "Your profile"}</p>
        <p className="text-[12.5px] text-muted-foreground">{email ?? ""}</p>
      </div>
      <ChevronRight className="size-4 text-muted-foreground" />
    </div>
  );
}

function Group({
  title,
  icon,
  children,
  id,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mb-5 scroll-mt-4">
      <h2 className="px-2 mb-2 flex items-center gap-1.5 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
        {icon} {title}
      </h2>
      <div className="ios-card divide-y divide-border overflow-hidden">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  danger,
  onClick,
  testId,
  showChevron = true,
}: {
  label: string;
  value?: string | null;
  danger?: boolean;
  onClick?: () => void;
  testId?: string;
  showChevron?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3.5 ${onClick ? "cursor-pointer active:bg-muted/50" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      data-testid={testId}
    >
      <span className={`text-[14.5px] ${danger ? "text-destructive font-medium" : ""}`}>{label}</span>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {value && <span className="text-[13.5px]">{value}</span>}
        {showChevron && <ChevronRight className="size-4" />}
      </div>
    </div>
  );
}

function EditProfileFieldDialog({
  open,
  label,
  initialValue,
  inputType,
  saving,
  onCancel,
  onSave,
}: {
  open: boolean;
  label: string;
  initialValue: string;
  inputType: "text" | "number";
  saving: boolean;
  onCancel: () => void;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (open) {
      setValue(initialValue);
    }
  }, [open, initialValue]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>Update your {label.toLowerCase()}.</DialogDescription>
        </DialogHeader>
        <Input
          type={inputType}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          data-testid="profile-edit-input"
          disabled={saving}
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={saving} data-testid="profile-edit-cancel">
            Cancel
          </Button>
          <Button onClick={() => onSave(value)} disabled={saving} data-testid="profile-edit-save">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChangePasswordDialog({
  open,
  saving,
  error,
  onCancel,
  onSave,
}: {
  open: boolean;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (currentPassword: string, newPassword: string) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setValidationError(null);
    }
  }, [open]);

  function handleSave() {
    if (newPassword.length < 8) {
      setValidationError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError("New passwords do not match.");
      return;
    }
    setValidationError(null);
    onSave(currentPassword, newPassword);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            data-testid="change-password-current"
            disabled={saving}
            autoFocus
          />
          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            data-testid="change-password-new"
            disabled={saving}
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            data-testid="change-password-confirm"
            disabled={saving}
          />
        </div>
        {(validationError || error) && (
          <p
            data-testid="change-password-error"
            className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-[12px] text-destructive"
          >
            {validationError ?? error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={saving} data-testid="change-password-cancel">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} data-testid="change-password-save">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

