# HU-002 — Fichas publicadas (lista y detalle)

## 1. Validación de la información existente

| Aspecto | Estado |
|---------|--------|
| **Título** | Correcto y alineado con backlog: *Fichas publicadas (lista y detalle)*. |
| **Formato “Como… quiero… para…”** | Correcto; define actor público sin sesión, acción de consulta y beneficio de información sin autenticación, alineado con UC-01. |
| **Estimación (S/M/L)** | **M** coherente para un alcance MVP de consulta pública con listado y detalle. |
| **Prioridad** | **Alta** coherente con valor de producto (consulta pública como capacidad base del MVP). |
| **Inconsistencias detectadas** | Existe frontera funcional a concretar con **HU-003** (mapa en detalle): HU-002 cubre lista y detalle de ficha publicada; la localización en mapa se refina en HU-003 para evitar duplicidad de alcance. |
| **Tamaño / división** | Tamaño adecuado para **M** si se mantiene el foco en lectura pública (sin edición, sin autenticación y sin lógica de notificaciones). |

---

## 2. Historia refinada

| Campo | Valor |
|-------|--------|
| **ID** | HU-002 |
| **Épica** | Consulta pública |
| **Título** | Fichas publicadas (lista y detalle) |
| **Estimación de complejidad** | M |
| **Prioridad** | Alta |

**Historia de usuario**

Como visitante sin cuenta, quiero consultar el listado y el detalle de las fichas de árboles publicados con su información asociada, para informarme sin autenticación según UC-01.

- **Entregable de la historia:** Flujo público operativo de consulta de árboles publicados con una vista de listado y una vista de detalle, accesibles sin sesión y servidas por el API Gateway con contrato de lectura pública, devolviendo únicamente información de fichas con estado publicable para consumo anónimo del MVP.

### Alcance

#### Incluye

- Consulta pública sin autenticación de fichas de árboles publicadas, mediante rutas de listado y detalle en frontend.
- Listado público con **filtros básicos** acordados en contrato (`especie`, `provincia`, `municipio`, y —solo para roles privilegiados en backend— `estado` / `visibilidad`); catálogo de **nombres de provincia** para la UI vía `GET /api/catalog/public/provinces` (sin exponer código de provincia al visitante anónimo).
- Lectura de información principal de la ficha publicada en detalle (datos descriptivos y metadatos de publicación según contrato disponible).
- Integración de frontend con endpoints públicos del gateway para catálogo en modo lectura.
- Manejo de estados básicos de UX en consulta pública (carga, vacío y error controlado).
- Navegación desde listado a detalle manteniendo coherencia de rutas públicas del MVP.

#### Queda fuera de esta historia

- Alta y edición de fichas por colaborador (HU-005 y HU-008).
- Gestión administrativa de maestros o suscripciones (HU-011 y HU-012).
- Notificaciones por correo y procesamiento de eventos (HU-007).
- Integración de mapa en detalle como entregable principal de esta HU (se refina en HU-003 para evitar solape).
- Capacidades de IA orientativa o chat (HU-009 y HU-010).

### Dependencias

- Existencia de fichas en estado publicable creadas por el flujo de catálogo (HU-005).
- API Gateway operativo con rutas públicas de catálogo alineadas a OpenAPI.
- Definición de navegación base y guardas ya establecida para el MVP (HU-013).
- Contrato de datos de catálogo suficiente para listado y detalle público en frontend.

### Riesgos

- Solape funcional entre HU-002 y HU-003 si no se mantiene separación explícita lista/detalle frente a mapa.
- Falta de datos publicados en entorno de pruebas que impida validar valor real de la consulta pública.
- Diferencias entre contrato OpenAPI y payload real en endpoints de lectura pública durante iteraciones.
- Deriva de alcance hacia **filtros avanzados** o búsqueda compleja no requeridos en este corte MVP (los filtros simples del listado público y el endpoint de nombres de provincia **sí** forman parte del contrato cerrado).

### Aclaraciones y refinamiento

**Cerrado en contrato / implementación (ver [openapi.yaml](../api/openapi.yaml) y [HU-002-ticket-breakdown.md](HU-002-ticket-breakdown.md)):**

- Campos mínimos de respuesta para **lista** y **detalle** públicos, paginación (`page`, `size`, `totalResults`), orden por defecto y filtros de consulta.
- Criterio de visibilidad para el visitante **anónimo**: solo fichas **PUBLICADO** y **PUBLICO** en listado/detalle públicos (ampliación con JWT privilegiado documentada en el servicio).

**Sigue abierto o dependiente de otros entregables:**

- Evidencia de **datos semilla** o dataset mínimo de fichas publicadas para validación funcional en entornos de prueba.
- Vista de **detalle** en frontend: la ruta puede existir antes de la pantalla definitiva; el contrato del detalle público ya está definido para alinear **HU-003** (mapa).

## 3. Criterios de aceptación (BDD)

### Referencias

Backlog `HU-002` (tabla §3), `readme.md` §1.2 (consulta pública y visualización), `readme.md` §1.3 (jerarquía pública), `docs/use-cases/use-case-summary.md` (UC-01), `docs/api/openapi.yaml` (rutas públicas de catálogo).

### Escenario 1 — Consulta pública de listado sin sesión

- **Dado que** soy un visitante sin autenticación  
- **Cuando** accedo a la sección pública de árboles  
- **Entonces** veo un listado de fichas publicadas sin necesidad de iniciar sesión y con estado de carga/error controlado.

### Escenario 2 — Acceso a detalle desde listado

- **Dado que** estoy consultando el listado público de árboles  
- **Cuando** selecciono una ficha concreta  
- **Entonces** puedo abrir su vista de detalle pública y visualizar la información asociada permitida para consulta anónima.

### Escenario 3 — Exclusión de fichas no publicadas en consulta pública

- **Dado que** existen fichas en distintos estados de publicación  
- **Cuando** un visitante consulta listado o detalle públicos  
- **Entonces** solo se muestran fichas publicadas y el acceso a contenido no publicado no se expone en el flujo público.

## 4. Evaluación INVEST (resumen)

| Criterio | Comentario |
|----------|------------|
| **Independiente** | Parcialmente: depende de que exista catálogo publicable, pero aporta valor por sí sola como capacidad pública del MVP. |
| **Negociable** | Sí: detalle de campos, paginación y copy de estados puede ajustarse sin cambiar el objetivo funcional. |
| **Valiosa** | Sí: habilita el caso de uso principal de consulta abierta para visitantes. |
| **Estimable** | Sí: alcance acotado a lectura pública con lista y detalle, separado de creación/edición y notificaciones. |
| **Small** | Sí para **M** si se evita añadir filtros avanzados y se mantiene separación con HU-003 (mapa). |
| **Testable** | Sí: verificable con pruebas de navegación pública, respuestas API de lectura y control de visibilidad de fichas no publicadas. |

## 5. Esfuerzo estimado de implementación

Orden de magnitud **medio (M)** para MVP: implementación de vistas públicas de listado y detalle, integración con endpoints públicos de catálogo en gateway, manejo de estados de interfaz y validaciones de visibilidad en backend según estado de publicación. El esfuerzo depende de la disponibilidad de datos publicados en entorno de prueba y del cierre del contrato de campos de respuesta.
