import { describe, expect, it } from "vitest";

import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/domain/audit/actions";

import { FakeAuditRepository } from "./fakes/audit-repository";

const ADMIN = "admin-1";

describe("vocabulario de auditoría", () => {
  it("mantiene acciones y tipos de entidad como uniones cerradas y sin duplicados", () => {
    // Una consulta de auditoría dentro de un año necesita que estos valores
    // signifiquen lo mismo que hoy; el conjunto cerrado es lo que lo sostiene.
    expect(new Set(AUDIT_ACTIONS).size).toBe(AUDIT_ACTIONS.length);
    expect(new Set(AUDIT_ENTITY_TYPES).size).toBe(AUDIT_ENTITY_TYPES.length);
  });

  it("no incluye acciones del ciclo de vida de la copia", () => {
    // Esas viven en CopyStateTransition, no aquí: los dos registros no se solapan (D10).
    for (const action of AUDIT_ACTIONS) {
      expect(action.startsWith("copy.")).toBe(false);
    }
    expect(AUDIT_ENTITY_TYPES).not.toContain("Copy");
  });
});

describe("registro de acciones administrativas", () => {
  it("conserva quién, cuándo y sobre qué", async () => {
    const repository = new FakeAuditRepository();
    const at = new Date("2026-05-01T12:00:00.000Z");

    await repository.record({
      actorId: ADMIN,
      action: "settings.updated",
      entityType: "SystemSetting",
      entityId: "setting-1",
      metadata: { key: "maxQueuesPerUser", from: 1, to: 2 },
      at,
    });

    expect(repository.entries).toHaveLength(1);
    expect(repository.entries[0]).toMatchObject({
      actorId: ADMIN,
      action: "settings.updated",
      entityType: "SystemSetting",
      entityId: "setting-1",
      at,
    });
  });

  it("guarda el valor anterior y el nuevo, que es lo que hace útil el registro", async () => {
    const repository = new FakeAuditRepository();
    await repository.record({
      actorId: ADMIN,
      action: "plan.updated",
      entityType: "Plan",
      entityId: "plan-premium",
      metadata: { monthlyPrice: { from: "24.99", to: "27.99" } },
      at: new Date("2026-05-02T09:00:00.000Z"),
    });

    // Sin el antes/después, la auditoría diría que algo cambió pero no qué.
    expect(repository.entries[0].metadata).toEqual({
      monthlyPrice: { from: "24.99", to: "27.99" },
    });
  });

  it("admite acciones sin entidad concreta", async () => {
    const repository = new FakeAuditRepository();
    await repository.record({
      actorId: ADMIN,
      action: "employee.created",
      entityType: "User",
      at: new Date("2026-05-03T09:00:00.000Z"),
    });
    expect(repository.entries[0].entityId).toBeUndefined();
  });

  it("devuelve el historial de una entidad de lo más reciente a lo más antiguo", async () => {
    const repository = new FakeAuditRepository();
    for (const [index, day] of ["01", "03", "02"].entries()) {
      await repository.record({
        actorId: ADMIN,
        action: "plan.updated",
        entityType: "Plan",
        entityId: "plan-basic",
        metadata: { paso: index },
        at: new Date(`2026-05-${day}T09:00:00.000Z`),
      });
    }

    const history = await repository.findByEntity({
      entityType: "Plan",
      entityId: "plan-basic",
    });
    expect(history.map((e) => e.at.toISOString().slice(8, 10))).toEqual(["03", "02", "01"]);
  });

  it("no mezcla el historial de entidades distintas", async () => {
    const repository = new FakeAuditRepository();
    const at = new Date("2026-05-01T09:00:00.000Z");
    await repository.record({ actorId: ADMIN, action: "plan.updated", entityType: "Plan", entityId: "a", at });
    await repository.record({ actorId: ADMIN, action: "plan.updated", entityType: "Plan", entityId: "b", at });

    const history = await repository.findByEntity({ entityType: "Plan", entityId: "a" });
    expect(history).toHaveLength(1);
    expect(history[0].entityId).toBe("a");
  });

  it("respeta el límite pedido", async () => {
    const repository = new FakeAuditRepository();
    for (let day = 1; day <= 5; day++) {
      await repository.record({
        actorId: ADMIN,
        action: "settings.updated",
        entityType: "SystemSetting",
        entityId: "s",
        at: new Date(`2026-05-0${day}T09:00:00.000Z`),
      });
    }

    const history = await repository.findByEntity({
      entityType: "SystemSetting",
      entityId: "s",
      limit: 2,
    });
    expect(history).toHaveLength(2);
  });
});
