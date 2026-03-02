# Design: CU03-B4 — Worker: Libreta de direcciones

## Context

El Worker procesa conversaciones GET_ADDRESS con una máquina de estados en `conversation.processor.ts`. Tras confirmar la dirección, `finalizeAddress()` sincroniza con el eCommerce, crea `OrderAddress` y cierra o transiciona a `WAITING_REGISTER` (usuarios no registrados). Para usuarios registrados cierra directamente. CU03-B3 introdujo `WAITING_SAVE_ADDRESS` con un handler temporal que solo cierra.

La libreta de direcciones (`Address` en Prisma) ya existe y se consulta en el sub-journey 2.1. Este change añade la oferta de guardar y la persistencia cuando la dirección es nueva.

**Restricciones**: ADR-005 (Worker BullMQ), ADR-006 (SSE vía Redis), ADR-008/009 (Prisma compartido). Sin nuevos endpoints REST.

## Goals / Non-Goals

**Goals:**
- Ofrecer guardar la dirección confirmada cuando no está en la libreta.
- Pedir alias (label) antes de persistir; sanitizar y usar fallback si vacío.
- Reutilizar `interpretUserIntent('WAITING_CONFIRMATION')` para Sí/No.
- Mantener consistencia con SSE (`publishConversationUpdate`, `publishConversationComplete`).

**Non-Goals:**
- Editar o eliminar direcciones de la libreta.
- Permitir múltiples alias por conversación.
- Cambiar el schema de la tabla `Address`.
- Frontend o API REST.

## Decisions

### 1. Nueva fase `WAITING_SAVE_ADDRESS_LABEL` en lugar de persistir de inmediato

**Decisión:** Tras CONFIRM en `WAITING_SAVE_ADDRESS`, pedir el alias y transicionar a `WAITING_SAVE_ADDRESS_LABEL`; persistir solo cuando el usuario responda.

**Alternativa rechazada:** Guardar con label genérico "Mi dirección" sin preguntar. Se descarta porque el usuario debe poder elegir un nombre significativo (Casa, Trabajo, etc.).

### 2. `sanitizeAddressLabel`: trim + slice(0,80) + fallback

**Decisión:** `trim()`; si vacío → `'Mi dirección'`; si no → truncar a 80 caracteres para evitar overflow en DB.

**Alternativa rechazada:** Re-pedir si el alias está vacío. Aumenta turnos y frustración; el fallback es suficiente.

### 3. `offerSaveAddress()` como función helper, no inline

**Decisión:** Extraer la lógica de oferta y transición a una función reutilizable llamada desde `finalizeAddress()` y `handleWaitingRegisterEmail()`.

**Alternativa rechazada:** Duplicar la lógica en ambos puntos. Aumenta riesgo de inconsistencias.

### 4. `closeConversation()` como helper compartido

**Decisión:** Centralizar el cierre (update Conversation, `publishConversationComplete`) en una función usada por varios handlers.

**Alternativa rechazada:** Repetir el bloque en cada handler. Ya existe patrón similar en `handleWaitingRegister`; se unifica.

### 5. Comparación de direcciones por `fullAddress` normalizado

**Decisión:** `trim().toLowerCase()` en ambos lados para determinar si la dirección ya existe. Sin normalización Unicode ni fuzzy matching.

**Alternativa rechazada:** Coincidencia exacta sin normalización. Pequeñas diferencias de formato impedirían detectar duplicados.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Label con caracteres especiales o muy largos | `slice(0, 80)`; Prisma/schema deben validar longitud y charset. |
| Usuario envía algo no interpretable como alias | Se usa tal cual; no validamos semántica. Si es spam, queda en DB; no hay impacto funcional. |
| `offerSaveAddress` desde `handleWaitingRegisterEmail` modifica el flujo actual | B3 ya transicionaba a `WAITING_SAVE_ADDRESS`; solo cambiamos qué hace el handler y añadimos el mensaje de oferta antes. |
| Tests con Prisma/Redis abiertos | Seguir [worker-testing-patterns.md](../../memory-bank/patterns/worker-testing-patterns.md): mockear antes del import. |

## Migration Plan

1. Implementar cambios en `address.service.ts` y `conversation.processor.ts`.
2. Ejecutar tests unitarios e integración.
3. Desplegar Worker; no hay migraciones de DB.
4. **Rollback:** Revertir commits; restaurar handler temporal de `handleWaitingSaveAddress` que solo llama a `closeConversation()`. Las Address creadas previamente permanecen; opcional: script de limpieza por fecha si se requiriera.

## Open Questions

- ¿El schema `Address` tiene constraint de longitud en `label`? Asumimos 80 chars como límite seguro; verificar con el schema de `prisma-db`.
