import { describe, expect, it } from "vitest";

import {
  can,
  permissionsOf,
  PERMISSIONS,
  type Permission,
} from "@/domain/auth/permissions";
import { canEnterSurface, ROLES, type Role } from "@/domain/auth/roles";

/**
 * La tabla replica la matriz de PRD §3. Se escribe entera —permitidos **y**
 * denegados— para que cualquier cambio de política tenga que pasar por aquí: es el
 * sitio donde se ve de un vistazo quién puede qué.
 */
const MATRIX: Record<Permission, readonly Role[]> = {
  "portal.access": ["SUBSCRIBER"],
  "backoffice.access": ["OPERATOR", "ADMIN"],

  "account.manage": ["SUBSCRIBER"],
  "rental.request": ["SUBSCRIBER"],
  "queue.join": ["SUBSCRIBER"],
  "offer.respond": ["SUBSCRIBER"],
  "return.initiate": ["SUBSCRIBER"],

  "set.manage": ["OPERATOR", "ADMIN"],
  // Publicar decide qué ve el público: la spec lo reserva al admin.
  "set.publish": ["ADMIN"],
  "copy.create": ["OPERATOR", "ADMIN"],
  "copy.advance_lifecycle": ["OPERATOR", "ADMIN"],
  "incident.mark": ["OPERATOR", "ADMIN"],

  "customer.read_limited": ["OPERATOR", "ADMIN"],
  "customer.read_full": ["ADMIN"],

  "copy.retire": ["ADMIN"],
  "settings.manage": ["ADMIN"],
  "employee.manage": ["ADMIN"],
};

describe("matriz de permisos (PRD §3)", () => {
  it.each(PERMISSIONS)("«%s» se concede exactamente a los roles previstos", (permission) => {
    for (const role of ROLES) {
      expect(can(role, permission)).toBe(MATRIX[permission].includes(role));
    }
  });

  it("el admin puede todo lo del operador", () => {
    for (const permission of permissionsOf("OPERATOR")) {
      expect(can("ADMIN", permission)).toBe(true);
    }
  });

  it("el visitante (sin rol) no tiene ningún permiso", () => {
    // El acceso público se concede por rutas explícitas, nunca por permiso (D13).
    for (const permission of PERMISSIONS) {
      expect(can(null, permission)).toBe(false);
      expect(can(undefined, permission)).toBe(false);
    }
  });

  // ── Las denegaciones que sostienen el dominio ──────────────────────────────

  it("solo el admin da de baja una copia", () => {
    expect(can("ADMIN", "copy.retire")).toBe(true);
    // El operador detecta y marca; confirmar la baja es del admin (D6).
    expect(can("OPERATOR", "copy.retire")).toBe(false);
    expect(can("OPERATOR", "incident.mark")).toBe(true);
    expect(can("SUBSCRIBER", "copy.retire")).toBe(false);
  });

  it("el operador no configura reglas ni gestiona empleados", () => {
    expect(can("OPERATOR", "settings.manage")).toBe(false);
    expect(can("OPERATOR", "employee.manage")).toBe(false);
  });

  it("el operador ve el historial de cliente en lectura limitada, no completo", () => {
    expect(can("OPERATOR", "customer.read_limited")).toBe(true);
    expect(can("OPERATOR", "customer.read_full")).toBe(false);
    expect(can("ADMIN", "customer.read_full")).toBe(true);
  });

  it("el suscriptor no toca nada del back-office", () => {
    for (const permission of permissionsOf("OPERATOR")) {
      expect(can("SUBSCRIBER", permission)).toBe(false);
    }
  });

  it("ningún rol del personal opera como suscriptor", () => {
    for (const permission of ["rental.request", "queue.join", "offer.respond"] as const) {
      expect(can("OPERATOR", permission)).toBe(false);
      expect(can("ADMIN", permission)).toBe(false);
    }
  });
});

describe("las superficies se derivan de la matriz", () => {
  it.each(ROLES)("%s entra en las superficies que le concede su permiso", (role) => {
    expect(canEnterSurface(role, "portal")).toBe(can(role, "portal.access"));
    expect(canEnterSurface(role, "backoffice")).toBe(can(role, "backoffice.access"));
  });
});
