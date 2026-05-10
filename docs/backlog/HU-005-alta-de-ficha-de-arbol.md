# HU-005 — Alta de ficha de árbol

## 1. Validación de la información existente

| Aspecto | Estado |
|---------|--------|
| **Título** | Correcto y alineado con el backlog: *Alta de ficha de árbol*. |
| **Formato “Como… quiero… para…”** | Correcto; el backlog añade explícitamente coordenadas (R2), maestros (R1, R8) y UC-03; la redacción refinada unifica todo en una frase sin notas al pie en el cuerpo de la historia. |
| **Estimación (S/M/L)** | **L** coherente con alcance técnico (persistencia, validaciones, auditoría, Kafka). |
| **Prioridad** | **Alta** alineada con MVP. |
| **Inconsistencias detectadas** | ~~OpenAPI `object` genérico~~ **cerrado:** [openapi.yaml](../api/openapi.yaml) define **CreateTreeRequest** / **CreatedTreeResponse**. El **GET** `/api/catalog/trees` del contrato está **reservado**; el backend actual solo implementa **POST** (listado colaborador pendiente de otra tarea/HU). |
| **Tamaño / división** | Historia grande pero acotada por “Queda fuera”: fotos —subida **HU-006**, consulta **HU-014**—, IA (HU-009), edición (HU-008). Si el equipo difería Kafka en un segundo despliegue, convendría explicitar entregables parciales (riesgo para R7/cadena de notificaciones). |

---

## 2. Historia refinada

| Campo | Valor |
|-------|--------|
| **ID** | HU-005 |
| **Épica** | Catálogo colaborador |
| **Título** | Alta de ficha de árbol |
| **Estimación de complejidad** | L |
| **Prioridad** | Alta |

**Historia de usuario**

Como colaborador autenticado, quiero registrar un árbol con datos descriptivos, coordenadas y especie elegida entre las disponibles en los maestros del catálogo, pudiendo dejar la ficha publicable para consulta pública, para documentar el ejemplar según las reglas del catálogo.

- **Entregable de la historia:** Ficha de **ÁRBOL** persistida en el **catálogo** (`catalog-service`) asociada al colaborador creador, con especie y provincia válidas según maestros, coordenadas del ejemplar, metadatos de negocio previstos (incluido estado de publicación acorde al producto) y trazas de auditoría de catálogo cuando aplique; **publicación a Kafka** del mensaje **`ARBOL_CREADO`** en `catalog.arbol.evento` solo en el **alta exitosa** (implementación **TASK-HU-005-05**), alineado con [kafka-events.md](../events/kafka-events.md) y **R7** (**solo-on-create**). La **persistencia de `EVENTO_CATALOGO`**, el consumo estable del topic y el **envío de correo** quedan fuera: **[HU-007](backlog.md)** (`notification-service`).

### Alcance

#### Incluye

- Creación de ficha mediante el flujo previsto para **colaboradores autenticados** (caso de uso de registrar árbol): datos descriptivos y de ubicación, referencia a **especie** y **provincia** desde datos maestros, control de publicación para consulta pública según lo descrito en el modelo y el contrato HTTP (`POST /api/catalog/trees` con cuerpo JSON, detalle cerrable en implementación sin contradecir el contrato publicado).
- Cumplimiento de **R1** (toda ficha referencia exactamente una especie desde maestros) y **R2** (cada árbol lleva coordenadas del ejemplar).
- Registro del **creador** de la ficha (vinculación a usuario aplicación / subject OIDC según modelo `USUARIO_APP` / responsabilidades del servicio).
- **Auditoría de catálogo** para operaciones relevantes (**R3**, entidad **AUDITORIA_CATALOGO** en el diseño documentado).
- Tras creación correcta: **publicación a Kafka** en **`catalog.arbol.evento`** con **`tipo_evento`** = **`ARBOL_CREADO`**, payload mínimo (`evento_id`, `arbol_id`, `ocurrido_en`, …) según **kafka-events.md** y **R7** (código del productor: **TASK-HU-005-05**). **No** incluye insertar en **`EVENTO_CATALOGO`** (microservicio de notificaciones, **[HU-007](backlog.md)**).

#### Queda fuera de esta historia

- **Subida de binarios** y política R4–R5 de fotografías (épica **Fotografías**, **HU-006** y **HU-014**, `media-service` y rutas de medios / fotos del árbol).
- **Identificación asistida por IA** en el momento del alta (extensión **UC-05** sobre UC-03/04; **HU-009**).
- **Edición posterior** de la ficha (**UC-04**, **HU-008**).
- **Notificación por correo** a suscriptores (**[HU-007](backlog.md)**): aquí solo se garantiza la **publicación a Kafka** (`ARBOL_CREADO`); el consumo del topic, **EVENTO_CATALOGO** / idempotencia y **SMTP** son responsabilidad del **notification-service** (desglose en [HU-007-ticket-breakdown.md](HU-007-ticket-breakdown.md)).
- **Gestión de maestros** taxonómicos y geográficos (**UC-07**, **HU-011**): la historia *consume* maestros, no los administra.
- **Consulta pública** de la ficha (**HU-002**, **HU-003**): solo la posibilidad de marcar la ficha como publicable en alta según reglas; no la implementación completa del mapa o listados públicos.

### Dependencias

