# HU-016 — Consulta de características de especie (ADMIN, MVP)

## 1. Validación de la información existente

| Aspecto | Estado |
|---------|--------|
| **Título** | *Consulta de características de especie (ADMIN, MVP)* — alineado con readme §2 (Integración con IA) y §3.1.4. |
| **Formato “Como… quiero… para…”** | Definido en [backlog.md](backlog.md) §3. |
| **Estimación (S/M/L)** | **M** — orquestación en **ai-assistant-service**, contrato API, UI acotada en administración de maestros, auditoría **AUDITORIA_USO_IA** y persistencia mínima en Mongo (`especie_detalle`). |
| **Prioridad** | **Media** — única capacidad de IA del MVP; no bloquea consulta pública ni catálogo colaborador. |
| **Alcance MVP vs futuro** | **HU-009** (identificación por imagen, UC-05) y **HU-010** (chat, UC-06) quedan en **Próxima versión**; rutas de producto `/ai/identify` y `/ai/chat` sin implementar en este corte. |
| **Tamaño / división** | Historia acotada; desglose en tickets tras refinamiento (OpenAPI, backend IA, UI admin, Mongo/auditoría). |

---

## 2. Historia refinada

| Campo | Valor |
|-------|--------|
| **ID** | HU-016 |
| **Épica** | Inteligencia artificial |
| **Título** | Consulta de características de especie (ADMIN, MVP) |
| **Estimación de complejidad** | M |
| **Prioridad** | Media |

**Historia de usuario**

Como usuario con rol **ADMIN**, quiero consultar o solicitar el enriquecimiento con IA de las características de una especie ya registrada en el catálogo taxonómico, para disponer de información ampliada (hábitat, distribución, datos ecológicos, referencias, etc.) como apoyo a la gestión de maestros, sin que el sistema presente la respuesta como veredicto científico ni exponga esta función a colaboradores en el MVP.

- **Entregable de la historia:** flujo **ADMIN** (p. ej. desde `/admin/masters` o pantalla asociada) que invoca **ai-assistant-service** con el identificador de especie (`especie_id` / `especie_pg_id`), obtiene o muestra el documento enriquecido según [mongo.md](../data-model/mongo.md) (`especie_detalle`), registra trazabilidad en **AUDITORIA_USO_IA** (`subject_oidc` del JWT) y deja el contrato en [openapi.yaml](../api/openapi.yaml).

### Alcance

#### Incluye

- **Solo rol ADMIN** (JWT con rol de administración); **403** para colaborador u otros roles.
- Consulta de características de **especie** (no de ejemplar/árbol en este MVP).
- Orquestación en **ai-assistant-service** hacia proveedor de IA externo; lectura del nombre científico (y contexto mínimo) desde **catalog-service**.
- Persistencia o actualización del documento **`especie_detalle`** en MongoDB (campos acordados en `mongo.md`: p. ej. `distribucion`, `datos_ecologicos`, `referencias`, `sinonimos`).
- **Auditoría R3** en esquema `ai` (**AUDITORIA_USO_IA**: `subject_oidc`, `tipo_uso_ia`, resumen de prompt/resultado, `consultado_en`).
- Mensaje de producto: IA **orientativa** ([product-context](../../.cursor/rules/product-context.mdc)); sin veredictos definitivos en UI.
- Contrato HTTP bajo `/api/ai/**` (ruta concreta a cerrar en refinamiento; p. ej. consulta por `speciesId`).

#### Queda fuera de esta historia

- **Identificación orientativa por imagen** (**HU-009**, UC-05, `/ai/identify`, `POST /api/ai/species-identification`).
- **Chat asistido** (**HU-010**, UC-06, `/ai/chat`, `POST /api/ai/chat`).
- Enriquecimiento de **ejemplar** / notas de campo (`ejemplar_detalle`, observaciones embebidas) — alcance **HU-015** u otra historia.
- Acceso de **colaborador** a funciones de IA en alta/edición de árbol.
- Sincronización automática masiva de todas las especies del catálogo (batch); el MVP puede limitarse a **bajo demanda** por especie seleccionada por el ADMIN.

### Dependencias

- **HU-001** (JWT, rol **ADMIN**).
- **HU-011** (especies en catálogo SQL; pantalla `/admin/masters`).
- **HU-013** (navegación y guardas por rol).
- Infra: **MongoDB**, **ai-assistant-service**, gateway `/api/ai/**`.
- Coordinación con **HU-015** si la capa de acceso Mongo o la invalidación de proyecciones se implementan allí primero; en ese caso **HU-016** puede consumir el puerto/repositorio definido por **HU-015** o incluir un corte mínimo de escritura en `especie_detalle` documentado en el desglose.

### Riesgos

- **Coste y límites** del proveedor de IA (cuotas, timeouts); definir límites por ADMIN en refinamiento.
- **Calidad alucinaciones:** mitigar con copy de producto y revisión humana del ADMIN.
- **Desalineación SQL/Mongo** si se renombra especie en **HU-011** sin invalidar `especie_detalle` (deuda **HU-015**).

### Aclaraciones pendientes (refinamiento)

- Path y verbo exactos en OpenAPI (p. ej. `GET` vs `POST` para disparar enriquecimiento).
- Comportamiento si ya existe `especie_detalle`: mostrar cache, refrescar con IA, o ambos.
- Campos mínimos obligatorios en la respuesta y en el documento Mongo del primer corte.
- Relación de tickets con **HU-015** (quién implementa el repositorio Mongo).

## 3. Criterios de aceptación (BDD)

### Referencias

readme §2, §3.1.4; [mongo.md](../data-model/mongo.md) (`especie_detalle`); [data-model.md](../data-model/data-model.md) **R3**; [openapi.yaml](../api/openapi.yaml); **HU-011**; [product-context.mdc](../../.cursor/rules/product-context.mdc).

### Escenario 1 — ADMIN consulta características de una especie existente

**Dado** un usuario autenticado con rol **ADMIN** y una especie con `especie_id` válido en catálogo  
**Cuando** solicita la consulta/enriquecimiento de características de esa especie  
**Entonces** el sistema devuelve información ampliada (desde Mongo y/o tras invocar al proveedor de IA)  
**Y** registra una entrada en **AUDITORIA_USO_IA** con el `subject_oidc` del token  
**Y** la UI indica que el contenido es orientativo, no determinación oficial.

### Escenario 2 — Colaborador no puede usar la función

**Dado** un colaborador autenticado sin rol **ADMIN**  
**Cuando** intenta invocar el endpoint de características de especie por IA  
**Entonces** recibe **403 Forbidden** (Problem Details).

### Escenario 3 — Especie inexistente

**Dado** un **ADMIN** autenticado  
**Cuando** solicita características para un `speciesId` inexistente en catálogo  
**Entonces** recibe **404 Not Found** (o error acordado en contrato) sin llamar al proveedor de IA.

---

## 4. Enlaces

- Backlog: [backlog.md](backlog.md) §3 (**HU-016**).
- Próximas versiones: **HU-009**, **HU-010**.
- Maestros: **HU-011**; Mongo: **HU-015**.
