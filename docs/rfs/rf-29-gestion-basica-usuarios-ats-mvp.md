# Requisito Funcional: RF-29

## 1. Título Descriptivo
* **Propósito:** Gestión Básica Usuarios (ATS MVP)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El ATS MVP debería incluir funcionalidades básicas de administración de usuarios, accesibles para un rol de Administrador. Como mínimo, debe permitir crear nuevas cuentas de usuario (para Reclutadores y Hiring Managers), asignarles un rol, y activar/desactivar cuentas existentes.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Permite gestionar quién tiene acceso al sistema y con qué nivel de permisos (aunque los roles sean básicos en MVP). Es necesario para poder incorporar nuevos reclutadores o managers al uso de la herramienta y retirar el acceso cuando sea necesario.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Administrador.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Existe una sección de "Gestión de Usuarios" accesible solo para el rol Administrador.
    2.  Se muestra una lista de usuarios existentes (nombre, email, rol, estado).
    3.  Hay una opción para "Crear Nuevo Usuario".
    4.  El formulario de creación pide Nombre, Email y Rol (selector Reclutador/Manager/Admin).
    5.  Se puede editar un usuario existente para cambiar su rol o estado (activo/inactivo).
    6.  La gestión de contraseñas (reseteo) puede ser básica o manejada por otro sistema si hay SSO.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-29), Sección 7 (UC6), Sección 11 (Modelo Datos - Usuario).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Alta` (Basado en Should Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-30 (Autenticación y roles).

## 9. Notas y Suposiciones del PO
* **Propósito:** Aunque "Should Have", es casi "Must Have" para un uso práctico más allá de un único usuario. La complejidad puede variar según el manejo de contraseñas.