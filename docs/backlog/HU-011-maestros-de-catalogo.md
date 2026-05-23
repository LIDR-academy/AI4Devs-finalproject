# HU-011 — Maestros de catálogo

## 1. Validación de la información existente

| Aspecto | Estado |
|---------|--------|
| **Título** | Correcto y alineado con el backlog: *Maestros de catálogo* (alcance operativo: maestros **taxonómicos**). |
| **Formato “Como… quiero… para…”** | Correcto en el backlog; coherente con **R8** y **UC-07** (solo taxonomía; provincias fuera). |
| **Estimación (S/M/L)** | Revisada a **M**: tres tablas pequeñas, patrones reutilizables del catálogo y UI admin acotada a una pantalla de especie con altas auxiliares; ver desglose [HU-011-ticket-breakdown.md](HU-011-ticket-breakdown.md). |
| **Prioridad** | **Media** coherente con el backlog; no se modifica. |
| **Inconsistencias detectadas (corregidas)** | Provincias excluidas del mantenimiento admin; estimación ajustada de **L** a **M**; aclaraciones de refinamiento cerradas en §2 (decisiones) y tickets **TASK-HU-011-01** en adelante. |
| **Tamaño / división** | Historia **M**, acotada por matriz CRUD y UI única; no requiere división en varias HUs. |

---

## 2. Historia refinada

| Campo | Valor |
|-------|--------|
| **ID** | HU-011 |
| **Épica** | Administración |
| **Título** | Maestros de catálogo |
| **Estimación de complejidad** | M |
| **Prioridad** | Media |

**Historia de usuario**

Como usuario con rol administrador, quiero gestionar los datos de referencia taxonómicos del catálogo —familia, género y especie— que alimentan las fichas de árbol, para mantener un vocabulario compartido coherente reservado a administración e incorporar nuevos registros al sistema.

- **Entregable de la historia:** Capacidad para un **ADMIN** autenticado de **dar de alta y editar especies** y de **dar de alta familia y género** cuando falten en los desplegables, en **catalog-service** y pantalla `/admin/masters`, con trazas **AUDITORIA_CATALOGO** (**R3**), invalidación de caché de especies tras escrituras y contrato **OpenAPI** cerrado. Desglose: [HU-011-ticket-breakdown.md](HU-011-ticket-breakdown.md).

### Alcance

#### Incluye

- **Gestión administrativa (UC-07)** de maestros **taxonómicos** (**R8**), solo rol **ADMIN**, según matriz CRUD acordada (§ decisiones).
- **API de escritura** en **catalog-service** con validación alineada a columnas SQL (`V1__baseline.sql`), autorización **ADMIN** y errores **Problem** (RFC 9457); contrato en [openapi.yaml](../api/openapi.yaml) (**TASK-HU-011-01**).
- **Auditoría (R3)** en altas/modificaciones/bajas de especie y altas de familia/género.
- **Invalidación de caché** Redis de lecturas unpaged de especies tras escrituras (**TASK-HU-011-05**).
- **Interfaz única** en `/admin/masters`: listado y formulario de **alta/edición de especie**; botón **+** junto al combo de **género** (popup de alta de género, y dentro de él **+** para alta de **familia**); sin edición ni baja de familia/género en UI ni API en el MVP.

#### Queda fuera de esta historia

- **Provincias:** solo lectura y semillas Flyway.
- **Modificación o baja** de **familia** y **género** (MVP).
- **Sincronización Mongo** al renombrar especie (**HU-015**): fuera del MVP; renombre en SQL sin invalidar proyecciones Mongo.
- Semillas Flyway iniciales, CRUD de árboles, suscripciones, IA, importación masiva.

### Dependencias

- **HU-001** (JWT **ADMIN**), lecturas existentes (`GET /api/catalog/species`), semillas **V2**, **HU-013** (ruta `/admin/masters`).

### Riesgos

- **Caché** obsoleta si falla la evicción (mitigado por **TASK-HU-011-05**).
- **Baja de especie** con fichas referenciadas: debe rechazarse de forma explícita (**409** o **400** acordado en contrato).

### Decisiones de refinamiento (registro)

