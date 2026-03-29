# US-003: Gestión de Planos y Carga de Capas

**Como** Arquitecto  
**Quiero** organizar mis dibujos en Planos (con versiones) y subir archivos como Capas  
**Para** mantener un histórico ordenado y superponer información técnica (electricidad, fontanería) sobre un plano base.

## Detalles
- **Titulo breve:** Gestión de Planos y Capas
- **Prioridad:** Alta (P1)
- **Estimación:** 13 Puntos
- **Dependencias:** US-002 (Proyectos)
- **Orden de ejecución:** 3
- **Estado:** Pending

## Diseño de Pantallas y UI

### 1. Vista: Listado de Planos del Proyecto
- **Contexto:** Panel principal dentro de un Proyecto.
- **Componentes:**
  - Tabla/Grid agrupadora: Muestra los "Sheets" (ej: Planta Baja, Planta Primera).
  - Indicador de versión actual: (ej: "v3 - ACTIVA").
  - Botón Acción Principal: **"Nuevo Plano / Versión"**.

### 2. Modal: Crear/Versionar Plano
- **Selección de Modo:**
  - *Opción A (Nuevo Sheet):* Input texto para nombre (ej: "Alzados Norte").
  - *Opción B (Nueva Versión):* Dropdown con sheets existentes. El sistema calcula automáticamente `v_actual + 1`.
- **Feedback:** Al seleccionar un existente, muestra "Se creará la Versión X".

### 3. Vista: Detalle de Plano (Stage)
- **Contexto:** Al entrar en una versión específica de un plano.
- **Gestor de Capas (Sidebar):**
  - Lista de capas existentes (Base, Estructura, etc.).
  - Botón: **"Añadir Capa"**.
- **Modal de Subida de Capa:**
  - Input: Nombre de la capa (ej: "Instalaciones AACC").
  - Selector Tipo: `BASE` (Opaco) o `OVERLAY` (Transparencia).
  - File Picker: PDF, PNG, JPG.
  - **Selector de Páginas (Solo PDF):** 
    - Vista previa de todas las páginas del documento.
    - Permite selección múltiple (Checkboxes).
    - Para cada página seleccionada, muestra campos de configuración individual: **Nombre de Capa** y **Tipo** (Base/Overlay).

## Criterios de Aceptación (Gherkin)

### Escenario 1: Crear una nueva versión de un plano existente
**Dado** el proyecto tiene el plano "Planta Baja" en versión 1
**Cuando** el usuario selecciona "Nueva Versión" y elige "Planta Baja"
**Entonces** el sistema crea el Container "Planta Baja v2" en estado DRAFT
**Y** redirige al usuario al detalle de este nuevo plano vacío.

### Escenario 2: Seguridad en la subida (ACL)
**Dado** un usuario con rol "VIEWER" en el proyecto
**Cuando** intenta llamar al endpoint de creación de planos o subida de capas
**Entonces** el backend responde `403 Forbidden`.

### Escenario 3: Selección múltiple de páginas en PDF
**Dado** un usuario subiendo un PDF con 5 páginas
**Cuando** selecciona la página 1 como "Planta Base" (Tipo BASE)
**Y** selecciona la página 3 como "Red Eléctrica" (Tipo OVERLAY)
**Entonces** el sistema genera dos peticiones de creación de capa
**Y** el Worker procesa cada página independientemente
**Y** el plano resultante muestra la página 1 de fondo y la 3 superpuesta.

### Escenario 4: Notificación visual de éxito (Real-time)
**Dado** que el usuario está viendo el detalle de un plano
**Y** acaba de subir una capa que está en estado PROCESSING
**Cuando** el Worker finaliza la conversión de la imagen
**Entonces** la capa aparece automáticamente en la lista de capas (sin F5)
**Y** se muestra una notificación "Toast" de éxito.

### Escenario 5: Notificación visual de error (Real-time)
**Dado** que una capa está en proceso de carga
**Cuando** el Worker falla al procesar el archivo (ej. archivo corrupto)
**Entonces** la capa defectuosa desaparece de la lista
**Y** se muestra una notificación de error con la razón del fallo.



## Tickets de Trabajo

### [DB-003] Esquema Base de Datos: Planos y Capas
- **Tipo:** Database
- **Propósito:** Modelado de jerarquía Plan > Layer con integridad referencial.
- **Especificaciones Técnicas:**
  - `Plan`: `id`, `project_id`, `sheet_name`, `version`, `status` (DRAFT/ACTIVE).
    - Constraint: `UNIQUE(project_id, sheet_name, version)`.
  - `Layer`: `id`, `plan_id`, `name`, `image_url`, `type` (BASE/OVERLAY), `status`.
    - Constraint: FK `plan_id` con `ON DELETE CASCADE`.
