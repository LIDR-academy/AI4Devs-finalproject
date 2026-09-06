import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Campo de texto multilínea. Se trae con W2/W3 (`wireframes.md` §4.2 y §5.3): las
 * observaciones del informe de condición y el "cuéntanos qué has encontrado" del aviso
 * de discrepancia.
 *
 * Mismo criterio que `Input`: el borde usa `--input` porque es un control y su contorno
 * necesita 3:1 (WCAG 1.4.11), y el estado de error se pinta desde `aria-invalid` para
 * que el color y lo que anuncia el lector de pantalla no puedan separarse.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-20 w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-2 text-base outline-none transition-[color,box-shadow] md:text-sm",
        "placeholder:text-[var(--muted-foreground)] disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-[var(--ring)] focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]",
        "aria-invalid:border-[var(--destructive)] aria-invalid:ring-[var(--destructive)]",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
