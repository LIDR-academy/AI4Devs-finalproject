import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import FormInput from "../FormInput";

// Wrapper component to provide React Hook Form context
const FormInputWrapper = (props: any) => {
  const { register } = useForm();
  return <FormInput register={register} {...props} />;
};

describe("FormInput Component", () => {
  describe("Rendering Tests", () => {
    it("renders input with correct attributes", () => {
      render(
        <FormInputWrapper
          id="test-input"
          name="testField"
          type="email"
          label="Test Label"
          placeholder="Test placeholder"
        />
      );

      const input = screen.getByLabelText("Test Label");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "email");
      expect(input).toHaveAttribute("id", "test-input");
      expect(input).toHaveAttribute("placeholder", "Test placeholder");
    });

    it("renders label with correct text", () => {
      render(
        <FormInputWrapper
          id="test-input"
          name="testField"
          type="text"
          label="Email Address"
        />
      );

      const label = screen.getByText("Email Address");
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute("for", "test-input");
    });

    it("renders required asterisk when required", () => {
      render(
        <FormInputWrapper
          id="test-input"
          name="testField"
          type="text"
          label="Email"
          required
        />
      );

      const asterisk = screen.getByLabelText("required");
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveTextContent("*");
    });

    it("renders placeholder text", () => {
      render(
        <FormInputWrapper
          id="test-input"
          name="testField"
          type="email"
          label="Email"
          placeholder="you@example.com"
        />
      );

      const input = screen.getByPlaceholderText("you@example.com");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Validation Display Tests", () => {
    it("displays error message when error prop is provided", () => {
      render(
        <FormInputWrapper
          id="test-input"
          name="testField"
          type="text"
          label="Email"
          error="Email is required"
        />
      );

      const errorMessage = screen.getByText("Email is required");
      expect(errorMessage).toBeInTheDocument();
    });

    it("applies error styling when error exists", () => {
      render(
        <FormInputWrapper
          id="test-input"
          name="testField"
          type="text"
          label="Email"
          error="Invalid email"
        />
      );

      const input = screen.getByLabelText("Email");
      expect(input).toHaveClass("border-red-300");
    });

    it("error message has role='alert'", () => {
      render(
        <FormInputWrapper
          id="test-input"
          name="testField"
          type="text"
          label="Email"
          error="Error message"
        />
      );

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Error message");
    });

    it("input has aria-invalid='true' when error exists", () => {
      render(
        <FormInputWrapper
          id="test-input"
          name="testField"
          type="text"
          label="Email"
          error="Error message"
        />
      );

      const input = screen.getByLabelText("Email");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("Disabled State Tests", () => {
    it("disables input when disabled prop is true", () => {
      render(
        <FormInputWrapper
          id="test-input"
          name="testField"
          type="text"
          label="Email"
          disabled
        />
      );

      const input = screen.getByLabelText("Email");
      expect(input).toBeDisabled();
    });

    it("applies disabled styling", () => {
      render(
        <FormInputWrapper
          id="test-input"
          name="testField"
          type="text"
          label="Email"
          disabled
        />
      );

      const input = screen.getByLabelText("Email");
      expect(input).toHaveClass("cursor-not-allowed");
    });
  });

  describe("Accessibility Tests", () => {
    it("label is associated with input via htmlFor/id", () => {
      render(
        <FormInputWrapper
          id="email-input"
          name="email"
          type="email"
          label="Email Address"
        />
      );

      const label = screen.getByText("Email Address");
      const input = screen.getByLabelText("Email Address");

      expect(label).toHaveAttribute("for", "email-input");
      expect(input).toHaveAttribute("id", "email-input");
    });

    it("error message is associated via aria-describedby", () => {
      render(
        <FormInputWrapper
          id="test-input"
          name="testField"
          type="text"
          label="Email"
          error="Error message"
        />
      );

      const input = screen.getByLabelText("Email");
      expect(input).toHaveAttribute("aria-describedby", "test-input-error");

      const errorElement = document.getElementById("test-input-error");
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent("Error message");
    });
  });
});

