# Requisito Funcional: RF-10

## 1. Título Descriptivo
* **Propósito:** Invocar Evaluación IA

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** Después de recepcionar una nueva candidatura (RF-09) y asegurar el perfil `CandidatoIA` (RF-09B), el ATS MVP debe iniciar el proceso de evaluación por IA. Esto implica enviar los datos relevantes (como el archivo CV o su ruta, el ID de la Vacante, el ID de la Candidatura) al servicio correspondiente de TalentIA Core AI (Servicio de Evaluación) para que realice el análisis.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Dispara el núcleo del procesamiento inteligente de TalentIA. Es el paso que solicita a la IA que analice al candidato contra la vacante, generando el score y la información que ayudará a los reclutadores.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Sistema (ATS MVP invoca a Core AI).

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Tras los pasos RF-09 y RF-09B, el ATS MVP realiza una llamada a la API del Servicio de Evaluación de Core AI.
    2.  La llamada incluye identificadores necesarios (ID Candidatura ATS, ID Vacante ATS, ID Archivo Candidato ATS) y/o el propio contenido del CV.
    3.  El sistema maneja la llamada (puede ser síncrona esperando respuesta, o asíncrona si la evaluación es larga, recibiendo un ID de tarea).
    4.  Se registra que la evaluación ha sido solicitada para esa candidatura.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-10), Sección 4.A (Gestión Candidaturas), Sección 7 (UC3).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-09 (Recepción Candidatura), RF-09B (Perfil CandidatoIA), RF-11/RF-12/RF-12B/RF-12C/RF-13 (Servicios Core AI que procesan la solicitud), RF-21 (API Interna).

## 9. Notas y Suposiciones del PO
* **Propósito:** La decisión de implementación (síncrona vs asíncrona) impacta cómo el ATS MVP maneja la respuesta (espera directa vs polling o webhook). Para MVP, síncrono con timeout razonable podría ser más simple si la evaluación es rápida (RNF-03).