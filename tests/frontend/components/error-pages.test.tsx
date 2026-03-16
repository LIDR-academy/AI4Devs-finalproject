import { fireEvent, render, screen } from "@testing-library/react";

import ForbiddenPage from "@/app/forbidden/page";
import NotFound from "@/app/not-found";
import GlobalError from "@/app/error";

describe("US-109 error pages", () => {
  test("renders custom 404 page with navigation actions", () => {
    const backSpy = jest.spyOn(window.history, "back").mockImplementation(() => undefined);

    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go Home" })).toHaveAttribute("href", "/");
    fireEvent.click(screen.getByRole("button", { name: "Go Back" }));
    expect(backSpy).toHaveBeenCalledTimes(1);

    backSpy.mockRestore();
  });

  test("renders custom 403 page with login link", () => {
    render(<ForbiddenPage />);

    expect(screen.getByRole("heading", { name: "Access denied" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to Login" })).toHaveAttribute("href", "/login");
  });

  test("renders global 500 fallback and retry action", () => {
    const reset = jest.fn();
    render(<GlobalError error={new Error("boom") as Error & { digest?: string }} reset={reset} />);

    expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
