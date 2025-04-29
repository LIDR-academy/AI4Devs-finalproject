# Ticket: TK-041

## Título
FE: Implementar Lógica Frontend para Formulario de Aplicación (Validación y Envío)

## Descripción
Desarrollar la lógica en el frontend para manejar el formulario de aplicación (TK-040). Esto incluye validación de campos obligatorios y formato de email, validación del tipo de archivo del CV (PDF/DOCX), recopilación de los datos y el archivo, y el envío de la información como una petición `multipart/form-data` al endpoint correspondiente del backend (ej. `POST /api/public/v1/applications`). Manejar la respuesta para mostrar confirmación o error al candidato.

## User Story Relacionada
US-010: Aplicar a una Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  Al intentar enviar el formulario, se valida en el cliente que Nombre y Email no estén vacíos y Email tenga formato válido. Se muestran errores si falla.
2.  Al seleccionar un archivo CV, se valida en el cliente que la extensión sea `.pdf` o `.docx`. Se muestra error si no lo es.
3.  Al hacer clic en "Enviar Aplicación" (y pasar validaciones), se construye un objeto `FormData` que incluye los datos del formulario (nombre, email, tel, jobId) y el archivo CV.
4.  Se realiza una llamada POST al endpoint backend de recepción de candidaturas (definido por US-011, ej. `/api/public/v1/applications` o `/api/v1/applications` según Anexo I) con el `FormData` y `Content-Type: multipart/form-data`.
5.  Se muestra un indicador de carga durante el envío.
6.  Si la respuesta del backend es de éxito (ej. 201 Created), se muestra un mensaje claro de "Aplicación enviada con éxito" al candidato en el portal.
7.  Si la respuesta es de error (ej. 400, 500), se muestra un mensaje genérico de error al candidato.

## Solución Técnica Propuesta (Opcional)
Usar las capacidades nativas del navegador para `FormData` y `fetch`/`axios` para enviar `multipart/form-data`. Implementar validaciones en el cliente para feedback rápido.

## Dependencias Técnicas (Directas)
* TK-040 (Formulario UI que invoca esta lógica)
* Definición del endpoint backend para recepción de candidaturas (parte de US-011, ej. TK-043).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-010)

## Estimación Técnica Preliminar
[ 6 ] [horas] - [Implementación validaciones cliente, manejo FormData, llamada API multipart, manejo respuesta/errores]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, application, form, validation, file-upload

## Comentarios
El manejo de `multipart/form-data` y la validación de archivos son puntos clave.

## Enlaces o Referencias
[Documentación sobre FormData, fetch API]