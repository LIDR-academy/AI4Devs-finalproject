# HU-014 — Consulta de fotografías del árbol

## 1. Validación de la información existente

| Aspecto | Estado |
|---------|--------|
| **Título** | Alineado con el backlog: *Consulta de fotografías del árbol*; complementa **HU-006**. |
| **Formato “Como… quiero… para…”** | Correcto; cubre visitante y usuarios autenticados según contexto y reglas R4–R5. |
| **Estimación (S/M/L)** | **M**: listados o proyecciones de metadatos, autorización por rol y categoría, URLs prefirmadas de **lectura** (si aplica), integración mínima en detalle público y/o ficha de edición. |
| **Prioridad** | **Alta** para cerrar el valor de las fotos más allá del almacenamiento. |
| **Inconsistencias detectadas** | Sin inconsistencias críticas en este corte: el contrato de galería por árbol y la categoría literal (`PUBLIC`/`PRIVATE`) están cerrados en [docs/api/openapi.yaml](../api/openapi.yaml). Mantener revisión de coherencia con [docs/data-model/data-model.md](../data-model/data-model.md) en evolutivos (miniaturas/CDN, políticas avanzadas). |
| **Tamaño / división** | Adecuado para **M** si se acota a consulta y visualización sin editor avanzado, tratamiento de imágenes ni IA (**HU-009**). |

---

## 2. Historia refinada

| Campo | Valor |
|-------|--------|
| **ID** | HU-014 |
| **Épica** | Fotografías |
| **Título** | Consulta de fotografías del árbol |
| **Estimación de complejidad** | M |
| **Prioridad** | Alta |

**Historia de usuario**

Como visitante o usuario autenticado quiero ver las fotografías almacenadas en el sistema y asociadas a un árbol para valorar el ejemplar con material visual cuando corresponda.

- **Entregable de la historia:** Flujo de **lectura** coherente con **media-service** y **API Gateway**: listado o consulta de **metadatos** de fotografías por árbol (filtrado por permisos y visibilidad), y obtención de **acceso al binario** (p. ej. URL prefirmada de descarga/visualización de corta duración) sin exponer credenciales de bucket al cliente. Integración mínima en **consulta pública** (detalle alineado con **HU-002** / **HU-003**) para fotos **PUBLIC** en fichas publicadas, y en contexto **autenticado** (colaborador / **ADMIN**) para incluir **PRIVATE** cuando la matriz lo permita.

### Alcance

#### Incluye

- Endpoints acordados en [docs/api/openapi.yaml](../api/openapi.yaml) bajo `/api/media` para **listar metadatos visibles por árbol** y obtener URL de lectura para visualización en cliente.
- El endpoint de galería por árbol devuelve, como mínimo, los campos `id`, `url`, `esPrincipal`, `orden`, `mimeType`, `ancho`, `alto` y `categoria`.
- El campo `categoria` se expresa en contrato como literal de negocio (`PUBLIC` | `PRIVATE`).
- Aplicación de reglas **R4–R5** y matriz de [docs/data-model/data-model.md](../data-model/data-model.md): público anónimo solo ve **PUBLIC**; usuario autenticado ve **PUBLIC + PRIVATE** según permisos de negocio.
- **JWT** donde las rutas de lectura lo exijan; respuestas coherentes con **404** u omisión de recursos no autorizados (sin filtrar existencia de fotos privadas a terceros, según decisión de endurecimiento documentada en contrato).
- En **listado público** (HU-002), cada tarjeta muestra la **fotografía principal** en el hueco izquierdo; si no existe imagen disponible, se muestra **imagen por defecto**.
- La imagen de tarjeta y las imágenes del carrusel deben mantener **proporción original** dentro de un contenedor de **tamaño fijo homogéneo**.
- En **detalle** (mismo flujo para anónimo y autenticado en este corte), se muestra un **carrusel** de fotografías con navegación **anterior/siguiente**, ordenado por **foto principal primero** y resto en **orden ascendente**.
- El carrusel del detalle ocupa la **misma dimensión** que el mapa y ambos bloques se distribuyen al **50% del ancho** en layout de escritorio.
- Si solo hay una fotografía en detalle, se muestra diseño simple de imagen única (sin controles de navegación).
- Al abrir una foto del carrusel, se muestra una vista ampliada a **pantalla completa** con la misma navegación/paginación anterior-siguiente.
- No se requiere interacción por **swipe** en móvil para este entregable (la navegación se garantiza con controles).

#### Queda fuera de esta historia

- **Alta** de fotografías, presign de **subida** y registro inicial de metadatos (**HU-006**).
- **Alta o edición** de la ficha de árbol sin la parte de consulta de medios (**HU-005**, **HU-008**), salvo dependencia de datos de árbol y publicación.
- **Identificación por IA** a partir de la imagen (**HU-009**) y **chat** (**HU-010**).
- Notificaciones (**HU-007**), maestros (**HU-011**), tratamiento de imagen (resize, CDN) más allá de lo imprescindible para mostrar una primera versión.

### Dependencias

- **HU-006** (o al menos contrato y modelo de metadatos/binario acordados): sin fotos persistidas, la consulta tiene valor limitado; en implementación puede avanzar en paralelo el contrato de lectura.
- **HU-001** para rutas que exijan sesión; **HU-002** / **HU-003** como ancla natural del detalle público donde mostrar galería pública.
- **API Gateway** enrutando `/api/media` hacia **media-service**; **MinIO** u almacén compatible para objetos ya referenciados.

