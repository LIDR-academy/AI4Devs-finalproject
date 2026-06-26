import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: unknown) => config,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/settings" }),
  Link: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <a className={className}>{children}</a>
  ),
}));

vi.mock("@/features/auth/route-guard", () => ({
  requireAuthBeforeLoad: () => undefined,
  useRequireAuthRedirect: () => true,
}));

vi.mock("@/features/auth/session", () => ({
  clearSession: vi.fn(),
  getSessionUser: () => ({ email: "user@example.com" }),
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

beforeEach(() => {
  vi.clearAllMocks();
  getNotificationPreferencesMock.mockResolvedValue({
    expirationEnabled: true,
    priceDropEnabled: true,
    foodConsumedByOthersEnabled: true,
  });
  getAutoExpirySettingsMock.mockResolvedValue({ enabled: true, thresholdDays: 14 });
  updateAutoExpirySettingsMock.mockImplementation(async (payload) => payload);
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
