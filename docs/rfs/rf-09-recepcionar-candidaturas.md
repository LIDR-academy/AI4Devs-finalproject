# Requisito Funcional: RF-09

## 1. Título Descriptivo
* **Propósito:** Recepcionar Candidaturas

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El sistema ATS MVP debe ser capaz de procesar los datos enviados desde el formulario de aplicación (RF-08). Esto implica recibir la información del candidato, almacenar el archivo de CV adjunto de forma segura, y crear un nuevo registro de `Candidatura` asociando al `Candidato` con la `Vacante` correspondiente en la base de datos del ATS MVP.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Es el paso que efectivamente ingresa la información del candidato en el sistema de gestión, permitiendo su posterior revisión y evaluación. Conecta el portal público con el backend de gestión.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Sistema (procesa la entrada del Candidato).

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Tras enviar el formulario (RF-08), el sistema recibe los datos (nombre, email, etc.) y el archivo CV.
    2.  El sistema almacena el archivo CV en una ubicación designada (ej. S3, disco local).
    3.  Busca si ya existe un `Candidato` con ese email; si no, crea uno nuevo.
    4.  Crea un nuevo registro en la tabla `Candidatura` vinculando el `Candidato` (existente o nuevo) y la `Vacante` a la que aplicó.
    5.  La nueva candidatura se asigna a una etapa inicial por defecto del pipeline (ej. "Nuevo").
    6.  Se muestra un mensaje de confirmación al Candidato en el portal.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-09), Sección 4.A (Gestión de Candidaturas), Sección 7 (UC3).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-08 (Formulario de Aplicación), RF-01 (Existencia de Vacante), (Potencialmente RF-28 para etapa inicial).

## 9. Notas y Suposiciones del PO
* **Propósito:** El manejo de duplicados de candidatos se basa en el email como identificador único. El almacenamiento del CV debe ser seguro.