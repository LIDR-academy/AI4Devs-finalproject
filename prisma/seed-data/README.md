# Datos semilla del catálogo

`sets.json` contiene un subconjunto de **35 sets** usado por `prisma/seed.ts`.

## Procedencia

Los campos objetivos vienen del **dataset público de Rebrickable**
(<https://rebrickable.com/downloads/>), descargado de `sets.csv` y `themes.csv`:

| Campo | Origen |
| --- | --- |
| `setNum` | `sets.csv` → `set_num` (referencia oficial, p. ej. `75192-1`) |
| `name` | `sets.csv` → `name` |
| `year` | `sets.csv` → `year` |
| `pieceCount` | `sets.csv` → `num_parts` |
| `theme` / `parentTheme` | `themes.csv`, resolviendo la jerarquía `parent_id` |
| `boxPhotoUrl` | `sets.csv` → `img_url` (CDN de Rebrickable) |

Datos cortesía de Rebrickable; se conserva `setNum` en el modelo `Set` para poder
rastrear cada ficha hasta su origen y para que la semilla sea idempotente.

## Campos curados a mano

Estos **no** salen del dataset y son estimaciones nuestras, suficientes para el MVP
pero no autoritativas:

- `recommendedAge` — edad orientativa del envase.
- `difficulty` — `Iniciación` · `Intermedio` · `Avanzado` · `Experto`.
- `referenceValue` — PVP aproximado en EUR. Alimenta el precio del alquiler puntual
  (D9) y sirve de base para reclamaciones.
- `restricted` — `true` cuando `referenceValue >= 300`, que es el umbral con el que
  la semilla materializa la antigüedad mínima de suscripción (D7). El criterio
  definitivo sigue abierto en `design.md` → *Open Questions*.

## Regenerar

El fichero se generó una sola vez a partir de los CSV de Rebrickable y se commitea
tal cual, para que `npm run db:seed` funcione **sin red** y de forma determinista.
Para ampliar el catálogo: añadir la referencia del set al script de extracción,
volver a descargar los CSV y curar a mano los tres campos de arriba.
