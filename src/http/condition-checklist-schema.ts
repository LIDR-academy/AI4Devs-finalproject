import { z } from "zod";

import {
  CONDITION_CHECKLIST_IDS,
  type ConditionChecklist,
} from "@/domain/rentals/condition-checklist";

/**
 * Esquema de la lista de comprobación, **derivado del catálogo de dominio** en vez de
 * escrito a mano en cada endpoint (`wireframes.md` §4.3).
 *
 * Vive en la capa HTTP porque Zod es del transporte, no del dominio; pero las claves
 * son las del dominio, así que añadir una comprobación es tocar **un** fichero y los
 * dos endpoints —entrega e inspección— se enteran a la vez.
 *
 * Tres decisiones que valen más que el esquema:
 *
 * - **O están todas o no está ninguna.** Un informe con media lista no se puede
 *   comparar con el de la otra punta del alquiler, y comparar es para lo único que
 *   sirven. `null` sigue siendo válido: significa "no se registró lista".
 * - **Se rechaza lo que no esté en el catálogo** (`strict`). Antes se aceptaba
 *   cualquier clave y la base acababa con listas que ninguna pantalla sabía leer.
 * - **Booleanos, no texto libre.** Lo que no cabe en una casilla va a
 *   `observaciones`, que es un campo aparte del informe.
 */
const shape = Object.fromEntries(
  CONDITION_CHECKLIST_IDS.map((id) => [id, z.boolean()])
) as Record<keyof ConditionChecklist, z.ZodBoolean>;

export const ChecklistSchema = z
  .strictObject(shape, "La lista de comprobación no coincide con el catálogo.")
  .nullish();
