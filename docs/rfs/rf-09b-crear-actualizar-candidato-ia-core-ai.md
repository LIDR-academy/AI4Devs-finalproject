# Requisito Funcional: RF-09B

## 1. Título Descriptivo
* **Propósito:** Crear/Actualizar CandidatoIA (Core AI)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** Inmediatamente después de que el ATS MVP recepciona una nueva candidatura (RF-09), o como parte de ese flujo, el sistema debe interactuar con TalentIA Core AI (Servicio Perfil Candidato) para asegurar la existencia y actualización del perfil unificado `CandidatoIA`. Si no existe un `CandidatoIA` para el email del aplicante, se debe crear uno. Si ya existe, se debe añadir el ID de la nueva `Candidatura` (del ATS MVP) a la lista `candidaturas_ids` del `CandidatoIA` existente.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Establece y mantiene el perfil unificado del candidato dentro del ecosistema de IA. Es fundamental para poder asociar múltiples evaluaciones de diferentes candidaturas a la misma persona y habilitar la vista de historial unificado (RF-26B).

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Sistema (ATS MVP invoca a Core AI).

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Tras registrar una `Candidatura` en ATS MVP, se realiza una llamada a la API del Servicio Perfil de Core AI, pasando el email del candidato y el ID de la nueva `Candidatura`.
    2.  Core AI busca un `CandidatoIA` existente por email.
    3.  Si no se encuentra, Core AI crea un nuevo registro `CandidatoIA` con el email y añade el ID de la `Candidatura` a su lista `candidaturas_ids`.
    4.  Si se encuentra, Core AI añade el ID de la nueva `Candidatura` a la lista `candidaturas_ids` del `CandidatoIA` existente y actualiza la fecha de modificación.
    5.  Core AI devuelve una confirmación (o error) al ATS MVP.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-09B), Sección 7 (UC3), Sección 11 (Modelo de Datos - CandidatoIA).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-09 (Recepción de Candidatura), RF-21 (API Interna).

## 9. Notas y Suposiciones del PO
* **Propósito:** Requiere que el modelo `CandidatoIA` exista en Core AI con el campo `candidaturas_ids`. La sincronización de otros datos (nombre, teléfono) puede ser parte de esta llamada o gestionarse por separado.