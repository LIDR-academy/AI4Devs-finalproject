## 6. Feature 5: Visualización y Gestión del Pipeline de Selección (Prioridad: Alta)

### 6.1. Objetivos de Prueba

* Verificar la correcta visualización de los resultados de la evaluación IA (Score, Etapa Sugerida, Resumen) en las diferentes vistas de candidato (lista, detalle, Kanban).
* Validar la funcionalidad y usabilidad de la vista de lista de candidatos por vacante, incluyendo paginación y acceso al detalle.
* Validar la funcionalidad y usabilidad de la vista de pipeline Kanban, asegurando la correcta representación de etapas y candidatos.
* Verificar que los usuarios puedan mover candidatos entre etapas del pipeline de forma manual (Kanban y detalle) y que los cambios se persistan y registren correctamente.
* (Should Have) Validar las funcionalidades de ordenación y filtrado por score IA en la lista de candidatos.
* (Should Have) Validar la visualización del historial de aplicaciones anteriores del candidato.
* (Could Have) Validar la funcionalidad opcional de movimiento automático a la etapa sugerida por IA.
* (Could Have) Validar la funcionalidad de comparación de candidatos lado a lado.
* Asegurar que las vistas se cargan y responden dentro de tiempos aceptables (Rendimiento).

### 6.2. User Stories Cubiertas

* **Must Have:**
    * [US-27: Mostrar Evaluación IA en Perfil de Candidatura](./us/us-27-mostrar-evaluacion-ia-perfil-candidatura.md)
    * [US-28: Mostrar Etapa de Pipeline Sugerida por IA](./us/us-28-mostrar-etapa-pipeline-sugerida-ia.md)
    * [US-29: Visualizar Lista de Candidatos por Vacante](./us/us-29-visualizar-lista-candidatos-vacante.md)
    * [US-30: Visualizar Pipeline de Selección en Tablero Kanban](./us/us-30-visualizar-pipeline-seleccion-tablero-kanban.md)
    * [US-31: Mover Candidato entre Etapas del Pipeline](./us/us-31-mover-candidato-entre-etapas-pipeline.md)
* **Should Have:**
    * [US-33: Mostrar Resumen Generado por IA en Perfil de Candidatura](./us/us-33-mostrar-resumen-generado-ia-perfil-candidatura.md)
    * [US-34: Ordenar y Filtrar Lista de Candidatos por Score IA](./us/us-34-ordenar-filtrar-lista-candidatos-score-ia.md)
    * [US-35: Consultar Historial de Aplicaciones Anteriores del Candidato](./us/us-35-consultar-historial-aplicaciones-anteriores-candidato.md)
* **Could Have:**
    * [US-32: Automatizar (Opcionalmente) Movimiento Inicial a Etapa Sugerida](./us/us-32-automatizar-opcionalmente-movimiento-inicial-etapa-sugerida.md)
    * [US-36: Comparar Perfiles de Candidatos Lado a Lado](./us/us-36-comparar-perfiles-candidatos-lado-lado.md)

### 6.3. Enfoque de Pruebas Específico

* **Pruebas Funcionales:**
    * **UI (Frontend - TK-081, TK-083, TK-087, TK-089, TK-092, TK-094, TK-095, TK-098, TK-100, TK-104, TK-109, TK-113, TK-117, TK-123, TK-127, TK-129):**
        * **Visualización IA:** Verificar la correcta visualización (y manejo de nulos) del Score IA, Etapa Sugerida, y Resumen IA en detalle, lista y Kanban.
        * **Lista Candidatos (US-029):** Probar la carga de datos, columnas correctas, paginación. Probar navegación al detalle.
        * **Kanban (US-030):** Probar la renderización de columnas (etapas) y tarjetas (candidatos). Verificar información en tarjetas.
        * **Mover Candidatos (US-031):** Probar drag-and-drop en Kanban (mover a diferentes etapas). Probar selector de etapa en vista detalle. Verificar actualización visual y confirmación/error.
        * **Ordenar/Filtrar (US-034 - Should Have):** Probar clic en cabecera Score IA para ordenar. Probar controles de filtro por rango si se implementan.
        * **Historial (US-035 - Should Have):** Verificar que la sección de historial se muestre con datos correctos (o no se muestre si no hay historial).
        * **Automatización (US-032 - Could Have):** Probar checkbox de configuración y verificar su efecto (requiere ver si el candidato se mueve solo tras evaluación).
        * **Comparativa (US-036 - Could Have):** Probar selección múltiple, habilitación del botón "Comparar", y la vista de comparación lado a lado.
    * **API (Backend - TK-085, TK-090, TK-096, TK-102, TK-107, TK-111, TK-115, TK-122):**
        * Probar endpoint de lista de candidaturas con/sin paginación, y con parámetros de ordenación/filtrado (TK-111, TK-115). Verificar que incluya score/etapa/resumen.
        * Probar endpoint de datos Kanban, verificando la estructura agrupada.
        * Probar endpoint de actualización de etapa, verificando cambio en BBDD y creación de registro en `historial_etapas`.
        * Probar endpoint de detalle de candidatura verificando inclusión de historial.
        * Probar endpoints de configuración global (GET/PUT).
* **Pruebas de Integración:**
    * **FE <-> BE (ATS):** Verificar flujo completo de carga de datos para lista y Kanban, movimiento de etapas (drag-drop y detalle), ordenación/filtrado, consulta de historial.
    * **BE (ATS) <-> BE (Core AI):** Verificar llamada para obtener `candidaturas_ids` para el historial (TK-121).
    * **Post-Evaluación (Feature 4 -> Feature 5):** Verificar que los resultados de la evaluación (score, etapa, resumen) almacenados por el ATS (TK-082, TK-084, TK-108) se muestren correctamente en la UI de esta feature. Verificar el movimiento automático (TK-106) si está habilitado.
* **Pruebas de Usabilidad:** Evaluar la claridad de la información IA, la facilidad para navegar entre candidatos, la intuitividad del Kanban y el movimiento de etapas.
* **Pruebas de Rendimiento:** Medir tiempos de carga de la lista de candidatos y del tablero Kanban con un número significativo (ej. 50-100) de candidatos.
* **Pruebas Unitarias (TK-086, TK-091, TK-097, TK-103, TK-112, TK-116, TK-121, etc.):** Responsabilidad del desarrollador (lógica de consulta, agrupación, actualización, etc.).

### 6.4. Datos de Prueba Necesarios

* Vacantes con múltiples candidaturas.
* Candidaturas en diferentes etapas del pipeline.
* Candidaturas con y sin evaluación IA (score, etapa sugerida, resumen).
* Usuarios con roles Reclutador/Manager.
* Un candidato con aplicaciones a múltiples vacantes (para probar historial).
* Configuración del sistema para movimiento automático (on/off).

### 6.5. Priorización Interna

1.  **Visualización Básica (US-27, US-28, US-29, US-30):** Poder ver la lista, el Kanban y la información IA esencial.
2.  **Movimiento Manual (US-031):** Funcionalidad central de gestión.
3.  **Should Haves (US-33, US-34, US-35):** Añaden valor significativo a la usabilidad.
4.  **Could Haves (US-32, US-36):** Funcionalidades opcionales/avanzadas.

---