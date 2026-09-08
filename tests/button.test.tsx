import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button (shadcn/ui)", () => {
  it("renderiza el texto y es un <button> accesible por rol", () => {
    render(<Button>Alquilar</Button>);
    const btn = screen.getByRole("button", { name: "Alquilar" });
    expect(btn).toBeInTheDocument();
  });

  // El hijo es un `<a>` **externo** a propósito: es el caso en el que no cabe `Link` de
  // `next/link`, y además evita que la regla `no-html-link-for-pages` marque el test en
  // cuanto una ruta interna coincida con el `href` — le pasó a `/catalogo` al nacer
  // `/catalogo/[setId]`.
  it("con asChild delega en el hijo (p. ej. un enlace externo)", () => {
    render(
      <Button asChild>
        <a href="https://rebrickable.com/sets/">Ver la ficha en Rebrickable</a>
      </Button>
    );
    expect(
      screen.getByRole("link", { name: "Ver la ficha en Rebrickable" })
    ).toHaveAttribute("href", "https://rebrickable.com/sets/");
  });
});
