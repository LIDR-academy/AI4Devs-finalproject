# METAPROMPT LLM GEMINI

**_FEATURE: TERMINAR PÁGINA HOME_**  
Gemini como Arquitecto de Producto refina este prompt para /create-spec de agent-os.  
El objetivo de la feature es completar la página de inicio (HomePage.tsx) de la aplicación “SEPE Comparator”.  
Los datos en las secciones “Total Templates”, “Active Comparisions”, “This Months” y “Recent Activity” son fake, para tener la aplicación plenamente funcional, se necesita sustituir estos datos por datos reales:

- Total Templates: Crear un servicio que devuelva el número de versiones de templates disponibles en el sistema, para mostrar al usuario (X versiones de Y templates). Adaptar el front (HomePage.tsx) para que consuma el servicio y muestre el dato al usuario
- Active Comparison: Crear el servicio que devuelva el número de comparaciones guardadas en base de datos y lo muestre en la página.
- This Month: En el api activity crear un servicio que devuelve el número de actividades en el mes actual

# RESPUESTA DEL MODELO (prompt refinado)

/create-spec
Crea la especificación completa para implementar las métricas funcionales de la página de inicio (HomePage.tsx). El objetivo es sustituir los datos mock por datos en tiempo real obtenidos mediante nuevos endpoints de solo lectura.

### 1. Backend: Implementación de Endpoints de Métricas (Solo Lectura)

- **Objetivo:** Crear un nuevo router llamado 'metrics.py' para alojar todos los endpoints de reporting, siguiendo el Principio de Responsabilidad Única (SRP).
- **Ruta Base:** /api/v1/metrics
- **Autenticación:** Todos los endpoints de métricas deben requerir autenticación (usar 'Depends(get_current_active_user)').

#### A. Métrica: Total Templates

- **Endpoint:** GET /api/v1/metrics/templates/summary
- **Lógica:** Ejecutar consultas SQL que devuelvan dos conteos:
  1.  El número total de **plantillas únicas** (registros en `pdf_templates`).
  2.  El número total de **versiones** (registros en `template_versions`).
- **Output:** Un Pydantic Model que devuelva ambos valores (ej., { "total_templates": 15, "total_versions": 45 }).

#### B. Métrica: Active Comparisons

- **Endpoint:** GET /api/v1/metrics/comparisons/count
- **Lógica:** Ejecutar una consulta SQL que devuelva el número total de comparaciones guardadas en la tabla `comparisons`.
- **Output:** Un Pydantic Model simple (ej., { "total_comparisons": 50 }).

#### C. Métrica: This Month (Activity)

- **Endpoint:** GET /api/v1/metrics/activity/monthly
- **Lógica:** Ejecutar una consulta SQL sobre la tabla **`activity`** que cuente el número total de eventos de actividad registrados **en el mes natural actual**.
- **Output:** Un Pydantic Model (ej., { "activities_this_month": 120 }).

### 2. Frontend: Integración y Visualización

- **Objetivo:** Modificar el componente 'HomePage.tsx' para consumir los nuevos servicios.
- **Lógica de Carga:** Utilizar Hooks (ej., `useEffect`) para llamar a los tres nuevos endpoints al montar el componente.
- **Actualización de UI (Secciones):**
  - **Total Templates:** Mostrar el formato enriquecido: "X Versiones de Y Templates".
  - **Active Comparisons:** Mostrar el conteo simple.
  - **This Month:** Mostrar el conteo de actividades.
- **Componente 'Recent Activity':** El Front-end debe asegurarse de consumir el endpoint **GET /api/v1/activity/recent** (creado en SPEC 10) y mostrar la lista de actividades debajo de estas métricas.

### 3. Convenciones (Código Limpio)

- **SOLID:** Asegurar la creación del nuevo router **`metrics.py`** para separar la lógica de reporting de los routers de negocio (templates, comparisons, auth).