- **Autenticación OIDC/JWT** y rol de colaborador (**HU-001**): toda creación exige usuario autenticado con permisos acordes.
- **Existencia operativa de maestros** (especie, provincia u otros requeridos por el modelo físico de `ARBOL`) coherente con **R8**; el backlog documenta el riesgo de maestros vacíos frente al alta (orden de despliegue / datos iniciales no cerrados en fuentes).
- **API Gateway** enrutando `/api/catalog` con validación de JWT hacia **catalog-service**, según arquitectura del readme.
- Contratos compartidos: **OpenAPI** (gateway), **ADR-0002** (PK numéricas en SQL), **kafka-events.md** para payload mínimo e idempotencia en cadena downstream.

### Riesgos

- **DTO de alta aún genérico en OpenAPI:** el esquema JSON está abierto; divergencia entre equipos al cerrar campos obligatorios frente al modelo `ARBOL` y reglas R1–R2.
- **Coordenadas:** convivencia de decimales en el diagrama lógico y **PostGIS** en el esquema `catalog`; la fuente no cierra el modelo físico único en primera entrega (hueco del backlog).
- **Maestros sin datos:** imposibilidad de dar de alta árbol alineado a R1 si no hay especies cargadas; depende de despliegue y semillas no documentadas.
- **Alcance Mongo:** proyección o enriquecimientos en Mongo para búsqueda pueden solaparse con trabajo futuro; no son requisito explícito de UC-03 en el resumen de casos de uso.

### Aclaraciones pendientes (refinamiento)

- Detalle del **DTO de alta** (campos obligatorios, validaciones, códigos de error 400) y alineación explícita con columnas `ARBOL` del readme.
- Criterio único para **ubicación** (solo lat/long, geometría PostGIS, o ambos) en la primera versión.
- **Política de datos iniciales** o orden mínimo entre despliegue de maestros (**HU-011**) y primera alta (**HU-005**).
- Si la publicación Kafka debe ser **síncrona al commit** transaccional o mecanismo de compensación ante fallo downstream (solo documentado como práctica general de idempotencia en consumidor).

## 3. Criterios de aceptación (BDD)

### Referencias

UC-03; reglas R1, R2, R3, R7, R8, R9; readme (registro de árbol, modelo lógico de `ARBOL`, diagramas de arquitectura); `docs/events/kafka-events.md` (`catalog.arbol.evento`, `ARBOL_CREADO`); OpenAPI `POST /api/catalog/trees`.

### Escenario 1 — Alta correcta con especie y coordenadas

- **Dado que** soy un colaborador autenticado con token válido  
- **Cuando** envío una solicitud de creación de ficha con una **especie_id** existente en maestros, **coordenadas** válidas y el resto de datos requeridos por la implementación cerrada del DTO  
- **Entonces** recibo respuesta de creación exitosa, la ficha queda asociada a mi usuario como creador, y se publica en Kafka un mensaje acorde a **`ARBOL_CREADO`** con **`arbol_id`** y **`evento_id`** utilizables para idempotencia en el **notification-service** (sin exigir que el catálogo persista **`EVENTO_CATALOGO`**).

### Escenario 2 — Rechazo por datos incumpliendo reglas de negocio

- **Dado que** soy un colaborador autenticado  
- **Cuando** intento crear una ficha **sin** especie válida en maestros o **sin** coordenadas del ejemplar (R1, R2)  
- **Entonces** la operación no crea el árbol y recibo un error de cliente coherente con problemas detalle (p. ej. RFC 9457) sin publicar evento de alta hacia notificación.

### Escenario 3 — Autorización y auditoría mínima

- **Dado que** el endpoint de creación exige autenticación según OpenAPI  
- **Cuando** un cliente **sin** Bearer válido o sin rol de colaborador según política de producto invoca la creación  
- **Entonces** no se crea la ficha (p. ej. 401/403 según diseño de seguridad) y no se emite evento de alta; y cuando la creación sea exitosa, queda traza acorde a **AUDITORIA_CATALOGO** para la operación relevante (R3).

## 4. Evaluación INVEST (resumen)

| Criterio | Comentario |
|----------|------------|
| **Independiente** | Parcialmente: depende de identidad y de maestros disponibles; el evento Kafka acopla contractualmente con notificaciones sin implementarlas en esta historia. |
| **Negociable** | Sí: detalle del DTO, validaciones finas y estrategia PostGIS frente a decimales son refinables dentro del alcance UC-03. |
| **Valiosa** | Sí: núcleo del MVP (registro colaborativo con publicación opcional y cadena hacia suscriptores vía evento). |
| **Estimable** | Sí: backlog marca **L**; el cierre del contrato JSON reduce incertidumbre. |
| **Small** | Límite: tamaño grande; si el equipo cierra primero solo persistencia SQL sin Kafka, habría que partir en entregables coordinados (riesgo de incumplir R7 en cadena). |
| **Testable** | Sí: verificable por API y BD, incluyendo presencia del mensaje en **Kafka** según contrato en [kafka-events.md](../events/kafka-events.md). |

## 5. Esfuerzo estimado de implementación

Orden de magnitud **alto dentro del sprint del MVP** para **catalog-service**: modelo/DTO, validaciones, persistencia con coordenadas **numéricas** (MVP), integración Flyway, **publicación Kafka (TASK-05)**, auditoría y pruebas de integración (Testcontainers alineado al readme). Front: formulario de alta y manejo de errores. Cifra concreta de persona-días: **no fijada en fuentes**; depende del equipo.
