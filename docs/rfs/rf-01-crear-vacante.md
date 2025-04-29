# Requisito Funcional: RF-01

## 1. Título Descriptivo
* **Propósito:** Crear Vacante

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El sistema (ATS MVP) debe permitir a los usuarios con rol de Reclutador iniciar el proceso de creación de una nueva oferta de empleo, proporcionando una interfaz para introducir la información básica requerida. Esto incluye campos estándar como título del puesto, departamento, ubicación, etc..

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Es el punto de partida fundamental para cualquier proceso de reclutamiento. Sin la capacidad de crear una vacante, el sistema no puede gestionar el flujo de selección. Permite iniciar formalmente la búsqueda de talento.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Un Reclutador autenticado puede acceder a la opción "Crear Nueva Vacante".
    2.  El formulario de creación incluye campos para: Título, Departamento (opcional), Ubicación (texto), Requisitos Clave (texto inicial).
    3.  Al guardar, se crea un nuevo registro de Vacante en la base de datos del ATS MVP con estado inicial (ej. "Borrador").
    4.  El sistema asigna un identificador único a la nueva vacante.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-01), Sección 4.A (Gestión de Vacantes), Sección 7 (UC1).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** (Potencialmente) RF-29 (Gestión Usuarios - para asignar Reclutador), RF-30 (Autenticación).

## 9. Notas y Suposiciones del PO
* **Propósito:** Asume que los campos "básicos" mencionados en RF-01 son suficientes para la creación inicial. Detalles específicos de la JD o parámetros IA se manejan en requisitos posteriores (RF-04B, RF-05, etc.).