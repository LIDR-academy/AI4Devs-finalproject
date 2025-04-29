# Ticket: TK-066

## Título
CAI-BE: Implementar Lógica Core AI para Iniciar Proceso de Evaluación

## Descripción
Desarrollar la lógica de negocio inicial dentro del servicio de Evaluación de Core AI que se activa al recibir una solicitud válida (desde TK-065). Debe validar la existencia/accesibilidad de los recursos referenciados (ej. ¿puede acceder al CV a partir de la referencia?) y luego iniciar el primer paso del pipeline de evaluación: la lógica de parsing del CV (TK-067 / US-020).

## User Story Relacionada
US-019: Invocar Evaluación IA para Nueva Candidatura (y desencadena US-020)

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método de servicio recibe los IDs validados (`candidatura_ats_id`, `vacante_ats_id`, `archivo_cv_ats_id`/referencia).
2.  (Opcional, dependiendo de dónde se almacena el CV) Valida que puede acceder al archivo CV usando la referencia proporcionada (ej. si es una URL a S3, verifica que existe o tiene permisos). Si no, lanza error 404/400.
3.  Invoca la lógica/servicio responsable del parsing del CV (TK-067), pasando la referencia/contenido del archivo y los IDs relevantes para asociar el resultado.
4.  Orquesta el flujo subsiguiente: tras el parsing (TK-067), invoca el scoring (TK-069), etc., hasta obtener la respuesta final (US-024).
5.  Maneja errores provenientes de los pasos subsiguientes (parsing, scoring) y los propaga adecuadamente para la respuesta final del endpoint (TK-065).

## Solución Técnica Propuesta (Opcional)
Implementar como un método principal en el Servicio de Evaluación que orquesta las llamadas a otros métodos/servicios internos (Parsing, Scoring, etc.).

## Dependencias Técnicas (Directas)
* TK-065 (Endpoint API que invoca esta lógica)
* Lógica/Servicio de Acceso a Archivos CV (puede ser parte de TK-043 o una interfaz compartida).
* TK-067 (Lógica de Parsing CV a invocar).
* Lógica de Scoring (TK-069), Comparación (TK-071), Sugerencia (TK-072), Retorno (TK-073) - Tickets futuros.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-019)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Implementación orquestación básica del flujo de evaluación, validación inicial de acceso a CV]

## Asignación Inicial
Equipo Backend (Core AI)

## Etiquetas
backend, core-ai, logic, service, evaluation, orchestrator, pipeline

## Comentarios
Ticket clave para el flujo de evaluación dentro de Core AI. Su complejidad aumentará si se implementa como asíncrono.

## Enlaces o Referencias
[TK-001 - Especificación API]