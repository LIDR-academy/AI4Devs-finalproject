# User Story: US-015

## Feature Asociada
Feature 2: Asistencia IA para Descripción de Puesto (JD)

## Título
Generar Borrador de JD Usando IA (Capacidad Core AI)

## Narrativa
Como Sistema TalentIA Core AI
Quiero poder recibir datos básicos de una vacante, invocar a un proveedor LLM externo con un prompt adecuado, y procesar la respuesta
Para generar un borrador estructurado y profesional de la Descripción del Puesto (JD) y devolverlo al ATS MVP.

## Detalles
Describe la capacidad interna del microservicio Core AI para realizar la generación de contenido.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que el servicio Core AI recibe una petición API interna (desde US-012) con datos básicos de la vacante (título, etc.).
2.  El servicio formula un prompt específico para generación de JD y realiza una llamada a la API del proveedor LLM configurado (RF-22).
3.  Dado que la llamada al LLM es exitosa, el servicio extrae el contenido de la JD generada de la respuesta del LLM.
4.  El servicio devuelve una respuesta API interna al ATS MVP conteniendo el texto de la JD generada.
5.  Dado que la llamada al LLM falla (error, timeout), el servicio devuelve una respuesta API interna indicando el error específico al ATS MVP.
6.  (Opcional - RF-23) Dado que existen datos internos relevantes (ej. perfil de puesto estándar) Y la lógica para usarlos está implementada, estos datos se incorporan en el prompt al LLM o se usan para refinar la JD generada.

## Requisito(s) Funcional(es) Asociado(s)
RF-06, RF-23 (Should Have)

## Prioridad: Must Have
* **Justificación:** Es la capacidad central de IA que habilita la funcionalidad de generación de JD.

## Estimación Preliminar (SP): 5
* **Justificación:** Requiere lógica de backend para manejar la petición API, construir prompts efectivos, interactuar con una API externa (LLM), manejar errores y respuestas, y potencialmente integrar datos internos (RF-23 añade complejidad). Complejidad moderada.