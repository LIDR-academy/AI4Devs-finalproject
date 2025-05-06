# SPRINT Feature 5: Visualización y Gestión del Pipeline

* **Objetivo del SPRINT:** Implementar las interfaces clave del ATS MVP para que los usuarios internos (Reclutadores/Managers) puedan revisar candidatos, visualizar el pipeline en lista y Kanban, y mover candidatos entre etapas.
* **Feature Asociada:** Feature 5: Visualización y Gestión del Pipeline de Selección ([docs/features/feature-05-visualizacion-gestion-pipeline.md](../features/feature-05-visualizacion-gestion-pipeline.md))
* **User Stories Incluidas:**
    * [US-27: Mostrar Evaluación IA en Perfil de Candidatura](../us/us-27-mostrar-evaluacion-ia-perfil-candidatura.md)
    * [US-28: Mostrar Etapa de Pipeline Sugerida por IA](../us/us-28-mostrar-etapa-pipeline-sugerida-ia.md)
    * [US-29: Visualizar Lista de Candidatos por Vacante](../us/us-29-visualizar-lista-candidatos-vacante.md)
    * [US-30: Visualizar Pipeline de Selección en Tablero Kanban](../us/us-30-visualizar-pipeline-seleccion-tablero-kanban.md)
    * [US-31: Mover Candidato entre Etapas del Pipeline](../us/us-31-mover-candidato-entre-etapas-pipeline.md)
    * [US-32: Automatizar (Opcionalmente) Movimiento Inicial a Etapa Sugerida](../us/us-32-automatizar-opcionalmente-movimiento-inicial-etapa-sugerida.md) (Could Have)
    * [US-33: Mostrar Resumen Generado por IA en Perfil de Candidatura](../us/us-33-mostrar-resumen-generado-ia-perfil-candidatura.md) (Should Have)
    * [US-34: Ordenar y Filtrar Lista de Candidatos por Score IA](../us/us-34-ordenar-filtrar-lista-candidatos-score-ia.md) (Should Have)
    * [US-35: Consultar Historial de Aplicaciones Anteriores del Candidato](../us/us-35-consultar-historial-aplicaciones-anteriores-candidato.md) (Should Have)
    * [US-36: Comparar Perfiles de Candidatos Lado a Lado](../us/us-36-comparar-perfiles-candidatos-lado-lado.md) (Could Have)
* **Total Story Points (Feature):** 33 SP
* **Total Horas Estimadas (Feature):** 127 horas
* **Estimación Promedio por Persona:** 11 SP / ~42.3 horas
* **Duración Estimada del SPRINT:** ~2.5 semanas (Este es un SPRINT más largo debido al volumen de UI y lógica asociada).

## Tareas del SPRINT por Persona

Aquí se listan las Tareas Técnicas (TKs) para esta Feature, con una propuesta de asignación buscando equilibrar la carga, que es considerable en este SPRINT.

### Jose Luis (Estimación: ~42 horas / ~10.5 SP)

