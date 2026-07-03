import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// --- Mocks ---------------------------------------------------------------
const navigateMock = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: unknown) => config,
  useNavigate: () => navigateMock,
  useLocation: () => ({ pathname: "/add/manual" }),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

vi.mock("@/features/auth/route-guard", () => ({
  requireAuthBeforeLoad: () => undefined,
  useRequireAuthRedirect: () => true,
}));

const toastSuccessMock = vi.fn();
vi.mock("sonner", () => ({
  toast: { success: (...args: unknown[]) => toastSuccessMock(...args) },
}));

const createPantryItemMock = vi.fn();
vi.mock("@/features/pantry/pantry.api", async () => {
  const actual = await vi.importActual<typeof import("@/features/pantry/pantry.api")>(
    "@/features/pantry/pantry.api",
  );
  return {
    ...actual,
    createPantryItem: (...args: unknown[]) => createPantryItemMock(...args),
  };
});

const clearSessionMock = vi.fn();
vi.mock("@/features/auth/session", () => ({
  clearSession: () => clearSessionMock(),
  getAccessToken: () => "test-token",
}));

import { ManualEntryPage } from "./add.manual";
import { ApiError } from "@/features/pantry/pantry.api";
import { getAnalyticsBuffer, resetAnalyticsBuffer } from "@/shared/lib/analytics";
import { consumeHighlightedItem } from "@/features/pantry/pantry-view-state";

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByTestId("manual-name-input"), "Greek Yogurt");
  const quantity = screen.getByTestId("manual-quantity-input");
  await user.clear(quantity);
  await user.type(quantity, "2");
}

function eventNames(): string[] {
  return getAnalyticsBuffer().map((e) => e.name);
}

beforeEach(() => {
  vi.clearAllMocks();
  resetAnalyticsBuffer();
  sessionStorage.clear();
});

describe("ManualEntryPage", () => {
  it("emits pantry_add_item_opened on mount", () => {
    render(<ManualEntryPage />);
    expect(eventNames()).toContain("pantry_add_item_opened");
  });

  it("shows a field-level error and does not submit when name is empty", async () => {
    const user = userEvent.setup();
    render(<ManualEntryPage />);

    await user.click(screen.getByRole("button", { name: "Save item" }));

    const error = await screen.findByTestId("manual-name-error");
    expect(error).toHaveTextContent("Name is required.");
    expect(screen.getByTestId("manual-name-input")).toHaveAttribute("aria-invalid", "true");
    expect(createPantryItemMock).not.toHaveBeenCalled();
    expect(eventNames()).not.toContain("pantry_add_item_submitted");
  });

  it("disables the submit button while the request is in flight", async () => {
    const user = userEvent.setup();
    let resolveCreate: (value: unknown) => void = () => {};
    createPantryItemMock.mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = resolve;
      }),
    );

    render(<ManualEntryPage />);
    await fillValidForm(user);

    const saveButton = screen.getByRole("button", { name: "Save item" });
    await user.click(saveButton);

    await waitFor(() => expect(saveButton).toBeDisabled());
    expect(createPantryItemMock).toHaveBeenCalledTimes(1);

    resolveCreate({ id: "item-1" });
  });

  it("submits a trimmed, typed payload and reports success", async () => {
    const user = userEvent.setup();
    createPantryItemMock.mockResolvedValue({ id: "new-item-99" });

    render(<ManualEntryPage />);
    await user.type(screen.getByTestId("manual-name-input"), "  Greek Yogurt  ");
    const quantity = screen.getByTestId("manual-quantity-input");
    await user.clear(quantity);
    await user.type(quantity, "3");
    await user.type(screen.getByTestId("manual-unit-price-input"), "1.50");

    await user.click(screen.getByRole("button", { name: /Save item|Added to pantry/ }));

    await waitFor(() => expect(createPantryItemMock).toHaveBeenCalledTimes(1));
    const payload = createPantryItemMock.mock.calls[0][0];
    expect(payload.name).toBe("Greek Yogurt");
    expect(payload.quantity).toBe(3);
    expect(payload.pricePaid).toBe(4.5);

    expect(toastSuccessMock).toHaveBeenCalled();
    expect(eventNames()).toEqual(
      expect.arrayContaining(["pantry_add_item_submitted", "pantry_add_item_success"]),
    );
    expect(consumeHighlightedItem()).toBe("new-item-99");
  });

  it("shows a retry-friendly message and failure event on a 5xx error", async () => {
    const user = userEvent.setup();
    createPantryItemMock.mockRejectedValue(new ApiError(500, "boom"));

    render(<ManualEntryPage />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Save item" }));

    const error = await screen.findByTestId("manual-form-error");
    expect(error).toHaveTextContent(/try again/i);
    const failed = getAnalyticsBuffer().find((e) => e.name === "pantry_add_item_failed");
    expect(failed?.props).toEqual({ reason: "server_error" });
  });

  it("shows a household-access warning on a 403 error", async () => {
    const user = userEvent.setup();
    createPantryItemMock.mockRejectedValue(new ApiError(403, "forbidden"));

    render(<ManualEntryPage />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Save item" }));

    const error = await screen.findByTestId("manual-form-error");
    expect(error).toHaveTextContent(/household/i);
  });

  it("clears the session and redirects on a 401 error", async () => {
    const user = userEvent.setup();
    createPantryItemMock.mockRejectedValue(new ApiError(401, "unauthorized"));

    render(<ManualEntryPage />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Save item" }));

    await waitFor(() => expect(clearSessionMock).toHaveBeenCalled());
    expect(navigateMock).toHaveBeenCalledWith({ to: "/auth", replace: true });
  });

  it("includes notes in the payload when notes are entered", async () => {
    const user = userEvent.setup();
    createPantryItemMock.mockResolvedValue({ id: "item-notes-1" });

    render(<ManualEntryPage />);
    await fillValidForm(user);
    await user.type(screen.getByPlaceholderText(/optional notes/i), "organic brand, aisle 3");

    await user.click(screen.getByRole("button", { name: /Save item|Added to pantry/ }));

    await waitFor(() => expect(createPantryItemMock).toHaveBeenCalledTimes(1));
    const payload = createPantryItemMock.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.notes).toBe("organic brand, aisle 3");
  });

  it("omits notes from the payload when the notes field is empty", async () => {
    const user = userEvent.setup();
    createPantryItemMock.mockResolvedValue({ id: "item-no-notes" });

    render(<ManualEntryPage />);
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: /Save item|Added to pantry/ }));

    await waitFor(() => expect(createPantryItemMock).toHaveBeenCalledTimes(1));
    const payload = createPantryItemMock.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("notes");
  });
});
