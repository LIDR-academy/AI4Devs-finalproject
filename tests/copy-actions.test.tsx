import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CopyActions } from "@/components/backoffice/copy-actions";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

/**
 * Acciones de copia del back-office, compartidas por la cola de trabajo y la ficha de
 * catálogo.
 *
 * Se prueba **aquí y no en el E2E** porque llegar a un estado que admita la baja
 * —`EN_INSPECCION`, `INCOMPLETA` o `ALQUILADA`— exige montar medio circuito de
 * devolución contra la base compartida, y la semilla no garantiza ninguno: es
 * idempotente por existencia, así que los estados que dejó al sembrar se los va
 * comiendo cada ejecución del E2E.
 */
describe("CopyActions", () => {
  const ok = () => ({ ok: true, json: async () => ({}) }) as unknown as Response;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async () => ok());
    vi.stubGlobal("fetch", fetchMock);
  });

  const abrirDialogo = () => {
    render(<CopyActions copyId="copy-1" state="INCOMPLETA" subject="copia AB12" />);
    fireEvent.click(screen.getByRole("button", { name: "Dar de baja: copia AB12" }));
  };

  it("nombra cada botón con su copia: cuatro «Catalogar» seguidos son indistinguibles", () => {
    render(<CopyActions copyId="copy-1" state="INTAKE" subject="copia AB12" />);
    expect(screen.getByRole("button", { name: "Catalogar: copia AB12" })).toBeInTheDocument();
  });

  it("una transición normal va al endpoint genérico", async () => {
    render(<CopyActions copyId="copy-1" state="INTAKE" subject="copia AB12" />);
    fireEvent.click(screen.getByRole("button", { name: /Catalogar/ }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/copies/copy-1/transitions");
    expect(JSON.parse(init.body).to).toBe("DISPONIBLE");
  });

  /**
   * Lo que protege: que la baja **no** vuelva a colarse por el endpoint genérico de
   * transiciones. Ese acepta cualquier motivo, incluido uno enlatado, y así una
   * decisión con impacto económico entraba en la auditoría sin causa. `/retire` lo
   * exige.
   */
  it("la baja pide el motivo y va a /retire", async () => {
    abrirDialogo();

    const motivo = await screen.findByLabelText(/Motivo de la baja/);
    expect(motivo).toBeRequired();
    expect(screen.getByRole("dialog")).toHaveTextContent(/definitiva/i);

    fireEvent.change(motivo, { target: { value: "Pieza estructural rota" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar la baja" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/copies/copy-1/retire");
    expect(JSON.parse(init.body)).toEqual({ reason: "Pieza estructural rota" });
  });

  it("un rechazo del servidor se explica y no se traga", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Tu rol no permite realizar esta transición." }),
    } as unknown as Response);

    abrirDialogo();
    fireEvent.change(await screen.findByLabelText(/Motivo de la baja/), {
      target: { value: "Pérdida" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar la baja" }));

    // El diálogo sigue abierto con el motivo escrito: cerrarlo obligaría a repetirlo.
    expect(await screen.findByRole("alert")).toHaveTextContent(/no permite/);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("un estado sin acciones no pinta botones", () => {
    render(<CopyActions copyId="copy-1" state="DISPONIBLE" subject="copia AB12" />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
