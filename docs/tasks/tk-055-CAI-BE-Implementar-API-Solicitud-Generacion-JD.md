# Ticket: TK-055

## Título
CAI-BE: Implementar Endpoint API Core AI para Solicitud Generación JD

## Descripción
Crear y exponer un endpoint en el servicio Core AI correspondiente (ej. Servicio Generación JD) que reciba las solicitudes del ATS MVP (iniciadas en TK-047) para generar una JD. Debe aceptar los datos básicos de la vacante como input y orquestar el proceso de generación invocando la lógica interna (TK-056, TK-057, TK-058).

## User Story Relacionada
US-015: Generar Borrador de JD Usando IA (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un endpoint (ej. `POST /api/v1/ai/generate-jd`) en el servicio Core AI, definido según TK-001.
2.  El endpoint acepta un cuerpo JSON con datos básicos de la vacante (ej. titulo, requisitos_clave).
3.  El endpoint está protegido por el mecanismo de autenticación interna definido (ej. API Key, token interno).
4.  Valida la entrada básica recibida del ATS MVP. Devuelve 400 si falla.
5.  Invoca la lógica de construcción de prompt (TK-056).
6.  Invoca la lógica de integración con LLM (TK-057).
7.  Invoca la lógica de manejo de respuesta (TK-058).
8.  Devuelve la respuesta al ATS MVP (JD generada o error) con el código de estado apropiado (200 OK, 500 Error, etc.).

## Solución Técnica Propuesta (Opcional)
Implementar usando el framework backend de Core AI (Java/Spring Boot).

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-056 (Lógica Prompt Engineering)
* TK-057 (Lógica Integración LLM)
* TK-058 (Lógica Manejo Respuesta)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-015)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Creación ruta/controlador, validación básica, orquestación llamadas internas]

## Asignación Inicial
Equipo Backend (Core AI)

## Etiquetas
backend, core-ai, api, rest, generate-jd, ai

## Comentarios
Punto de entrada para la funcionalidad de generación de JD en Core AI.

## Enlaces o Referencias
[TK-001 - Especificación API]