* [ ] [TK-085: BE: Implementar Endpoint API Listar Candidaturas por Vacante](<../tasks/tk-085-BE-implementar-endpoint-api-listar-candidaturas-vacante.md>) (3h / 1 SP)
* [ ] [TK-086: BE: Implementar Lógica de Negocio para Listar Candidaturas por Vacante](<../tasks/tk-086-BE-implementar-logica-negocio-listar-candidaturas-vacante.md>) (4h / 1 SP)
* [ ] [TK-090: BE: Adaptar/Crear Endpoint API para Datos Kanban](<../tasks/tk-090-BE-adaptar-crear-endpoint-api-datos-kanban.md>) (2h / 0 SP)
* [ ] [TK-091: BE: Implementar Logica de Negocio para Datos Kanban](<../tasks/tk-091-BE-implementar-logica-negocio-datos-kanban.md>) (3h / 1 SP)
* [ ] [TK-096: BE: Implementar Endpoint API Actualizar Etapa Candidatura](<../tasks/tk-096-BE-implementar-endpoint-api-actualizar-etapa-candidatura.md>) (3h / 1 SP)
* [ ] [TK-097: BE: Implementar Logica de Negocio Actualizar Etapa Candidatura](<../tasks/tk-097-BE-implementar-logica-negocio-actualizar-etapa-candidatura.md>) (4h / 1 SP)
* [ ] [TK-101: BE-DB: Definir Esquema/Tabla para Configuración Global del Sistema](<../tasks/tk-101-DB-definir-schema-tabla-configuracion-global.md>) (1h / 0 SP) - **(Could Have)**
* [ ] [TK-102: BE-API: Implementar Endpoints API para Gestión Configuración Global (GET/PUT)](<../tasks/tk-102-BE-API-implementar-endpoints-gestion-configuracion-global.md>) (3h / 1 SP) - **(Could Have)**
* [ ] [TK-103: BE-Logic: Implementar Lógica de Negocio Leer/Escribir Configuración Global](<../tasks/tk-103-BE-Logic-implementar-logica-negocio-leer-escribir-configuracion-global.md>) (2h / 0 SP) - **(Could Have)**
* [ ] [TK-106: BE-Logic: Modificar Lógica Post-Evaluación para Mover Candidato Automáticamente según Config](<../tasks/tk-106-BE-Logic-modificar-logica-post-evaluacion-mover-automaticamente.md>) (2h / 0 SP) - **(Could Have)**
* [ ] [TK-107: BE-API: Asegurar/Incluir campo `resumen_ia` en respuesta API de Detalle Candidatura](<../tasks/tk-107-BE-API-asegurar-incluir-campo-resumen-ia-respuesta-api-detalle-candidatura.md>) (1h / 0 SP) - **(Should Have)**
* [ ] [TK-108: BE-Logic: Asegurar Almacenamiento/Recuperación de `resumen_ia` en ATS](<../tasks/tk-108-BE-Logic-asegurar-almacenamiento-recuperacion-resumen-ia-ats.md>) (2h / 0 SP) - **(Should Have)**
* [ ] [TK-111: BE-API: Adaptar API Listar Candidaturas para Soportar Ordenación por Score](<../tasks/tk-111-BE-API-adaptar-api-listar-candidaturas-ordenacion-score.md>) (1h / 0 SP) - **(Should Have)**
* [ ] [TK-112: BE-Logic: Implementar Lógica de Negocio Ordenación por Score IA](<../tasks/tk-112-BE-Logic-implementar-logica-negocio-ordenacion-score-ia.md>) (2h / 0 SP) - **(Should Have)**
* [ ] [TK-115: BE-API: (Opcional) Adaptar API Listar Candidaturas para Soportar Filtrado por Rango de Score](<../tasks/tk-115-BE-API-opcional-adaptar-api-listar-candidaturas-filtrado-score.md>) (1h / 0 SP) - **(Should Have - Opcional)**
* [ ] [TK-116: BE-Logic: (Opcional) Implementar Lógica de Negocio Filtrado por Rango de Score IA](<../tasks/tk-116-BE-Logic-opcional-implementar-logica-negocio-filtrado-score-ia.md>) (2h / 0 SP) - **(Should Have - Opcional)**

### Jesus (Estimación: ~42 horas / ~11 SP)

