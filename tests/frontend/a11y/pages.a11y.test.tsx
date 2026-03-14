import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import Home from "@/app/page";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";

expect.extend(toHaveNoViolations);

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    login: jest.fn(),
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

jest.mock("@/lib/api", () => ({
  api: {
    register: jest.fn(),
  },
}));

describe("Frontend accessibility", () => {
  it("home page has no critical accessibility violations", async () => {
    const { container } = render(<Home />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("login form has no critical accessibility violations", async () => {
    const { container } = render(<LoginForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("register form has no critical accessibility violations", async () => {
    const { container } = render(<RegisterForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
