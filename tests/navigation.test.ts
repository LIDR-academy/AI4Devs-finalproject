import { describe, expect, it } from "vitest";

import { isCurrentDestination, navFor } from "@/lib/navigation";

/**
 * La navegación de superficie (`documents/wireframes.md` §2.3): qué destinos ve cada
 * rol y cuál está activo. Se prueba el módulo, no la barra, porque las dos decisiones
 * que pueden salir mal —enseñar de más y no marcar nada— son datos, no pintura.
 */
describe("navFor", () => {
  const labels = (surface: "portal" | "backoffice", role: "SUBSCRIBER" | "OPERATOR" | "ADMIN") =>
    navFor(surface, role).map((destination) => destination.label);

  it("el operador solo ve las secciones cuyos permisos tiene", () => {
    expect(labels("backoffice", "OPERATOR")).toEqual(["Cola de trabajo", "Clientes"]);
  });

  it("el admin ve además configuración y personal", () => {
    expect(labels("backoffice", "ADMIN")).toEqual([
      "Cola de trabajo",
      "Clientes",
      "Configuración",
      "Personal",
    ]);
  });

  // El orden de la barra es una decisión de diseño; que salga del orden en que se
  // implementaron las pantallas sería un accidente.
  it("respeta el orden declarado, no el de los permisos", () => {
    const admin = labels("backoffice", "ADMIN");
    expect(admin.indexOf("Clientes")).toBeLessThan(admin.indexOf("Configuración"));
  });

  /**
   * Lo que protege este par de pruebas: que nadie enseñe un destino antes de que
   * exista su pantalla. Hoy el portal se queda en un único destino —los otros cuatro
   * llegan con W5— y por eso su barra ni se pinta.
   */
  it("no ofrece los destinos cuya pantalla aún no existe", () => {
    expect(labels("portal", "SUBSCRIBER")).toEqual(["Resumen"]);
    expect(labels("backoffice", "ADMIN")).not.toContain("Catálogo");
  });

  it("un rol sin acceso a la superficie no ve ninguna sección con permiso", () => {
    expect(labels("backoffice", "SUBSCRIBER")).toEqual(["Cola de trabajo"]);
  });
});

describe("isCurrentDestination", () => {
  const raiz = { href: "/backoffice", label: "Cola de trabajo" };
  const seccion = { href: "/backoffice/clientes", label: "Clientes" };

  it("la raíz de la superficie exige coincidencia exacta", () => {
    expect(isCurrentDestination(raiz, "/backoffice")).toBe(true);
    // Si aceptara prefijos, la cola de trabajo saldría activa en las cinco secciones.
    expect(isCurrentDestination(raiz, "/backoffice/clientes")).toBe(false);
  });

  it("una sección sigue activa en sus subrutas", () => {
    expect(isCurrentDestination(seccion, "/backoffice/clientes")).toBe(true);
    // La ficha de un cliente: sin esto la barra se quedaría sin ningún activo.
    expect(isCurrentDestination(seccion, "/backoffice/clientes/abc-123")).toBe(true);
  });

  it("no confunde secciones con prefijo común", () => {
    expect(isCurrentDestination(seccion, "/backoffice/clientes-antiguos")).toBe(false);
  });
});
