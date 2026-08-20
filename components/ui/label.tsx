"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Etiqueta de un campo. Radix se encarga de que pulsar en el texto enfoque el
 * control, incluso cuando el control no es un `<input>` nativo.
 *
 * No lleva marca visual de obligatorio: el asterisco lo pone quien la usa, junto al
 * texto, para que forme parte del nombre accesible del campo.
 */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex select-none items-center gap-1 text-sm font-medium leading-none",
        className
      )}
      {...props}
    />
  );
}

export { Label };
