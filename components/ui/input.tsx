import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Campo de texto. Se trae con W4 (`wireframes.md` §6.3), que es la primera pantalla
 * con un formulario de verdad; hasta ahora eran `<input>` con las mismas clases
 * copiadas en cuatro sitios.
 *
 * El borde usa `--input` y no `--border`: es un control, y su contorno tiene que
 * llegar a 3:1 contra el fondo (WCAG 1.4.11), mientras que un borde decorativo no.
 * El estado de error se pinta desde `aria-invalid`, no desde una prop: así el color
 * no puede ir por un lado y lo que anuncia el lector de pantalla por otro.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-[var(--input)] bg-transparent px-3 py-1 text-base outline-none transition-[color,box-shadow] md:text-sm",
        "placeholder:text-[var(--muted-foreground)] disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-[var(--ring)] focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]",
        "aria-invalid:border-[var(--destructive)] aria-invalid:ring-[var(--destructive)]",
        className
      )}
      {...props}
    />
  );
}

export { Input };
