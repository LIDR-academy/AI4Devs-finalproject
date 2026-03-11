import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AuthButton from "../AuthButton";

describe("AuthButton Component", () => {
  describe("Rendering Tests", () => {
    it("renders button with children", () => {
      render(<AuthButton>Click Me</AuthButton>);

      const button = screen.getByRole("button", { name: "Click Me" });
      expect(button).toBeInTheDocument();
    });

    it("applies fullWidth class when fullWidth prop is true", () => {
      render(<AuthButton fullWidth>Submit</AuthButton>);

      const button = screen.getByRole("button", { name: "Submit" });
      expect(button).toHaveClass("w-full");
    });

    it("applies correct type attribute", () => {
      render(<AuthButton type="submit">Submit</AuthButton>);

      const button = screen.getByRole("button", { name: "Submit" });
      expect(button).toHaveAttribute("type", "submit");
    });
  });

  describe("Loading State Tests", () => {
    it("shows loading spinner when loading prop is true", () => {
      const { container } = render(<AuthButton loading>Loading</AuthButton>);

      // Check for the Loader2 icon by checking for SVG with animate-spin class
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("disables button when loading", () => {
      render(<AuthButton loading>Submit</AuthButton>);

      const button = screen.getByRole("button", { name: "Submit" });
      expect(button).toBeDisabled();
    });

    it("has aria-busy='true' when loading", () => {
      render(<AuthButton loading>Submit</AuthButton>);

      const button = screen.getByRole("button", { name: "Submit" });
      expect(button).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("Disabled State Tests", () => {
    it("disables button when disabled prop is true", () => {
      render(<AuthButton disabled>Submit</AuthButton>);

      const button = screen.getByRole("button", { name: "Submit" });
      expect(button).toBeDisabled();
    });

    it("has aria-disabled='true' when disabled", () => {
      render(<AuthButton disabled>Submit</AuthButton>);

      const button = screen.getByRole("button", { name: "Submit" });
      expect(button).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("Click Handling Tests", () => {
    it("calls onClick handler when clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<AuthButton onClick={handleClick}>Click Me</AuthButton>);

      const button = screen.getByRole("button", { name: "Click Me" });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <AuthButton onClick={handleClick} disabled>
          Click Me
        </AuthButton>
      );

      const button = screen.getByRole("button", { name: "Click Me" });
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});

