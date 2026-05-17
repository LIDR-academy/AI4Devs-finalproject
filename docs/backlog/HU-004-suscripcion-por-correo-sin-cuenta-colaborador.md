# HU-004 — Suscripción por correo sin cuenta colaborador

## 1. Validación de la información existente

| Aspecto | Estado |
|---------|--------|
| **Título** | Alineado con el backlog: cubre alta de suscriptor **sin** cuenta de Colaborador. |
| **Formato “Como… quiero… para…”** | Presente en el backlog con UC-02; la historia refinada en §2 unifica redacción y beneficio sin referencias entre paréntesis en el cuerpo de la historia de usuario. |
| **Estimación (S/M/L)** | **M** — se mantiene. |
| **Prioridad** | **Alta** — se mantiene. |
| **Inconsistencias detectadas** | Coherencia cerrada para el MVP: alta en **ACTIVA** sin correo de confirmación; [**data-model §2**](../data-model/data-model.md) y OpenAPI alineados. |
| **Tamaño / división** | Acotada si se excluye envío masivo de correos y consumo Kafka (**[HU-007](backlog.md)**) y la **gestión administrativa** de registros (**[HU-012](backlog.md)**). |

---

## 2. Historia refinada

| Campo | Valor |
|-------|--------|
| **ID** | HU-004 |
| **Épica** | Notificaciones |
| **Título** | Suscripción por correo sin cuenta colaborador |
| **Estimación de complejidad** | M |
| **Prioridad** | Alta |

**Historia de usuario**

Como visitante sin cuenta en la plataforma, quiero registrarme con mi correo electrónico para suscribirme a avisos sobre nuevas altas de fichas de árbol en el catálogo, para enterarme de novedades sin tener que consultar la web de forma continua.

- **Entregable de la historia:** Flujo de **alta de suscriptor** usable por un **público no autenticado**: interfaz en **`/subscriptions/new`**, **`POST /api/notifications/subscriptions`** vía **API Gateway** (mismo patrón de entrada que el resto de microservicios; **sin** JWT en este `POST`) y persistencia **SUSCRIPTOR** en el microservicio **`notification-service`** con **`estado_suscripcion` = ACTIVA** al crear (correo válido y sin fila previa conflictiva). Quedan **fuera** el envío de correos tras alta de árbol, Kafka y **NOTIFICACION** / **ENVIO_NOTIFICACION** (**[HU-007](HU-007-aviso-por-correo-al-crear-una-ficha.md)**), el paso a **CANCELADA** y la **reactivación** desde **CANCELADA** (**[HU-012](backlog.md)** / **UC-08**).

### Alcance

#### Incluye

- Registro inicial de solicitud de suscripción mediante **solo** dirección de **correo electrónico** validada como tal, según cuerpo mínimo del OpenAPI (**`email`** obligatorio, formato email).
- Exposición del contrato como **endpoint público** en OpenAPI (**`security: []`** para este `POST`); el tráfico de la SPA al **mismo host/puerto del API Gateway** que el resto de la aplicación (no se asume llamada directa al puerto del microservicio en entornos integrados).
- Implementación **backend** exclusiva en **`notification-service`** (`services/notification-service`): persistencia **SUSCRIPTOR** con **`email`**, **`estado_suscripcion` = ACTIVA** en el alta; marcas **`alta_en`**; **`confirmado_en`** / **`baja_en`** según readme (en MVP sin opt-in puede **`confirmado_en`** igualarse a **`alta_en`** o aplicarse política técnica mínima acordada en implementación).
- Si ya existe **ACTIVA** con ese **correo**, o si existe **CANCELADA** con ese **correo**: respuesta **`409 Conflict`**, **RFC 9457** y **`detail`** explícito para el usuario (**no** se reactiva desde el flujo público; la reactivación **ACTIVA** desde **CANCELADA** es solo **ADMIN** en **[HU-012](backlog.md)**).
- Respuesta **`201`** con JSON mínimo `{ "email": "..." }` según [openapi.yaml](../api/openapi.yaml): confirma el alta sin exponer **`suscriptor_id`** ni otros datos enumerables.
- Coherencia con **UC-02** (actor **Público**, sin autenticación) y preparación para que **R7** y **UC-09** solo afecten a suscriptores con **`estado_suscripcion` = ACTIVA** (véase [data-model.md](../data-model/data-model.md) §2).

#### Queda fuera de esta historia

- **Notificación efectiva por correo** al crear una ficha (**UC-09**, **R7**, Kafka, **HU-007**).
- **Confirmación por correo** del alta público UC-02 ni **motor de plantillas** en esta historia (MVP sin ambos).
- **Gestión administrativa** (**UC-08**, **[HU-012](backlog.md)**): paso a **CANCELADA**, listados y **`GET /api/notifications/subscriptions`**.
- **Cuenta de Colaborador** u OIDC para este flujo: el alta es **sin** JWT.

### Dependencias

