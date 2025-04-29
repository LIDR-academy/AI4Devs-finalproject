# Ticket: TK-065

## Título
CAI-BE: Implementar Endpoint API Core AI para Recibir Solicitud de Evaluación

## Descripción
Crear y exponer un endpoint en el servicio Core AI correspondiente (ej. Servicio de Evaluación) que reciba la solicitud del ATS MVP (enviada desde TK-045) para iniciar la evaluación de una nueva candidatura. Debe aceptar los identificadores necesarios (ID Candidatura ATS, ID Vacante ATS, ID/Referencia Archivo CV ATS).

## User Story Relacionada
US-019: Invocar Evaluación IA para Nueva Candidatura

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un endpoint (ej. `POST /api/v1/ai/evaluations`) en Core AI, definido según TK-001.
2.  El endpoint acepta un cuerpo JSON con los IDs requeridos: `candidatura_ats_id`, `vacante_ats_id`, `archivo_cv_ats_id` (o referencia al archivo).
3.  El endpoint está protegido por el mecanismo de autenticación interna.
4.  Valida que los IDs proporcionados sean válidos (formato correcto, no nulos). Devuelve 400 si falla.
5.  Invoca la lógica de negocio (TK-066) para iniciar el proceso de evaluación.
6.  Si la invocación es síncrona, espera y devuelve la respuesta final de la evaluación (definida en US-024). Si es asíncrona, devuelve una respuesta inmediata (ej. 202 Accepted) con un ID de tarea para consultar el estado (requeriría tickets adicionales para consulta de estado y notificación de finalización, no en MVP inicial). *Asumimos síncrono para MVP inicial según TK-045*.
7.  Maneja errores de validación o de la lógica de inicio (TK-066) devolviendo códigos de error apropiados (400, 500).

## Solución Técnica Propuesta (Opcional)
Implementar usando el framework backend de Core AI. Definir claramente el contrato de entrada en TK-001.

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-066 (Lógica de Negocio que inicia la evaluación)
* Autenticación interna.
* Decisión de diseño Síncrono vs Asíncrono (definido síncrono para MVP en TK-045).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-019)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Creación ruta/controlador, validación input, orquestación llamada a servicio de evaluación]

## Asignación Inicial
Equipo Backend (Core AI)

## Etiquetas
backend, core-ai, api, rest, evaluation, trigger

## Comentarios
Punto de entrada en Core AI para todo el flujo de evaluación.

## Enlaces o Referencias
[TK-001 - Especificación API]