# Ticket: TK-057

## Título
CAI-BE: Implementar Integración Segura con API de LLM Externo

## Descripción
Desarrollar la lógica dentro del servicio Core AI para realizar la llamada HTTP a la API del proveedor LLM externo configurado. Debe incluir el manejo seguro de la API Key, el envío del prompt (generado en TK-056), la recepción de la respuesta, y el manejo básico de errores de comunicación/API.

## User Story Relacionada
US-015: Generar Borrador de JD Usando IA (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  La URL base y la API Key del LLM se obtienen de configuración segura (variables entorno, secret manager - RNF-11).
2.  Se utiliza un cliente HTTP robusto (ej. RestTemplate, Feign, OkHttp en Java) para realizar la llamada POST a la API del LLM.
3.  La petición incluye el prompt (de TK-056) en el formato esperado por la API del LLM (ej. JSON con campo 'prompt' o 'messages').
4.  La petición incluye la API Key en la cabecera de autorización correcta (ej. `Authorization: Bearer <API_KEY>`).
5.  Se configuran timeouts razonables para la llamada API.
6.  Se manejan códigos de estado HTTP de éxito (ej. 200 OK) y error (ej. 4xx, 5xx) devueltos por la API del LLM.
7.  Se implementan reintentos básicos (con backoff) para errores transitorios (ej. 5xx, timeouts).
8.  La respuesta exitosa (contenido generado por LLM) se pasa a la lógica de manejo de respuesta (TK-058).
9.  Los errores persistentes de comunicación o API se manejan y se propagan adecuadamente (ej. lanzando excepción específica).

## Solución Técnica Propuesta (Opcional)
Crear un cliente/servicio dedicado para la interacción con el LLM. Usar librerías para reintentos (ej. Spring Retry).

## Dependencias Técnicas (Directas)
* TK-056 (Provee el prompt)
* TK-058 (Consume la respuesta)
* Configuración segura de API Key y URL base.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-015)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Implementación cliente HTTP, manejo auth LLM, manejo básico errores/reintentos]

## Asignación Inicial
Equipo Backend (Core AI)

## Etiquetas
backend, core-ai, ai, llm, integration, api-client, http, security, retry

## Comentarios
La gestión segura de la API Key es fundamental.

## Enlaces o Referencias
[Documentación API del LLM elegido, Documentación cliente HTTP/librería reintentos]