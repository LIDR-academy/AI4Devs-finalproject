# Ticket: TK-058

## Título
CAI-BE: Implementar Manejo de Respuesta LLM y Retorno a ATS

## Descripción
Desarrollar la lógica dentro del servicio Core AI que recibe la respuesta exitosa de la API del LLM (obtenida en TK-057), extrae el texto relevante de la JD generada, y lo prepara para ser devuelto al ATS MVP a través de la respuesta del endpoint API de Core AI (TK-055). También debe manejar los casos de error provenientes de la lógica anterior (prompting, llamada LLM).

## User Story Relacionada
US-015: Generar Borrador de JD Usando IA (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  Recibe la respuesta JSON/texto del LLM (vía TK-057).
2.  Parsea la respuesta para extraer el contenido principal de la JD generada (la estructura de la respuesta depende del LLM).
3.  Realiza una limpieza/formateo básico del texto si es necesario.
4.  Prepara la estructura de datos de la respuesta exitosa para la API interna de Core AI (TK-055), incluyendo el texto de la JD.
5.  Si se recibió un error de pasos anteriores (TK-056, TK-057), prepara una estructura de datos de respuesta de error adecuada para la API interna (TK-055), incluyendo un mensaje de error descriptivo.
6.  Devuelve el objeto de respuesta (éxito o error) al controlador del endpoint (TK-055).

## Solución Técnica Propuesta (Opcional)
Implementar como parte del flujo del servicio de generación de JD.

## Dependencias Técnicas (Directas)
* TK-057 (Provee la respuesta del LLM o el error)
* TK-055 (Endpoint API que devuelve esta respuesta al ATS)
* Formato de respuesta esperado por el LLM.
* Formato de respuesta definido en la API interna (TK-001).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-015)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Parseo respuesta LLM, formateo básico, construcción objeto respuesta API interna]

## Asignación Inicial
Equipo Backend (Core AI)

## Etiquetas
backend, core-ai, ai, llm, response-handling, parsing, generate-jd

## Comentarios
Clave para entregar el resultado correcto al ATS.

## Enlaces o Referencias
[Documentación API del LLM sobre formato de respuesta], [TK-001 - Especificación API]