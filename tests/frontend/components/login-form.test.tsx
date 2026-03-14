import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { LoginForm } from "@/components/auth/login-form";

const pushMock = jest.fn();
const loginMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock("@/lib/toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    login: loginMock,
  }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    loginMock.mockReset();
  });

  it("submits credentials and redirects to dashboard", async () => {
    loginMock.mockResolvedValue(undefined);

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("API Key"), {
      target: { value: "ipfs_gw_test_key" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("ipfs_gw_test_key", "user@example.com");
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows validation errors when fields are missing", async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("API key is required")).toBeInTheDocument();
    });
  });
});
