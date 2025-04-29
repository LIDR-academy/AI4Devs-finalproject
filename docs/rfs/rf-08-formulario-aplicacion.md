# Requisito Funcional: RF-08

## 1. Título Descriptivo
* **Propósito:** Formulario de Aplicación

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El portal de empleo (RF-07) debe incluir, para cada vacante listada o en una página de detalle, un formulario que permita a los Candidatos enviar su aplicación. Este formulario debe solicitar información básica (nombre, email) y permitir adjuntar un archivo de CV en formatos estándar (PDF, DOCX).

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Es el mecanismo por el cual los candidatos introducen su información y CV en el sistema para ser considerados para una vacante. Es esencial para el flujo de recepción de candidaturas.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Candidato.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Desde la lista de vacantes (RF-07), se puede acceder a un formulario de aplicación (o está directamente en la página de detalle).
    2.  El formulario contiene campos para Nombre, Email (obligatorios) y Teléfono (opcional).
    3.  El formulario incluye un campo para seleccionar y subir un archivo de CV.
    4.  Se aceptan archivos con extensión .pdf y .docx (y potencialmente .doc).
    5.  Existe un botón "Enviar Aplicación" o similar.
    6.  (Opcional pero recomendado) Incluye un checkbox para aceptación de política de privacidad (GDPR).

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-08), Sección 4.A (Portal de Candidatos), Sección 7 (UC2).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-07 (Portal Básico de Empleo), RF-09 (Recepción de Candidaturas).

## 9. Notas y Suposiciones del PO
* **Propósito:** Se asume validación básica de campos (email válido, archivo subido). No incluye preguntas personalizadas en el formulario para MVP.