| Tema | Decisión MVP |
|------|----------------|
| **Contrato OpenAPI** | Ticket **TASK-HU-011-01**: rutas, verbos, esquemas request/response y códigos de error. |
| **Matriz CRUD** | **Familia** y **género:** solo **POST** (alta). **Especie:** **POST**, **PUT** (edición) y **DELETE**; **no** se permite **DELETE** de especie si existe **FK** desde `arbol.especie_id`. **Familia**/**género:** sin **PUT** ni **DELETE** en MVP. |
| **Campos obligatorios** | Derivados de SQL: **familia** — `nombre_cientifico` (NOT NULL); **género** — `familia_id`, `nombre_cientifico`; **especie** — `genero_id`, `nombre_cientifico`. `nombre_comun` opcional en las tres tablas. |
| **UI admin** | **Una pantalla** de listado + alta/edición de **especie**. Combo **género** con **+** → popup alta género (selector familia + campos); en ese popup, combo **familia** con **+** → popup alta familia. Tras alta exitosa, refrescar combo y seleccionar el nuevo ítem. Sin pantallas ni acciones de editar/borrar familia o género. |
| **Caché Redis** | Ticket **TASK-HU-011-05**: `@CacheEvict` (o equivalente) en escrituras que afecten al listado unpaged de especies. |
| **Mongo / HU-015** | Renombrar especie en PostgreSQL **no** dispara actualización de documentos Mongo en el MVP; deuda explícita para **HU-015**. |

### Aclaraciones pendientes (refinamiento)

Ninguna: cerradas en la tabla anterior y en [HU-011-ticket-breakdown.md](HU-011-ticket-breakdown.md).

## 3. Criterios de aceptación (BDD)

### Referencias

**UC-07**; **R1**, **R3**, **R8**, **R9**; [data-model.md](../data-model/data-model.md); `V1__baseline.sql`; [HU-011-ticket-breakdown.md](HU-011-ticket-breakdown.md).

### Escenario 1 — Alta de especie con género y familia auxiliares

- **Dado que** soy **ADMIN** autenticado  
- **Cuando** en `/admin/masters` doy de alta una **especie** y, mediante **+** en los combos, creo antes un **género** y una **familia** que no existían  
- **Entonces** quedan persistidos familia, género y especie con PK numéricas (**R9**), la especie aparece en `GET /api/catalog/species`, se registra auditoría (**R3**) y la caché unpaged de especies se invalida.

### Escenario 2 — Rechazo a roles no administradores

- **Dado que** los endpoints de escritura taxonómica exigen **ADMIN**  
- **Cuando** un usuario sin ese rol invoca alta/edición/baja de maestros  
- **Entonces** recibo **401** o **403** en **Problem** y no hay cambios ni auditoría de escritura.

### Escenario 3 — Baja de especie bloqueada por fichas de árbol

- **Dado que** existe una **especie** referenciada por al menos un registro en `arbol`  
- **Cuando** un **ADMIN** solicita **DELETE** de esa especie  
- **Entonces** la operación no elimina la fila y recibo error de cliente coherente con el contrato (p. ej. **409**), sin incoherencia respecto a **R1**.

## 4. Evaluación INVEST (resumen)

| Criterio | Comentario |
|----------|------------|
| **Independiente** | Parcialmente: depende de **HU-001** y lecturas/semillas existentes. |
| **Negociable** | Acotada: CRUD de familia/género limitado a alta; Mongo fuera del corte. |
| **Valiosa** | Sí: **UC-07** y mantenimiento taxonómico operativo. |
| **Estimable** | Sí: **M** con tickets definidos. |
| **Small** | Sí para un sprint con alcance MVP acordado. |
| **Testable** | Sí: API, UI, auditoría, evicción de caché y regla FK en baja. |

## 5. Esfuerzo estimado de implementación

Orden de magnitud **medio** (**M**): **catalog-service** (escritura taxonómica acotada, auditoría, caché), **frontend** (pantalla única con popups), **OpenAPI** y pruebas. Ver [HU-011-ticket-breakdown.md](HU-011-ticket-breakdown.md).
