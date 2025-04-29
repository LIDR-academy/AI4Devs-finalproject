# Requisito Funcional: RF-26

## 1. Título Descriptivo
* **Propósito:** Ordenar/Filtrar por Score (ATS MVP)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** La interfaz del ATS MVP que muestra la lista de candidatos para una vacante (RF-15) debería permitir al usuario ordenar la lista de candidatos según el score de IA (`puntuacion_ia_general`) de forma ascendente o descendente. Opcionalmente, podría permitir filtrar candidatos cuyo score esté por encima o por debajo de un cierto valor introducido por el usuario.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Facilita enormemente la gestión de listas largas de candidatos, permitiendo al usuario enfocarse rápidamente en los perfiles mejor puntuados por la IA o identificar aquellos que no cumplen un mínimo según su criterio particular en ese momento. Mejora la eficiencia de la revisión.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador, Hiring Manager.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  En la vista de lista de candidatos (RF-15), la columna del Score IA es clickeable para ordenar la tabla/lista por ese campo.
    2.  El primer clic ordena ascendentemente, el segundo descendentemente (o viceversa).
    3.  (Opcional Filtro) Existe un control (ej. campo numérico, slider) que permite al usuario definir un umbral de score.
    4.  (Opcional Filtro) Al aplicar el filtro, la lista solo muestra los candidatos que cumplen la condición (ej. score >= umbral).

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-26), Sección 7 (UC4).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Alta` (Basado en Should Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-14 (Disponibilidad del score), RF-15 (Vista de lista).

## 9. Notas y Suposiciones del PO
* **Propósito:** La funcionalidad de ordenación es más sencilla y prioritaria que el filtrado. El filtrado puede añadirse después si la ordenación resulta insuficiente.