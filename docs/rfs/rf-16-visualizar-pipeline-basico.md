# Requisito Funcional: RF-16

## 1. Título Descriptivo
* **Propósito:** Visualizar Pipeline Básico

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El ATS MVP debe ofrecer una representación visual del pipeline de selección para una vacante específica, mostrando las diferentes etapas configuradas (RF-28) y los candidatos que se encuentran en cada una. Una vista tipo tablero Kanban es la recomendada, donde cada columna representa una etapa y cada tarjeta un candidato.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Proporciona una visión clara del estado general del proceso de selección para una vacante, facilitando la identificación de cuellos de botella y la gestión del flujo de candidatos a través de las distintas fases.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador, Hiring Manager.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Se puede acceder a la vista de Pipeline para una vacante seleccionada.
    2.  La vista muestra columnas que representan las etapas del pipeline configuradas (RF-28).
    3.  Dentro de cada columna, se muestran tarjetas representando a los candidatos que están actualmente en esa etapa.
    4.  Cada tarjeta de candidato muestra información mínima identificativa (nombre) y potencialmente el score IA y la etapa sugerida (RF-14, RF-14B).
    5.  La interfaz permite mover las tarjetas entre columnas (RF-17).

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-16), Sección 4.A (Gestión Pipeline), Sección 7 (UC4).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-01 (Existencia Vacantes), RF-09 (Existencia Candidaturas), RF-17 (Mover Candidatos), RF-28 (Configuración Etapas).

## 9. Notas y Suposiciones del PO
* **Propósito:** La implementación Kanban es una sugerencia fuerte. La cantidad de información en la tarjeta debe ser concisa para mantener la claridad visual.