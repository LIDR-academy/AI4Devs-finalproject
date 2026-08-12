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
