# User Story: US-003

## Feature Asociada
Feature 7: Administración y Configuración del Sistema

## Título
Gestionar Cuentas de Usuario y Roles

## Narrativa
Como Administrador del Sistema
Quiero poder crear, activar/desactivar y asignar roles (Reclutador, Manager, Admin) a las cuentas de usuario
Para controlar quién tiene acceso al ATS MVP y con qué nivel de permisos básicos.

## Detalles
Cubre la administración básica de usuarios internos del sistema.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que he iniciado sesión como Administrador, puedo acceder a la sección "Gestión de Usuarios".
2.  Dado que estoy en la gestión de usuarios, puedo ver una lista de usuarios existentes mostrando Nombre, Email, Rol y Estado (Activo/Inactivo).
3.  Dado que estoy en la gestión de usuarios, puedo crear un nuevo usuario proporcionando Nombre (no vacío), Email (único y formato válido), Contraseña inicial (cumple política básica) y Rol (seleccionado de la lista: Reclutador, Manager, Admin), y el usuario se crea como Activo por defecto.
4.  Dado que intento crear un usuario con un email que ya existe, el sistema muestra un error claro y no crea el usuario.
5.  Dado que estoy en la gestión de usuarios, puedo seleccionar un usuario existente y cambiar su Rol a otro rol válido, y el cambio se guarda.
6.  Dado que estoy en la gestión de usuarios, puedo seleccionar un usuario existente y cambiar su estado entre Activo e Inactivo, y el cambio se guarda.
7.  Dado que un usuario está Inactivo, no puede iniciar sesión en el sistema (ver US-004).

## Requisito(s) Funcional(es) Asociado(s)
RF-29

## Prioridad: Must Have
* **Justificación:** Necesario para operar el sistema en un entorno multiusuario realista, aunque el RF original fuera Should Have. Esencial para asignar responsabilidades.

## Estimación Preliminar (SP): 5
* **Justificación:** Implica funcionalidad CRUD estándar para usuarios, incluyendo UI, lógica de negocio, validaciones (email único) y persistencia. Similar complejidad a la gestión de etapas.