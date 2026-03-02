## Context

Tras CU03-B1 y CU03-B2, `finalizeAddress()` sincroniza la dirección, crea OrderAddress, actualiza Order a `READY_TO_PROCESS` y cierra la conversación. El Journey 3 (usuario no registrado) requiere ofrecer registro voluntario post-confirmación. El email no viene del contexto de compra mock, por lo que debe pedirse vía chat. La dirección confirmada se guarda en el estado (`confirmedAddress`) para que CU03-B4 pueda ofrecer guardarla en la libreta.

## Goals / Non-Goals

**Goals:**
- Bifurcar `finalizeAddress()` según `user.isRegistered`.
- Añadir fases `WAITING_REGISTER` y `WAITING_REGISTER_EMAIL` con handlers dedicados.
- Pedir email vía chat, validar, actualizar User y transicionar a `WAITING_SAVE_ADDRESS` para CU03-B4.
- Mantener consistencia con ADR-005 (BullMQ), ADR-006 (SSE) y patrones existentes en `address.service`.

**Non-Goals:**
- Implementar el handler `handleWaitingSaveAddress` (CU03-B4).
- Cambios en API REST, frontend o schema Prisma.
- Autenticación por email (solo se persiste el campo).

## Decisions

### 1. Extracción de email: regex vs OpenAI

**Decisión**: Usar regex como primera opción (patrón RFC 5322 simplificado).  
**Alternativas**: OpenAI para mensajes ambiguos ("mi correo es juan at gmail punto com").  
**Rationale**: El usuario suele indicar el email de forma directa; regex cubre el 95% de casos sin latencia ni coste. Si se detectan muchos fallos, se puede añadir fallback a OpenAI en un cambio posterior.

### 2. Orden de mensajes tras confirmar dirección

**Decisión**: Mensaje de confirmación de dirección → mensaje de oferta de registro (dos mensajes separados).  
**Rationale**: Mantiene claridad: primero cerramos el tema de la dirección, luego ofrecemos registro. Coherente con el flujo actual de `buildSyncSuccessMessage`.

### 3. Handler temporal para `WAITING_SAVE_ADDRESS`

**Decisión**: B3 puede incluir un handler mínimo que cierre la conversación tras el mensaje de confirmación si B4 no está desplegado.  
**Rationale**: Permite desplegar B3 de forma independiente sin errores por fase desconocida. B4 reemplazará ese handler al implementarse.

### 4. Validación de email

**Decisión**: Regex que acepte formatos comunes (ej. `[^\s]+@[^\s]+\.[^\s]+`), rechazando vacíos y strings muy largos (>254).  
**Rationale**: Balance entre robustez y simplicidad. No se valida dominio MX en MVP.

## Risks / Trade-offs

- **[Riesgo] Email inválido reiterado**: Usuario escribe mal varias veces → Mitigación: Re-pedir con mensaje claro; considerar límite de intentos (ej. 3) y escalar a humano si se supera.
- **[Trade-off] Regex vs formatos edge-case**: Algunos emails raros (comentarios, etc.) podrían no extraerse → Aceptable para MVP; mejora iterativa si hay feedback.
- **[Riesgo] CU03-B4 no desplegado**: Fase `WAITING_SAVE_ADDRESS` sin handler → Mitigación: Handler temporal que cierra la conversación.

## Migration Plan

1. Implementar cambios en `address.service.ts` y `conversation.processor.ts`.
2. Desplegar Worker; la API y frontend no cambian.
3. **Rollback**: Revertir commits; el flujo anterior (cierre directo tras confirmar) se restaura. No hay migración de datos.
