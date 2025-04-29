# Requisito Funcional: RF-21

## 1. Título Descriptivo
* **Propósito:** API Interna ATS MVP <-> Core AI

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** Debe existir una interfaz de programación de aplicaciones (API) interna, bien definida, documentada y versionada, que permita la comunicación entre los componentes del ATS MVP y los microservicios de TalentIA Core AI. Esta API debe cubrir todas las interacciones necesarias identificadas en los casos de uso y requisitos funcionales (ej. solicitar JD, guardar params IA, solicitar evaluación, enviar feedback, crear/actualizar CandidatoIA).

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Es la "tubería" que conecta los dos componentes principales de la solución. Una API clara y estable es fundamental para la integración, mantenibilidad y evolución del sistema, permitiendo que ATS MVP y Core AI se desarrollen y desplieguen de forma relativamente independiente.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Sistema (Define la comunicación entre componentes).

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Se elige un estilo de API (RESTful recomendado).
    2.  Se definen los endpoints necesarios para cada interacción (RF-04, RF-04B, RF-09B, RF-10, RF-19, RF-26B opcional).
    3.  Se definen los formatos de petición y respuesta (JSON recomendado) para cada endpoint.
    4.  Se utiliza versionado explícito en la URL (ej. `/api/v1/...`).
    5.  Se implementa un mecanismo de autenticación/autorización básico para la comunicación interna (ej. API key compartida, token interno).
    6.  La API está documentada (ej. usando OpenAPI/Swagger).

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-21), Sección 10 (Modelo Integración), Sección 12 (Arquitectura).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** Todos los RF que implican comunicación entre ATS MVP y Core AI.

## 9. Notas y Suposiciones del PO
* **Propósito:** La definición detallada del contrato de esta API es una tarea técnica clave temprana en el desarrollo. Considerar un Gateway API (Sec 12) puede simplificar la gestión.