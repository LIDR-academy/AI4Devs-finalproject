import { describe, expect, it } from "vitest";

import { ForbiddenError, NotFoundError, ValidationError } from "@/domain/errors";
import type {
  CreateSetInput,
  ManagedSet,
  SetRepository,
  UpdateSetInput,
} from "@/repositories/set.repository";
import { createSet, publishSet, unpublishSet, updateSet } from "@/use-cases/catalog/manage-sets";
import { addCopy, listCopiesOfSet } from "@/use-cases/copies/manage-copies";

import { FakeAuditRepository } from "./fakes/audit-repository";
import { FakeCopyRepository } from "./fakes/copy-repository";

const ADMIN = { id: "admin-1", role: "ADMIN" as const };
const OPERATOR = { id: "operator-1", role: "OPERATOR" as const };
const SUBSCRIBER = { id: "user-1", role: "SUBSCRIBER" as const };
const AT = new Date("2026-06-01T10:00:00.000Z");

const BASE_SET: ManagedSet = {
  id: "set-1",
  setNum: "75192-1",
  themeId: "theme-1",
  name: "Millennium Falcon",
  year: 2017,
  pieceCount: 7541,
  recommendedAge: "16+",
  difficulty: "Experto",
  referenceValue: "849.99",
  boxPhotoUrl: null,
  restricted: true,
  published: false,
};

class FakeSetRepository implements SetRepository {
  private sequence = 0;

  constructor(readonly sets: ManagedSet[] = []) {}

  async findById(setId: string) {
    return this.sets.find((s) => s.id === setId) ?? null;
  }

  async create(input: CreateSetInput) {
    const set: ManagedSet = {
      ...BASE_SET,
      ...input,
      id: `set-${++this.sequence + 100}`,
      referenceValue: input.referenceValue ?? null,
      published: false,
    };
    this.sets.push(set);
    return set;
  }

  async update(setId: string, input: UpdateSetInput) {
    const set = this.sets.find((s) => s.id === setId);
    if (!set) return null;
    Object.assign(set, input);
    return set;
  }

  async setPublished(setId: string, published: boolean) {
    const set = this.sets.find((s) => s.id === setId);
    if (!set) return null;
    set.published = published;
    return set;
  }

  async themeExists(themeId: string) {
    return themeId === "theme-1";
  }
}

function deps(sets: ManagedSet[] = []) {
  const repository = new FakeSetRepository(sets);
  const audit = new FakeAuditRepository();
  return { repository, audit, now: () => AT };
}

