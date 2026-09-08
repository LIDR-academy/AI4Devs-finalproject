"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FieldIssue {
  field: string;
  issue: string;
}

/**
 * Alta de personal del back-office — solo admin (UC-B13).
 *
 * El endpoint, el permiso y la auditoría existían desde el bloque 8; lo que faltaba
 * era la puerta: un admin que entrara por la interfaz podía cambiar el rol de alguien
 * o suspenderlo, pero no dar de alta a nadie. Crear un operador exigía llamar a
 * `POST /api/employees` a mano.
 *
 * **La contraseña la fija el admin y la entrega él.** No hay invitación por correo —
 * el transporte del MVP escribe al log (`src/mail/`), así que un correo de invitación
 * no llegaría a nadie. Por eso la pantalla dice explícitamente que hay que dársela a
 * la persona: una contraseña que solo conoce quien crea la cuenta no sirve de nada.
 */
export function NewEmployeeForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [issues, setIssues] = useState<FieldIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const issueFor = (field: string) => issues.find((i) => i.field === field)?.issue;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIssues([]);
    setError(null);
    setCreated(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "");

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: text("fullName"),
          email: text("email"),
          password: text("password"),
          role: text("role"),
        }),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        // El email repetido llega como error de campo (`errors[]`, RFC 9457) y se
        // pinta junto al suyo; lo demás, arriba. **No se limpia el formulario**: quien
        // acaba de escribir cuatro campos no debería reescribirlos por una colisión.
        setIssues(problem?.errors ?? []);
        setError(
          problem?.errors?.length ? null : (problem?.detail ?? "No se ha podido crear la cuenta.")
        );
        return;
      }

      const { employee } = await response.json();
      setCreated(employee?.email ?? text("email"));
      formRef.current?.reset();
      router.refresh();
    } catch {
      setError("No se ha podido contactar con el servidor.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex w-full max-w-md flex-col gap-4 rounded-md border p-4"
    >
      <div>
        <h2 className="text-sm font-semibold">Dar de alta a alguien</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          La cuenta queda activa al crearla. Entrégale la contraseña en persona: el
          sistema no le manda ningún correo.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Nombre y apellidos</Label>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="off"
          required
          aria-invalid={issueFor("fullName") ? true : undefined}
          aria-describedby={issueFor("fullName") ? "fullName-error" : undefined}
        />
        {issueFor("fullName") ? (
          <p id="fullName-error" className="text-sm text-[var(--destructive)]">
            {issueFor("fullName")}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="employeeEmail">Email</Label>
        <Input
          id="employeeEmail"
          name="email"
          type="email"
          // `off` y no `email`: el navegador ofrecería el correo del admin que está
          // rellenando el formulario, que es justo el que no va aquí.
          autoComplete="off"
          required
          aria-invalid={issueFor("email") ? true : undefined}
          aria-describedby={issueFor("email") ? "employeeEmail-error" : undefined}
        />
        {issueFor("email") ? (
          <p id="employeeEmail-error" className="text-sm text-[var(--destructive)]">
            {issueFor("email")}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="employeePassword">Contraseña inicial</Label>
        <Input
          id="employeePassword"
          name="password"
          // `text` y no `password`: el admin tiene que **leerla** para poder
          // entregarla, y no es su propia contraseña lo que teclea. Ocultarla solo
          // conseguiría que la escribiera mal y nadie lo notara hasta el primer acceso.
          type="text"
          autoComplete="off"
          required
          minLength={8}
          aria-invalid={issueFor("password") ? true : undefined}
          aria-describedby={
            issueFor("password") ? "employeePassword-error" : "employeePassword-hint"
          }
        />
        {issueFor("password") ? (
          <p id="employeePassword-error" className="text-sm text-[var(--destructive)]">
            {issueFor("password")}
          </p>
        ) : (
          <p id="employeePassword-hint" className="text-sm text-[var(--muted-foreground)]">
            Al menos 8 caracteres. Podrá cambiarla desde «¿Has olvidado la contraseña?».
          </p>
        )}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Rol</legend>
        {/* Operador por defecto: es el alta habitual, y un admin de más reparte
            permisos que luego hay que quitar a mano. */}
        <label className="flex items-start gap-2 text-sm">
          <input type="radio" name="role" value="OPERATOR" defaultChecked className="mt-1" />
          <span>
            Operador
            <span className="block text-[var(--muted-foreground)]">
              Cola de trabajo, ciclo de vida de las copias y ficha de cliente limitada.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="radio" name="role" value="ADMIN" className="mt-1" />
          <span>
            Administrador
            <span className="block text-[var(--muted-foreground)]">
              Todo lo del operador, más bajas de copias, configuración y personal.
            </span>
          </span>
        </label>
      </fieldset>

      {error ? (
        <p role="alert" className="text-sm text-[var(--destructive)]">
          {error}
        </p>
      ) : null}

      {created ? (
        // `status` y no `alert`: es una confirmación. El email va dentro porque es lo
        // que el admin tiene que comprobar antes de entregar las credenciales.
        <p role="status" className="text-sm">
          Cuenta creada para <strong>{created}</strong>. No olvides darle la contraseña.
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Creando…" : "Crear cuenta"}
      </Button>
    </form>
  );
}
