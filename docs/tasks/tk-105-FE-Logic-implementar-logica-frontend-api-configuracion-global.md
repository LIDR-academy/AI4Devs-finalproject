# Ticket: TK-105

## Título
FE-Logic: Implementar Lógica Frontend para API Configuración Global

## Descripción
Desarrollar la lógica en el frontend (servicio/store) para llamar a los endpoints de la API de configuración global (TK-102): obtener la configuración al cargar la UI (TK-104) y enviar la actualización al guardar cambios.

## User Story Relacionada
US-032: Automatizar (Opcionalmente) Movimiento Inicial a Etapa Sugerida

## Criterios de Aceptación Técnicos (Verificables)
1.  Al cargar el componente de configuración (TK-104), se llama a `GET /api/v1/admin/settings` y el estado del checkbox se establece con el valor `enable_auto_stage_move` recibido.
2.  Al guardar cambios desde TK-104, se llama a `PUT /api/v1/admin/settings` enviando el nuevo valor `{ "enable_auto_stage_move": true/false }`.
3.  Las llamadas incluyen token de autenticación y requieren rol Admin.
4.  Se manejan estados de carga y errores de las llamadas API, mostrando feedback al usuario.

## Solución Técnica Propuesta (Opcional)
Añadir funciones al servicio API existente o a un nuevo servicio de configuración.

## Dependencias Técnicas (Directas)
* TK-102 (Endpoints Backend API)
* TK-104 (Componente UI que invoca esta lógica)
* Mecanismo de autenticación/autorización frontend (TK-002 y rol).

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-032)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Implementación llamadas API GET/PUT, manejo estado, integración UI]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, configuration, settings

## Comentarios
Lógica API estándar para obtener y actualizar datos.

## Enlaces o Referencias
[TK-001 - Especificación API]