import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

/**
 * Tarjeta: un borde de 1px y nada más.
 *
 * Sin sombra a propósito (`design-system.md` §4.2): la elevación es para lo que
 * **flota de verdad** —diálogos, popovers—, y en el tema oscuro una sombra sobre
 * fondo oscuro no separa nada. El borde separa igual de bien en los dos temas.
 *
 * Se trae ahora porque la ficha de set la necesita para la caja de decisión
 * (`wireframes.md` §3.1); las pantallas anteriores se apañaban con un `div` con
 * borde y ese patrón repetido es justo lo que este componente retira.
 */
function Card({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="card"
      className={cn(
        "flex flex-col gap-4 rounded-md border bg-[var(--card)] p-4 text-[var(--card-foreground)]",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("flex flex-col gap-2", className)} {...props} />;
}

/**
 * El título de una tarjeta **no lleva nivel de encabezado propio**: según dónde se use
 * es un `h2` o un `h3`, y fijarlo aquí rompería el orden de encabezados de la página
 * (WCAG 1.3.1). Quien la usa pone el suyo con `asChild`:
 * `<CardTitle asChild><h2 id="…">…</h2></CardTitle>`.
 */
function CardTitle({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp data-slot="card-title" className={cn("font-semibold leading-tight", className)} {...props} />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-[var(--muted-foreground)]", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("flex flex-col gap-3", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-footer" className={cn("flex flex-wrap items-center gap-2", className)} {...props} />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
