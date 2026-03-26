# QA_Plan.md

## 1. Alcance de la documentación y pruebas

Este plan cubre el MVP de TravelSplit: registro/login, gestión de viajes y participantes, registro de gastos con evidencias, cálculo de saldos y cierre de viaje, así como notificaciones básicas por email. [file:1]

---

## 2. Documentación funcional resumida

### 2.1 Módulo de Autenticación y Perfil
- Registro de usuario con email único, nombre y contraseña (>6 caracteres). [file:1]  
- Login mediante JWT y protección de rutas privadas.  
- Cada usuario solo puede actualizar su propio perfil (no existen administradores globales). [file:1]

### 2.2 Módulo de Viajes y Participantes
- Creación de viajes en moneda fija COP, con el creador como CREATOR. [file:1]  
- Listado de viajes donde el usuario es CREATOR o MEMBER.  
- Invitación de participantes por email registrado (Strict User Policy) y unión por código. [file:1]

### 2.3 Módulo de Gastos
- Creación de gastos con título, monto en COP, categoría, pagador y beneficiarios. [file:1]  
- Adjuntar foto opcional de recibo y feed de gastos ordenado por fecha.  
- Solo el CREATOR puede editar/eliminar gastos; los MEMBER no pueden editar ni sus propios gastos. [file:1]

### 2.4 Módulo de Saldos y Cierre
- Cálculo de total gastado por usuario vs cuota justa. [file:1]  
- Visualización “quién debe a quién” y resumen personal.  
- Cierre del viaje por parte del CREATOR, bloqueando nuevos gastos pero manteniendo visibilidad histórica. [file:1]

### 2.5 Notificaciones y Auditoría
- Envío de correo cuando un usuario es agregado a un viaje. [file:1]  
- Soft delete en entidades críticas (viajes, gastos, participantes) manteniendo trazabilidad financiera. [file:1]

---

## 3. Estrategia de pruebas

### 3.1 Tipos de prueba

- **Pruebas unitarias (backend):**  
  - Servicios de autenticación (registro/login/JWT).  
  - Servicios de viajes (creación, invitación, unión, cierre).  
  - Servicios de gastos (creación, edición, borrado lógico).  
  - Motor de cálculo de saldos “quién debe a quién”. [file:1]

- **Pruebas de integración (API):**  
  - Flujo completo Registro → Login → Crear viaje → Agregar participantes → Crear gastos → Consultar saldos → Cerrar viaje. [file:1]  
  - Validación Strict User Policy al invitar emails no registrados. [file:1]

- **Pruebas end-to-end (frontend + backend):**  
  - Uso real de la app con un grupo de usuarios simulados (CREATOR y MEMBER).  
  - Validación de permisos UI (botones y acciones visibles/invisibles según rol). [file:1]

---

## 4. Casos de prueba clave (alto nivel)

### 4.1 Autenticación y Perfil

1. **CP-AUTH-001 – Registro exitoso**
   - Dado que un email no está registrado.  
   - Cuando se envía formulario válido.  
   - Entonces se crea el usuario y se puede iniciar sesión. [file:1]

2. **CP-AUTH-002 – Registro con email duplicado**
   - Dado que un email ya existe.  
   - Cuando se intenta registrar nuevamente.  
   - Entonces se devuelve mensaje de error y no se crea usuario. [file:1]

3. **CP-PROFILE-001 – Actualizar solo mi perfil**
   - Dado que un usuario autenticado accede a /users/:id propio.  
   - Cuando envía cambios válidos.  
   - Entonces se actualiza el perfil; si el id es de otro usuario, se rechaza. [file:1]

### 4.2 Viajes y Participantes

4. **CP-TRIP-001 – Crear viaje**
   - Usuario autenticado crea viaje con nombre.  
   - Se crea viaje en COP y el usuario queda como CREATOR. [file:1]

5. **CP-TRIP-002 – Invitar participante registrado**
   - CREATOR invita por email existente.  
   - Se crea TripParticipant MEMBER y se envía email de notificación. [file:1]

6. **CP-TRIP-003 – Bloquear invitación a email no registrado**
   - CREATOR intenta invitar email inexistente.  
   - El sistema rechaza la invitación y no crea participante. [file:1]

7. **CP-TRIP-004 – Unirse por código**
   - Usuario autenticado ingresa código válido.  
   - Queda asociado como MEMBER al viaje. [file:1]

### 4.3 Gastos

8. **CP-EXP-001 – Crear gasto válido**
   - Participante de un viaje crea gasto con título, monto, categoría y beneficiarios.  
   - El gasto aparece en el feed del viaje. [file:1]

9. **CP-EXP-002 – Adjuntar foto de recibo**
   - Al crear gasto se sube imagen válida.  
   - Se almacena y se asocia al gasto, visible en el detalle. [file:1]

10. **CP-EXP-003 – Edición/eliminación solo por CREATOR**
    - CREATOR edita o elimina gasto existente.  
    - MEMBER intenta editar/eliminar y la operación se rechaza. [file:1]

### 4.4 Saldos y Cierre

11. **CP-BAL-001 – Cálculo de saldos correcto**
    - Dado un conjunto de gastos y beneficiarios.  
    - Cuando se consultan saldos.  
    - Entonces se muestran deudas “A debe X a B” consistentes con los montos. [file:1]

12. **CP-BAL-002 – Cerrar viaje**
    - CREATOR cierra viaje.  
    - Nuevos gastos se bloquean, pero el historial y saldos siguen visibles. [file:1]

### 4.5 Notificaciones y Auditoría

13. **CP-NOTIF-001 – Email al agregar participante**
    - Cuando un usuario es agregado como MEMBER.  
    - Entonces se envía correo con el nombre del viaje y enlace. [file:1]

14. **CP-AUD-001 – Soft delete de gastos**
    - Al eliminar un gasto se marca deleted_at.  
    - No aparece en listados ni cálculo de saldos, pero el registro existe en la base. [file:1]

---

## 5. Criterios de aceptación del MVP

- Todos los flujos principales descritos en el PRD se pueden completar sin errores críticos. [file:1]  
- Todas las reglas de negocio críticas se cumplen: moneda única COP, roles por viaje, sin admin global, soft delete y Strict User Policy en invitaciones. [file:1]  
- No hay acciones en la interfaz que permitan a un MEMBER romper las restricciones de edición/eliminación ni cerrar viajes. [file:1]
