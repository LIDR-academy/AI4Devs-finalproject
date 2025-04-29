# Ticket: TK-161

## Título
FE-Logic: Implementar Lógica Frontend para Iniciar Descarga Exportación

## Descripción
Implementar la lógica simple en el frontend que se ejecuta al hacer clic en el botón "Exportar Datos" (TK-160). Debe iniciar la descarga del archivo generado por el endpoint del backend (TK-158).

## User Story Relacionada
US-044: Exportar Información Básica de un Candidato

## Criterios de Aceptación Técnicos (Verificables)
1.  Se implementa un manejador de eventos para el clic en el botón de exportar (TK-160).
2.  El manejador obtiene el `applicationId` de la candidatura actual.
3.  Redirige el navegador (o abre una nueva pestaña) a la URL del endpoint de exportación: `/api/v1/applications/{applicationId}/export`.
4.  Esto inicia la descarga del archivo servido por el backend (TK-158).

## Solución Técnica Propuesta (Opcional)
Usar `window.location.href` o crear un enlace `<a>` dinámicamente con el `href` apuntando a la API y simular un clic. La redirección directa es más simple si la API es GET y está protegida por cookies de sesión o si el token se puede pasar de alguna forma (aunque pasar token en URL GET no es ideal; si se usa token Bearer, podría requerir una llamada fetch inicial para obtener el blob y luego generar la descarga en cliente, lo cual es más complejo). *Decisión MVP: Asumir GET y redirección simple, ajustar si la autenticación lo impide.*

## Dependencias Técnicas (Directas)
* TK-160 (Botón UI que invoca esta lógica)
* TK-158 (Endpoint Backend API al que apuntar)

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-044)

## Estimación Técnica Preliminar
[ 1 ] [hora] - [Implementación manejador de clic, lógica de redirección URL]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, export, download, navigation

## Comentarios
La implementación puede volverse más compleja si se requiere manejo de token Bearer para la descarga.

## Enlaces o Referencias
N/A