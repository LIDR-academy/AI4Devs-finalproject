# Ticket: TK-042

## Título
BE: Implementar Endpoint Recepción Candidatura (`POST /api/v1/applications`)

## Descripción
Crear y exponer el endpoint `POST /api/v1/applications` en el backend del ATS MVP (alineado con Anexo I) que acepte peticiones `multipart/form-data` enviadas desde el formulario de aplicación público (TK-041). Debe extraer los datos del candidato (nombre, email, tel), el ID de la vacante (jobId) y el archivo CV. No requiere autenticación. Invoca la lógica de procesamiento (TK-044).

## User Story Relacionada
US-011: Recepcionar y Almacenar Nueva Candidatura

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un endpoint `POST /api/v1/applications` que acepta `Content-Type: multipart/form-data`.
2.  El endpoint NO requiere autenticación.
3.  Puede extraer correctamente los campos de texto (nombre, email, tel, jobId) del `FormData`.
4.  Puede extraer correctamente el archivo CV adjunto (ej. campo 'cvFile').
5.  Valida que los campos obligatorios (nombre, email, jobId, cvFile) estén presentes y el email tenga formato válido. Devuelve 400 Bad Request si falla.
6.  Valida que el tipo de archivo (MIME type o extensión) sea permitido (PDF, DOCX). Devuelve 400 si no.
7.  Invoca la lógica de negocio principal (TK-044) pasando los datos y el archivo extraídos.
8.  Si la lógica es exitosa, devuelve 201 Created (posiblemente con el ID de la candidatura creada).
9.  Si la lógica falla, devuelve el código de error apropiado (400, 500).

## Solución Técnica Propuesta (Opcional)
Usar librerías/middlewares del framework backend para parsear `multipart/form-data` (ej. `multer` en Node.js, manejo nativo en Django/Flask).

## Dependencias Técnicas (Directas)
* TK-001 / Anexo I (Definición API endpoint)
* TK-044 (Lógica de Negocio Procesamiento Aplicación)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-011)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Configuración endpoint, middleware multipart/form-data, extracción y validación básica datos/archivo]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, application, candidate, file-upload, multipart

## Comentarios
Endpoint público crítico para la entrada de datos.

## Enlaces o Referencias
[Anexo I], [Documentación middleware multipart]