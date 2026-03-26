# Epics_Roadmap.md

## Épica 1: Autenticación y Gestión de Cuenta
Objetivo: Permitir que usuarios se registren, inicien sesión y gestionen su perfil de forma segura.

Historias incluidas:
- US-AUTH-001 – Registro de usuario
- US-AUTH-002 – Inicio de sesión
- US-AUTH-003 – Mantener sesión autenticada
- US-PROFILE-001 – Actualizar mi perfil

Entregable clave:
- Flujo completo de acceso a la plataforma y actualización de perfil con control de autorización por usuario. 

---

## Épica 2: Gestión de Viajes y Participantes
Objetivo: Permitir la creación de viajes, definición de participantes y aplicación de roles CREATOR/MEMBER por viaje. 

Historias incluidas:
- US-TRIP-001 – Crear viaje
- US-TRIP-002 – Listar mis viajes
- US-TRIP-003 – Invitar participantes por email (Strict User Policy)
- US-TRIP-004 – Unirse a viaje por código
- US-TRIP-005 – Editar configuración de viaje
- US-PART-001 – Ver participantes del viaje
- US-PART-002 – Ver mi rol en el viaje

Entregable clave:
- Módulo de viajes con control de acceso contextual por rol y manejo de participantes registrados. 

---

## Épica 3: Registro y Feed de Gastos
Objetivo: Permitir registrar, visualizar y gestionar los gastos de cada viaje con evidencia opcional. 

Historias incluidas:
- US-EXP-001 – Crear gasto
- US-EXP-002 – Adjuntar foto de recibo
- US-EXP-003 – Feed de gastos del viaje
- US-EXP-004 – Editar o eliminar gasto (solo Creador)

Entregable clave:
- Registro estructurado de gastos en COP, con adjuntos de recibos y control estricto de quién puede editar/eliminar. 

---

## Épica 4: Cálculo de Saldos y Cierre de Viaje
Objetivo: Calcular “quién debe a quién” y permitir cerrar el viaje cuando las cuentas estén claras. 

Historias incluidas:
- US-BAL-001 – Ver saldos por persona
- US-BAL-002 – Ver resumen total personal
- US-BAL-003 – Cerrar / equilibrar gastos del viaje

Entregable clave:
- Motor de cálculo de saldos por viaje y estado de cierre del viaje, manteniendo visibilidad posterior. 

---

## Épica 5: Notificaciones y Auditoría
Objetivo: Asegurar comunicación y trazabilidad sin borrar datos financieros. 

Historias incluidas:
- US-NOTIF-001 – Notificación al ser agregado a un viaje
- US-AUD-001 – Mantener historial sin borrar definitivamente

Entregable clave:
- Notificación por email al ser agregado a un viaje y soporte de soft delete en entidades críticas.

---

# Propuesta de Sprints (MVP ~3 Sprints)

## Sprint 1 – Fundaciones y Auth
Foco:
- Épica 1 completa.
- Parte inicial de Épica 2 (crear viaje básico y listar viajes).

Alcance sugerido:
- US-AUTH-001, US-AUTH-002, US-AUTH-003
- US-PROFILE-001
- US-TRIP-001, US-TRIP-002

Resultado:
- Usuario puede registrarse, iniciar sesión y crear/listar viajes propios. 

---

## Sprint 2 – Viajes avanzados y Gastos
Foco:
- Completar Épica 2.
- Iniciar Épica 3 (crear gastos y feed). 

Alcance sugerido:
- US-TRIP-003, US-TRIP-004, US-TRIP-005
- US-PART-001, US-PART-002
- US-EXP-001, US-EXP-003

Resultado:
- Viajes con participantes invitados, roles aplicados y registro/visualización básica de gastos. 

---

## Sprint 3 – Saldos, Cierre y Calidad
Foco:
- Completar Épica 3.
- Implementar Épica 4 y Épica 5. 

Alcance sugerido:
- US-EXP-002, US-EXP-004
- US-BAL-001, US-BAL-002, US-BAL-003
- US-NOTIF-001
- US-AUD-001

Resultado:
- Cálculo de saldos, cierre de viaje, evidencias de recibos y notificaciones, con soft delete operativo. 