- **Esfuerzo:** 2 pts

### [BACK-003] API: Gestión de Planes y Seguridad
- **Tipo:** Backend Feature
- **Propósito:** Lógica de negocio para contenedores de planos y control de acceso.
- **Especificaciones Técnicas:**
  - Middleware `ensureProjectPermission(role=['OWNER','EDITOR'])`.
  - `POST /projects/:id/plans`: 
    - Lógica: Si recibe `sheetName` existente, buscar `MAX(version)` e incrementar.
  - `GET /projects/:id/plans`: Devolver estructura agrupada o árbol.
- **Criterios de Aceptación:**
  - No permite versiones duplicadas.
  - Solo roles permitidos pueden crear.
- **Esfuerzo:** 3 pts

### [BACK-004] API: Subida de Capas y Validación
- **Tipo:** Backend Feature
- **Propósito:** Endpoint transaccional para subida de ficheros.
- **Especificaciones Técnicas:**
  - `POST /plans/:planId/layers`: Multipart/form-data.
  - Body params: `layerName`, `layerType`, `pdfPageUserSelected` (opcional, default 1).
  - **Validación:** File Type (Magic Numbers para PDF/Img), Size Limit.
  - Acción: Subir a Temp/S3 -> Crear registro `Layer` (PROCESSING) -> Encolar Job BullMQ con metadatos (`pageToConvert`).
- **Esfuerzo:** 5 pts

### [WORKER-001] Procesador de Imágenes y PDFs
- **Tipo:** Worker Feature
- **Propósito:** Consumir cola y transformar assets.
- **Especificaciones Técnicas:**
  - Librería: `sharp` + `pdf-lib` (o similar).
  - Job Payload debe incluir: `filePath`, `pageIndex`.
  - Lógica: 
    - Si es PDF: Extraer página indicada -> Rasterizar a PNG de alta res.
    - Si es IMG: Optimizar/Redimensionar.
  - Output: Actualizar `Layer` con URL final y status `READY`.
- **Esfuerzo:** 8 pts

### [FRONT-003] UI: Gestor de Planos y Wizard de Subida
- **Tipo:** Frontend Feature
- **Propósito:** Interfaz para el flujo explícito de 2 pasos y gestión PDF avanzada.
- **Especificaciones Técnicas:**
  - Componente `PlanList`: Group By sheet name.
  - Componente `CreatePlanModal`: Lógica para decidir si es nuevo o versión.
  - Componente `LayerUploader`: 
    - Al cargar PDF, usar librería (ej: `pdfjs-dist`) para renderizar thumbnails.
    - Interfaz de selección múltiple tipo "Grid".
    - Formulario dinámico: Generar un set de inputs (Nombre, Tipo) por cada página seleccionada.
    - Lógica de envío: Iterar sobre la selección y enviar peticiones secuenciales o paralelas al backend, o usar endpoint batch si disponible.
- **Esfuerzo:** 8 pts

### [BACK-005] Real-time Events Infrastructure
- **Tipo:** Backend Feature
- **Propósito:** Notificar al frontend cuando un job de procesamiento termina.
- **Especificaciones Técnicas:**
  - **Socket.io:** Implementar autenticación y "Rooms" privadas (`user:{userId}`).
  - **Redis Events:** Usar `QueueEvents` de BullMQ para escuchar `completed` y `failed` de la cola `layer-processing`.
  - **Bridge:** Al detectar evento de cola → Buscar `userId` del job → Emitir evento `layer:processed` o `layer:failed` al room del usuario.
  - **Worker:** Asegurar que `userId` viaja en el payload del Job a través de BullMQ.
- **Esfuerzo:** 3 pts

### [FRONT-004] Real-time Layer Updates
- **Tipo:** Frontend Feature
- **Propósito:** Consumir eventos de socket para UX fluida.
- **Especificaciones Técnicas:**
  - **Plugin Socket:** Conexión automática al loguearse.
  - **Store `plans`:** Acción `onLayerProcessed(layer)` que hace push al array local.
  - **UI Feedback:** Componente de Toast para errores. Eliminación optimista o reactiva de items fallidos.
- **Esfuerzo:** 3 pts


