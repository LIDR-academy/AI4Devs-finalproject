# Spec: 2025-10-26-02-upload-template-flow

## METAPROMPT LLM GEMINI

Refinar este prompt para usuarlo en /create-specs de agent-os: Añadir la feature “Upload Template” del menu (/upload), para ello vamos a reutilizar todo el trabajo realizado en /analysis: en el menú de la aplicación  “upload template redirigirá a la pagina “/analysis en” vez de upload. Después del análisis, si el usuario decide guardar como nueva plantilla, botón “guardar como versión inicial”, rellena los campos de la modal y la acción se completa con exito,  redirigir a una nueva página /createdTemplate (ver la imagen adjunta add-template-navigation.png). En la página createdTemplate mostrar toda la información relevante del nuevo template (incluido un enlace para descargar el documento) y un mensaje de que la acción se ha ejecutado correctamente.  
La pagina acual /analyze no muestra el menú, corregir esto ya que la página debe estar integrada en la navegación.

## RESPUESTA

/create-spec
Crea la especificación completa para refactorizar el flujo de subida de plantillas, reutilizando el componente de análisis, e implementando la página de confirmación y visualización de éxito.

### 1. Frontend: Refactorización de Navegación y UX

- **Objetivo:** Implementar la navegación del menú y crear la página de visualización de éxito según el flujo de la imagen adjunta.
- **Archivo Principal:** Modificar 'App.tsx' y el componente 'TemplateAnalyzePage.tsx'.

#### A. Ajuste de Rutas (App.tsx):

1.  **Refactorizar Menú:** En el componente de navegación (Layout/Sidebar), asegurar que el enlace "Upload Template" redirija a la ruta de análisis: `/analyze`.
2.  **Integrar /analyze:** Mover la ruta `/analyze` al bloque de **rutas protegidas con Layout**, para que muestre el menú de navegación (Tal como se ve en la imagen).
3.  **Nueva Ruta de Éxito:** Añadir una nueva ruta protegida llamada `/templates/created/:versionId` que cargue un nuevo componente 'TemplateCreatedPage'.

#### B. Flujo en 'TemplateAnalyzePage.tsx':

1.  **Activación del Botón:** Modificar el botón "Guardar como Versión Inicial" para que, al completar la llamada exitosa al endpoint de persistencia (POST /api/v1/templates/ingest), redirija al usuario a la nueva ruta de éxito.
2.  **Redirección:** La redirección debe ser a `/templates/created/[ID_DE_LA_VERSIÓN_GUARDADA]`.

#### C. Nuevo Componente 'TemplateCreatedPage.tsx' (Página de Éxito):

1.  **Creación:** Implementar el nuevo componente 'TemplateCreatedPage.tsx'.
2.  **Visualización:** Este componente debe:
    - Recibir el `versionId` de los parámetros de la ruta.
    - Llamar a un nuevo endpoint del backend: **GET /api/v1/templates/versions/{versionId}** para obtener todos los datos guardados.
    - Mostrar: un mensaje de éxito, los **Metadatos Globales** del template y la versión (título, autor, fechas, número de campos) y **un enlace directo para descargar el PDF original** (utilizando la ruta de archivo almacenada en la DB y un endpoint de descarga).

### 2. Backend: Implementación de Endpoints Necesarios

- **Objetivo:** Proporcionar los endpoints de consulta requeridos por la nueva página de visualización.

Los endpoints requeridos para para la nueva página de visualización ya existen:

1. Datos generales del template: /api/v1/templates/{template*id} \_ya existe*
2. Descarga del documento: /api/v1/templates/{template*id}/download \_ya existe*
3. Datos generales de la versión del template: _nuevo_:

#### A. Endpoint de Consulta de Versión por ID (Nuevo):

1.  **Ruta:** GET /api/v1/templates/versions/{versionId}
2.  **Lógica:**
    - Recibe el `versionId` (UUID).
    - Consulta la tabla `template_versions` (usando el `versionId`).
    - Consulta la tabla `pdf_templates` a través de la relación (FK) para obtener el nombre base.
    - **Output:** Devuelve un esquema enriquecido con todos los metadatos globales (título, autor, fechas, etc.), el `file_path` (para generar el enlace de descarga) y el `template_id` asociado.
