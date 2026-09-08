import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NewEmployeeForm } from "../app/(backoffice)/backoffice/empleados/new-employee-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

/**
 * Alta de personal (UC-B13). Se prueba **aquí y no en el E2E** por lo mismo que los
 * formularios de configuración: crear un empleado de verdad deja una cuenta más en la
 * base compartida en **cada** ejecución de la suite, y la semilla no limpia lo que no
 * ha creado ella. La pantalla en sí ya pasa por la auditoría de accesibilidad del E2E.
 *
 * Se importa por ruta relativa: vive junto a su ruta, y el alias `@/` apunta a `src/`.
 */

const created = (email: string) =>
  ({ ok: true, json: async () => ({ employee: { id: "u1", email } }) }) as unknown as Response;

const problem = (body: unknown) =>
  ({ ok: false, json: async () => body }) as unknown as Response;

function rellenar({ password = "una-contraseña" } = {}) {
  fireEvent.change(screen.getByLabelText("Nombre y apellidos"), {
    target: { value: "Olga Operadora" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "olga@clickoteca.test" },
  });
  fireEvent.change(screen.getByLabelText("Contraseña inicial"), {
    target: { value: password },
  });
}

describe("NewEmployeeForm", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async () => created("olga@clickoteca.test"));
    vi.stubGlobal("fetch", fetchMock);
  });

  it("crea un operador con los cuatro campos en una sola llamada", async () => {
    render(<NewEmployeeForm />);
    rellenar();
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/employees");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      fullName: "Olga Operadora",
      email: "olga@clickoteca.test",
      password: "una-contraseña",
      role: "OPERATOR",
    });
  });

  it("el rol por defecto es operador, no administrador", () => {
    render(<NewEmployeeForm />);
    expect(screen.getByLabelText(/Operador/)).toBeChecked();
    expect(screen.getByLabelText(/Administrador/)).not.toBeChecked();
  });

  it("permite crear un administrador eligiéndolo explícitamente", async () => {
    render(<NewEmployeeForm />);
    rellenar();
    fireEvent.click(screen.getByLabelText(/Administrador/));
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).role).toBe("ADMIN");
  });

  it("la contraseña se ve mientras se escribe: hay que poder entregarla", () => {
    render(<NewEmployeeForm />);
    // Ocultarla no protege nada —no es la contraseña de quien teclea— y sí conseguiría
    // que se copiara mal y nadie lo notara hasta el primer intento de acceso.
    expect(screen.getByLabelText("Contraseña inicial")).toHaveAttribute("type", "text");
  });

  it("confirma con el email creado y deja el formulario vacío para el siguiente", async () => {
    render(<NewEmployeeForm />);
    rellenar();
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByRole("status")).toHaveTextContent("olga@clickoteca.test");
    expect(screen.getByLabelText("Email")).toHaveValue("");
    expect(screen.getByLabelText("Contraseña inicial")).toHaveValue("");
  });

  // ── Caminos de error ───────────────────────────────────────────────────────

  it("el email repetido se explica junto a su campo y no borra lo escrito", async () => {
    fetchMock.mockResolvedValueOnce(
      problem({
        detail: "Datos no válidos.",
        errors: [{ field: "email", issue: "Ya existe una cuenta con este email." }],
      })
    );
    render(<NewEmployeeForm />);
    rellenar();
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByText("Ya existe una cuenta con este email.")).toBeInTheDocument();
    // Reescribir los cuatro campos por una colisión de email sería castigar al admin
    // por un dato que ya tenía bien.
    expect(screen.getByLabelText("Nombre y apellidos")).toHaveValue("Olga Operadora");
    expect(screen.getByLabelText("Email")).toBeInvalid();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("un rechazo sin error de campo se explica arriba, una sola vez", async () => {
    fetchMock.mockResolvedValueOnce(
      problem({ detail: "Solo un administrador gestiona el personal." })
    );
    render(<NewEmployeeForm />);
    rellenar();
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Solo un administrador gestiona el personal."
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("un servidor inalcanzable no deja el botón bloqueado", async () => {
    fetchMock.mockRejectedValueOnce(new Error("sin red"));
    render(<NewEmployeeForm />);
    rellenar();
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("contactar con el servidor");
    expect(screen.getByRole("button", { name: "Crear cuenta" })).toBeEnabled();
  });

  it("el navegador exige ya los 8 caracteres, sin ida y vuelta al servidor", () => {
    render(<NewEmployeeForm />);
    expect(screen.getByLabelText("Contraseña inicial")).toHaveAttribute("minLength", "8");
  });
});
