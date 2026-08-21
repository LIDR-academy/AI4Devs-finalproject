import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RetentionForm } from "../app/(backoffice)/backoffice/catalogo/retention-form";
import { PlansForm } from "../app/(backoffice)/backoffice/configuracion/plans-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

/**
 * Los dos formularios de HU-16. Se prueban **aquí y no en el E2E** por lo mismo que
 * `copy-actions`: son formularios de admin sobre la base compartida, y guardar de
 * verdad un precio o una cadencia dejaría el entorno cambiado para el resto de la
 * suite —la semilla no restaura valores, solo crea los que falten—.
 *
 * Se importan por ruta relativa: viven junto a su ruta, como el resto de componentes
 * de pantalla, y el alias `@/` apunta a `src/`.
 */

const ok = () => ({ ok: true, json: async () => ({}) }) as unknown as Response;

const problem = (body: unknown) =>
  ({ ok: false, json: async () => body }) as unknown as Response;

const PLAN = {
  code: "PREMIUM",
  name: "Premium",
  monthlyPrice: "24.99",
  maxSimultaneousSets: 2,
  queueBonusDays: 10,
};

describe("PlansForm", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async () => ok());
    vi.stubGlobal("fetch", fetchMock);
  });

  it("los tres campos viajan en una sola llamada al plan", async () => {
    render(<PlansForm plans={[PLAN]} />);

    fireEvent.change(screen.getByLabelText("Precio mensual (€)"), {
      target: { value: "29.99" },
    });
    fireEvent.change(screen.getByLabelText("Ventaja en cola (días)"), {
      target: { value: "12" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar plan" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/plans/PREMIUM");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({
      monthlyPrice: "29.99",
      maxSimultaneousSets: 2,
      queueBonusDays: 12,
    });
  });

  /**
   * Lo que protege: que un importe escrito a la española llegue como lo espera el
   * endpoint. `24,99` no casa con su expresión regular y se rechazaría con un error de
   * campo que el admin no sabría interpretar —el número que ve escrito es correcto—.
   */
  it("la coma decimal se traduce antes de salir", async () => {
    render(<PlansForm plans={[PLAN]} />);

    fireEvent.change(screen.getByLabelText("Precio mensual (€)"), {
      target: { value: "19,50" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar plan" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).monthlyPrice).toBe("19.50");
  });

  it("un rechazo del servidor se explica con el error de campo, no con el genérico", async () => {
    fetchMock.mockResolvedValueOnce(
      problem({
        detail: "No se ha podido actualizar el plan.",
        errors: [{ field: "maxSimultaneousSets", issue: "El plan debe permitir al menos un set." }],
      })
    );
    render(<PlansForm plans={[PLAN]} />);
    fireEvent.click(screen.getByRole("button", { name: "Guardar plan" }));

    expect(await screen.findByText("El plan debe permitir al menos un set.")).toBeInTheDocument();
    expect(screen.queryByText("Plan guardado.")).not.toBeInTheDocument();
  });

  it("cada plan nombra sus propios campos: dos «Precio mensual» no se distinguirían", () => {
    render(<PlansForm plans={[PLAN, { ...PLAN, code: "BASIC", name: "Basic" }]} />);

    const precios = screen.getAllByLabelText("Precio mensual (€)");
    expect(precios).toHaveLength(2);
    expect(new Set(precios.map((campo) => campo.id)).size).toBe(2);
  });
});

describe("RetentionForm", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async () => ok());
    vi.stubGlobal("fetch", fetchMock);
  });

  const pintar = (props: Partial<React.ComponentProps<typeof RetentionForm>> = {}) =>
    render(
      <RetentionForm
        setId="set-1"
        enabled={false}
        cadenceDays={7}
        defaultCadenceDays={7}
        queueLength={3}
        {...props}
      />
    );

  it("activar manda los dos campos, porque el endpoint define la configuración entera", async () => {
    pintar({ cadenceDays: 14, defaultCadenceDays: 7 });

    fireEvent.click(screen.getByLabelText("Recordar a quien lo tenga"));
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/sets/set-1/retention-reminder");
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body)).toEqual({ enabled: true, cadenceDays: 14 });
  });

  /**
   * Lo que protege: la condición de D7 que más sorprende. Activar los recordatorios de
   * un set que nadie espera no envía nada, y sin decirlo el admin lo daría por roto.
   */
  it("avisa de que sin cola no se enviará ninguno, en cuanto se activa", async () => {
    pintar({ queueLength: 0 });

    expect(screen.getByText(/Solo se envían mientras haya alguien esperando/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Recordar a quien lo tenga"));
    expect(await screen.findByText(/nadie espera este set/)).toBeInTheDocument();
  });

  it("dice de dónde sale la cadencia cuando el set no tiene la suya", () => {
    pintar({ cadenceDays: 7, defaultCadenceDays: 7 });
    expect(screen.getByText(/regla del sistema/)).toBeInTheDocument();
  });

  it("un 403 al operador se enseña tal cual lo cuenta la API", async () => {
    fetchMock.mockResolvedValueOnce(
      problem({ detail: "Solo un administrador configura los recordatorios." })
    );
    pintar();
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(
      await screen.findByText("Solo un administrador configura los recordatorios.")
    ).toBeInTheDocument();
  });
});
