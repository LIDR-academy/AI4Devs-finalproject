## Why

La capability `notifications` describe **qué avisos se generan** —qué evento produce
cuál, a quién va, que un fallo al avisar no tumba la operación— y no dice **nada del
buzón donde se leen**. Ese hueco es anterior a este change: el marcado individual
existe desde que se construyó el portal, el contador de no leídos vive en la cabecera
desde entonces, y ninguna de las dos cosas tiene requisito que las gobierne. El marcado
masivo, recién añadido, solo lo hizo más visible.

No es un detalle cosmético. Las reglas del buzón son las que impiden que alguien lea o
vacíe el buzón de otro, y las que deciden qué significa "todos" cuando la pantalla
enseña 50 de 60. Eso tiene que estar escrito donde se comprueba, no solo en los
comentarios del código que lo implementa.

## What Changes

- **Requisito nuevo: el buzón del suscriptor**, con lo que ya hace y no estaba dicho:
  cada cual ve **solo los suyos**, los no leídos se distinguen y se cuentan, se marcan
  uno a uno o **todos de una vez**, y "todos" son todos los del usuario y no los que
  quepan en la pantalla.
- Queda escrito también **por qué vaciar un buzón ya vacío no es un error** mientras
  que marcar un aviso ya leído sí lo rechaza: son dos peticiones distintas —una señala
  una fila, la otra pide un estado final— y hasta ahora la diferencia solo vivía en un
  comentario.

Este change documenta, sobre todo, lo que el sistema ya hace. **Con una excepción, y la
encontró el propio ejercicio de escribirlo:** `GET /api/notifications` calculaba los "sin
leer" contando sobre la lista devuelta, que viene recortada, así que daba de menos a
quien tuviera más pendientes que el tope de la página —y con `?unread=1` devolvía
directamente el tamaño de la página—. Se cuenta ahora en la base, como ya hacía la
pantalla del portal.

## Capabilities

### Modified Capabilities

- `notifications`: requisito nuevo para el buzón —lectura, marcado individual y
  marcado masivo—. Los dos requisitos existentes, que describen qué avisos se emiten y
  a quién, no se tocan.

## Impact

**Casi nada que implementar.** El código ya cumplía lo que la spec pasa a exigir, salvo
el recuento de `GET /api/notifications` descrito arriba:

- `GET`/listado del buzón y contador: `listForUser` y `countUnread`, con el `userId`
  siempre en la consulta.
- Marcado individual: `POST /api/notifications/:id/read` — 404 si el aviso no existe,
  no es suyo o ya estaba leído.
- Marcado masivo: `POST /api/notifications/read` — devuelve cuántos marcó, y cero es
  una respuesta válida.

**Pruebas que ya lo cubren:** `tests/avisos-actions.test.tsx` (las dos acciones de la
pantalla, incluidos los caminos de error) y `tests/notifications.test.ts` (emisión e
idempotencia de los avisos).
