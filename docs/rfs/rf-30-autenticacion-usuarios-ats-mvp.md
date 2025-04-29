# Requisito Funcional: RF-30

## 1. Título Descriptivo
* **Propósito:** Autenticación de Usuarios (ATS MVP)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El ATS MVP debe proteger el acceso a sus funcionalidades internas (todas excepto el portal de candidatos RF-07/RF-08). Debe requerir que los usuarios (Reclutador, Manager, Administrador) proporcionen credenciales válidas (ej. email y contraseña) para iniciar sesión y acceder al sistema.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Asegura que solo personal autorizado pueda acceder a los datos sensibles de candidatos y vacantes y realizar acciones en el sistema. Es un requisito básico de seguridad (RNF-07).

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador, Hiring Manager, Administrador.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Al intentar acceder a cualquier página interna del ATS MVP sin sesión activa, el usuario es redirigido a una página de Login.
    2.  La página de Login pide Email y Contraseña.
    3.  Al enviar credenciales válidas, el sistema inicia una sesión para el usuario y le redirige a la página solicitada o al dashboard.
    4.  Al enviar credenciales inválidas, se muestra un mensaje de error y no se inicia sesión.
    5.  Existe una opción para "Cerrar Sesión".
    6.  La sesión tiene un tiempo de expiración razonable.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-30), Sección 9 (RNF-07).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Alta` (Basado en Should Have del PRD, pero es un Must Have de Seguridad) - **Considerar elevar a Must Have.**

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-29 (Existencia de usuarios y roles).

## 9. Notas y Suposiciones del PO
* **Propósito:** Es un requisito fundamental de seguridad, debería ser Must Have. La implementación puede usar librerías estándar de manejo de sesiones/tokens.