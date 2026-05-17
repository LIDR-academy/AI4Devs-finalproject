# HU-006 — Subida de fotografías al árbol

## 1. Validación de la información existente

| Aspecto | Estado |
|---------|--------|
| **Título** | Correcto y alineado con el backlog: *Subida de fotografías al árbol*; la **consulta** queda en **HU-014**. |
| **Formato “Como… quiero… para…”** | Correcto; **usuario autenticado** con acceso de edición según rol (**COLABORADOR** y **ADMIN**, coherente con readme y fila de [backlog.md](backlog.md)); subida segura y visibilidad alineadas a las reglas de fotografía del modelo de datos. |
| **Estimación (S/M/L)** | **M** coherente con alcance típico de primer corte (presign, persistencia de metadatos, bucket MinIO, UI mínima). |
| **Prioridad** | **Alta** alineada con MVP. |
| **Inconsistencias detectadas** | **Cerrado** (TASK-HU-006-06): contrato media en [openapi.yaml](../api/openapi.yaml); guía: [media-upload-hu006.md](../engineering/media-upload-hu006.md). Ampliación edición (**TASK-HU-006-14**): cerrada. |
| **Estado** | **Cerrada** (tickets en [HU-006-ticket-breakdown.md](HU-006-ticket-breakdown.md)) |
| **Tamaño / división** | Adecuado para **M** si se acota a usuarios autenticados con permiso sobre la ficha (**COLABORADOR** y **ADMIN**), metadatos en `media-service` y subida a MinIO vía gateway; riesgo de crecimiento si se mezcla la galería de consulta (**HU-014**) o tratamiento de imágenes en la misma entrega. |

---

## 2. Historia refinada

| Campo | Valor |
|-------|--------|
| **ID** | HU-006 |
| **Épica** | Fotografías |
| **Título** | Subida de fotografías al árbol |
| **Estimación de complejidad** | M |
| **Prioridad** | Alta |

**Historia de usuario**

Como usuario autenticado, quiero asociar una o varias fotografías a los árboles a los que tengo acceso de edición según mi rol (colaborador que documenta ejemplares o administrador), para completar la ficha del ejemplar con material visual almacenado de forma segura en el sistema.

- **Entregable de la historia:** Flujo vertical mínimo en el que **media-service** (Spring Boot, esquema **`media`** en PostgreSQL, integración **AWS SDK v2** con almacén **S3-compatible**) expone bajo el **API Gateway** las operaciones previstas en el contrato para **solicitar subida prefirmada** y **persistir o confirmar metadatos** asociados al objeto subido; los binarios residen en **MinIO** en desarrollo, sin credenciales de bucket en el cliente. Pueden usarlo los roles **COLABORADOR** y **ADMIN** autenticados, alineado con el readme (misma franja de acceso que **alta y edición de árbol**): cada uno solo puede iniciar subidas asociadas a árboles para los que el sistema conceda permiso según rol y política de propiedad o administración. La fotografía hereda la visibilidad de la ficha/árbol (R4–R5), sin selector independiente por imagen en el MVP. El usuario puede subir varias fotografías y la primera seleccionada queda marcada como **principal** en base de datos para su reutilización en otros casos de uso.

### Alcance

#### Incluye

- Existencia operativa de **media-service** en el monorepo `services/`, alineado con la tabla de microservicios del readme (JPA, Flyway en esquema `media`, uso de API S3 hacia MinIO).
- Flujo de **subida directa al bucket**: el cliente autenticado obtiene URL **prefirmada** vía API bajo `/api/media` (según OpenAPI), sube el objeto al almacén y el servicio registra **metadatos** (incluida asociación al árbol, tipo de contenido, tamaño, clave de objeto, orden, indicador de foto principal o campos mínimos acordados en implementación). La visibilidad de la foto se deriva del árbol, sin categoría manual por imagen.
- Límite de tamaño de archivo por fotografía configurable como propiedad de aplicación con valor por defecto de **20 MB** en MVP.
- Máximo de **10 fotografías por árbol** en el primer release.
- Tipos MIME permitidos en MVP: `image/jpeg`, `image/png` e `image/webp`.
- Comunicación del entorno local con **MinIO** según la infraestructura descrita en el readme y en `infra/compose` (almacenamiento de objetos para imágenes en desarrollo).
- Autorización por **JWT** en las rutas de media que lo exijan, coherente con el gateway y con el hecho de que las fotografías enlazan con fichas de catálogo existentes.
- Criterios de visibilidad de fotografías alineados a la **matriz** documentada en el modelo de datos (solo **PUBLIC** y **PRIVATE**, heredados de la ficha/árbol; no parametrizados por foto en esta HU).
- Componente de **previsualización previa a subida a MinIO** en la pantalla de alta: al cargar la primera imagen, el cliente lee metadatos de imagen y, si existen latitud y longitud válidas, **sobrescribe** los campos de coordenadas de la pantalla y posiciona el marcador en el mapa.
- **Alta y baja de fotos en edición** (`/trees/:id/edit`): presign → MinIO → confirmación para añadir; `DELETE` de una foto con confirmación UX y promoción de principal (**TASK-HU-006-14**).

