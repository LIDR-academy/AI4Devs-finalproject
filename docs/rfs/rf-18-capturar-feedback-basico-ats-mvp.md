# Requisito Funcional: RF-18

## 1. Título Descriptivo
* **Propósito:** Capturar Feedback Básico (ATS MVP)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** La interfaz del ATS MVP, al mostrar la evaluación IA de un candidato (RF-14), debe ofrecer al menos un mecanismo simple para que el usuario (Reclutador/Manager) proporcione retroalimentación sobre la calidad o corrección de esa evaluación. Un ejemplo básico podría ser un par de botones "pulgar arriba / pulgar abajo" para validar el score general, o una opción para indicar si la sugerencia de etapa (RF-14B) fue útil/correcta.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Permite recoger información valiosa directamente del experto humano sobre el desempeño de la IA. Este feedback es crucial para el Módulo de Aprendizaje (RF-20) y la mejora continua de los modelos de IA (objetivo clave de Fase 1).

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador, Hiring Manager.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  En la vista de detalle de la candidatura, junto a la información de evaluación IA (score, etapa sugerida), existen controles interactivos para dar feedback (ej. botones, estrellas, etc.).
    2.  El usuario puede interactuar con estos controles para indicar su valoración.
    3.  La acción del usuario es capturada por el frontend del ATS MVP.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-18), Sección 4.A (Interfaz Usuario), Sección 7 (UC5).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-14/RF-14B (Mostrar Evaluación sobre la que dar feedback), RF-19 (Enviar Feedback).

## 9. Notas y Suposiciones del PO
* **Propósito:** El MVP requiere *al menos* un mecanismo básico. RF-27 (Should Have) propone mecanismos más detallados. El diseño exacto del control de feedback debe definirse.