import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { RegisterForm } from "@/components/auth/register-form";
import { api } from "@/lib/api";

const push = jest.fn();
const login = jest.fn();
const success = jest.fn();
const error = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

jest.mock("@/lib/toast", () => ({
  toast: {
    success: (...args: unknown[]) => success(...args),
    error: (...args: unknown[]) => error(...args),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ login }),
}));

jest.mock("@/lib/api", () => ({
  api: {
    register: jest.fn(),
  },
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });

    URL.createObjectURL = jest.fn(() => "blob:test-url");
    URL.revokeObjectURL = jest.fn();
  });

  test("renders the required fields and login link", () => {
    render(<RegisterForm />);

    expect(screen.getByRole("heading", { name: "Create your account" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
  });

  test("shows real-time validation feedback", async () => {
    render(<RegisterForm />);

    fireEvent.input(screen.getByLabelText("Email"), { target: { value: "bad-email" } });
    fireEvent.input(screen.getByLabelText("Password"), { target: { value: "weakpass" } });
    fireEvent.input(screen.getByLabelText("Confirm Password"), { target: { value: "different" } });

    await waitFor(() => {
      expect(screen.getByText("Enter a valid email address", { selector: "p" })).toBeInTheDocument();
      expect(screen.getByText("Password must include at least one uppercase letter", { selector: "p" })).toBeInTheDocument();
      expect(screen.getByText("Passwords do not match", { selector: "p" })).toBeInTheDocument();
      expect(screen.getByText(/Strength:/)).toHaveTextContent("Strength: Weak");
    });
  });

  test("submits successfully, shows API key modal, and redirects to dashboard", async () => {
    (api.register as jest.Mock).mockResolvedValue({
      status: 201,
      message: "Registration successful",
      data: {
        email: "new.user@example.com",
        api_key: "ipfs_gw_test_123456",
      },
    });

    render(<RegisterForm />);

    fireEvent.input(screen.getByLabelText("Email"), { target: { value: "new.user@example.com" } });
    fireEvent.input(screen.getByLabelText("Password"), { target: { value: "StrongPass1!" } });
    fireEvent.input(screen.getByLabelText("Confirm Password"), { target: { value: "StrongPass1!" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("ipfs_gw_test_123456")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Go to Dashboard" }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("ipfs_gw_test_123456", "new.user@example.com");
      expect(push).toHaveBeenCalledWith("/dashboard");
      expect(success).toHaveBeenCalled();
    });
  });

  test("copies and downloads API key from success dialog", async () => {
    (api.register as jest.Mock).mockResolvedValue({
      status: 201,
      message: "Registration successful",
      data: {
        email: "copy.user@example.com",
        api_key: "ipfs_gw_copy_123456",
      },
    });

    const anchorClickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    render(<RegisterForm />);

    fireEvent.input(screen.getByLabelText("Email"), { target: { value: "copy.user@example.com" } });
    fireEvent.input(screen.getByLabelText("Password"), { target: { value: "StrongPass1!" } });
    fireEvent.input(screen.getByLabelText("Confirm Password"), { target: { value: "StrongPass1!" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Copy key" }));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("ipfs_gw_copy_123456");
    });

    fireEvent.click(screen.getByRole("button", { name: "Download .txt" }));
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(anchorClickSpy).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test-url");

    anchorClickSpy.mockRestore();
  });

  test("shows email-specific error when backend reports email already registered", async () => {
    (api.register as jest.Mock).mockRejectedValue({
      response: {
        data: {
          message: "Email already registered",
        },
      },
    });

    render(<RegisterForm />);

    fireEvent.input(screen.getByLabelText("Email"), { target: { value: "existing.user@example.com" } });
    fireEvent.input(screen.getByLabelText("Password"), { target: { value: "StrongPass1!" } });
    fireEvent.input(screen.getByLabelText("Confirm Password"), { target: { value: "StrongPass1!" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    expect((await screen.findAllByText("This email is already registered. Try logging in instead.")).length).toBeGreaterThan(0);
    expect(error).toHaveBeenCalledWith("Email already registered");
  });

  test("shows root error when backend response does not include credentials", async () => {
    (api.register as jest.Mock).mockResolvedValue({
      status: 201,
      message: "Registration successful",
      data: null,
    });

    render(<RegisterForm />);

    fireEvent.input(screen.getByLabelText("Email"), { target: { value: "broken.user@example.com" } });
    fireEvent.input(screen.getByLabelText("Password"), { target: { value: "StrongPass1!" } });
    fireEvent.input(screen.getByLabelText("Confirm Password"), { target: { value: "StrongPass1!" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    expect((await screen.findAllByText("Registration response did not include user credentials")).length).toBeGreaterThan(0);
    expect(error).toHaveBeenCalledWith("Registration response did not include user credentials");
  });
});