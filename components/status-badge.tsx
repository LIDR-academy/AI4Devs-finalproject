import { Badge } from "@/components/ui/badge";
import type { StatusLabel } from "@/lib/status";

/**
 * La única forma de pintar un estado del dominio en pantalla.
 *
 * Recibe el `StatusLabel` ya resuelto (`copyStatus(state, "subscriber")`, etc.) en
 * vez del estado crudo: así la decisión de *qué se le cuenta a cada rol* vive
 * entera en `lib/status.ts` y no se reparte entre las pantallas.
 */
export function StatusBadge({
  status,
  className,
}: {
  status: StatusLabel;
  className?: string;
}) {
  return (
    <Badge tone={status.tone} className={className}>
      {status.label}
    </Badge>
  );
}
