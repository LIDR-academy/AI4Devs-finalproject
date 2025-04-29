# Ticket: TK-158

## Título
BE-API: Implementar Endpoint API para Exportar Datos Candidatura (`GET /api/v1/applications/{applicationId}/export`)

## Descripción
Crear y exponer un endpoint `GET /api/v1/applications/{applicationId}/export` en el backend ATS. Este endpoint no devolverá JSON, sino que invocará la lógica de generación de exportación (TK-159) y devolverá directamente el archivo (ej. ZIP) con las cabeceras HTTP adecuadas para iniciar la descarga en el navegador del cliente. Protegido por autenticación.

## User Story Relacionada
US-044: Exportar Información Básica de un Candidato

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un endpoint `GET /api/v1/applications/{applicationId}/export`.
2.  El endpoint está protegido por autenticación (TK-005).
3.  Valida que `applicationId` exista y sea accesible. Devuelve 404 si no.
4.  Invoca la lógica de negocio (TK-159) para generar el archivo de exportación (stream o buffer).
5.  Si la lógica es exitosa, establece las cabeceras HTTP:
    * `Content-Type: application/zip` (o el MIME type apropiado).
    * `Content-Disposition: attachment; filename="export_candidato_{candidatoNombre}_{applicationId}.zip"` (o similar).
6.  Envía el contenido del archivo generado como cuerpo de la respuesta.
7.  Maneja errores de la lógica de negocio (ej. devolviendo 404 si no se encuentra el CV, 500 si falla la generación del ZIP).

## Solución Técnica Propuesta (Opcional)
Endpoint GET que devuelve directamente el stream del archivo. El framework backend debe permitir configurar las cabeceras de respuesta y enviar datos binarios.

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-005 (Middleware Autenticación)
* TK-159 (Lógica de Negocio Exportación)

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-044)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Creación ruta/controlador, integración middleware, configuración cabeceras descarga, streaming respuesta]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, export, download, file, zip, application

## Comentarios
Devuelve un archivo, no JSON.

## Enlaces o Referencias
[TK-001 - Especificación API], [Documentación framework sobre descarga de archivos]