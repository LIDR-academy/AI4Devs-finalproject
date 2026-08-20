import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SurfaceNav } from "@/components/surface-nav";

const { pathname } = vi.hoisted(() => ({ pathname: { value: "/backoffice" } }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.value }));

const DESTINOS = [
  { href: "/backoffice", label: "Cola de trabajo" },
  { href: "/backoffice/clientes", label: "Clientes" },
];

describe("SurfaceNav", () => {
  it("es un <nav> con nombre accesible y marca el activo con aria-current", () => {
    pathname.value = "/backoffice/clientes";
    render(<SurfaceNav label="Back-office" destinations={DESTINOS} />);

    const nav = screen.getByRole("navigation", { name: "Back-office" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clientes" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    // El activo es exactamente uno: `aria-current` en dos sitios no dice dónde estás.
    expect(screen.getByRole("link", { name: "Cola de trabajo" })).not.toHaveAttribute(
      "aria-current"
    );
  });

  // Con un solo destino la barra apuntaría siempre a donde ya estás. Es lo que pasa
  // hoy en el portal, y por eso no se pinta hasta que W5 traiga sus rutas.
  it("no se pinta con un solo destino", () => {
    pathname.value = "/portal";
    const { container } = render(
      <SurfaceNav label="Portal" destinations={[{ href: "/portal", label: "Resumen" }]} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
