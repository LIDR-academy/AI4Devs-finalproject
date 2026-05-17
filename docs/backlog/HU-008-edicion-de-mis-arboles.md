# HU-008 — Edición y baja de mis árboles

## 1. Validación de la información existente

| Aspecto | Estado |
|---------|--------|
| **Título** | Actualizado en backlog: *Edición y baja de mis árboles* (incluye eliminación de fichas propias). |
| **Formato “Como… quiero… para…”** | Correcto; el backlog enlaza **UC-04** y la restricción de propiedad (“únicamente los árboles que dí de alta yo”); la redacción refinada mantiene ese foco en el colaborador sin notas al pie en el cuerpo de la historia. |
| **Estimación (S/M/L)** | **M** en backlog; el alcance entregado (filtros, cascada multi-servicio, **PUT**/**DELETE**) justificó esfuerzo **medio–alto** en implementación. |
| **Prioridad** | **Alta** alineada con MVP y con la jerarquía de páginas del readme (§2.3). |
| **Inconsistencias detectadas** | **Cerrado:** OpenAPI con `GET`/`PUT`/`DELETE` en `/api/catalog/trees` y borrado masivo en media; **ADMIN** sobre cualquier ficha; galería en edición vía **HU-006** (**TASK-HU-006-14**). **Deuda MVP documentada:** rollback compensatorio tras borrado de fotos (escenario BDD 8); borrado Mongo real (**TASK-HU-015-01**); **TASK-HU-008-11** (IT catalog↔media) **rechazado**. |
| **Estado** | **Cerrada** — tickets en [HU-008-ticket-breakdown.md](HU-008-ticket-breakdown.md); verificación manual en [frontend/README.md](../../frontend/README.md) (apartado HU-008). |
| **Tamaño / división** | Entregado: edición, **baja** en cascada, **filtros** en listado, endpoints **catalog** + **media**, UI **Mis árboles** y edición; fotos en edición (**HU-006**); hook Mongo **stub**. |

---

## 2. Historia refinada

| Campo | Valor |
|-------|--------|
| **ID** | HU-008 |
| **Épica** | Catálogo colaborador |
| **Título** | Edición y baja de mis árboles |
| **Estimación de complejidad** | M |
| **Prioridad** | Alta |
| **Estado** | **Cerrada** |

**Historia de usuario**

Como colaborador autenticado, quiero modificar o eliminar únicamente los árboles que di de alta yo, para mantener actualizada mi documentación sin afectar el trabajo de otros.

- **Entregable de la historia:** Flujo vertical en **catalog-service**, **media-service** (borrado masivo de fotos por árbol) y **frontend** que permite al colaborador **listar y filtrar** sus fichas, **abrir una ficha en modo edición**, **persistir cambios** (**PUT**) y **eliminar físicamente** fichas propias (**DELETE** con cascada media → SQL → hook Mongo **stub**), respetando **R1**, **R2** y la **propiedad** (`usuario_app_id`; **ADMIN** sobre cualquier ficha). Si **media-service** falla al borrar fotos, el árbol **no** se elimina en PostgreSQL. **Rollback compensatorio** tras fotos borradas: **no** implementado en MVP (deuda documentada). **AUDITORIA_CATALOGO** (**R3**, [ADR-0004](../adr/0004-catalog-rest-write-and-audit.md)). Sin **`ARBOL_CREADO`** ni notificación en edición/baja (**R7**). Rutas: **`/my-trees`**, **`/trees/:id/edit`** (**HU-013**). Galería en edición: **[TASK-HU-006-14](HU-006-ticket-breakdown.md)** (**HU-006** cerrada). Desglose: **[HU-008-ticket-breakdown.md](HU-008-ticket-breakdown.md)**.

### Alcance

#### Incluye

- **Listado** vía `GET /api/catalog/trees` (paginación `page`/`size`):
  - **`COLABORADOR`:** solo fichas con **`usuario_app_id`** del actor.
  - **`ADMIN`:** puede listar fichas de **cualquier** colaborador; filtro adicional opcional por **usuario creador** (`createdByUserId` / `usuario_app_id` del autor de la ficha).
  - **Filtros opcionales** (colaborador y admin): por **especie** (`speciesId`); por **fecha de creación** — rango **desde** / **hasta** en formato **`date`** (ISO-8601, interpretación **UTC**); validar `desde` ≤ `hasta` (**400** si no).
- **UI Mis árboles:** controles de filtro (especie, fechas de creación; para **ADMIN**, selector de usuario creador) con peticiones cancelables (**HU-007/HU-008**).
- **Lectura de ficha** para edición: `GET /api/catalog/trees/{id}` con respuesta acorde a los campos editables del alta (**HU-005**): especie, provincia, coordenadas, municipio, descripción, altitud, estado de publicación y visibilidad en mapa público, en DTO de API (no entidad JPA expuesta).
- **Actualización** de ficha existente mediante **`PUT`** en `/api/catalog/trees/{id}` (esquema **`UpdateTreeRequest`** simétrico a **`CreateTreeRequest`** en [openapi.yaml](../api/openapi.yaml)); validaciones **R1** (especie en maestros) y **R2** (coordenadas del ejemplar).
- **Baja de ficha:** **`DELETE /api/catalog/trees/{id}`** con **borrado físico** de la fila `arbol` en PostgreSQL; misma regla de propiedad que la edición; confirmación en UI. **Orquestación en catalog-service** (sin saga en MVP):
  1. Si el árbol **tiene fotografías**, invocar **`DELETE /api/media/trees/{treeId}/photos`**; si **media-service** responde con error → **detener** el proceso (no se borra el árbol en PostgreSQL).
  2. Si no hay fotos, o tras borrado correcto de todas las fotos → **eliminar el árbol** en PostgreSQL (transacción catálogo).
  3. Invocar borrado Mongo — **[TASK-HU-015-01](HU-015-ticket-breakdown.md)** (entregado **stub/no-op** `NoOpTreeEnrichmentDeletionPort`; borrado real pendiente en **HU-015**).
  - Si falla el paso **2** o **3** tras haber borrado fotos en el paso **1** → en refinamiento se acordó **rollback**; en el **MVP entregado** no hay compensación automática (deuda; ver [services/README.md](../../services/README.md) apartado HU-008).
- **Autorización:** **`COLABORADOR`** solo puede leer, actualizar o eliminar árboles propios; **`ADMIN`** puede operar sobre cualquier ficha. Ficha ajena para colaborador → **403**; identificador inexistente → **404**. JWT y roles según [api-security.mdc](../../.cursor/rules/api-security.mdc).
- **Auditoría de catálogo** para modificación y baja (**R3**), con resumen técnico de ids (sin PII en `datos_*`), coherente con el patrón de alta documentado en ADR-0004.
- **Frontend:** vista **Mis árboles** y formulario de **edición** reutilizando patrones de **HU-005** (mapa OSM, validación, manejo de errores Problem, patrón de peticiones cancelables descrito en [frontend/README.md](../../frontend/README.md) para HU-007/HU-008).
- **Materialización de `usuario_app`** en lecturas/escritas cuando aplique la misma regla perezosa del alta (claims `email` / `profile`).

#### Queda fuera de esta historia

- **Alta** de nueva ficha (**HU-005**, **UC-03**).
- **Publicación a Kafka** y **notificación por correo** tras edición: en el MVP las modificaciones **no** activan **UC-09** ni **`ARBOL_CREADO`** ([kafka-events.md](../events/kafka-events.md), **R7**).
- **Subida y borrado de fotografías** en la pantalla de edición: cubierto por **[TASK-HU-006-14](HU-006-ticket-breakdown.md)** (**HU-006** cerrada); esta HU entrega la pantalla de datos de ficha y la galería integrada en `/trees/:id/edit`.
- **Consulta pública** ampliada de galerías (**HU-014**); la edición no implementa la experiencia completa del visitante.
- **Identificación por IA** en edición (**HU-009**, extensión **UC-05** sobre **UC-04**) y **chat** (**HU-010**).
- **Gestión de maestros** taxonómicos o geográficos (**HU-011**): la historia **consume** listas de especies/provincias ya expuestas, no las administra.
- **Consulta pública** de listados o detalle (**HU-002**, **HU-003**), salvo el efecto lateral de cambiar `publicationState` / visibilidad en mapa o de **eliminar** una ficha publicada.
- **Proyección o sincronización Mongo** en alta/edición: **[HU-015](HU-015-proyeccion-y-enriquecimiento-mongo.md)** (fuera del corte **HU-008** salvo el hook de borrado ya referenciado).

### Dependencias

- **Autenticación OIDC/JWT** y rol de colaborador (**HU-001**).
- **Alta de ficha** operativa (**HU-005**): existencia de árboles con `usuario_app_id` y contrato **`CreateTreeRequest`** como referencia de campos.
- **Estructura de rutas y guardas** (**HU-013**): `/my-trees`, `/trees/:id/edit` con `requiresAuth`.
- **Maestros** disponibles para selects (especie, provincia); gestión reservada a **HU-011**, consumo en formulario como en el alta.
- **API Gateway** enrutando `/api/catalog` con validación de JWT hacia **catalog-service**.
- **HU-006** / **[TASK-HU-006-14](HU-006-ticket-breakdown.md):** **cerrada** — galería en `/trees/:id/edit`.
- **HU-015** / **[TASK-HU-015-01](HU-015-ticket-breakdown.md):** borrado Mongo real pendiente; invocación desde baja de árbol con **stub** en este corte.

### Decisiones de refinamiento (registro)

| Tema | Decisión |
|------|----------|
| **Eliminación de ficha** | **Borrado físico** en PostgreSQL (`DELETE` del registro `arbol`). |
| **Fotografías** | Path fijo: **`DELETE /api/media/trees/{treeId}/photos`**. Si hay fotos, se invoca **antes** del borrado SQL; error en media → **parar** (no borrar árbol). Sin fotos → paso omitido. |
| **Mongo** | Al borrar el árbol se deben eliminar los documentos de enriquecimiento del ejemplar; en este corte: **stub/no-op** (`NoOpTreeEnrichmentDeletionPort`); implementación real en **[TASK-HU-015-01](HU-015-ticket-breakdown.md)** (**HU-015** pendiente). |
| **Rol ADMIN** | **`COLABORADOR`:** solo fichas propias (`usuario_app_id`). **`ADMIN`:** puede editar y eliminar **cualquier** ficha (alineado con permisos de fotos en **HU-006** y readme de alta/edición para administrador). La historia en formato “Como colaborador…” sigue describiendo el caso principal. |
| **Verbo HTTP de actualización** | MVP: solo **`PUT`** (reemplazo completo del cuerpo, esquema **`UpdateTreeRequest`** simétrico a **`CreateTreeRequest`**). **`PATCH`** queda fuera del primer corte. |
| **Campos inmutables** | **`usuario_app_id` / creador** no cambian en edición. Resto de campos del DTO de alta son editables, incluido `speciesId` y estado de publicación (sin bloqueo extra tras publicar en MVP). |
| **Errores de autorización** | **`404`** si no existe el `treeId`; **`403`** si existe pero el actor no tiene permiso (no propietario y no **ADMIN**). |
| **Listado colaborador** | `GET /api/catalog/trees`: paginación `page`/`size` (p. ej. `size=20`), orden **`modificado_en` desc**; filtros: **`speciesId`**, **`createdFrom`** / **`createdTo`** (`format: date`, **UTC**). |
| **Listado ADMIN** | Mismos filtros; además filtro opcional **`createdByUserId`** (`usuario_app_id` del colaborador que dio de alta la ficha). |
| **Borrado de fotos por árbol** | **`DELETE /api/media/trees/{treeId}/photos`** en **media-service**, consumido por **catalog-service**; ticket previsto **catalog + media** — tabla siguiente. |
| **Orden borrado en cascada** | (1) Fotos en media si existen → error media = **stop**; (2) árbol en PostgreSQL; (3) Mongo (**TASK-HU-015-01**). |
| **Fallo parcial tras fotos borradas** | Acordado **rollback** en refinamiento; **no implementado** en MVP entregado (deuda). Aborto si falla media **antes** del SQL: **sí** (implementado). |

### Desglose en tickets

Ver [HU-008-ticket-breakdown.md](HU-008-ticket-breakdown.md) (`TASK-HU-008-01` … `TASK-HU-008-16`). El trabajo **catalog + media** del borrado masivo queda en **TASK-HU-008-05**, **TASK-HU-008-06** y **TASK-HU-008-07**.

### Riesgos

| Riesgo | Mitigación acordada |
|--------|---------------------|
| **Contrato HTTP abierto** en `PUT` (`type: object`) | Cerrar **`UpdateTreeRequest`** y **`DELETE`** en OpenAPI en el mismo corte que la implementación. |
| **Borrado distribuido** (media + SQL + Mongo stub) | Orquestación en **catalog-service**; aborto si falla media; tests unitarios/WebMvc; **TASK-HU-008-11** (IT catalog↔media) **rechazado**; verificación manual en [frontend/README.md](../../frontend/README.md). |
| **TASK-HU-015-01 pendiente** | Stub/no-op y test de invocación al puerto Mongo; activar borrado real cuando exista capa Mongo. |
| **Filtros de fechas** | Parámetros tipo **`date`** en **UTC**; validar `createdFrom` ≤ `createdTo` con **400**. |
| **PUBLICADO → consulta pública** | Comportamiento esperado (**R7** sin correo en edición/baja); copy de confirmación en UI si se pasa a publicado o se elimina ficha visible. |
| **Concurrencia** (dos pestañas) | MVP: última escritura gana; sin bloqueo optimista. |

### Aclaraciones pendientes (refinamiento)

*Ninguna.* Refinamiento cerrado; desglose en [HU-008-ticket-breakdown.md](HU-008-ticket-breakdown.md).

## 3. Criterios de aceptación (BDD)

### Referencias

**UC-04**; reglas **R1**, **R2**, **R3**, **R7**; [use-case-summary.md](../use-cases/use-case-summary.md) (ediciones y bajas sin **UC-09**); readme §2.3 (rutas `/my-trees`, `/trees/:id/edit`); OpenAPI `GET|PUT|DELETE` en `/api/catalog/trees` y `/api/catalog/trees/{id}`; [ADR-0004](../adr/0004-catalog-rest-write-and-audit.md); [TASK-HU-006-14](HU-006-ticket-breakdown.md); [TASK-HU-015-01](HU-015-ticket-breakdown.md); autoría de referencia en `TreeMediaSubmissionPermissionService`.

### Escenario 1 — Edición correcta por el creador

- **Dado que** soy un colaborador autenticado y existe una ficha de árbol que creé yo (mi `usuario_app_id` coincide con el de la ficha)  
- **Cuando** envío una actualización con **especie** y **provincia** válidas en maestros, **coordenadas** válidas y el resto de campos permitidos por el contrato cerrado  
- **Entonces** recibo respuesta de éxito, los datos persistidos reflejan los cambios, queda traza de auditoría acorde a **R3** y **no** se publica en Kafka un mensaje **`ARBOL_CREADO`** ni se dispara notificación a suscriptores por esta operación (**R7**).

### Escenario 2 — Rechazo al intentar editar ficha ajena

- **Dado que** soy un colaborador autenticado y existe una ficha creada por otro colaborador  
- **Cuando** intento actualizar esa ficha por su identificador  
- **Entonces** la operación no modifica el árbol y recibo **403** (o el código acordado en implementación para falta de permiso), sin evento de notificación.

### Escenario 3 — Validación de negocio y ausencia de notificación

- **Dado que** soy el colaborador creador de la ficha  
- **Cuando** intento guardar cambios **sin** especie válida en maestros o **sin** coordenadas del ejemplar (**R1**, **R2**)  
- **Entonces** no se aplican los cambios y recibo un error de cliente coherente con Problem Details (**400**), sin publicar evento de alta hacia notificación.

### Escenario 4 — Baja física con cascada (fotos antes que árbol)

- **Dado que** soy el colaborador creador de una ficha que tiene fotografías asociadas  
- **Cuando** confirmo la eliminación de mi árbol  
- **Entonces** primero se invoca **`DELETE /api/media/trees/{treeId}/photos`** con éxito, después se elimina físicamente la ficha en PostgreSQL y, cuando **[TASK-HU-015-01](HU-015-ticket-breakdown.md)** esté implementado, sus enriquecimientos en Mongo; queda auditoría de baja (**R3**) y **no** hay notificación a suscriptores (**R7**).

### Escenario 5 — Abortar baja si falla media

- **Dado que** soy el creador de una ficha con fotografías y **media-service** responde con error al borrar las fotos  
- **Cuando** confirmo la eliminación del árbol  
- **Entonces** el proceso **se detiene**, el árbol **permanece** en PostgreSQL con sus fotos y recibo un error al cliente.

### Escenario 6 — Listado filtrado (colaborador)

- **Dado que** soy un colaborador autenticado con varias fichas propias  
- **Cuando** consulto **Mis árboles** con filtro por **especie** y/o rango de **fecha de creación** (`date`, UTC)  
- **Entonces** solo veo mis fichas que cumplen los criterios, sin árboles de otros usuarios.

### Escenario 7 — Listado ADMIN por usuario creador

- **Dado que** soy **ADMIN** y existen fichas de varios colaboradores  
- **Cuando** consulto el listado aplicando filtro por **usuario creador** (`createdByUserId`) además de especie y/o fechas  
- **Entonces** solo veo las fichas dadas de alta por ese colaborador que cumplen el resto de filtros.

### Escenario 8 — Rollback si falla el borrado SQL tras fotos *(deuda MVP; no implementado)*

- **Dado que** las fotografías del árbol se han borrado correctamente en **media-service**  
- **Cuando** falla el borrado del árbol en PostgreSQL (o el hook Mongo una vez implementado)  
- **Entonces** *(objetivo de refinamiento)* se aplicaría **rollback** de lo ejecutado, error al cliente y estado consistente. **En el MVP cerrado:** no hay compensación automática; queda como mejora futura (sin saga).

## 4. Evaluación INVEST (resumen)

| Criterio | Comentario |
|----------|------------|
| **Independiente** | Parcialmente: depende de identidad (**HU-001**), alta previa (**HU-005**) y rutas base (**HU-013**); no depende de Kafka ni notificaciones. |
| **Negociable** | Cerrado en *Decisiones de refinamiento* (filtros, cascada, path media, fechas UTC, filtro ADMIN por creador). |
| **Valiosa** | Sí: completa el ciclo colaborador (mantener y retirar documentación propia) tras el alta. |
| **Estimable** | Sí con reservas: backlog **M**; la baja y la coordinación con media/Mongo aumentan incertidumbre (valorar **L** en planificación). |
| **Small** | Límite alto: edición + baja con rollback + filtros + ticket **catalog + media**; acotado por **TASK-HU-006-14** y **TASK-HU-015-01**. |
| **Testable** | Sí: API (filtros, propiedad, baja, aborto por media), UI Mis árboles, tests automáticos y checklist manual HU-008; rollback (esc. 8) fuera del corte. |

## 5. Esfuerzo estimado de implementación

**Entregado** (orden de magnitud medio–alto frente al **M** del backlog): **catalog-service** (listado con filtros, GET por id, **PUT**, **DELETE** con orquestación), **media-service** (borrado masivo por árbol), **OpenAPI**, **frontend** (Mis árboles, edición, galería vía **HU-006**). Cifra en persona-días: **no fijada en fuentes**.
