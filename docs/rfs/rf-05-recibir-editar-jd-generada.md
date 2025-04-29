# Requisito Funcional: RF-05

## 1. Título Descriptivo
* **Propósito:** Recibir y Editar JD generada

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El ATS MVP debe ser capaz de recibir el contenido de la Job Description generado por TalentIA Core AI (tras la solicitud de RF-04) y presentarlo al Reclutador en un editor de texto enriquecido (o similar), permitiéndole revisar, modificar y finalmente guardar/publicar la descripción.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Asegura el principio de "Human in the loop". Permite al Reclutador validar, ajustar y personalizar el contenido generado por la IA antes de que sea público o utilizado, garantizando la calidad final y la adecuación al contexto específico.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Tras una solicitud exitosa de generación de JD (RF-04, RF-06), el contenido recibido de Core AI se muestra en un campo de edición en el formulario de la vacante.
    2.  El Reclutador puede modificar libremente el texto en el editor.
    3.  Al guardar la vacante, el contenido final del editor se almacena como la descripción oficial de la vacante en la BBDD del ATS MVP.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-05), Sección 4.A, Sección 7 (UC1).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-04 (Solicitud), RF-06 (Generación), RF-01/RF-02 (Contexto Vacante).

## 9. Notas y Suposiciones del PO
* **Propósito:** Asume la existencia de un editor de texto (simple o enriquecido) en la interfaz del ATS MVP.