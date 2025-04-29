# Ticket: TK-102

## Título
BE-API: Implementar Endpoints API para Gestión Configuración Global (GET/PUT)

## Descripción
Crear y exponer endpoints API en el backend del ATS MVP (ej. `GET /api/v1/admin/settings` y `PUT /api/v1/admin/settings`) para permitir a los administradores leer y actualizar las configuraciones globales del sistema, incluyendo la opción `enable_auto_stage_move`. Protegido por rol ADMIN.

## User Story Relacionada
US-032: Automatizar (Opcionalmente) Movimiento Inicial a Etapa Sugerida

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe `GET /api/v1/admin/settings` que devuelve un objeto con las configuraciones actuales (ej. `{ "enable_auto_stage_move": false }`). Protegido (ADMIN).
2.  Existe `PUT /api/v1/admin/settings` que acepta un cuerpo JSON con las configuraciones a actualizar (ej. `{ "enable_auto_stage_move": true }`). Protegido (ADMIN).
3.  El endpoint PUT valida los tipos de datos recibidos.
4.  Invoca la lógica de negocio (TK-103) para leer/escribir la configuración.
5.  Devuelve 200 OK con la configuración actualizada (PUT) o la configuración actual (GET), o errores apropiados (400, 401, 403, 500).

## Solución Técnica Propuesta (Opcional)
Endpoints RESTful estándar para gestionar la configuración. PUT es adecuado para reemplazar el conjunto de configuraciones (o PATCH para parcial).

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-005 (Middleware Autenticación/Autorización ADMIN)
* TK-103 (Lógica de Negocio Configuración)

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-032)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Creación 2 endpoints, integración middleware, validación input]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, configuration, settings, admin

## Comentarios
Permite la gestión de la configuración desde el frontend.

## Enlaces o Referencias
[TK-001 - Especificación API]