### Riesgos

- **Contrato HTTP** de listado y de URL de lectura incompleto o desalineado con el de subida (**HU-006**).
- **Filtrado en backend** obligatorio: no confiar solo en la UI para ocultar **PRIVATE**.
- **Rendimiento y caché** de URLs prefirmadas de lectura (ventana, reintentos, CDN futura).

### Aclaraciones pendientes (refinamiento)

- **Listado de metadatos por árbol**: resuelto en `GET /api/media/trees/{treeId}/photos` (galería visible para el solicitante con orden principal+ascendente).
- Criterio de ausencia de fotos en API de galería: respuesta **200** con **lista vacía**.
- Sin pendientes funcionales adicionales para pasar a cierre documental del corte.

## 3. Criterios de aceptación (BDD)

### Referencias

[docs/data-model/data-model.md](../data-model/data-model.md) (R4, R5, matriz); [docs/api/openapi.yaml](../api/openapi.yaml); **HU-002**, **HU-003**, **HU-006**; [readme.md](../../readme.md) (media-service, MinIO, gateway).

### Escenario 1 — Tarjeta en listado con foto principal o imagen por defecto

- **Dado que** consulto el listado de árboles publicados y cada tarjeta reserva el bloque izquierdo para imagen  
- **Cuando** un árbol tiene fotografía principal disponible o carece de ella  
- **Entonces** se muestra la foto principal en tamaño fijo respetando proporción, o en su defecto una imagen por defecto.

### Escenario 2 — Detalle con carrusel 50/50 y navegación completa

- **Dado que** accedo al detalle de árbol (público o autenticado) y existen varias fotografías visibles para mi rol  
- **Cuando** se renderiza el bloque visual del detalle  
- **Entonces** se muestra un carrusel con foto principal primero y resto en orden ascendente, con controles anterior/siguiente, mismo tamaño que el mapa (layout 50/50) y apertura en pantalla completa con paginación equivalente.

### Escenario 3 — Visibilidad por rol y caso de imagen única

- **Dado que** existen fotografías públicas y privadas de un árbol y puedo consultar como visitante o usuario autenticado  
- **Cuando** solicito el conjunto de fotos para listado o detalle  
- **Entonces** en anónimo solo veo públicas, en autenticado veo públicas+privadas según permisos, y si solo hay una foto se muestra imagen única sin controles de carrusel.

## 4. Evaluación INVEST (resumen)

| Criterio | Comentario |
|----------|------------|
| **Independiente** | Parcialmente: fuerte vínculo con **HU-006** y con detalle público; el valor es entregable como vertical de lectura una vez exista al menos un flujo de subida o datos de prueba. |
| **Negociable** | Sí: forma del listado, paginación, miniaturas server-side vs cliente, alcance de la primera UI. |
| **Valiosa** | Sí: sin consulta, las fotos subidas no completan la experiencia de producto. |
| **Estimable** | Sí; incertidumbre en cierre de OpenAPI y reparto catalog vs media. |
| **Small** | Razonable en **M** si no se añade IA ni notificaciones. |
| **Testable** | Sí: pruebas de API por rol y pruebas de integración con MinIO/gateway según política del equipo. |

## 5. Esfuerzo estimado de implementación

Orden de magnitud **medio (M)**: contrato de lectura, autorización en **media-service**, prefirmadas de descarga si procede, pruebas y UI mínima en detalle (y opcionalmente en edición). Cifra en persona-días: **no fijada en fuentes**.

## 6. Estado de implementación en código (corte HU-014, 2026)

Objetivo: dejar trazada en documentación lo ya construido frente a la HU completa (secciones 2–3).

| Pieza | Estado | Notas |
|-------|--------|--------|
| **Contrato galería** `GET /api/media/trees/{treeId}/photos` | Hecho | [docs/api/openapi.yaml](../api/openapi.yaml): `200` con lista (vacía cuando aplica), campos mínimos `id/url/esPrincipal/orden/mimeType/ancho/alto/categoria`, `categoria` literal `PUBLIC`/`PRIVATE`. |
| **Contrato foto principal binaria** `GET /api/media/public/trees/{treeId}/primary-photo` | Hecho | Se mantiene para miniatura/listado público; respuestas binaria `image/*` y `404/502` según contrato. |
| **Visibilidad por rol en backend** | Hecho | Público anónimo recibe solo `PUBLIC`; autenticado recibe `PUBLIC + PRIVATE` según permisos de negocio; orden estable principal+ascendente. |
| **Lectura segura de objetos** | Hecho | URLs de galería emitidas como lectura firmada (evita acceso directo no autorizado al bucket privado). |
| **UI listado (HU-002)** | Hecho | Tarjeta con fotografía principal o fallback; proporción contenida en bloque fijo del lado izquierdo; enlace a detalle desde imagen y botón. |
| **UI detalle + mapa (HU-003)** | Hecho | Carrusel y mapa en layout 50/50 en escritorio, variante de imagen única sin controles, y fallback cuando no hay coordenadas válidas. |
| **Vista ampliada fullscreen** | Hecho | Visor dedicado con zoom/pan, reset, indicador de zoom y paginación anterior/siguiente. |
| **Pruebas frontend críticas** | Hecho | Cobertura de placeholder, carrusel múltiple, modo imagen única, apertura de visor y orden de navegación/wrap. |
| **Desglose HU-014** | Hecho | Tickets trazados y ejecutados en [HU-014-ticket-breakdown.md](HU-014-ticket-breakdown.md). |
