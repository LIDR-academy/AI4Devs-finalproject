# Tasks: Buzón de avisos

> **Change casi de solo spec.** Todo lo que el requisito exige estaba implementado y
> probado salvo un recuento, que se destapó al escribirlo (1.6). Las tareas nacen
> marcadas y apuntan a dónde mirar para verificarlo, que es lo que necesita quien
> archive.

## 1. Comprobar que lo implementado cumple lo que se escribe

- [x] 1.1 El buzón se resuelve **siempre** por la sesión: `listForUser`, `countUnread`,
      `markRead` y `markAllRead` reciben el `userId` de `requireSession`, y ninguno lo
      acepta en el cuerpo de la petición
- [x] 1.2 El marcado individual responde **igual** a "no existe", "no es tuyo" y "ya
      estaba leído" (`app/api/notifications/[notificationId]/read/route.ts`)
- [x] 1.3 El marcado masivo cubre **todos** los del usuario, no la página visible, y
      `readAt: null` en el `WHERE` evita reescribir fechas de lectura ya registradas
- [x] 1.4 Vaciar un buzón ya vacío responde correctamente con cero marcados
- [x] 1.6 **Defecto encontrado al escribir la spec:** `GET /api/notifications` contaba
      los "sin leer" sobre la lista devuelta —recortada—, así que daba de menos con
      muchos pendientes y, con `?unread=1`, devolvía el tamaño de la página. Pasa a
      contarse en la base, como ya hacía `/portal/avisos`
- [x] 1.5 Tests que lo sostienen: `tests/avisos-actions.test.tsx` (las dos acciones y
      sus caminos de error) y `tests/notifications.test.ts` (emisión e idempotencia)

## 2. Cierre

- [x] 2.1 `documents/PRD.md` §4.7 recoge el buzón y qué significa "todos"
- [x] 2.2 `openspec validate --all --strict` en verde
- [x] 2.3 Archivar el change: es lo único pendiente, y aplica el delta a
      `openspec/specs/notifications`
