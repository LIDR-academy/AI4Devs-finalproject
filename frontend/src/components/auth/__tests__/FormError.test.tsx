import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FormError from "../FormError";

describe("FormError Component", () => {
  it("renders error message text", () => {
    render(<FormError message="This is an error message" />);

    const errorText = screen.getByText("This is an error message");
    expect(errorText).toBeInTheDocument();
  });

  it("has role='alert' for screen readers", () => {
    render(<FormError message="Error occurred" />);

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Error occurred");
  });

  it("displays alert icon", () => {
    const { container } = render(<FormError message="Error" />);

    // Check for the AlertCircle icon by checking for SVG element
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("h-5", "w-5");
  });

  it("applies correct styling", () => {
    const { container } = render(<FormError message="Error" />);

    const alertDiv = screen.getByRole("alert");
    expect(alertDiv).toHaveClass("rounded-md");
    expect(alertDiv).toHaveClass("bg-red-50");
    expect(alertDiv).toHaveClass("border");
    expect(alertDiv).toHaveClass("border-red-200");
  });
});

