# Requisito Funcional: RF-22

## 1. Título Descriptivo
* **Propósito:** Invocación Proveedor LLM (Core AI)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** TalentIA Core AI (específicamente los servicios que lo requieran, como Generación JD RF-06 y potencialmente Evaluación RF-11/RF-24) debe ser capaz de realizar llamadas seguras y fiables a la API de un proveedor externo de Large Language Models (LLM) configurado (ej. OpenAI GPT, Google Gemini, Anthropic Claude). Debe poder enviar un prompt y recibir la respuesta generada por el LLM.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Permite aprovechar las capacidades avanzadas de procesamiento y generación de lenguaje natural de los modelos LLM externos, que son la base para funcionalidades como la generación automática de JDs y potencialmente el análisis semántico de CVs o la generación de resúmenes.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** N/A (Servicio interno).

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  El sistema permite configurar la URL base y la API key del proveedor LLM de forma segura (RNF-11).
    2.  Los servicios Core AI pueden construir un prompt adecuado para la tarea (generar JD, resumir, etc.).
    3.  Se realiza una llamada HTTPS a la API del LLM incluyendo el prompt y la API key en la cabecera de autorización.
    4.  El sistema maneja correctamente la respuesta del LLM (éxito con contenido, error).
    5.  Se implementan mecanismos básicos de resiliencia (ej. timeouts, reintentos con backoff) para la llamada externa.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-22), Sección 4.B, Sección 7 (UC1, UC3), Sección 12 (Arquitectura).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-06 (Generación JD), RF-24 (Resumen Candidato - Should Have).

## 9. Notas y Suposiciones del PO
* **Propósito:** Implica costes asociados al uso de la API del proveedor LLM. La gestión de errores y la optimización de prompts son clave para la eficiencia y calidad. Se debe considerar la privacidad y seguridad al enviar datos (potencialmente anonimizados) al LLM externo.