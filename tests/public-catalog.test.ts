import { describe, expect, it } from "vitest";

import {
  NON_PUBLIC_SET_FIELDS,
  PUBLIC_SET_FIELDS,
  type PublicSet,
} from "@/domain/catalog/public-projection";
import { NotFoundError } from "@/domain/errors";
import type { CatalogRepository, PublicPlan } from "@/repositories/catalog.repository";
import {
  browsePublicCatalog,
  listMembershipPlans,
  viewPublicSet,
  viewSetAsSubscriber,
  MAX_PAGE_SIZE,
} from "@/use-cases/catalog/browse-public-catalog";

const SET: PublicSet = {
  id: "set-1",
  setNum: "75192-1",
  name: "Millennium Falcon",
  year: 2017,
  pieceCount: 7541,
  theme: "Ultimate Collector Series",
  recommendedAge: "16+",
  difficulty: "Experto",
  boxPhotoUrl: "https://cdn.rebrickable.com/media/sets/75192-1.jpg",
  restricted: false,
};

const PLANS: PublicPlan[] = [
  { code: "BASIC", name: "Basic", monthlyPrice: "14.99", maxSimultaneousSets: 1, queueBonusDays: 0 },
  { code: "PREMIUM", name: "Premium", monthlyPrice: "24.99", maxSimultaneousSets: 2, queueBonusDays: 10 },
];

/** Repositorio de mentira que anota la paginación con la que se le llamó. */
function fakeRepository(options: { published?: PublicSet[]; total?: number } = {}) {
  const published = options.published ?? [SET];
  const calls: Array<{ limit?: number; offset?: number }> = [];

  const repository: CatalogRepository = {
    async listPublicSets(input = {}) {
      calls.push(input);
      return { sets: published, total: options.total ?? published.length };
    },
    async findPublicSetById(id) {
      return published.find((s) => s.id === id) ?? null;
    },
    async findAuthenticatedSetById({ setId, userId }) {
      const set = published.find((s) => s.id === setId);
      if (!set) return null;
      return {
        ...set,
        availableCopies: 2,
        totalCopies: 3,
        queueLength: 4,
        // Solo "ana" está en la cola, en tercera posición.
        queuePosition: userId === "ana" ? 3 : null,
      };
    },
    async listPublicPlans() {
      return PLANS;
    },
  };
  return { repository, calls };
}

describe("proyección pública del catálogo (D13)", () => {
  it("no expone disponibilidad, cola ni datos de nivel Copy", async () => {
    const { repository } = fakeRepository();
    const { sets } = await browsePublicCatalog({ repository });

    const keys = Object.keys(sets[0]);
    for (const forbidden of ["copies", "availability", "disponibilidad", "queue", "state"]) {
      expect(keys).not.toContain(forbidden);
    }
  });

  it("no expone el valor de referencia ni banderas internas", () => {
    // El valor de referencia es el coste de reposición: información de negocio, no un
    // atributo de catálogo.
    for (const field of NON_PUBLIC_SET_FIELDS) {
      expect(PUBLIC_SET_FIELDS as readonly string[]).not.toContain(field);
    }
  });

  it("la restricción por antigüedad sí es pública: es del set, no del inventario", () => {
    // Estuvo en la lista de campos internos hasta el change `sets-restringidos-a-la-
    // vista`. Sacarlo de ahí es una decisión de spec, y esto es lo que la fija: sin
    // esta afirmación, devolverlo a la lista pasaría desapercibido.
    expect(NON_PUBLIC_SET_FIELDS as readonly string[]).not.toContain("restricted");
    expect(PUBLIC_SET_FIELDS as readonly string[]).toContain("restricted");
  });

  it("expone exactamente los atributos de catálogo que pide la spec", async () => {
    const { repository } = fakeRepository();
    const { sets } = await browsePublicCatalog({ repository });

    expect(Object.keys(sets[0]).sort()).toEqual(
      [
        "boxPhotoUrl",
        "difficulty",
        "id",
        "name",
        "pieceCount",
        "recommendedAge",
        "restricted",
        "setNum",
        "theme",
        "year",
      ].sort()
    );
  });
});

