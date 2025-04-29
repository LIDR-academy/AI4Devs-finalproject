# Requisito Funcional: RF-35

## 1. Título Descriptivo
* **Propósito:** Exportar Datos Candidato

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El ATS MVP podría ofrecer una opción para exportar la información básica de un candidato seleccionado (nombre, contacto, ¿notas?, ¿último CV?) a un formato estándar (ej. CSV, PDF simple).

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Permite sacar información del sistema para compartirla externamente, para procesos offline, o para cumplir con solicitudes de portabilidad de datos (aunque esto último requeriría un enfoque más robusto).

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador, Administrador.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  En la vista de detalle de un candidato/candidatura, existe un botón "Exportar".
    2.  Al pulsarlo, se genera un archivo (ej. CSV) con los datos básicos del candidato.
    3.  El archivo se descarga en el navegador del usuario.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8.3 (RF-35).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Baja` (Basado en Could Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-09 (Existencia datos candidato).

## 9. Notas y Suposiciones del PO
* **Propósito:** Exportación muy básica. No incluye exportación masiva ni formatos complejos.