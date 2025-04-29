# Ticket: TK-045

## Título
BE: Desencadenar Procesamiento IA Post-Aplicación

## Descripción
Implementar el mecanismo en el backend para que, una vez que una nueva candidatura ha sido exitosamente recepcionada y almacenada (TK-044), se inicien los siguientes pasos del flujo de IA: 1) Creación/Actualización del `CandidatoIA` (US-018) y 2) Invocación de la Evaluación IA (US-019).

## User Story Relacionada
US-011: Recepcionar y Almacenar Nueva Candidatura (implícitamente, para que la aplicación sea útil) y habilita US-018, US-019.

## Criterios de Aceptación Técnicos (Verificables)
1.  Tras la finalización exitosa de la lógica de TK-044 (candidatura guardada).
2.  Se realiza una llamada (directa o asíncrona) al servicio/endpoint de Core AI responsable de US-018 (Gestionar Perfil CandidatoIA), pasando el email y el ID de la nueva candidatura ATS.
3.  Se realiza una llamada (directa o asíncrona) al servicio/endpoint de Core AI responsable de US-019 (Invocar Evaluación IA), pasando los IDs necesarios (Candidatura ATS, Vacante ATS, Archivo CV ATS).
4.  El mecanismo elegido (llamada directa vs. evento asíncrono) maneja errores básicos de comunicación (ej. loguear si no se puede contactar con Core AI).
5.  El procesamiento de la aplicación (TK-044) no se bloquea indefinidamente esperando la respuesta de estas llamadas si son asíncronas.

## Solución Técnica Propuesta (Opcional)
* **Opción A (Simple - Síncrona):** La lógica de TK-044 llama directamente a las APIs de Core AI (US-018, US-019) después de guardar en BBDD. Puede aumentar la latencia de respuesta al candidato.
* **Opción B (Robusta - Asíncrona):** La lógica de TK-044 publica un evento (ej. `CandidaturaRecibida`) en un message broker (RabbitMQ/Kafka). Workers/Servicios separados escuchan este evento y realizan las llamadas a Core AI. Desacopla los sistemas.

*Decisión MVP:* Empezar con Opción A (llamada directa) por simplicidad, asumiendo que las llamadas a Core AI para iniciar el proceso son rápidas. Refactorizar a Opción B si se observan problemas de rendimiento o se necesita mayor desacoplamiento.

## Dependencias Técnicas (Directas)
* TK-044 (Lógica que desencadena esto)
* Definición/Implementación de los endpoints API de Core AI para US-018 y US-019 (parte de TK-001).
* (Si Opción B) Infraestructura y configuración de Message Broker.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-011, ya que sin esto la IA no se activa)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Implementación de 2 llamadas API directas desde backend ATS a Core AI, manejo básico errores comunicación] (Estimación para Opción A)

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, integration, event, async, core-ai, trigger

## Comentarios
Ticket puente entre la recepción de la aplicación y el inicio del procesamiento IA. La elección Síncrono vs Asíncrono es una decisión de diseño importante.

## Enlaces o Referencias
[TK-001 - Especificación API], [Documentación Message Broker si aplica]