describe("paginación del catálogo público", () => {
  it("usa un tamaño de página por defecto", async () => {
    const { repository, calls } = fakeRepository();
    const page = await browsePublicCatalog({ repository });
    expect(calls[0]).toEqual({ limit: 24, offset: 0 });
    expect(page.limit).toBe(24);
  });

  it("satura un límite excesivo en vez de rechazarlo", async () => {
    const { repository, calls } = fakeRepository();
    // Pedir 1000 es una petición mal calibrada, no un error: se sirve el máximo.
    await browsePublicCatalog({ repository }, { limit: 1000 });
    expect(calls[0].limit).toBe(MAX_PAGE_SIZE);
  });

  it("corrige valores absurdos de paginación", async () => {
    const { repository, calls } = fakeRepository();
    await browsePublicCatalog({ repository }, { limit: 0, offset: -50 });
    expect(calls[0]).toEqual({ limit: 1, offset: 0 });

    await browsePublicCatalog({ repository }, { limit: Number.NaN, offset: 10.7 });
    expect(calls[1]).toEqual({ limit: 1, offset: 10 });
  });
});

describe("detalle público de un Set", () => {
  it("devuelve el set publicado", async () => {
    const { repository } = fakeRepository();
    await expect(viewPublicSet({ repository }, "set-1")).resolves.toMatchObject({ id: "set-1" });
  });

  it("responde igual para un set inexistente que para uno sin publicar", async () => {
    // Distinguirlos permitiría sondear qué hay en el catálogo antes de publicarlo.
    const { repository } = fakeRepository({ published: [] });
    await expect(viewPublicSet({ repository }, "set-1")).rejects.toBeInstanceOf(NotFoundError);
    await expect(viewPublicSet({ repository }, "no-existe")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("proyección autenticada frente a la pública", () => {
  it("añade disponibilidad y cola sobre lo que ya veía el visitante", async () => {
    const { repository } = fakeRepository();
    const authenticated = await viewSetAsSubscriber({ repository }, { setId: "set-1", userId: "ana" });
    const publicSet = await viewPublicSet({ repository }, "set-1");

    // Todo lo público sigue estando, con el mismo valor.
    for (const [key, value] of Object.entries(publicSet)) {
      expect(authenticated[key as keyof typeof publicSet]).toEqual(value);
    }
    expect(authenticated).toMatchObject({
      availableCopies: 2,
      totalCopies: 3,
      queueLength: 4,
    });
  });

  it("da la posición en cola de quien pregunta, y null si no está encolado", async () => {
    const { repository } = fakeRepository();
    const ana = await viewSetAsSubscriber({ repository }, { setId: "set-1", userId: "ana" });
    const bruno = await viewSetAsSubscriber({ repository }, { setId: "set-1", userId: "bruno" });

    expect(ana.queuePosition).toBe(3);
    expect(bruno.queuePosition).toBeNull();
    // La longitud de la cola sí es la misma para ambos: es un dato del set.
    expect(bruno.queueLength).toBe(ana.queueLength);
  });

  it("no expone el estado de cada copia, solo cuántas hay", async () => {
    const { repository } = fakeRepository();
    const set = await viewSetAsSubscriber({ repository }, { setId: "set-1", userId: "ana" });
    // Qué copia está en higienización es back-office, no información de suscriptor.
    expect(Object.keys(set)).not.toContain("copies");
    expect(Object.keys(set)).not.toContain("state");
  });

  it("tampoco revela el valor de referencia a un suscriptor", async () => {
    const { repository } = fakeRepository();
    const set = await viewSetAsSubscriber({ repository }, { setId: "set-1", userId: "ana" });
    expect(Object.keys(set)).not.toContain("referenceValue");
  });

  it("un set sin publicar es 404 también para quien tiene sesión", async () => {
    const { repository } = fakeRepository({ published: [] });
    await expect(
      viewSetAsSubscriber({ repository }, { setId: "set-1", userId: "ana" })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("planes de membresía", () => {
  it("los muestra sin sesión, con precio, límite y ventaja de cola", async () => {
    const { repository } = fakeRepository();
    const plans = await listMembershipPlans({ repository });

    expect(plans.map((p) => p.code)).toEqual(["BASIC", "PREMIUM"]);
    expect(plans[0].monthlyPrice).toBe("14.99");
    expect(plans[1].maxSimultaneousSets).toBe(2);
    expect(plans[1].queueBonusDays).toBe(10);
  });

  it("expresa el precio como cadena, no como number", async () => {
    const { repository } = fakeRepository();
    const [basic] = await listMembershipPlans({ repository });
    // Un decimal monetario en coma flotante binaria acaba dando 14.989999…
    expect(typeof basic.monthlyPrice).toBe("string");
  });
});
