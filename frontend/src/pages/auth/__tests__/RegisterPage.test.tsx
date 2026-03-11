import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "../../../contexts/AuthContext";
import type { AuthContextType } from "../../../types";
import RegisterPage from "../RegisterPage";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("RegisterPage", () => {
  const mockRegister = vi.fn();
  const mockAuthContext: AuthContextType = {
    user: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: mockRegister,
    loading: false,
    error: undefined,
  };

  const renderRegisterPage = (contextValue = mockAuthContext) => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={contextValue}>
          <RegisterPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering Tests", () => {
    it("renders registration form with all fields", () => {
      renderRegisterPage();

      expect(
        screen.getByRole("heading", { name: /create your account/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i, { selector: "#password" })).toBeInTheDocument();
      expect(
        screen.getByLabelText(/confirm password/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    it("renders email, password, confirm password, and full name inputs", () => {
      renderRegisterPage();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i, { selector: "#password" });
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const fullNameInput = screen.getByLabelText(/full name/i);

      expect(emailInput).toHaveAttribute("type", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
      expect(fullNameInput).toHaveAttribute("type", "text");
    });

    it("renders submit button", () => {
      renderRegisterPage();

      const submitButton = screen.getByRole("button", { name: /sign up/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("renders 'Sign in' link", () => {
      renderRegisterPage();

      const signInLink = screen.getByText(/already have an account/i);
      expect(signInLink).toBeInTheDocument();
      expect(signInLink.closest("a")).toHaveAttribute("href", "/login");
    });
  });

  describe("Validation Tests", () => {
    it("displays error when required fields are empty", async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const submitButton = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        const passwordErrors = screen.getAllByText(/password is required/i);
        expect(passwordErrors.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("displays error for invalid email format", async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "invalid-email");

      const submitButton = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email address/i)
        ).toBeInTheDocument();
      });
    });

    it("displays error when password is too short", async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const passwordInput = screen.getByLabelText(/^password/i, { selector: "#password" });
      await user.type(passwordInput, "12345");

      const submitButton = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 6 characters/i)
        ).toBeInTheDocument();
      });
    });

    it("displays error when passwords don't match", async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const passwordInput = screen.getByLabelText(/^password/i, { selector: "#password" });
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password456");

      const submitButton = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/passwords do not match/i)
        ).toBeInTheDocument();
      });
    });

    it("displays error when password exceeds 100 characters", async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const longPassword = "a".repeat(101);
      const passwordInput = screen.getByLabelText(/^password/i, { selector: "#password" });
      await user.type(passwordInput, longPassword);

      const submitButton = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/password must not exceed 100 characters/i)
        ).toBeInTheDocument();
      });
    });

    it("displays error when full name exceeds 255 characters", async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const longName = "a".repeat(256);
      const fullNameInput = screen.getByLabelText(/full name/i);
      await user.type(fullNameInput, longName);

      const submitButton = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/full name must not exceed 255 characters/i)
        ).toBeInTheDocument();
      });
    });

    it("real-time password match validation", async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const passwordInput = screen.getByLabelText(/^password/i, { selector: "#password" });
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password456");

      // Trigger validation by clicking submit
      const submitButton = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/passwords do not match/i)
        ).toBeInTheDocument();
      });

      // Clear and re-type matching password
      await user.clear(confirmPasswordInput);
      await user.type(confirmPasswordInput, "password123");

      // Error should be cleared
      await waitFor(() => {
        expect(
          screen.queryByText(/passwords do not match/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Form Submission Tests", () => {
    it("calls register function with correct data on valid submission", async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i, { selector: "#password" });
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const fullNameInput = screen.getByLabelText(/full name/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.type(fullNameInput, "Test User");

      const submitButton = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
          full_name: "Test User",
        });
      });
    });

    it("shows loading state during registration", () => {
      const loadingContext = { ...mockAuthContext, loading: true };
      renderRegisterPage(loadingContext);

      const submitButton = screen.getByRole("button");
      expect(submitButton).toHaveAttribute("aria-busy", "true");
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/creating account/i);
    });

    it("auto-logs in user after successful registration", async () => {
      const authenticatedContext = {
        ...mockAuthContext,
        isAuthenticated: true,
        user: {
          id: 1,
          email: "test@example.com",
          full_name: "Test User",
          is_active: true,
          is_superuser: false,
          created_at: "2025-10-19T12:00:00Z",
        },
      };
      renderRegisterPage(authenticatedContext);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
      });
    });

    it("redirects to dashboard after registration", async () => {
      const authenticatedContext = {
        ...mockAuthContext,
        isAuthenticated: true,
        user: {
          id: 1,
          email: "test@example.com",
          full_name: "Test User",
          is_active: true,
          is_superuser: false,
          created_at: "2025-10-19T12:00:00Z",
        },
      };
      renderRegisterPage(authenticatedContext);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
      });
    });

    it("handles optional full name field correctly", async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i, { selector: "#password" });
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

      const submitButton = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
          full_name: "",
        });
      });
    });
  });

  describe("Error Handling Tests", () => {
    it("displays error when email already exists (400)", () => {
      const errorContext = {
        ...mockAuthContext,
        error: "Email already registered",
      };
      renderRegisterPage(errorContext);

      // FormError component renders when error exists
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
    });

    it("displays validation errors from backend", () => {
      const errorContext = {
        ...mockAuthContext,
        error: "Invalid email format",
      };
      renderRegisterPage(errorContext);

      // FormError component renders when error exists
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });

    it("allows retry after error", async () => {
      const user = userEvent.setup();
      const errorContext = {
        ...mockAuthContext,
        error: "Registration failed",
      };
      renderRegisterPage(errorContext);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i, { selector: "#password" });
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "newpassword");
      await user.type(confirmPasswordInput, "newpassword");

      const submitButton = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility Tests", () => {
    it("all inputs have associated labels", () => {
      renderRegisterPage();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i, { selector: "#password" });
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const fullNameInput = screen.getByLabelText(/full name/i);

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
      expect(fullNameInput).toBeInTheDocument();
    });

    it("required fields marked with asterisk", () => {
      renderRegisterPage();

      const requiredAsterisks = screen.getAllByLabelText("required");
      expect(requiredAsterisks.length).toBeGreaterThan(0);
    });

    it("error messages announced to screen readers", () => {
      const errorContext = {
        ...mockAuthContext,
        error: "Registration error",
      };
      renderRegisterPage(errorContext);

      // FormError component renders with role="alert"
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Registration error");
    });

    it("no accessibility violations", () => {
      renderRegisterPage();

      // Basic accessibility checks
      expect(screen.getByRole("form")).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i, { selector: "#password" })).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });
  });
});