- **`notification-service`** (o módulo equivalente) con esquema **`notification`** en PostgreSQL y migraciones alineadas al modelo del readme.
- **API Gateway** enrutando **`/api/notifications`** hacia **`notification-service`** (único punto de entrada HTTP para la UI, igual que otros contextos `/api/...`).
- Contrato **OpenAPI** como referencia de la operación pública de alta; errores de validación alineados a **RFC 9457** donde aplique.

### Riesgos

- **Abuso del endpoint público** (altas masivas, suscripciones con correos ajenos): **riesgo aceptado en el MVP** y registrado en [data-model.md](../data-model/data-model.md) §2; no se exige rate limiting ni captcha en esta entrega.

### Aclaraciones cerradas en refinamiento

- **Correo ya en ACTIVA:** **`409 Conflict`** + `Problem` con mensaje explícito en **`detail`** (sin segundo **201** encubierto).
- **Correo existente en CANCELADA:** **`409 Conflict`** + mensaje explícito; **sin** paso a **ACTIVA** en esta historia (solo **ADMIN** / **HU-012**).
- **Cuerpo del `201`:** objeto **`{ email }`** acorde al contrato OpenAPI.

## 3. Criterios de aceptación (BDD)

### Referencias

UC-02; regla R7 (**ACTIVA**, [data-model.md](../data-model/data-model.md)); readme (página `/subscriptions/new`, modelo **SUSCRIPTOR** en `notification_service`); [openapi.yaml](../api/openapi.yaml) `POST /api/notifications/subscriptions`; [use-case-summary.md](../use-cases/use-case-summary.md).

### Escenario 1 — Alta de suscripción con correo válido

- **Dado que** soy un visitante **sin** autenticación en la plataforma  
- **Cuando** envío una solicitud de alta con un **correo electrónico** con formato válido según el contrato público  
- **Entonces** la operación concluye con respuesta **`201`**, el cuerpo incluye **`email`** igual al solicitado y queda persistido el **SUSCRIPTOR** con **`estado_suscripcion` = ACTIVA**

### Escenario 2 — Rechazo por correo inválido o ausente

- **Dado que** el endpoint público solo exige el campo **`email`** en el cuerpo JSON  
- **Cuando** envío el alta **sin** `email` o con valor que **no** cumpla el formato previsto (`format: email`)  
- **Entonces** la operación **no** crea una suscripción aceptada y devuelvo error de cliente (**`400`**) alineado a **RFC 9457** según los componentes **`Problem`** del contrato  

### Escenario 3 — Correo duplicado con suscripción ya ACTIVA

- **Dado que** ya existe un **SUSCRIPTOR** con ese **correo** en **`estado_suscripcion` = ACTIVA**  
- **Cuando** envío de nuevo una solicitud de alta con el mismo **correo**  
- **Entonces** **no** se crea un segundo registro, respondo **`409 Conflict`** con **`application/problem+json`**, **`status`** 409 y un **`detail`** legible (correo ya suscrito)  

### Escenario 4 — Intento de alta con correo en estado CANCELADA

- **Dado que** existe un **SUSCRIPTOR** con ese **correo** en **`estado_suscripcion` = CANCELADA**  
- **Cuando** envío el alta público  
- **Entonces** **no** se modifica el estado desde este flujo, respondo **`409 Conflict`** con **`application/problem+json`** y un **`detail`** explícito (p. ej. suscripción cancelada; reactivación solo por administración)  

### Escenario 5 — Separación respecto al envío de notificaciones de nuevas fichas

- **Dado que** el MVP reserva el **envío masivo / procesamiento del evento de catálogo** para la cadena **HU-007** (**UC-09**)  
- **Cuando** se completa con éxito **solo** el alta del suscriptor definido en esta historia  
- **Entonces** el sistema **no** debe dar por cumplido el envío de avisos por nuevas altas ni consumir **`catalog.arbol.evento`** en el marco únicamente de **HU-004** (eso queda exclusivamente para la historia correspondiente)

## 4. Evaluación INVEST (resumen)

| Criterio | Comentario |
|----------|------------|
| **Independiente** | Parcialmente: requiere servicio y esquema de notificaciones y gateway; no depende de login ni de alta de árbol, pero sí de línea base infra/contrato. |
| **Negociable** | Acotado: **409** + mensaje (**ACTIVA** duplicada o **CANCELADA** existente), **`201`** (**`{email}`**), alta **ACTIVA** inmediata si no hay conflicto. |
| **Valiosa** | Sí: habilita el canal de audiencia amplia sin cuenta, alineado al mensaje de producto del readme. |
| **Estimable** | Sí: estimación **M** del backlog; sin opt-in de correo el alcance es acotado. |
| **Small** | Razonable si se mantienen fuera HU-007 y HU-012 como en “Queda fuera”. |
| **Testable** | Sí: verificable por API (códigos, persistencia en BD) y por prueba de UI mínima en `/subscriptions/new`. |

## 5. Esfuerzo estimado de implementación

Orden de magnitud **medio** para **notification-service** (persistencia **SUSCRIPTOR** en **ACTIVA**, validación de email, endpoint detrás de gateway) y **frontend** (formulario en `/subscriptions/new`). Cifra de persona-días: **no fijada en fuentes**.
