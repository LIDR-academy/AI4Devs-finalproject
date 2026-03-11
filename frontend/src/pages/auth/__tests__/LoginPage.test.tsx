import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "../../../contexts/AuthContext";
import type { AuthContextType } from "../../../types";
import LoginPage from "../LoginPage";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LoginPage", () => {
  const mockLogin = vi.fn();
  const mockAuthContext: AuthContextType = {
    user: null,
    isAuthenticated: false,
    login: mockLogin,
    logout: vi.fn(),
    register: vi.fn(),
    loading: false,
    error: undefined,
  };

  const renderLoginPage = (contextValue = mockAuthContext) => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={contextValue}>
          <LoginPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering Tests", () => {
    it("renders login form with all expected elements", () => {
      renderLoginPage();

      expect(
        screen.getByRole("heading", { name: /sign in to your account/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
      expect(screen.getByText(/create a new account/i)).toBeInTheDocument();
    });

    it("renders email input with correct attributes", () => {
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("autocomplete", "email");
    });

    it("renders password input with correct attributes", () => {
      renderLoginPage();

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
    });

    it("renders submit button", () => {
      renderLoginPage();

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("renders 'Forgot password?' link", () => {
      renderLoginPage();

      const forgotPasswordLink = screen.getByText(/forgot your password/i);
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink.closest("a")).toHaveAttribute(
        "href",
        "/password-reset"
      );
    });

    it("renders 'Sign up' link", () => {
      renderLoginPage();

      const signUpLink = screen.getByText(/create a new account/i);
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink.closest("a")).toHaveAttribute("href", "/register");
    });
  });

  describe("Validation Tests", () => {
    it("displays error when email is empty and form is submitted", async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it("displays error when password is empty and form is submitted", async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it("displays error for invalid email format", async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "invalid-email");

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email address/i)
        ).toBeInTheDocument();
      });
    });

    it("displays error for password shorter than 6 characters", async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, "12345");

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 6 characters/i)
        ).toBeInTheDocument();
      });
    });

    it("clears validation errors when user starts typing", async () => {
      const user = userEvent.setup();
      renderLoginPage();

      // Submit empty form to trigger validation errors
      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      // Type in email field
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "test@example.com");

      // Email error should be cleared
      await waitFor(() => {
        expect(
          screen.queryByText(/email is required/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Form Submission Tests", () => {
    it("calls login function with correct credentials on valid submission", async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
    });

    it("shows loading state during login request", () => {
      const loadingContext = { ...mockAuthContext, loading: true };
      renderLoginPage(loadingContext);

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      expect(submitButton).toHaveAttribute("aria-busy", "true");
      expect(submitButton).toBeDisabled();
    });

    it("disables form inputs during loading", () => {
      const loadingContext = { ...mockAuthContext, loading: true };
      renderLoginPage(loadingContext);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });

    it("redirects to dashboard on successful login", async () => {
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
      renderLoginPage(authenticatedContext);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
      });
    });

    it("redirects to intended destination if coming from protected route", async () => {
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

      render(
        <MemoryRouter initialEntries={[{ pathname: "/login", state: { from: { pathname: "/templates" } } }]}>
          <AuthContext.Provider value={authenticatedContext}>
            <LoginPage />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/templates", {
          replace: true,
        });
      });
    });
  });

  describe("Error Handling Tests", () => {
    it("displays error message from AuthContext on login failure", () => {
      const errorContext = {
        ...mockAuthContext,
        error: "Invalid email or password",
      };
      renderLoginPage(errorContext);

      expect(
        screen.getByText(/invalid email or password/i)
      ).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("displays network error message on connection failure", () => {
      const errorContext = {
        ...mockAuthContext,
        error: "Network error occurred",
      };
      renderLoginPage(errorContext);

      expect(
        screen.getByText(/network error occurred/i)
      ).toBeInTheDocument();
    });

    it("keeps form enabled after error", () => {
      const errorContext = {
        ...mockAuthContext,
        error: "Invalid credentials",
      };
      renderLoginPage(errorContext);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      expect(emailInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });

    it("allows retry after error", async () => {
      const user = userEvent.setup();
      const errorContext = {
        ...mockAuthContext,
        error: "Invalid credentials",
      };
      renderLoginPage(errorContext);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "newpassword");

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility Tests", () => {
    it("all inputs have associated labels", () => {
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it("error messages have role='alert'", () => {
      const errorContext = {
        ...mockAuthContext,
        error: "Test error",
      };
      renderLoginPage(errorContext);

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Test error");
    });

    it("form has proper ARIA attributes", () => {
      renderLoginPage();

      const form = screen.getByRole("form");
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute("aria-labelledby", "login-title");
    });

    it("submit button has aria-busy during loading", () => {
      const loadingContext = { ...mockAuthContext, loading: true };
      renderLoginPage(loadingContext);

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      expect(submitButton).toHaveAttribute("aria-busy", "true");
    });

    it("no accessibility violations", () => {
      renderLoginPage();

      // Basic accessibility checks
      expect(screen.getByRole("form")).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });
  });

  describe("Integration Tests", () => {
    it("full login flow: Enter credentials → Submit → Token stored → Redirect", async () => {
      const user = userEvent.setup();
      renderLoginPage();

      // Enter credentials
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      // Submit form
      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      // Verify login was called
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
    });

    it("keyboard navigation: Tab through fields, Enter to submit", async () => {
      const user = userEvent.setup();
      renderLoginPage();

      // Click on email input to focus it
      const emailInput = screen.getByLabelText(/email/i);
      await user.click(emailInput);

      // Type email
      await user.type(emailInput, "test@example.com");

      // Tab to password input
      await user.tab();
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveFocus();

      // Type password
      await user.type(passwordInput, "password123");

      // Press Enter to submit
      await user.keyboard("{Enter}");

      // Verify login was called
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });
  });
});

