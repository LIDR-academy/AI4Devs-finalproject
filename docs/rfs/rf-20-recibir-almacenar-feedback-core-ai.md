# Requisito Funcional: RF-20

## 1. Título Descriptivo
* **Propósito:** Recibir/Almacenar Feedback (Core AI)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** TalentIA Core AI (Servicio de Feedback y Aprendizaje) debe exponer una API interna para recibir los datos de feedback enviados por el ATS MVP (RF-19). Al recibir una petición de feedback, debe validarla y almacenarla de forma persistente (en la entidad `RegistroFeedbackIA` o similar) asociándola a la evaluación correspondiente, para su posterior uso en procesos de re-entrenamiento o ajuste de los modelos de IA.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Es el componente que materializa el objetivo de aprendizaje continuo. Almacena la "verdad del terreno" proporcionada por los humanos, que es esencial para mejorar la precisión y relevancia de la IA a lo largo del tiempo.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** N/A (Servicio interno).

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  El servicio Core AI expone una API que acepta los datos de feedback definidos en RF-19.
    2.  Valida la petición recibida (ej. IDs existen, tipo de feedback válido).
    3.  Crea un nuevo registro en `RegistroFeedbackIA` con la información recibida.
    4.  Almacena el registro en la base de datos de Core AI.
    5.  Devuelve una confirmación (o error) al ATS MVP.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-20), Sección 4.B (Módulo Aprendizaje), Sección 7 (UC5), Sección 11 (Modelo Datos - RegistroFeedbackIA).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-19 (Recepción de petición), RF-21 (API Interna). (Indirectamente, los procesos de re-entrenamiento usarán estos datos).

## 9. Notas y Suposiciones del PO
* **Propósito:** El proceso de *uso* de este feedback para re-entrenar modelos puede ser complejo y realizarse offline/batch, no necesariamente en tiempo real al recibir el feedback. El requisito aquí es solo recibirlo y almacenarlo correctamente.