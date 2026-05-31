# HU-006 — Desglose en tickets de trabajo (subida de fotografías al árbol)

| Campo | Valor |
|-------|--------|
| **Historia** | [HU-006 en backlog.md](backlog.md) (tabla §3) |
| **Refinamiento** | [HU-006-fotografias-asociadas-al-arbol.md](HU-006-fotografias-asociadas-al-arbol.md) |
| **Épica** | Fotografías |
| **Título HU** | Subida de fotografías al árbol |
| **Estado HU** | **Cerrada** (14/14 tickets **Hecho**) |

**Convención de ID de ticket:** `TASK-HU-006-<nn>`.

**Estado del ticket:** columna **Estado** en cada fila; valores recomendados **Pendiente** (por defecto), **En curso**, **Hecho**. Actualízala al cerrar o arrancar trabajo.

**Contexto de equipo:** un ingeniero/a **full-stack** con HTML/CSS sólidos; stack y arquitectura en [readme.md](../../readme.md). Se asume **HU-001** (auth OIDC/JWT) y **HU-005** (Alta de ejemplar con coordenadas y mapa en frontend) en estado utilizable para poder cerrar este flujo.

**Objetivo de este desglose:** cerrar un vertical de **subida y gestión** de fotografías (no consulta completa; lectura en **HU-014**) con `media-service` + MinIO + gateway: subida múltiple (máx. 10), validaciones MIME/tamaño (20 MB por defecto por foto), marca de foto principal (primera seleccionada), previsualización con EXIF en alta (**HU-005**) y **alta/baja** en edición de ficha (**HU-008**, **TASK-HU-006-14**).

**Reglas aplicables por capa (referencia rápida):**

- **Frontend:** [frontend-vue3.mdc](../../.cursor/rules/frontend-vue3.mdc), [frontend-ux.mdc](../../.cursor/rules/frontend-ux.mdc), [frontend-security.mdc](../../.cursor/rules/frontend-security.mdc)
- **Backend:** [spring-boot-4-backend.mdc](../../.cursor/rules/spring-boot-4-backend.mdc), [backend-generation-standard.mdc](../../.cursor/rules/backend-generation-standard.mdc)
- **API / contrato:** [api-design.mdc](../../.cursor/rules/api-design.mdc), [api-contract.mdc](../../.cursor/rules/api-contract.mdc), [openapi.yaml](../api/openapi.yaml)
- **Calidad / pruebas:** [quality-and-testing.mdc](../../.cursor/rules/quality-and-testing.mdc), [testing-java.md](../engineering/testing-java.md), [testing-frontend.md](../engineering/testing-frontend.md)

**Checks mínimos para cerrar tickets de esta HU:**

- Frontend: `npm run build` y `npm run test`
- Backend: `mvn -f services/pom.xml test` (y `verify` si se tocan `testIT`)
- Integración funcional: subida de 2+ fotos en alta y en edición, marca de principal persistida, validación de límite/MIME/tamaño, autocompletado EXIF en la primera imagen (alta) y borrado de una foto con confirmación en edición

---

## Orden sugerido (dependencias)

```mermaid
flowchart LR
  T01[TASK-01 modelo media] --> T02[TASK-02 config y validaciones]
  T02 --> T03[TASK-03 presign + confirmación]
  T03 --> T04[TASK-04 principal y orden]
  T04 --> T05[TASK-05 autorización por árbol]
  T03 --> T06[TASK-06 OpenAPI media]
  T07[TASK-07 componente upload+preview] --> T08[TASK-08 EXIF coord]
  T08 --> T09[TASK-09 integración create tree]
  T05 --> T09
  T06 --> T09
  T09 --> T10[TASK-10 tests backend]
  T09 --> T11[TASK-11 tests frontend]
  T10 --> T12[TASK-12 tests frontend]
  T11 --> T12
  T12 --> T13[TASK-13 docs HU-006]
  T08 --> T14[TASK-14 fotos edición HU-008]
  T05 --> T14
  T11 --> T14
```

---

## Tickets

### Media-service y persistencia (backend)

| ID | Título | Descripción breve | Estado |
|----|--------|-------------------|--------|
| **TASK-HU-006-01** | Modelo relacional de fotografía en esquema `media` | Definir/ajustar migración Flyway para metadatos de foto asociados a `ejemplar_id` con campos mínimos: identificador, clave de objeto, MIME, tamaño bytes, orden, `es_principal`, autor y timestamps. Mantener PK numérica y convenciones de esquema del proyecto. | Hecho |
| **TASK-HU-006-02** | Configuración de límites y validación de archivo | Añadir propiedades de aplicación en `media-service` para `max-file-size` (default 20 MB), MIME permitidos (`image/jpeg`, `image/png`, `image/webp`) y máximo 10 fotos por árbol. Validar en backend antes de confirmar registro de metadatos. | Hecho |
| **TASK-HU-006-03** | Flujo API de presign + confirmación de metadatos | Implementar endpoints bajo `/api/media` para solicitar URL prefirmada de subida y confirmar/persistir metadatos tras subida. Error handling con `application/problem+json`, sin exponer detalles internos de MinIO/S3. | Hecho |
| **TASK-HU-006-04** | Regla de foto principal y orden de selección | Persistir la primera foto seleccionada como principal. Asegurar consistencia para cargas múltiples en la misma operación (orden estable) y para operaciones posteriores sobre el mismo árbol (sin duplicar principales activas). | Hecho |
| **TASK-HU-006-05** | Autorización por rol y árbol objetivo | Validar que solo `COLABORADOR` o `ADMIN` autenticados con permiso sobre el árbol pueden subir/confirmar fotos. Alinear con reglas de alta/edición en catálogo y con JWT de gateway. | Hecho |