* [ ] [TK-082: FE: Asegurar Disponibilidad de Score IA en Datos de Candidatura Frontend](<../tasks/tk-082-FE-Asegurar-Disponibilidad-Score-IA-Datos-FE.md>) (1h / 0 SP)
* [ ] [TK-084: FE: Asegurar Disponibilidad de Etapa Sugerida IA en Datos de Candidatura Frontend](<../tasks/tk-084-FE-Asegurar-Disponibilidad-Etapa-Sugerida-IA-Datos-FE.md>) (1h / 0 SP)
* [ ] [TK-088: FE: Implementar Lógica Frontend para API Listar Candidaturas](<../tasks/tk-088-FE-implementar-logica-frontend-api-listar-candidaturas.md>) (4h / 1 SP)
* [ ] [TK-093: FE: Implementar Lógica Frontend para API Datos Kanban y Etapas](<../tasks/tk-093-FE-implementar-logica-frontend-api-datos-kanban-etapas.md>) (3h / 1 SP)
* [ ] [TK-099: FE: Implementar Lógica API para Actualizar Etapa desde Frontend](<../tasks/tk-099-FE-implementar-logica-api-actualizar-etapa-frontend.md>) (2h / 0 SP)
* [ ] [TK-105: FE-Logic: Implementar Lógica Frontend para API Configuración Global](<../tasks/tk-105-FE-Logic-implementar-logica-frontend-api-configuracion-global.md>) (3h / 1 SP) - **(Could Have)**
* [ ] [TK-110: FE-Logic: Obtener y Manejar campo `resumen_ia` en Detalle Candidatura](<../tasks/tk-110-FE-Logic-obtener-manejar-resumen-ia-detalle.md>) (1h / 0 SP) - **(Should Have)**
* [ ] [TK-114: FE-Logic: Implementar Lógica Frontend para Ordenar por Score IA](<../tasks/tk-114-FE-Logic-implementar-logica-frontend-ordenar-score-ia.md>) (3h / 1 SP) - **(Should Have)**
* [ ] [TK-118: FE-Logic: (Opcional) Implementar Lógica Frontend para Filtrar por Rango de Score IA](<../tasks/tk-118-FE-Logic-opcional-implementar-logica-frontend-filtrar-score-ia.md>) (2h / 0 SP) - **(Should Have - Opcional)**
* [ ] [TK-119: CAI-BE-API: Implementar Endpoint API Obtener Detalles CandidatoIA (incl. `candidaturas_ids`)](<../tasks/tk-119-CAI-BE-API-implementar-endpoint-obtener-detalles-candidato-ia.md>) (2h / 0 SP) - **(Should Have)**
* [ ] [TK-120: CAI-BE-Logic: Implementar Lógica de Negocio Obtener Detalles CandidatoIA](<../tasks/tk-120-CAI-BE-Logic-implementar-logica-negocio-obtener-detalles-candidato-ia.md>) (1h / 0 SP) - **(Should Have)**
* [ ] [TK-121: BE-Logic: Implementar Lógica ATS para Obtener y Procesar Historial Aplicaciones](<../tasks/tk-121-BE-Logic-implementar-logica-ats-obtener-procesar-historial-aplicaciones.md>) (5h / 1 SP) - **(Should Have)**
* [ ] [TK-122: BE-API: Adaptar API Detalle Candidatura ATS para Incluir Historial](<../tasks/tk-122-BE-API-adaptar-api-detalle-candidatura-ats-incluir-historial.md>) (1h / 0 SP) - **(Should Have)**
* [ ] [TK-124: FE-Logic: Manejar y Pasar Datos de Historial a Componente UI Detalle](<../tasks/tk-124-FE-Logic-manejar-pasar-datos-historial-componente-ui-detalle.md>) (1h / 0 SP) - **(Should Have)**
* [ ] [TK-128: FE-Logic: Gestionar Estado de Selección Múltiple en Lista Candidatos](<../tasks/tk-128-FE-Logic-gestionar-estado-seleccion-multiple-lista-candidatos.md>) (2h / 0 SP) - **(Could Have)**
* [ ] [TK-130: FE-Logic: Obtener Datos y Orquestar Vista Comparación](<../tasks/tk-130-FE-Logic-obtener-datos-orquestar-vista-comparacion.md>) (4h / 1 SP) - **(Could Have)**

### David (Estimación: ~43 horas / ~11.5 SP)

* [ ] [TK-081: FE: Anadir Visualizacion Score IA a UI Detalle Candidatura](<../tasks/tk-081-FE-Anadir-Visualizacion-Score-IA-UI-Detalle.md>) (2h / 0 SP)
* [ ] [TK-083: FE: Anadir Visualizacion Etapa Sugerida IA a UI Candidatura](<../tasks/tk-083-FE-Anadir-Visualizacion-Etapa-Sugerida-IA.md>) (3h / 1 SP)
* [ ] [TK-087: FE: Crear Interfaz de Usuario Lista/Tabla de Candidatos por Vacante](<../tasks/tk-087-FE-crear-interfaz-usuario-lista-tabla-candidatos-vacante.md>) (5h / 1 SP)
* [ ] [TK-089: FE: Implementar Navegacion entre Lista y Detalle de Candidatura](<../tasks/tk-089-FE-implementar-navegacion-lista-candidatos-detalle.md>) (1h / 0 SP)
* [ ] [TK-092: FE: Crear/Integrar Componente UI Tablero Kanban](<../tasks/tk-092-FE-crear-componente-ui-tablero-kanban.md>) (8h / 2 SP) - **(Tarea de alta complejidad UI)**
* [ ] [TK-094: FE: Renderizar Columnas (Etapas) y Tarjetas (Candidatos) en Kanban](<../tasks/tk-094-FE-renderizar-columnas-tarjetas-kanban.md>) (4h / 1 SP)
* [ ] [TK-095: FE: Añadir Visualización Info Básica (Nombre, Score, Sugerencia) a Tarjeta Kanban](<../tasks/tk-095-FE-anadir-visualizacion-info-basica-tarjeta-kanban.md>) (2h / 0 SP)
* [ ] [TK-098: FE: Implementar Funcionalidad Drag-and-Drop en Kanban](<../tasks/tk-098-FE-implementar-funcionalidad-drag-and-drop-kanban.md>) (6h / 1 SP)
* [ ] [TK-100: FE: Implementar Control UI Cambiar Etapa en Detalle](<../tasks/tk-100-FE-implementar-control-ui-cambiar-etapa-detalle.md>) (4h / 1 SP)
* [ ] [TK-104: FE-UI: Crear Interfaz Usuario para Gestionar Configuración Global (Checkbox Automatización)](<../tasks/tk-104-FE-UI-crear-interfaz-usuario-gestionar-configuracion-global.md>) (3h / 1 SP) - **(Could Have)**
* [ ] [TK-109: FE-UI: Añadir Sección/Campo para Mostrar Resumen IA en Detalle Candidatura](<../tasks/tk-109-FE-UI-anadir-seccion-campo-mostrar-resumen-ia-detalle.md>) (2h / 0 SP) - **(Should Have)**
* [ ] [TK-113: FE-UI: Hacer Clickable Cabecera Columna Score IA para Ordenar](<../tasks/tk-113-FE-UI-hacer-clickable-cabecera-columna-score-ia-ordenar.md>) (2h / 0 SP) - **(Should Have)**
* [ ] [TK-117: FE-UI: (Opcional) Añadir Controles UI para Filtrar por Rango de Score](<../tasks/tk-117-FE-UI-opcional-anadir-controles-filtrar-rango-score.md>) (2h / 0 SP) - **(Should Have - Opcional)**
* [ ] [TK-123: FE-UI: Añadir Sección "Historial de Aplicaciones" a Vista Detalle Candidatura](<../tasks/tk-123-FE-UI-anadir-seccion-historial-aplicaciones-detalle-candidatura.md>) (3h / 1 SP) - **(Should Have)**
* [ ] [TK-127: FE-UI: Añadir Selección Múltiple y Botón Comparar a Lista Candidatos](<../tasks/tk-127-FE-UI-anadir-seleccion-multiple-boton-comparar-lista-candidatos.md>) (3h / 1 SP) - **(Could Have)**
* [ ] [TK-129: FE-UI: Crear Componente UI Vista Comparación Lado a Lado](<../tasks/tk-129-FE-UI-crear-componente-vista-comparacion-lado-a-lado.md>) (5h / 1 SP) - **(Could Have)**

