# Requisito Funcional: RF-03

## 1. Título Descriptivo
* **Propósito:** Publicar/Despublicar Vacante

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El sistema (ATS MVP) debe permitir a los Reclutadores cambiar el estado de una vacante para controlar su visibilidad en el portal de candidatos externo. Una vacante "Publicada" debe ser visible, mientras que una en otro estado (ej. "Borrador", "Cerrada", "Archivada") no debe serlo.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Controla el flujo de recepción de candidaturas. Permite hacer visible la oferta cuando está lista para recibir aplicantes y ocultarla cuando ya no se aceptan más o la posición se ha cubierto. Es esencial para gestionar el ciclo de vida de la oferta.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador. (Indirectamente afecta al Candidato que ve o no la oferta).

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Desde la vista de gestión de una vacante, el Reclutador tiene opciones claras para cambiar su estado (ej. botón "Publicar", "Cerrar", "Archivar").
    2.  Cambiar el estado actualiza el campo `estado` de la vacante en la BBDD del ATS MVP.
    3.  Las vacantes con estado "Publicada" aparecen listadas en el Portal Básico de Empleo (RF-07).
    4.  Las vacantes con otros estados no aparecen en dicho portal.
    5.  Se registra la fecha de publicación/cierre si aplica.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-03), Sección 4.A (Gestión de Vacantes), Sección 7 (UC1).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-01 (Crear Vacante), RF-07 (Portal Básico de Empleo).

## 9. Notas y Suposiciones del PO
* **Propósito:** Los estados exactos ("Borrador", "Publicada", "Cerrada", "Archivada") deben definirse claramente.