describe("alta y edición de Sets", () => {
  it("el operador puede catalogar; el suscriptor no", async () => {
    const d = deps();
    await expect(
      createSet(d, { themeId: "theme-1", name: "Bonsai", pieceCount: 878, actor: OPERATOR })
    ).resolves.toMatchObject({ name: "Bonsai" });

    await expect(
      createSet(d, { themeId: "theme-1", name: "Otro", pieceCount: 10, actor: SUBSCRIBER })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("un Set nace sin publicar: publicar es un acto aparte", async () => {
    const d = deps();
    const set = await createSet(d, {
      themeId: "theme-1",
      name: "Bonsai",
      pieceCount: 878,
      referenceValue: "49.99",
      actor: OPERATOR,
    });
    expect(set.published).toBe(false);
  });

  it("rechaza un tema inexistente señalando el campo", async () => {
    const d = deps();
    const error = await createSet(d, {
      themeId: "theme-fantasma",
      name: "Bonsai",
      pieceCount: 878,
      actor: OPERATOR,
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).issues[0].field).toBe("themeId");
  });

  it("404 al editar un Set que no existe", async () => {
    await expect(
      updateSet(deps(), "fantasma", { name: "X", actor: OPERATOR })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("publicación de un Set", () => {
  it("bloquea la publicación sin valor de referencia", async () => {
    const d = deps([{ ...BASE_SET, referenceValue: null }]);
    const error = await publishSet(d, "set-1", ADMIN).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).issues[0].field).toBe("referenceValue");
    // Y el Set sigue sin publicar.
    expect((await d.repository.findById("set-1"))?.published).toBe(false);
  });

  it("bloquea también un valor de referencia de cero", async () => {
    const d = deps([{ ...BASE_SET, referenceValue: "0.00" }]);
    await expect(publishSet(d, "set-1", ADMIN)).rejects.toBeInstanceOf(ValidationError);
  });

  it("solo el admin publica o retira del catálogo", async () => {
    const d = deps([{ ...BASE_SET }]);
    await expect(publishSet(d, "set-1", OPERATOR)).rejects.toBeInstanceOf(ForbiddenError);
    await expect(unpublishSet(d, "set-1", OPERATOR)).rejects.toBeInstanceOf(ForbiddenError);
    await expect(publishSet(d, "set-1", ADMIN)).resolves.toMatchObject({ published: true });
  });

  it("registra en auditoría quién publicó y qué", async () => {
    const d = deps([{ ...BASE_SET }]);
    await publishSet(d, "set-1", ADMIN);

    expect(d.audit.entries).toHaveLength(1);
    expect(d.audit.entries[0]).toMatchObject({
      actorId: "admin-1",
      action: "set.published",
      entityType: "Set",
      entityId: "set-1",
      at: AT,
    });
  });

  it("registra la retirada del catálogo con su propia acción", async () => {
    const d = deps([{ ...BASE_SET, published: true }]);
    await unpublishSet(d, "set-1", ADMIN);
    expect(d.audit.entries[0].action).toBe("set.unpublished");
  });

  it("es idempotente y no ensucia la auditoría al repetir", async () => {
    const d = deps([{ ...BASE_SET }]);
    await publishSet(d, "set-1", ADMIN);
    await publishSet(d, "set-1", ADMIN);
    await publishSet(d, "set-1", ADMIN);

    expect((await d.repository.findById("set-1"))?.published).toBe(true);
    expect(d.audit.entries).toHaveLength(1);
  });

  it("un Set retirado del catálogo puede volver a publicarse", async () => {
    const d = deps([{ ...BASE_SET, published: true }]);
    await unpublishSet(d, "set-1", ADMIN);
    await expect(publishSet(d, "set-1", ADMIN)).resolves.toMatchObject({ published: true });
    expect(d.audit.entries.map((e) => e.action)).toEqual(["set.unpublished", "set.published"]);
  });
});

describe("copias de un Set (D1)", () => {
  function copyDeps() {
    return {
      copies: new FakeCopyRepository([]),
      sets: new FakeSetRepository([{ ...BASE_SET }]),
      now: () => AT,
    };
  }

  it("un Set admite varias copias y cada una lleva su propio estado", async () => {
    const d = copyDeps();
    const first = await addCopy(d, { setId: "set-1", actor: OPERATOR });
    const second = await addCopy(d, { setId: "set-1", actor: OPERATOR });

    expect(first.id).not.toBe(second.id);
    expect(await d.copies.listBySet("set-1")).toHaveLength(2);

    // Mover una no arrastra a la otra: el estado vive en la Copia, no en el Set.
    await d.copies.transition({
      copyId: first.id,
      toState: "DISPONIBLE",
      actorId: OPERATOR.id,
      reason: null,
      at: AT,
    });
    expect((await d.copies.findById(first.id))?.state).toBe("DISPONIBLE");
    expect((await d.copies.findById(second.id))?.state).toBe("INTAKE");
  });

  it("toda copia nace en INTAKE", async () => {
    const d = copyDeps();
    expect((await addCopy(d, { setId: "set-1", actor: OPERATOR })).state).toBe("INTAKE");
  });

  it("el suscriptor no da de alta copias ni consulta el inventario", async () => {
    const d = copyDeps();
    await expect(
      addCopy(d, { setId: "set-1", actor: SUBSCRIBER })
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      listCopiesOfSet(d, { setId: "set-1", actor: SUBSCRIBER })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("404 si el Set no existe", async () => {
    const d = copyDeps();
    await expect(
      addCopy(d, { setId: "fantasma", actor: OPERATOR })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
