# Ticket: TK-029

## Título
FE: Implementar Lógica Frontend para API de Actualización de Estado Vacante

## Descripción
Desarrollar la lógica en el frontend para manejar el clic en los botones de cambio de estado (TK-028). Debe llamar al endpoint específico de la API del backend (`PATCH /api/v1/jobs/{jobId}/status`, TK-026) enviando el nuevo estado deseado, y actualizar la UI reflejando el nuevo estado si la llamada es exitosa.

## User Story Relacionada
US-007: Publicar y Despublicar una Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  Al hacer clic en un botón de cambio de estado (ej. "Publicar" en TK-028), se identifica el `jobId` y el `nuevoEstado` correspondiente ('PUBLICADA').
2.  Se realiza una llamada PATCH a `/api/v1/jobs/{jobId}/status` con `{"estado": "NUEVO_ESTADO"}` en el cuerpo y el token de autenticación.
3.  Se muestra un indicador de carga durante la llamada API.
4.  Si la respuesta es 200 OK, se actualiza el estado de la vacante en el store/estado local del frontend.
5.  La UI (botones visibles, indicador de estado) se actualiza para reflejar el nuevo estado recibido en la respuesta.
6.  Se puede mostrar un mensaje de confirmación de éxito (ej. toast).
7.  Si la respuesta es un error (400, 404, 409, 500), se muestra un mensaje de error específico al usuario.

## Solución Técnica Propuesta (Opcional)
Usar servicios/stores y librería HTTP. Actualizar el estado local de la vacante tras la respuesta exitosa.

## Dependencias Técnicas (Directas)
* TK-026 (Endpoint Backend API)
* TK-028 (Controles UI que invocan esta lógica)
* Mecanismo de autenticación frontend (TK-002).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-007)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Implementación llamada API PATCH, manejo de diferentes acciones/estados, actualización de UI, manejo errores]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, vacancy, job, status

## Comentarios
Manejar la actualización del estado local en el frontend es clave para que la UI sea consistente.

## Enlaces o Referencias
[TK-001 - Especificación API]