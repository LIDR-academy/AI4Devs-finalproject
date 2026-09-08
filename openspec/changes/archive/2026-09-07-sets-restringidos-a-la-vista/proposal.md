## Why

Una cuarta parte del catálogo publicado —**9 sets de 35** con el ajuste por defecto de
3 meses— exige antigüedad mínima de suscripción. Hoy el suscriptor reciente no se
entera hasta que abre la ficha, y lo que lee allí es esto:

> Este set requiere 3 meses de antigüedad de suscripción; llevas 1.

Cierto, y sin salida. De los cuatro motivos de no elegibilidad, los otros tres ofrecen
una acción —ver la suscripción, ver mis sets, entrar en la cola— y este solo constata.
Ni siquiera dice **cuándo** deja de aplicar, que es el único dato accionable que hay:
la fecha existe, es calculable y no depende de nadie más.

En la rejilla, además, un set restringido es indistinguible del resto. El suscriptor
descubre la restricción de uno en uno, abriendo fichas.

## What Changes

- **La restricción se ve en el catálogo**, sin abrir la ficha. `restricted` pasa a ser
  un **atributo público** del Set: lo ve también el visitante, igual que la dificultad
  o la edad recomendada. No es disponibilidad ni dato de nivel `Copy` — la frontera de
  D13 no se mueve.
- **La ficha dice desde cuándo**, no solo qué falta: "Podrás llevártelo a partir del
  14 de marzo de 2027". Es la salida que le faltaba al cuarto motivo.
- **La marca de la rejilla es estática y la fecha es personal.** En la rejilla, la
  condición del set ("A partir de 3 meses de suscripción"), igual para todo el mundo.
  En la ficha, la fecha de quien mira. Ver `design.md` §2.

No cambia: la regla de elegibilidad, ni qué sets están restringidos, ni el umbral
—que sigue siendo configurable por el admin—. Cambia **qué se cuenta y cuándo**.

## Capabilities

### Modified Capabilities

- `catalog-inventory`: la proyección pública incorpora `restricted` a los atributos de
  catálogo. Hasta ahora estaba en la lista de campos que **nunca** salen, junto al
  valor de referencia y a `published`, y hay un test que lo afirma: este change es lo
  que autoriza sacarlo de ahí.
- `subscriptions`: el rechazo por antigüedad pasa a decir **desde cuándo** podrá
  llevárselo, no solo cuánta antigüedad le falta.

## Impact

**Código a tocar**

- `src/domain/catalog/public-projection.ts`: `restricted` sale de
  `NON_PUBLIC_SET_FIELDS` y entra en `PublicSet` / `PUBLIC_SET_FIELDS`.
- `src/repositories/catalog.repository.prisma.ts`: `PUBLIC_SET_SELECT` lo incluye; la
  proyección autenticada deja de añadirlo por su cuenta.
- `src/domain/subscriptions/eligibility.ts`: función pura que devuelve **desde cuándo**,
  y el veredicto de antigüedad la incluye.
- `app/(public)/catalogo/page.tsx` (marca en la tarjeta) y
  `app/(public)/catalogo/[setId]/page.tsx` (la fecha, y la condición para el visitante).

**Tests**

- `tests/public-catalog.test.ts` afirma hoy que `restricted` no es público: hay que
  cambiar la afirmación, no borrarla.
- Casos nuevos para la fecha, incluida la frontera de `monthsBetween` cuando el día
  del mes de origen no existe en el mes de destino (un alta el día 31).
