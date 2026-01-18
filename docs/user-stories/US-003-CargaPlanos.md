# US-003: Subida y Procesamiento de Planos

**Como** Arquitecto  
**Quiero** subir archivos de imágenes o PDF al proyecto  
**Para** que sean procesados y visualizados como la base para la revisión.

## Detalles
- **Titulo breve:** Carga de Planos
- **Prioridad:** Alta (P1)
- **Estimación:** 8 Puntos (Incluye Worker)
- **Dependencias:** US-002
- **Orden de ejecución:** 3
- **Estado:** Pending

## Diseño de Pantallas y UI

### 1. Panel de Detalle de Proyecto (Estado Vacío)
- **Contexto:** Cuando se entra a un proyecto recién creado.
- **Zona Central:** "Drop zone" grande con icono. Texto: "Arrastra tu plano aquí o [Examina]".
- **Formatos aceptados:** Texto explicativo "PDF, JPG, PNG".

### 2. Componente de Carga de Archivos
- **Indicador de Progreso:** Barra de carga o spinner circular mientras se sube y procesa (Etapa Worker).
- **Mensaje de Estado:** "Subiendo..." -> "Procesando plano..." -> "Listo".
- **Botón de Cancelar:** Para abortar la subida en curso.

## Criterios de Aceptación (Gherkin)

### Escenario 1: Subida de imagen exitosa
**Dado** un proyecto abierto
**Cuando** el usuario arrastra un archivo .JPG o .PNG válido al área de carga
**Entonces** el archivo se sube al servidor
**Y** se muestra una vista previa en el navegador

### Escenario 2: Subida de PDF y conversión
**Dado** un archivo PDF de alta resolución "plano_planta.pdf"
**Cuando** el usuario lo sube a la plataforma
**Entonces** el sistema lo acepta y muestra estado "Procesando"
**Y** en segundo plano (Worker) se convierte a imagen
**Y** cuando termina, la interfaz se actualiza automáticamente mostrando el plano listo

### Escenario 3: Archivo no soportado (Edge Case)
**Dado** un usuario intentando subir un archivo .DWG o .DOCX
**Cuando** intenta realizar la carga
**Entonces** el sistema rechaza el archivo
**Y** muestra un mensaje de error "Formato no soportado. Solo JPG, PNG o PDF"

## Tickets de Trabajo

### [DB-003] Esquema Base de Datos: Planos y Capas
- **Tipo:** Database
- **Propósito:** Modelado de la jerarquía de planos (Plans) y sus archivos (Layers).
- **Especificaciones Técnicas:**
  - Modelo `Plan`: `id`, `project_id` (FK), `sheet_name`, `version`, `lifecycle_status`.
  - Modelo `Layer`: `id`, `plan_id` (FK), `image_url`, `status` (PENDING/PROCESSING/READY/ERROR), `order`, `type`.
  - Soporte de ENUMs para estados.
- **Criterios de Aceptación:**
  - Tablas creadas con indices apropiados (ej. en `project_id`).
  - Enum de status mapeado correctamente a PostgreSQL.
- **Equipo Asignado:** Backend/DBA
- **Esfuerzo:** 3 pts

### [BACK-003] API Endpoints & Queue Producer
- **Tipo:** Backend Feature
- **Propósito:** Endpoint de subida y encolamiento de tareas.
- **Especificaciones Técnicas:**
  - `POST /projects/:id/layers`: Upload file (S3/Multer).
  - Validar extensión y tamaño máximo (20MB).
  - Añadir job a cola Redis `plan-processing`.
  - Crear registro `Layer` con status `PROCESSING`.
- **Criterios de Aceptación:**
  - Archivo guardado, respuesta 202 Accepted.
  - Job existe en Redis.
- **Equipo Asignado:** Backend
- **Esfuerzo:** 5 pts

### [WORKER-001] Procesador de Planos
- **Tipo:** Backend/Worker Feature
- **Propósito:** Consumir cola y convertir archivos.
- **Especificaciones Técnicas:**
  - Configurar BullMQ/Redis consumer.
  - Librerías: `sharp` (imágenes), `pdf-lib`/`pdf2pic` (PDF).
  - Lógica: Convertir a PNG optimizado para web.
  - Actualizar `Layer` status a `READY`.
- **Criterios de Aceptación:**
  - PDF se convierte a imagen correctamente.
  - Status en DB se actualiza.
- **Equipo Asignado:** Backend
- **Esfuerzo:** 8 pts

### [FRONT-003] Componente de Upload y Polling
- **Tipo:** Frontend Feature
- **Propósito:** Interfaz de carga con feedback de progreso.
- **Especificaciones Técnicas:**
  - Drag & Drop zone.
  - Llamada a API de subida.
  - Implementar Polling (cada 2s) o sockets para escuchar cambio a `READY`.
- **Criterios de Aceptación:**
  - Estado cambia de "Subiendo" a "Procesando" a "Listo".
- **Equipo Asignado:** Frontend
- **Esfuerzo:** 5 pts