#### Queda fuera de esta historia

- Definición y gestión de **maestros** taxonómicos o geográficos (**HU-011**).
- **Alta o edición** de la ficha de árbol sin la parte de fotos (**HU-005**, **HU-008**) más allá de la **dependencia** de que exista un árbol identificable para asociar la fotografía.
- **Notificaciones** por correo o consumo de eventos Kafka de notificación (**HU-007**).
- **Identificación por IA** a partir de la imagen (**HU-009**) y **chat** (**HU-010**).
- **Consulta**, listado y visualización de galerías en detalle público o en contexto autenticado (**HU-014**), incluida la experiencia completa del visitante frente a fotos **PUBLIC** / **PRIVATE**.
- Reordenación manual de galería y cambio explícito de foto principal tras la subida inicial (el recálculo al borrar una foto en edición sí está en **TASK-HU-006-14**, cerrado).

### Dependencias

- **Identidad y sesión** (**HU-001**): token de acceso para llamadas autenticadas al gateway y hacia **media-service**.
- **Ficha de árbol** creada en catálogo (**HU-005**): identificador de árbol válido para asociar metadatos de fotografía salvo que el diseño permita metadatos previos a la existencia del árbol (no indicado en fuentes; por defecto se asume árbol existente).
- **API Gateway** enrutando **`/api/media`** hacia **media-service**, según arquitectura del readme.
- **Infraestructura**: PostgreSQL con esquema `media`, **MinIO** y variables de entorno acordes en Compose y documentación de servicios.

### Riesgos

- **Contrato HTTP (presign / confirm):** cerrado en OpenAPI (TASK-HU-006-06); flujo y propiedades operativas en [media-upload-hu006.md](../engineering/media-upload-hu006.md).
- **Autoría y permisos:** reglas distintas por rol (p. ej. colaborador frente a árbol ajeno frente a **ADMIN**); deben quedar explícitas en implementación y pruebas, en coherencia con la matriz del readme (alta y edición de árbol para colaborador y administrador).
- **Ventana de la URL prefirmada** y reintentos: UX y seguridad si la subida falla o caduca.
- **Extracción de metadatos EXIF** en cliente: no todas las imágenes incorporan GPS; además puede haber diferencias de formato entre dispositivos.
- **Foto principal**: riesgo de inconsistencias si se permite borrar o reordenar imágenes sin recalcular cuál queda marcada como principal.
- **Alineación R4–R5** con **HU-014**: los endpoints y la UI de **lectura** masiva o en detalle público deben cerrarse en la otra historia; aquí solo hace falta no contradecir el modelo de visibilidad.

### Decisiones de refinamiento (registro)

Resumen técnico actualizado: [media-upload-hu006.md](../engineering/media-upload-hu006.md). Contrato: [openapi.yaml](../api/openapi.yaml).

- Límite de tamaño fijado en **20 MB por fotografía** con configuración por propiedad de aplicación.
- Número máximo de fotografías por árbol fijado en **10** para el primer release.
- Tipos MIME permitidos en contrato: `image/jpeg`, `image/png`, `image/webp`.
- Detalle del **JSON de presign** y del **DTO de metadatos** de fotografía en OpenAPI (campos obligatorios, indicador de foto principal y herencia de visibilidad desde árbol, sin enumeración por imagen). **Implementado** en `docs/api/openapi.yaml` (operaciones media).
- Matriz concreta cuando **ADMIN** asocia fotos a un árbol creado por otro colaborador (permitido en MVP, condiciones o mismos endpoints que el colaborador con comprobación de rol en backend).
- Regla de EXIF cerrada: si la primera imagen tiene latitud y longitud válidas, **sobrescribe** los valores actuales de coordenadas en pantalla.
- En la primera versión la visibilidad de las fotografías se hereda de la visibilidad del árbol: las fotografías de un árbol público tienen visibilidad pública

