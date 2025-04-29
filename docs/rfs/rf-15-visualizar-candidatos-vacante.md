# Requisito Funcional: RF-15

## 1. Título Descriptivo
* **Propósito:** Visualizar Candidatos por Vacante

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El ATS MVP debe proporcionar una interfaz (ej. una tabla o lista) donde los usuarios (Reclutador/Manager) puedan ver todos los candidatos que han aplicado a una vacante específica. Esta vista debe incluir información clave de cada candidato, como nombre, fecha de aplicación, etapa actual en el pipeline, y la evaluación IA (score RF-14 y etapa sugerida RF-14B) si está disponible.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Es la vista operativa fundamental para que los reclutadores gestionen el día a día de una vacante. Permite tener una visión general de todos los aplicantes y acceder a sus perfiles para revisión.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador, Hiring Manager.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Desde la lista de vacantes, se puede seleccionar una vacante y acceder a la vista de sus candidatos.
    2.  Se muestra una lista/tabla con las candidaturas asociadas a esa vacante.
    3.  Cada fila/elemento muestra: Nombre del Candidato, Fecha Aplicación, Etapa Actual, Score IA (si aplica), Etapa Sugerida IA (si aplica).
    4.  Se puede hacer clic en una candidatura para ver su detalle.
    5.  (Should Have - RF-26) La lista permite ordenar por Score IA.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-15), Sección 4.A (Interfaz Usuario), Sección 7 (UC4).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-01 (Existencia Vacantes), RF-09 (Existencia Candidaturas), RF-14/RF-14B (Visualización datos IA).

## 9. Notas y Suposiciones del PO
* **Propósito:** Para MVP, la paginación básica puede ser necesaria si se esperan muchos candidatos. Filtros avanzados no son Must Have.