# User Story: US-001

## Feature Asociada
Feature 7: Administración y Configuración del Sistema

## Título
Definir Contrato API Interna

## Narrativa
Como Administrador del Sistema (o Tech Lead)
Quiero que el contrato de la API interna entre ATS MVP y TalentIA Core AI esté claramente definido y documentado
Para asegurar una integración fluida, mantenible y poder verificar la comunicación entre componentes.

## Detalles
Define la necesidad de establecer las reglas de comunicación (endpoints, formatos request/response, autenticación) entre los dos sistemas principales. Es un habilitador técnico clave.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Se ha generado un documento (ej. Swagger/OpenAPI v3.x) que especifica todos los endpoints de la API interna requeridos para las funcionalidades Must Have de Fase 1 (Solicitar JD, Guardar Params IA, Crear/Actualizar CandidatoIA, Solicitar Evaluación, Enviar Feedback).
2.  Para cada endpoint, se define claramente: método HTTP, ruta (con versionado v1), parámetros de entrada (path, query, body) y formato/schema de los cuerpos de petición y respuesta (JSON).
3.  Se especifica el mecanismo de autenticación/autorización para la API interna (ej. API Key requerida en cabecera).
4.  Se definen los códigos de estado HTTP esperados para respuestas exitosas (200, 201) y errores comunes (400, 401, 404, 500).
5.  El documento de especificación de la API es accesible para el equipo de desarrollo (ej. en repositorio Git, Wiki).

## Requisito(s) Funcional(es) Asociado(s)
RF-21

## Prioridad: Must Have
* **Justificación:** Fundamental para la integración técnica entre ATS MVP y Core AI, necesaria para casi todas las demás features.

## Estimación Preliminar (SP): 3
* **Justificación:** Tarea principalmente de definición, documentación y acuerdo técnico. Requiere coordinación pero la implementación técnica subyacente (ej. generar el archivo Swagger) no es excesivamente compleja para los endpoints iniciales.