## 3. Criterios de aceptación (BDD)

### Referencias

Readme (microservicio **media-service**, **MinIO**, enrutado `/api/media`); [docs/api/openapi.yaml](../api/openapi.yaml) (`/api/media/uploads/presign`, `/api/media/photos/confirm`, …); [docs/engineering/media-upload-hu006.md](../engineering/media-upload-hu006.md); [docs/data-model/data-model.md](../data-model/data-model.md) (reglas R4 y R5 y matriz de visibilidad); épicas en [backlog.md](backlog.md); dependencia de ficha de árbol (**HU-005**).

### Escenario 1 — Subida múltiple autorizada con foto principal

- **Dado que** soy un usuario autenticado con rol **COLABORADOR** o **ADMIN** y un árbol al que, según la política del producto, puedo asociar fotografías  
- **Cuando** selecciono varias imágenes válidas (máximo 10, MIME permitido y tamaño dentro de límite) y comienzo la subida  
- **Entonces** el sistema procesa la subida sin exponer credenciales de bucket, registra metadatos por cada imagen y marca en base de datos como **principal** la primera seleccionada.

### Escenario 2 — Herencia de visibilidad y previsualización con metadatos

- **Dado que** cargo la primera imagen en el componente de previsualización de la pantalla de alta  
- **Cuando** la imagen contiene metadatos de latitud y longitud  
- **Entonces** la interfaz sobrescribe las coordenadas actuales de la ficha y posiciona el marcador en el mapa; al persistir la fotografía, su visibilidad se hereda del árbol (R4–R5) sin selector manual por imagen.

### Escenario 3 — Rechazo por permisos o tamaño inválido

- **Dado que** soy un usuario autenticado **sin** permiso de subida sobre el árbol indicado, o un cliente **sin** credenciales en rutas que exijan JWT, según el caso  
- **Cuando** intento solicitar una subida sobre un árbol no autorizado o de una imagen que supera el límite de tamaño configurado  
- **Entonces** la operación no tiene efecto no autorizado y recibo un error coherente con la convención de errores de la API, sin filtrar detalles internos del almacén.

## 4. Evaluación INVEST (resumen)

| Criterio | Comentario |
|----------|------------|
| **Independiente** | Parcialmente: depende de identidad, gateway y existencia de árbol en catálogo; el valor de medios es entregable como vertical propio una vez exista la ficha. |
| **Negociable** | Sí: cierre fino del contrato JSON (presign/confirmación y errores), y detalle UX de mensajes de validación en cliente para límite de 10, MIME y tamaño. |
| **Valiosa** | Sí: completa la promesa del producto de documentar ejemplares con imágenes almacenadas de forma segura. |
| **Estimable** | Sí: el backlog marca **M**; la incertidumbre principal es el cierre del contrato y detalles de UX/validación en subida múltiple y EXIF. |
| **Small** | Razonable para **M** si no se mezcla IA, notificaciones ni la galería de lectura (**HU-014**) en la misma historia. |
| **Testable** | Sí: pruebas de API, permisos y comprobación de objeto en MinIO en entorno de integración o testcontainers según política del equipo. |

## 5. Esfuerzo estimado de implementación

Orden de magnitud **medio (M)** para el MVP: arranque de **media-service** (proyecto Maven, configuración S3/MinIO, Flyway en esquema `media`), implementación de **presign** y persistencia de metadatos (incluida marca de foto principal), enrutado en **api-gateway**, ajuste de **OpenAPI**, validación de tamaño por propiedad de aplicación (default 20 MB), lectura EXIF en cliente para autocompletar coordenadas de la primera imagen y pruebas automatizadas mínimas. Cifra en persona-días: **no fijada en fuentes**; depende del equipo y del alcance exacto de UX de subida en el mismo entregable.
