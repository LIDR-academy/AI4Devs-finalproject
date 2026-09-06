import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Píldora de estado. Un solo eje de variación —el **tono**— porque el tamaño y la
 * forma no significan nada aquí: lo que distingue a un estado de otro es el color
 * y, sobre todo, el texto.
 *
 * El texto no es opcional ni decorativo: el color por sí solo no puede llevar la
 * información (WCAG 1.4.1), así que la etiqueta es la que informa y el tono
 * acompaña. Por eso no existe una variante "solo punto de color".
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      tone: {
        neutral:
          "border-[var(--tone-neutral-border)] bg-[var(--tone-neutral)] text-[var(--tone-neutral-foreground)]",
        info: "border-[var(--tone-info-border)] bg-[var(--tone-info)] text-[var(--tone-info-foreground)]",
        success:
          "border-[var(--tone-success-border)] bg-[var(--tone-success)] text-[var(--tone-success-foreground)]",
        warning:
          "border-[var(--tone-warning-border)] bg-[var(--tone-warning)] text-[var(--tone-warning-foreground)]",
        danger:
          "border-[var(--tone-danger-border)] bg-[var(--tone-danger)] text-[var(--tone-danger-foreground)]",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
);

function Badge({
  className,
  tone,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ tone, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
