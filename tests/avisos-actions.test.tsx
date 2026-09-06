import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  MarkAllReadButton,
  MarkReadButton,
} from "../app/(portal)/portal/avisos/notification-actions";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

/**
 * Acciones del buzón del suscriptor.
 *
 * Se prueban aquí y no en el E2E porque vaciar un buzón es un cambio sobre una cuenta
 * de la base compartida, y las únicas cuentas con avisos son las del historial
 * sembrado: marcarlos en una ejecución los dejaría leídos para la siguiente.
 */

const ok = (body: unknown = {}) =>
  ({ ok: true, json: async () => body }) as unknown as Response;

const problem = (body: unknown) =>
  ({ ok: false, json: async () => body }) as unknown as Response;

describe("marcar todos los avisos como leídos", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    refresh.mockClear();
    fetchMock = vi.fn(async () => ok({ marked: 3 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  it("no se pinta cuando no hay nada que marcar", () => {
    // Un botón que no puede cambiar nada es ruido, y esta pantalla ya trae un botón
    // por fila.
    const { container } = render(<MarkAllReadButton unread={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("dice cuántos va a marcar, porque la lista viene recortada", () => {
    // Con sesenta avisos, la lista enseña cincuenta y el servidor marca los sesenta.
    // Sin el número, nadie sabría si pulsar afecta a lo que ve o a lo que no.
    render(<MarkAllReadButton unread={60} />);
    expect(screen.getByRole("button", { name: "Marcar los 60 como leídos" })).toBeVisible();
  });

  it("llama al endpoint de colección y refresca la pantalla", async () => {
    render(<MarkAllReadButton unread={3} />);
    fireEvent.click(screen.getByRole("button", { name: /Marcar los 3/ }));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    // Sin cuerpo: el destinatario sale de la sesión, así que no hay parámetro con el
    // que pedir el buzón de otro.
    expect(url).toBe("/api/notifications/read");
    expect(init.method).toBe("POST");
    expect(init.body).toBeUndefined();
  });

  // ── Caminos de error ───────────────────────────────────────────────────────

  it("un rechazo del servidor se explica y no se da por hecho", async () => {
    fetchMock.mockResolvedValueOnce(problem({ detail: "No autenticado." }));
    render(<MarkAllReadButton unread={2} />);
    fireEvent.click(screen.getByRole("button", { name: /Marcar los 2/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No autenticado.");
    expect(refresh).not.toHaveBeenCalled();
  });

  it("un servidor inalcanzable no deja el botón bloqueado", async () => {
    fetchMock.mockRejectedValueOnce(new Error("sin red"));
    render(<MarkAllReadButton unread={2} />);
    fireEvent.click(screen.getByRole("button", { name: /Marcar los 2/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("contactar con el servidor");
    expect(screen.getByRole("button", { name: /Marcar los 2/ })).toBeEnabled();
  });
});

describe("marcar un aviso suelto", () => {
  beforeEach(() => {
    refresh.mockClear();
    vi.stubGlobal("fetch", vi.fn(async () => ok()));
  });

  it("nombra el aviso al que pertenece", () => {
    // Diez botones "Marcar como leído" seguidos no dicen cuál se está pulsando.
    render(<MarkReadButton notificationId="n1" subject="Te toca un set de tu cola" />);
    expect(
      screen.getByRole("button", { name: "Marcar como leído: Te toca un set de tu cola" })
    ).toBeVisible();
  });
});
