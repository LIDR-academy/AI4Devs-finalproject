# Requisito Funcional: RF-04

## 1. Título Descriptivo
* **Propósito:** Solicitar Generación IA de JD

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** Desde la interfaz de gestión de vacantes del ATS MVP, el sistema debe ofrecer una opción explícita (ej. un botón) para que el Reclutador solicite la generación automática del contenido de la Descripción del Puesto (Job Description - JD) utilizando el servicio de TalentIA Core AI.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Uno de los objetivos clave es reducir el tiempo de creación de JDs. Esta funcionalidad activa la capacidad de IA para asistir en esta tarea, aportando eficiencia y potencial estandarización/calidad al contenido.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  En el formulario de edición/creación de vacante, existe un botón/acción claramente identificable como "Generar Descripción con IA".
    2.  Al activarlo, el sistema (ATS MVP) inicia una llamada al servicio correspondiente de TalentIA Core AI (RF-06), pasando los datos básicos disponibles de la vacante.
    3.  El sistema indica visualmente que la generación está en proceso.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-04), Sección 4.A, Sección 7 (UC1).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-01/RF-02 (Contexto de Vacante), RF-06 (Servicio Core AI).

## 9. Notas y Suposiciones del PO
* **Propósito:** Esta es la acción de *solicitar*. La recepción y edición se cubren en RF-05. Asume que la llamada a la IA es síncrona o asíncrona con indicación de progreso.