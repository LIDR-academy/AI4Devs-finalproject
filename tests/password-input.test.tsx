import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PasswordInput } from "../components/password-input";
import { LoginForm } from "../app/(public)/login/login-form";
import { RegisterForm } from "../app/(public)/registro/register-form";
import { ResetPasswordForm } from "../app/(public)/restablecer-contrasena/reset-password-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }),
}));

/**
 * El ojo de mostrar/ocultar de los campos de contraseña.
 *
 * Se prueba **aquí y no en el E2E** porque no toca ni el servidor ni la base: es
 * estado de un componente. Lo que sí vigila el E2E es que los campos sigan siendo
 * alcanzables por su etiqueta, que es lo que el botón podía romper —su nombre
 * contiene el del campo, y los selectores por etiqueta buscan por subcadena—.
 *
 * Se importan por ruta relativa: los formularios viven junto a su ruta, y el alias
 * `@/` apunta a `src/`.
 */

const campo = (nombre: string) => screen.getByLabelText(nombre) as HTMLInputElement;
const ojo = (nombre: string) => screen.getByRole("button", { name: nombre });

describe("PasswordInput", () => {
  const render1 = () =>
    render(
      <>
        <label htmlFor="p">Contraseña</label>
        <PasswordInput id="p" name="password" toggleLabel="Mostrar contraseña" />
      </>
    );

  it("nace oculta", () => {
    render1();
    expect(campo("Contraseña").type).toBe("password");
    expect(ojo("Mostrar contraseña")).toHaveAttribute("aria-pressed", "false");
  });

  it("el ojo la muestra y la vuelve a ocultar", () => {
    render1();
    fireEvent.click(ojo("Mostrar contraseña"));
    expect(campo("Contraseña").type).toBe("text");
    expect(ojo("Mostrar contraseña")).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(ojo("Mostrar contraseña"));
    expect(campo("Contraseña").type).toBe("password");
    expect(ojo("Mostrar contraseña")).toHaveAttribute("aria-pressed", "false");
  });

  it("lo ya escrito sigue ahí al alternar", () => {
    render1();
    fireEvent.change(campo("Contraseña"), { target: { value: "una-contraseña" } });
    fireEvent.click(ojo("Mostrar contraseña"));
    expect(campo("Contraseña").value).toBe("una-contraseña");
  });

  it("el ojo no envía el formulario que lo contiene", () => {
    // Un `<button>` sin `type` dentro de un `<form>` envía: mirar la contraseña
    // intentaría entrar con ella, y con el campo a medio escribir.
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <label htmlFor="p">Contraseña</label>
        <PasswordInput id="p" name="password" toggleLabel="Mostrar contraseña" />
      </form>
    );

    fireEvent.click(ojo("Mostrar contraseña"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("apunta al campo que gobierna, no a «el campo de contraseña» en abstracto", () => {
    // Con dos en la misma pantalla, `aria-controls` es lo que dice cuál es cuál.
    render(
      <>
        <label htmlFor="a">Uno</label>
        <PasswordInput id="a" toggleLabel="Mostrar uno" />
        <label htmlFor="b">Dos</label>
        <PasswordInput id="b" toggleLabel="Mostrar dos" />
      </>
    );

    expect(ojo("Mostrar uno")).toHaveAttribute("aria-controls", "a");
    expect(ojo("Mostrar dos")).toHaveAttribute("aria-controls", "b");

    fireEvent.click(ojo("Mostrar uno"));
    expect(campo("Uno").type).toBe("text");
    expect(campo("Dos").type).toBe("password");
  });
});

describe("Los campos de contraseña de la aplicación lo llevan", () => {
  const PLANES = [
    {
      code: "BASIC",
      name: "Básico",
      monthlyPrice: "14.99",
      maxSimultaneousSets: 1,
      queueBonusDays: 0,
    },
  ] as const;

  it("login", () => {
    render(<LoginForm />);
    fireEvent.click(ojo("Mostrar contraseña"));
    expect(campo("Contraseña").type).toBe("text");
  });

  it("alta de suscriptor", () => {
    render(<RegisterForm plans={PLANES} />);
    fireEvent.click(ojo("Mostrar contraseña"));
    expect(campo("Contraseña").type).toBe("text");
  });

  it("contraseña nueva: los dos campos, con un ojo cada uno", () => {
    render(<ResetPasswordForm token="da-igual" />);

    fireEvent.click(ojo("Mostrar la contraseña nueva"));
    expect(campo("Contraseña nueva").type).toBe("text");
    // El segundo no se ha movido: son dos campos, no una preferencia de pantalla.
    expect(campo("Repite la contraseña").type).toBe("password");

    fireEvent.click(ojo("Mostrar la contraseña repetida"));
    expect(campo("Repite la contraseña").type).toBe("text");
  });

  it("los dos ojos de esa pantalla no se llaman igual", () => {
    // Dos botones con el mismo nombre son ambiguos para quien navega por nombre, y
    // el E2E tampoco podría distinguirlos.
    const { container } = render(<ResetPasswordForm token="da-igual" />);
    const nombres = within(container)
      .getAllByRole("button")
      .map((boton) => boton.getAttribute("aria-label"))
      .filter((nombre): nombre is string => nombre !== null);

    expect(nombres).toEqual([...new Set(nombres)]);
    expect(nombres).toHaveLength(2);
  });
});
