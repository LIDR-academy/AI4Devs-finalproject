# Ticket: TK-142

## Título
BE-Logic: Implementar Lógica Generación Notificaciones en Eventos Clave

## Descripción
Modificar las lógicas de negocio existentes en el backend ATS donde ocurren eventos notificables (inicialmente: nueva candidatura creada - post TK-044, cambio de etapa a una relevante - post TK-097) para identificar al usuario(s) destinatario(s) (ej. Recruiter/HM de la vacante) y crear un registro en la tabla `Notificacion` (TK-141) con el mensaje y enlace apropiados.

## User Story Relacionada
US-041: Recibir Notificaciones Internas sobre Eventos Clave

## Criterios de Aceptación Técnicos (Verificables)
1.  Tras la creación exitosa de una `Candidatura` (en TK-044), se identifica el `recruiter_id` y `hiring_manager_id` de la `Vacante` asociada.
2.  Se crea un registro `Notificacion` para cada uno de ellos (si existen y son diferentes) con un mensaje como "Nueva candidatura recibida para [Título Vacante]" y un `link_url` a la candidatura.
3.  Tras un cambio de etapa exitoso (en TK-097) a una etapa predefinida como "relevante" (ej. 'Entrevista HM'), se identifica al usuario relevante (ej. el HM) y se crea una `Notificacion` para él.
4.  La creación de la notificación se realiza de forma robusta (ej. no debe fallar la operación principal si la creación de la notificación falla, pero se debe loguear el error).

## Solución Técnica Propuesta (Opcional)
Inyectar un servicio de Notificaciones en los servicios existentes (Vacantes, Candidaturas) y llamarlo en los puntos adecuados. La lógica para determinar destinatarios puede requerir consultar la Vacante.

## Dependencias Técnicas (Directas)
* TK-044 (Lógica creación candidatura a modificar)
* TK-097 (Lógica cambio etapa a modificar)
* TK-141 (Esquema `Notificacion` para crear registros)
* Lógica para obtener Recruiter/HM de una Vacante.

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-041)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Modificar 2+ lógicas existentes, implementar lógica creación notificación, identificación destinatarios]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, notification, event, trigger, generation

## Comentarios
Define dónde y cuándo se generan las notificaciones.

## Enlaces o Referencias
N/A