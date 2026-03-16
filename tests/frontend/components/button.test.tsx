import { render, screen } from "@testing-library/react";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  test("renders button label", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });
});