## Coordinación y Dependencias Clave

* **Datos de Evaluación IA (F4):** Esta Feature depende de que la Feature 4 esté completa y entregando resultados de evaluación (score, etapa sugerida, resumen) que el ATS MVP pueda almacenar y mostrar (US-27, US-28, US-33).
* **API BE Listar (TK-085), Kanban (TK-090), Actualizar Etapa (TK-096):** Deben estar listos antes de la lógica FE que los consume.
* **Lógica FE API (TK-088, TK-093, TK-099):** Necesaria antes que la UI interactiva.
* **Componentes UI (TK-087, TK-092):** La base visual de las vistas. TK-092 (Kanban) es complejo.
* **Drag-and-Drop (TK-098):** Depende del componente Kanban base (TK-092) y la lógica de actualización de etapa (TK-099).
* **Historial Unificado (US-35):** Depende de API/Lógica en Core AI (TK-119, TK-120) y lógica/UI en ATS (TK-121-124). Requiere coordinación entre ambos lados.
* **Comparativa Candidatos (US-36):** Depende de UI (TK-127, 129) y lógica (TK-128, 130).

## Entregable del SPRINT (Definition of Done para la Feature 5)

* El esquema de base de datos para la configuración global está creado.
* Los endpoints de backend para listar candidaturas por vacante, obtener datos para Kanban y actualizar etapa de candidatura están implementados.
* La lógica backend para listar candidaturas, agrupar para Kanban y actualizar etapa (incluyendo historial) está implementada.
* Los endpoints y lógica backend para gestionar la configuración global están implementados (si se completa US-32).
* Los endpoints y lógica backend para soportar ordenación/filtrado por score IA están implementados (si se completa US-34).
* Los endpoints de Core AI y la lógica backend de ATS para obtener el historial de aplicaciones están implementados (si se completa US-35).
* La interfaz de usuario frontend para visualizar la lista de candidatos por vacante (incluyendo datos IA), la vista de detalle y el tablero Kanban está implementada.
* La funcionalidad frontend para mover candidatos entre etapas (Kanban y detalle) está implementada.
* La funcionalidad frontend para gestionar configuración global está implementada (si se completa US-32).
* La funcionalidad frontend para mostrar resumen IA está implementada (si se completa US-33).
* La funcionalidad frontend para ordenar/filtrar por score IA está implementada (si se completa US-34).
* La funcionalidad frontend para mostrar historial unificado está implementada (si se completa US-35).
* La funcionalidad frontend para comparar candidatos está implementada (si se completa US-36).
* Los Reclutadores/Managers pueden visualizar y gestionar candidatos a través de las vistas de lista y pipeline, viendo la evaluación IA y moviendo candidatos entre etapas.
* Todas las pruebas unitarias y de integración relevantes para esta Feature han pasado.

---