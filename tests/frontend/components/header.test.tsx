import { fireEvent, render, screen } from "@testing-library/react";

import { Header } from "@/components/layout/header";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    logout: jest.fn(),
  }),
}));

describe("Header", () => {
  test("renders required navigation links", () => {
    render(<Header />);

    expect(screen.getAllByRole("link", { name: "Home" })[0]).toHaveAttribute("href", "/");
    expect(screen.getAllByRole("link", { name: "Upload" })[0]).toHaveAttribute("href", "/upload");
    expect(screen.getAllByRole("link", { name: "Retrieve" })[0]).toHaveAttribute("href", "/retrieve");
    expect(screen.getAllByRole("link", { name: "Files" })[0]).toHaveAttribute("href", "/files");
    expect(screen.getAllByRole("link", { name: "Docs" })[0]).toHaveAttribute("href", "/docs");
    expect(screen.getAllByRole("link", { name: "Login/Register" })[0]).toHaveAttribute("href", "/login");
  });

  test("opens and closes mobile menu", () => {
    const { container } = render(<Header />);

    const toggle = screen.getByRole("button", { name: /toggle navigation menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    const mobileUploadLink = container.querySelector("#mobile-nav a[href='/upload']");
    expect(mobileUploadLink).not.toBeNull();
    fireEvent.click(mobileUploadLink as Element);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
