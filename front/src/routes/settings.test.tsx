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
  getExpiryPreferencesMock.mockResolvedValue({ preferences: [] });
  resetExpiryPreferenceMock.mockResolvedValue(undefined);
  resetAllExpiryPreferencesMock.mockResolvedValue(undefined);
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
