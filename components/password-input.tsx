"use client";

import * as React from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Campo de contraseña con el ojo de mostrar/ocultar dentro del recuadro.
 *
 * Se extrae aquí porque el bloque estaba a punto de repetirse en los cuatro campos de
 * contraseña de la aplicación (login, alta, y las dos de la contraseña nueva), que es
 * el mismo criterio con el que nació `components/ui/input.tsx`. Conserva las clases
 * crudas que ya tenían esos campos en vez del estilo de `Input`: el encargo era añadir
 * el ojo, no cambiar el aspecto de cuatro formularios de paso.
 *
 * **Es un botón conmutador, no un `checkbox`:** alterna algo que ya está en pantalla,
 * no recoge un dato que deba viajar en el envío —un `checkbox` con `name` acabaría en
 * el `FormData` que se serializa al API—. Y el `type="button"` no es cosmético: dentro
 * de un `<form>`, un botón sin tipo **envía**, así que mirar la contraseña intentaría
 * entrar con ella a medio escribir.
 *
 * **El nombre accesible no cambia con el estado; cambia `aria-pressed`.** Reescribir
 * el `aria-label` a "Ocultar…" es lo más visto, pero mete el estado en el *nombre* del
 * control, y que un lector de pantalla vuelva a leer un nombre que ha cambiado bajo el
 * foco no está garantizado. Con el patrón conmutador de ARIA el estado sí se anuncia
 * al activarlo. El icono tachado es esa misma información para quien ve la pantalla.
 *
 * `toggleLabel` es **obligatorio y sin valor por defecto** a propósito: en una pantalla
 * con dos campos de contraseña —la de restablecer— dos botones llamados igual son
 * ambiguos para quien navega por nombre, y quedarían indistinguibles también para los
 * selectores del E2E. Obligarlo fuerza a diferenciarlos al escribir el segundo campo.
 */
function PasswordInput({
  id,
  toggleLabel,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & { toggleLabel: string }) {
  const [visible, setVisible] = useState(false);

  return (
    // El campo y su interruptor comparten caja para que el ojo quede dentro del
    // recuadro; el `pr-10` reserva el hueco, o el texto pasaría por debajo.
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        className={cn("h-9 w-full rounded-md border pl-3 pr-10 text-sm", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((shown) => !shown)}
        aria-pressed={visible}
        aria-controls={id}
        aria-label={toggleLabel}
        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-md text-[var(--muted-foreground)] outline-none transition-colors hover:text-[var(--foreground)] focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]"
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="size-4" />
        ) : (
          <Eye aria-hidden="true" className="size-4" />
        )}
      </button>
    </div>
  );
}

export { PasswordInput };
