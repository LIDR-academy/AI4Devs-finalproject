import { render, screen } from "@testing-library/react";

import Home from "@/app/page";

describe("Home page", () => {
  test("renders hero value proposition and CTAs", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "Decentralized. Secure. Permanent." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get Started" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Learn More" })).toBeInTheDocument();
  });

  test("renders features and how-it-works section", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "Decentralized Storage" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Secure by Design" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Permanent Access" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "How it works" })).toBeInTheDocument();
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.getByText("Step 3")).toBeInTheDocument();
  });
});
