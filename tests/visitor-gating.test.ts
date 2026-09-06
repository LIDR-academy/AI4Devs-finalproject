import { describe, expect, it } from "vitest";

import { decideSurfaceAccess } from "@/domain/auth/access";
import { can, permissionsOf, PERMISSIONS } from "@/domain/auth/permissions";
import { isRole, ROLES, type Surface } from "@/domain/auth/roles";

const SURFACES: Surface[] = ["portal", "backoffice"];

/**
 * El visitante es el **estado sin sesión**, no un rol de cuenta (D13). Estas pruebas
 * fijan la frontera: qué puede hacer sin identificarse y qué no.
 */
describe("visitante (actor no autenticado)", () => {
  it("no es un rol del sistema", () => {
    expect(isRole("VISITOR")).toBe(false);
    expect(ROLES).toHaveLength(3);
  });

  it("no tiene ningún permiso", () => {
    for (const permission of PERMISSIONS) {
      expect(can(null, permission)).toBe(false);
    }
  });

  it("se le pide identificarse en cualquier superficie, no se le enseña un 403", () => {
    for (const surface of SURFACES) {
      expect(decideSurfaceAccess(null, surface)).toEqual({ kind: "authenticate" });
      expect(decideSurfaceAccess(undefined, surface)).toEqual({ kind: "authenticate" });
    }
  });

  it("queda bloqueado en todas las acciones de suscriptor", () => {
    // Solicitar un set, unirse a una cola o responder una oferta exigen cuenta.
    for (const permission of permissionsOf("SUBSCRIBER")) {
      expect(can(null, permission)).toBe(false);
    }
  });

  it("queda bloqueado en todo el back-office", () => {
    for (const permission of permissionsOf("ADMIN")) {
      expect(can(null, permission)).toBe(false);
    }
  });
});

describe("acceso por superficie de quien sí tiene cuenta", () => {
  it("deja pasar a cada rol por su superficie", () => {
    expect(decideSurfaceAccess("SUBSCRIBER", "portal")).toEqual({ kind: "allow" });
    expect(decideSurfaceAccess("OPERATOR", "backoffice")).toEqual({ kind: "allow" });
    expect(decideSurfaceAccess("ADMIN", "backoffice")).toEqual({ kind: "allow" });
  });

  it("devuelve a su sitio a quien entra en la superficie equivocada", () => {
    // Redirigir en vez de cortar: un 403 seco a quien tiene cuenta es un callejón
    // sin salida.
    expect(decideSurfaceAccess("SUBSCRIBER", "backoffice")).toEqual({
      kind: "redirect",
      to: "portal",
    });
    expect(decideSurfaceAccess("OPERATOR", "portal")).toEqual({
      kind: "redirect",
      to: "backoffice",
    });
    expect(decideSurfaceAccess("ADMIN", "portal")).toEqual({
      kind: "redirect",
      to: "backoffice",
    });
  });

  it("nunca deja a un rol sin destino: la decisión siempre lo lleva a algún sitio", () => {
    for (const role of ROLES) {
      for (const surface of SURFACES) {
        const decision = decideSurfaceAccess(role, surface);
        expect(["allow", "redirect"]).toContain(decision.kind);
        if (decision.kind === "redirect") {
          // Y el destino tiene que ser una superficie donde sí pueda entrar.
          expect(decideSurfaceAccess(role, decision.to)).toEqual({ kind: "allow" });
        }
      }
    }
  });
});
