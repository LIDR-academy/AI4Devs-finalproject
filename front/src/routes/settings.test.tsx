import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const getExpiryPreferencesMock = vi.fn();
const resetExpiryPreferenceMock = vi.fn();
const resetAllExpiryPreferencesMock = vi.fn();

vi.mock("@/features/pantry/pantry.api", () => ({
  getExpiryPreferences: (...args: unknown[]) => getExpiryPreferencesMock(...args),
  resetExpiryPreference: (...args: unknown[]) => resetExpiryPreferenceMock(...args),
  resetAllExpiryPreferences: (...args: unknown[]) => resetAllExpiryPreferencesMock(...args),
}));

const navigateMock = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: unknown) => config,
  useNavigate: () => navigateMock,
  useLocation: () => ({ pathname: "/settings" }),
  Link: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <a className={className}>{children}</a>
  ),
}));

vi.mock("@/features/auth/route-guard", () => ({
  requireAuthBeforeLoad: () => undefined,
  useRequireAuthRedirect: () => true,
}));

const clearSessionMock = vi.fn();

vi.mock("@/features/auth/session", () => ({
  clearSession: (...args: unknown[]) => clearSessionMock(...args),
  getSessionUser: () => ({ email: "user@example.com" }),
}));

const getCurrentUserMock = vi.fn();
const updateProfileMock = vi.fn();
const changePasswordMock = vi.fn();
const deleteAccountMock = vi.fn();

vi.mock("@/features/auth/auth.api", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUserMock(...args),
  updateProfile: (...args: unknown[]) => updateProfileMock(...args),
  changePassword: (...args: unknown[]) => changePasswordMock(...args),
  deleteAccount: (...args: unknown[]) => deleteAccountMock(...args),
}));

const getNotificationPreferencesMock = vi.fn();
const updateNotificationPreferencesMock = vi.fn();
const getAutoExpirySettingsMock = vi.fn();
const updateAutoExpirySettingsMock = vi.fn();

vi.mock("@/features/notifications/notifications.api", () => ({
  getNotificationPreferences: (...args: unknown[]) => getNotificationPreferencesMock(...args),
  updateNotificationPreferences: (...args: unknown[]) => updateNotificationPreferencesMock(...args),
  getAutoExpirySettings: (...args: unknown[]) => getAutoExpirySettingsMock(...args),
  updateAutoExpirySettings: (...args: unknown[]) => updateAutoExpirySettingsMock(...args),
}));

import { SettingsPage } from "./settings";

const BASE_PROFILE = {
  id: "user-1",
  email: "alex@example.com",
  firstName: "Alex",
  lastName: "Garcia",
  age: 32,
  address: "Madrid, 28001, ES",
  createdAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  getNotificationPreferencesMock.mockResolvedValue({
    expirationEnabled: true,
    priceDropEnabled: true,
    foodConsumedByOthersEnabled: true,
  });
  getAutoExpirySettingsMock.mockResolvedValue({ enabled: true, thresholdDays: 14 });
  updateAutoExpirySettingsMock.mockImplementation(async (payload) => payload);
  getExpiryPreferencesMock.mockResolvedValue({ preferences: [] });
  resetExpiryPreferenceMock.mockResolvedValue(undefined);
  resetAllExpiryPreferencesMock.mockResolvedValue(undefined);
  getCurrentUserMock.mockResolvedValue(BASE_PROFILE);
  updateProfileMock.mockImplementation(async (payload) => ({ ...BASE_PROFILE, ...payload }));
  changePasswordMock.mockResolvedValue(undefined);
  deleteAccountMock.mockResolvedValue(undefined);
});