### Contrato y gateway

| ID | Título | Descripción breve | Estado |
|----|--------|-------------------|--------|
| **TASK-HU-006-06** | Cierre OpenAPI para HU-006 | Sustituir esquemas genéricos en `/api/media/uploads/presign` y `/api/media/photos/{photoId}` (o endpoints definitivos) por DTOs concretos: request/response de presign, confirmación de metadatos, límites/validaciones y errores esperados (400/401/403/404). | Hecho |
| **TASK-HU-006-07** | Verificación de enrutado gateway `/api/media` | Confirmar mapeo del API Gateway hacia `media-service`, propagación de JWT y CORS necesario para subida desde SPA en entorno local con MinIO. | Hecho |

### Frontend (subida múltiple + EXIF en alta)

| ID | Título | Descripción breve | Estado |
|----|--------|-------------------|--------|
| **TASK-HU-006-08** | Componente de selección y previsualización antes de subida | Crear/completar componente UI en frontend para seleccionar múltiples imágenes (máx. 10), mostrar previsualización local y orden de selección; la primera se marca visualmente como principal. Validaciones cliente para MIME y tamaño. | Hecho |
| **TASK-HU-006-09** | Lectura EXIF y sobrescritura de coordenadas | Al cargar la primera imagen, leer EXIF en cliente; si lat/lon son válidas, sobrescribir los campos de coordenadas de la pantalla de alta y actualizar marcador en mapa. Manejar casos sin EXIF o EXIF inválido sin bloquear subida. | Hecho |
| **TASK-HU-006-10** | Integración de subida con flujo de Alta de ejemplar | Integrar el componente en la pantalla de alta (HU-005): solicitar presign, subir a MinIO y confirmar metadatos en `media-service` para el árbol correspondiente, con mensajes UX claros de éxito/error/reintento. | Hecho |

### Calidad y documentación

| ID | Título | Descripción breve | Estado |
|----|--------|-------------------|--------|
| **TASK-HU-006-11** | Pruebas backend de validación y permisos | Pruebas unitarias + integración (`Test`/`IT` según capa): límites MIME/tamaño, máximo 10 fotos, autorización por rol/árbol, persistencia de `es_principal` y errores RFC 9457. | Hecho |
| **TASK-HU-006-12** | Pruebas frontend del componente y EXIF | Tests de composable/componente (Vitest): selección múltiple, bloqueo por límite/MIME/tamaño, marcaje de principal y sobrescritura de coordenadas cuando EXIF válido en primera imagen. | Hecho |
| **TASK-HU-006-13** | Documentación técnica del corte HU-006 | Actualizar docs afectados (OpenAPI ya cubierto en TASK-06, más README/engineering si aplica) con propiedades configurables, secuencia presign->upload->confirmación y criterio de principal/EXIF. | Hecho |

### Ampliación — fotos en pantalla de edición (HU-008)

Depende de que exista la pantalla de edición de ficha en **HU-008** (`/ejemplares/:id/edit`, listado **Mis árboles**). Reutiliza el componente de subida de **TASK-HU-006-08** y el flujo presign → MinIO → confirmación de **TASK-HU-006-03**.

| ID | Título | Descripción breve | Estado |
|----|--------|-------------------|--------|
| **TASK-HU-006-14** | Alta y baja de fotografías desde la edición de Mis árboles | **Backend (`media-service`):** **`DELETE /api/media/photos/{photoId}`** (contrato **TASK-HU-008-01**), borrado metadatos + objeto, autorización **TASK-HU-006-05**; al borrar la principal, promover otra como `es_principal`. **Frontend:** galería en `/ejemplares/:id/edit` con añadir (presign/confirmación, `startOrden`) y eliminar con diálogo de confirmación. **Pruebas:** `MediaPhotoDeleteServiceTest`, WebMvc delete, Vitest (`useEditTreeForm.test.ts`). | Hecho |

---

## Qué puede quedar para después (sigue siendo MVP global, no este corte)

- Reordenación manual de galería y cambio explícito de foto principal tras la subida inicial (distinto del recálculo al borrar en **TASK-HU-006-14**).
- Transformación de imágenes (resize, thumbnails, optimización, CDN).
- Consulta pública/privada completa de fotos y enlaces de lectura firmados (cubierto en **HU-014**).

## Dependencias externas a esta HU

- **HU-001:** autenticación OIDC/JWT y roles operativos.
- **HU-005:** flujo de Alta de ejemplar disponible para asociar fotos y reutilizar mapa/coordenadas.
- **HU-008:** **cerrada** — pantalla de edición (`/ejemplares/:id/edit`) y listado **Mis árboles** operativos para **TASK-HU-006-14**.
- **Infra Compose:** MinIO, Postgres y gateway operativos según [infra/compose/README.md](../../infra/compose/README.md).

## Cierre sugerido (definición de “hecho” para el corte)

Usuario `COLABORADOR` o `ADMIN` autenticado, sobre un árbol autorizado, puede: (1) en **alta**, seleccionar hasta 10 fotos (`jpeg/png/webp`), ver previsualización previa, obtener autocompletado EXIF en la primera imagen y subir vía presign → MinIO → confirmación; (2) en **edición**, añadir fotos adicionales (respetando el máximo) y eliminar una foto con confirmación, con promoción automática de principal si aplica. Persistencia en `media-service`, una única foto principal por árbol y validaciones de seguridad/tamaño/MIME cubiertas por tests. Consulta de galería en detalle público: **HU-014**.
