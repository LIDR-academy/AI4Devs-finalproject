# HU-007 — Aviso por correo al crear una ficha

## 1. Validación de la información existente

| Aspecto | Estado |
|---------|--------|
| **Título** | Correcto y alineado con el backlog: *Aviso por correo al crear una ficha*. |
| **Formato “Como… quiero… para…”** | Correcto; describe claramente valor para persona suscrita y evento disparador (alta de ficha). |
| **Estimación (S/M/L)** | **M** coherente para alcance MVP centrado en consumo de evento, idempotencia y envío de correo. |
| **Prioridad** | **Alta** alineada con objetivo de notificación del MVP. |
| **Inconsistencias detectadas** | No se detectan contradicciones con `backlog.md`; el desglose técnico define explícitamente el límite entre productor (`catalog-service`) y consumidor (`notification-service`). |
| **Tamaño / división** | Tamaño adecuado para **M** si se mantiene el corte en “solo alta” (`EJEMPLAR_CREADO`) y no se amplía a otros tipos de eventos o campañas. |

---

## 2. Historia refinada

| Campo | Valor |
|-------|--------|
| **ID** | HU-007 |
| **Épica** | Notificaciones |
| **Título** | Aviso por correo al crear una ficha |
| **Estimación de complejidad** | M |
| **Prioridad** | Alta |

**Historia de usuario**

Como persona suscrita por correo, quiero recibir un aviso cuando exista el alta de una ficha de árbol, para enterarme de nuevos ejemplares sin consultar la web de forma continua.

- **Entregable de la historia:** `notification-service` consume `catalog.ejemplar.evento`, procesa únicamente `EJEMPLAR_CREADO`, aplica idempotencia por `evento_id`, y genera notificación por correo (o no-op documentado si no hay suscriptores), manteniendo persistencia y trazabilidad en el esquema `notification`.

### Alcance

#### Incluye

- Consumo de eventos desde Kafka topic `catalog.ejemplar.evento` publicados por el Alta de ejemplar.
- Filtrado de `tipo_evento` para MVP: solo `EJEMPLAR_CREADO` dispara flujo de notificación.
- Persistencia mínima en `notification-service` para registrar evento consumido e idempotencia.
- Resolución de suscriptores **ACTIVA** y envío de correo con **texto fijo o cuerpo mínimo** (sin sistema de plantillas en el MVP).
- Manejo de reentregas sin duplicar envíos (no-op idempotente si evento ya procesado).
- Pruebas de integración del flujo consumidor + persistencia + envío simulado.

#### Queda fuera de esta historia

- Publicación del evento desde catálogo (pertenece a HU-005, `TASK-HU-005-05`).
- Notificaciones por modificación/edición de ficha; en MVP solo alta.
- Gestión funcional de altas/bajas de suscripciones (HU-004 y HU-012).
- Orquestación avanzada de campañas, preferencias por tipo de árbol o segmentación.
- Observabilidad avanzada/correlación distribuida fuera del corte mínimo funcional.

### Dependencias

- Publicación operativa de `EJEMPLAR_CREADO` en `catalog.ejemplar.evento` desde HU-005.
- Existencia de suscriptores registrados por HU-004 para validar destinatarios reales.
- Infraestructura Kafka + Postgres `notification` disponible en entorno local/CI.
- Contrato de evento alineado con `docs/events/kafka-events.md`.

### Riesgos

- Duplicidad de envíos si la deduplicación por `evento_id` no queda robusta.
- Desalineación de payload entre productor y consumidor (campos faltantes o tipos distintos).
- Fallos SMTP o latencia de envío que afecten reintentos y estado de notificación.
- Acoplamiento accidental a tipos de evento no contemplados en MVP.

### Aclaraciones pendientes (refinamiento)

- Política de reintentos de correo y estrategia de backoff en fallo temporal SMTP.
- Modelo final de estado de notificación en BD (`pendiente`, `enviado`, `error`) si se requiere en MVP.
- Redacción concreta del cuerpo del email (texto fijo permitido en MVP; sin plantillas).
- Evidencia mínima de cierre manual/E2E cuando no haya suscriptores (caso no-op).

## 3. Criterios de aceptación (BDD)

### Referencias

Backlog `HU-007`, [HU-007-ticket-breakdown.md](HU-007-ticket-breakdown.md), [kafka-events.md](../events/kafka-events.md), reglas R7 y UC-09; «suscriptor activo» = **`estado_suscripcion` = ACTIVA** ([data-model.md](../data-model/data-model.md) §2).

### Escenario 1 — Notificación tras Alta de ejemplar

- **Dado que** existe al menos un suscriptor activo  
- **Cuando** `notification-service` consume un evento válido `EJEMPLAR_CREADO` desde `catalog.ejemplar.evento`  
- **Entonces** registra el procesamiento del evento y genera la notificación por correo correspondiente.

### Escenario 2 — Reentrega del mismo evento

- **Dado que** un evento con el mismo `evento_id` ya fue procesado  
- **Cuando** el consumidor recibe una reentrega de ese evento  
- **Entonces** aplica idempotencia y no duplica envíos ni registros de notificación.

### Escenario 3 — Sin suscriptores activos

- **Dado que** llega un evento `EJEMPLAR_CREADO` válido y no hay destinatarios activos  
- **Cuando** se ejecuta el flujo de notificación  
- **Entonces** el sistema completa un no-op controlado y deja traza suficiente sin error funcional.

## 4. Evaluación INVEST (resumen)

| Criterio | Comentario |
|----------|------------|
| **Independiente** | Parcialmente: depende de publicación de evento desde HU-005 y de suscriptores de HU-004. |
| **Negociable** | Sí: formato de email, estrategia de retries y profundidad de estados pueden ajustarse. |
| **Valiosa** | Sí: entrega valor directo a usuario suscrito y materializa la promesa de notificaciones del MVP. |
| **Estimable** | Sí: el desglose técnico define componentes concretos (consumer, idempotencia, SMTP, tests). |
| **Small** | Aceptable para **M** si se limita a `EJEMPLAR_CREADO` y no se amplía a otros eventos. |
| **Testable** | Sí: verificable con pruebas de integración y escenarios de duplicado/no-op. |

## 5. Esfuerzo estimado de implementación

Orden de magnitud **medio (M)**, concentrado en `notification-service`: modelo de persistencia, listener Kafka, deduplicación, envío de correo y pruebas de integración con Kafka/BD. El riesgo principal de esfuerzo está en reintentos SMTP e idempotencia robusta bajo reentregas.