describe("SettingsPage — Profile", () => {
  it("renders the real profile fields loaded from getCurrentUser, not hardcoded placeholders", async () => {
    render(<SettingsPage />);

    expect(await screen.findByText("Alex")).toBeInTheDocument();
    expect(screen.getByText("Garcia")).toBeInTheDocument();
    expect(screen.getByText("32")).toBeInTheDocument();
    expect(screen.getByText("Madrid, 28001, ES")).toBeInTheDocument();
  });

  it("opens an edit dialog with the current value when the Name row is clicked", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const nameRow = await screen.findByTestId("profile-row-firstName");
    await user.click(nameRow);

    const input = await screen.findByTestId("profile-edit-input");
    expect(input).toHaveValue("Alex");
  });

  it("saves the new value and updates the row when Save is clicked", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(await screen.findByTestId("profile-row-firstName"));
    const input = await screen.findByTestId("profile-edit-input");
    await user.clear(input);
    await user.type(input, "Alexandra");
    await user.click(screen.getByTestId("profile-edit-save"));

    await waitFor(() => expect(updateProfileMock).toHaveBeenCalledWith({ firstName: "Alexandra" }));
    expect(await screen.findByText("Alexandra")).toBeInTheDocument();
  });

  it("closes the dialog without saving when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(await screen.findByTestId("profile-row-firstName"));
    await screen.findByTestId("profile-edit-input");
    await user.click(screen.getByTestId("profile-edit-cancel"));

    expect(updateProfileMock).not.toHaveBeenCalled();
    expect(screen.queryByTestId("profile-edit-input")).not.toBeInTheDocument();
  });

  it("sends age as a number when the Age row is edited", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(await screen.findByTestId("profile-row-age"));
    const input = await screen.findByTestId("profile-edit-input");
    await user.clear(input);
    await user.type(input, "33");
    await user.click(screen.getByTestId("profile-edit-save"));

    await waitFor(() => expect(updateProfileMock).toHaveBeenCalledWith({ age: 33 }));
  });

  it("does not make the Email row clickable/editable", async () => {
    render(<SettingsPage />);

    expect(await screen.findByText("alex@example.com")).toBeInTheDocument();
    expect(screen.queryByTestId("profile-row-email")).not.toBeInTheDocument();
  });

  it("does not crash and shows no profile values when getCurrentUser rejects", async () => {
    getCurrentUserMock.mockRejectedValue(new Error("Network error"));
    render(<SettingsPage />);

    await waitFor(() => expect(getCurrentUserMock).toHaveBeenCalled());
    expect(screen.queryByText("Alex")).not.toBeInTheDocument();
  });
});

describe("SettingsPage — expiry learning (T014 + T021)", () => {
  it("renders the Expiry Learning section heading", async () => {
    getExpiryPreferencesMock.mockResolvedValue({ preferences: [] });
    render(<SettingsPage />);
    expect(await screen.findByText(/expiry learning/i)).toBeInTheDocument();
  });

  it("shows an empty-state message when the user has no learned preferences", async () => {
    getExpiryPreferencesMock.mockResolvedValue({ preferences: [] });
    render(<SettingsPage />);
    expect(await screen.findByTestId("expiry-learning-empty")).toBeInTheDocument();
  });

  it("renders each preference row with the correct delta text", async () => {
    getExpiryPreferencesMock.mockResolvedValue({
      preferences: [
        { category: "dairy", averageDelta: 5, sampleCount: 4, lastUpdatedAt: "2026-06-28T10:00:00.000Z" },
        { category: "produce", averageDelta: -2, sampleCount: 3, lastUpdatedAt: "2026-06-27T08:00:00.000Z" },
      ],
    });
    render(<SettingsPage />);

    expect(await screen.findByText(/\+5 days/i)).toBeInTheDocument();
    expect(await screen.findByText(/−2 days/i)).toBeInTheDocument();
    expect(await screen.findByText(/dairy/i)).toBeInTheDocument();
    expect(await screen.findByText(/produce/i)).toBeInTheDocument();
  });

  it("calls resetExpiryPreference with the category when the per-category reset button is clicked", async () => {
    const user = userEvent.setup();
    getExpiryPreferencesMock.mockResolvedValue({
      preferences: [
        { category: "dairy", averageDelta: 5, sampleCount: 4, lastUpdatedAt: "2026-06-28T10:00:00.000Z" },
      ],
    });
    render(<SettingsPage />);

    const resetBtn = await screen.findByTestId("reset-expiry-preference-dairy");
    await user.click(resetBtn);

    await waitFor(() => expect(resetExpiryPreferenceMock).toHaveBeenCalledWith("dairy"));
  });

  it("calls resetAllExpiryPreferences when the Reset all button is clicked", async () => {
    const user = userEvent.setup();
    getExpiryPreferencesMock.mockResolvedValue({
      preferences: [
        { category: "dairy", averageDelta: 5, sampleCount: 4, lastUpdatedAt: "2026-06-28T10:00:00.000Z" },
      ],
    });
    render(<SettingsPage />);

    await screen.findByTestId("reset-all-expiry-preferences");
    await user.click(screen.getByTestId("reset-all-expiry-preferences"));

    await waitFor(() => expect(resetAllExpiryPreferencesMock).toHaveBeenCalled());
  });

  it("does not show an error page when getExpiryPreferences rejects", async () => {
    getExpiryPreferencesMock.mockRejectedValue(new Error("Network error"));
    render(<SettingsPage />);
    expect(await screen.findByTestId("expiry-learning-empty")).toBeInTheDocument();
  });
});

