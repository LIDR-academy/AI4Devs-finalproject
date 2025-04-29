# Requisito Funcional: RF-28

## 1. Título Descriptivo
* **Propósito:** Configurar Etapas Pipeline (ATS MVP)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El ATS MVP debería proporcionar una interfaz (probablemente en una sección de administración) donde un usuario con permisos (Administrador o Reclutador experto) pueda definir y gestionar las etapas estándar que componen el pipeline de selección. Esto incluye poder crear nuevas etapas, editar sus nombres, definir su orden en el flujo y, crucialmente, identificar qué etapas pueden ser seleccionadas como `etapa_pre_aceptacion` y `etapa_pre_rechazo` al configurar una vacante (RF-04B).

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Permite adaptar el flujo de trabajo del ATS MVP a los procesos específicos de la organización, en lugar de usar un pipeline fijo. Es indispensable para que la funcionalidad de sugerencia de etapa (RF-12C) funcione correctamente, ya que necesita saber qué etapas existen y cuáles son elegibles como destino de la sugerencia.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Administrador, Reclutador (si tiene permisos).

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Existe una sección de configuración de Pipeline accesible para usuarios autorizados.
    2.  Se muestra la lista de etapas actuales, con su orden.
    3.  Se pueden añadir nuevas etapas especificando un nombre.
    4.  Se pueden editar los nombres de las etapas existentes.
    5.  Se puede cambiar el orden de las etapas (ej. arrastrando).
    6.  Se pueden eliminar etapas (con validación si están en uso).
    7.  Se pueden marcar qué etapas son seleccionables como destino para las sugerencias IA (`etapa_pre_aceptacion`/`etapa_pre_rechazo`).
    8.  La configuración se guarda y se refleja en las vistas de pipeline (RF-16) y en los selectores de RF-04B.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-28, actualizado), Sección 7 (UC1, UC6), Sección 11 (Modelo Datos - EtapaPipeline).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Alta` (Basado en Should Have del PRD, pero esencial para la funcionalidad Must Have RF-04B/RF-12C/RF-14B) - **Considerar elevar a Must Have.**

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-04B (Uso en selector), RF-16 (Visualización), RF-17 (Movimiento entre etapas).

## 9. Notas y Suposiciones del PO
* **Propósito:** Dada su criticidad para habilitar la sugerencia de etapas IA (que son Must Have), este requisito debería ser considerado Must Have. Se necesita definir tipos de etapa (ej. 'Inicio', 'Intermedio', 'Final', 'Rechazo') para lógica adicional si es necesario.