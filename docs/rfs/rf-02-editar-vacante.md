# Requisito Funcional: RF-02

## 1. Título Descriptivo
* **Propósito:** Editar Vacante

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El sistema (ATS MVP) debe permitir a los usuarios (principalmente Reclutadores) modificar la información básica de una vacante previamente creada. Esto incluye poder cambiar título, descripción, requisitos, etc., antes o después de su publicación.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Permite corregir errores, actualizar información (ej. cambio de requisitos) o refinar detalles de la vacante durante su ciclo de vida, asegurando que la información presentada sea precisa.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador. (Potencialmente Hiring Manager para ciertos campos o validaciones).

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Un Reclutador puede seleccionar una vacante existente desde la lista de vacantes.
    2.  Se presenta una opción para "Editar" la vacante seleccionada.
    3.  El formulario de edición muestra los datos actuales de la vacante y permite modificarlos (campos de RF-01 y otros relevantes como descripción).
    4.  Al guardar los cambios, la información de la vacante en la base de datos del ATS MVP se actualiza.
    5.  Se registra la fecha de actualización de la vacante.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-02), Sección 4.A (Gestión de Vacantes), Sección 7 (UC1).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-01 (Crear Vacante).

## 9. Notas y Suposiciones del PO
* **Propósito:** La edición debe permitir modificar tanto datos básicos como la descripción completa y los parámetros IA (ver RF-04B).