describe("SettingsPage — auto-expiry", () => {
  it("loads and shows the current threshold", async () => {
    render(<SettingsPage />);
    const input = await screen.findByTestId("auto-expiry-threshold");
    await waitFor(() => expect(input).toHaveValue(14));
  });

  it("toggling auto-expiry sends a PATCH with enabled=false", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await screen.findByTestId("auto-expiry-threshold");
    await user.click(screen.getByTestId("auto-expiry-toggle"));

    await waitFor(() =>
      expect(updateAutoExpirySettingsMock).toHaveBeenCalledWith({ enabled: false, thresholdDays: 14 }),
    );
  });

  it("changing the threshold within range saves it", async () => {
    render(<SettingsPage />);

    const input = await screen.findByTestId("auto-expiry-threshold");
    fireEvent.change(input, { target: { value: "30" } });

    await waitFor(() =>
      expect(updateAutoExpirySettingsMock).toHaveBeenCalledWith(
        expect.objectContaining({ thresholdDays: 30 }),
      ),
    );
  });
});

describe("SettingsPage — Privacy & Security", () => {
  it("does not render the Ad privacy row", () => {
    render(<SettingsPage />);
    expect(screen.queryByText("Ad privacy")).not.toBeInTheDocument();
  });

  it("opens the change password dialog when the row is clicked", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(await screen.findByTestId("change-password-row"));

    expect(await screen.findByTestId("change-password-current")).toBeInTheDocument();
  });

  it("shows a validation error when the new passwords do not match", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(await screen.findByTestId("change-password-row"));
    await user.type(await screen.findByTestId("change-password-current"), "oldpassword1");
    await user.type(screen.getByTestId("change-password-new"), "newpassword1");
    await user.type(screen.getByTestId("change-password-confirm"), "newpassword2");
    await user.click(screen.getByTestId("change-password-save"));

    expect(await screen.findByTestId("change-password-error")).toHaveTextContent(
      /do not match/i,
    );
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  it("submits the change password request and closes the dialog on success", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(await screen.findByTestId("change-password-row"));
    await user.type(await screen.findByTestId("change-password-current"), "oldpassword1");
    await user.type(screen.getByTestId("change-password-new"), "newpassword1");
    await user.type(screen.getByTestId("change-password-confirm"), "newpassword1");
    await user.click(screen.getByTestId("change-password-save"));

    await waitFor(() =>
      expect(changePasswordMock).toHaveBeenCalledWith({
        currentPassword: "oldpassword1",
        newPassword: "newpassword1",
      }),
    );
    await waitFor(() =>
      expect(screen.queryByTestId("change-password-current")).not.toBeInTheDocument(),
    );
  });

  it("shows an error message when changing the password fails", async () => {
    const user = userEvent.setup();
    changePasswordMock.mockRejectedValue(new Error("Current password is incorrect"));
    render(<SettingsPage />);

    await user.click(await screen.findByTestId("change-password-row"));
    await user.type(await screen.findByTestId("change-password-current"), "wrongpassword");
    await user.type(screen.getByTestId("change-password-new"), "newpassword1");
    await user.type(screen.getByTestId("change-password-confirm"), "newpassword1");
    await user.click(screen.getByTestId("change-password-save"));

    expect(await screen.findByTestId("change-password-error")).toHaveTextContent(
      /current password is incorrect/i,
    );
  });

  it("opens a confirmation dialog warning about data loss when Delete account is clicked", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(await screen.findByTestId("delete-account-row"));

    expect(await screen.findByText(/permanently delete your account/i)).toBeInTheDocument();
  });

  it("does not delete the account when the confirmation is cancelled", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(await screen.findByTestId("delete-account-row"));
    await user.click(await screen.findByTestId("delete-account-cancel"));

    expect(deleteAccountMock).not.toHaveBeenCalled();
  });

  it("deletes the account, clears the session, and redirects to /auth on confirmation", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(await screen.findByTestId("delete-account-row"));
    await user.click(await screen.findByTestId("delete-account-confirm"));

    await waitFor(() => expect(deleteAccountMock).toHaveBeenCalled());
    expect(clearSessionMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith({ to: "/auth" });
  });

  it("shows an error message when deleting the account fails", async () => {
    const user = userEvent.setup();
    deleteAccountMock.mockRejectedValue(new Error("Network error"));
    render(<SettingsPage />);

    await user.click(await screen.findByTestId("delete-account-row"));
    await user.click(await screen.findByTestId("delete-account-confirm"));

    expect(await screen.findByTestId("delete-account-error")).toHaveTextContent(/network error/i);
  });
});
