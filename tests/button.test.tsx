import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button (shadcn/ui)", () => {
  it("renderiza el texto y es un <button> accesible por rol", () => {
    render(<Button>Alquilar</Button>);
    const btn = screen.getByRole("button", { name: "Alquilar" });
    expect(btn).toBeInTheDocument();
  });

  it("con asChild delega en el hijo (p. ej. un enlace)", () => {
    render(
      <Button asChild>
        <a href="/catalogo">Ver catálogo</a>
      </Button>
    );
    expect(screen.getByRole("link", { name: "Ver catálogo" })).toHaveAttribute(
      "href",
      "/catalogo"
    );
  });
});
