# Requisito Funcional: RF-06

## 1. Título Descriptivo
* **Propósito:** Generar Contenido JD (Core AI)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El componente TalentIA Core AI (específicamente el Servicio de Generación JD) debe ser capaz de recibir parámetros básicos de una vacante (título, requisitos clave iniciales, etc.) desde el ATS MVP (vía RF-04) y generar un borrador de descripción de puesto estructurada y profesional, incluyendo secciones como introducción, responsabilidades, requisitos y beneficios, utilizando un proveedor de LLM externo.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Es el núcleo de la funcionalidad de asistencia IA para la creación de JDs. Materializa el objetivo de reducir el tiempo y esfuerzo manual en esta tarea, aprovechando las capacidades generativas de los LLMs.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** N/A (Servicio interno invocado por ATS MVP). Indirectamente beneficia al Reclutador.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  El servicio Core AI expone una API interna que acepta datos básicos de una vacante como input.
    2.  Al ser invocado, el servicio formula un prompt adecuado y llama a la API del proveedor LLM configurado (RF-22).
    3.  Procesa la respuesta del LLM para obtener el texto de la JD.
    4.  Devuelve el texto generado (o un error) al ATS MVP que lo invocó (para RF-05).
    5.  Opcionalmente, almacena metadatos sobre la generación (ej. prompt usado, modelo LLM).

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-06), Sección 4.B (Generador Inteligente de JD), Sección 7 (UC1), Sección 12 (Arquitectura).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-04 (Invocación desde ATS), RF-22 (Invocación Proveedor LLM), RF-21 (API Interna).

## 9. Notas y Suposiciones del PO
* **Propósito:** La calidad y estructura de la JD generada dependerá de la calidad del prompt y las capacidades del LLM. Requiere configuración segura de la API key del proveedor LLM.