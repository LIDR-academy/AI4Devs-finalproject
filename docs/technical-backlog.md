# Technical_Backlog.md

## EPIC-1 – Autenticación y Gestión de Cuenta

### TCK-AUTH-001 – Endpoint de registro de usuario (POST /auth/register) ✅ COMPLETADO
- Relacionado con: US-AUTH-001
- Tipo: Backend
- Descripción:
  Implementar endpoint de registro que cree usuarios con email único, nombre y contraseña hasheada. 
- Tareas:
  - ✅ Definir entidad User (id, email, name, password_hash, timestamps, deleted_at).
  - ✅ Implementar DTO de creación y validaciones (email, longitud mínima password).
  - ✅ Implementar servicio de registro con verificación de email único.
  - ⏳ Tests unitarios de servicio y controlador. 
- Criterios de Aceptación:
  - ✅ Registro exitoso devuelve usuario sin exponer password.
  - ✅ Email duplicado devuelve error validado.
  - ✅ Se guardan timestamps de creación/actualización.
- Story Points: 3

### TCK-AUTH-002 – Endpoint de login y emisión de JWT (POST /auth/login) ✅ COMPLETADO
- Relacionado con: US-AUTH-002
- Tipo: Backend
- Descripción:
  Implementar autenticación con verificación de credenciales y emisión de JWT con payload { sub, email }. 
- Tareas:
  - ✅ Implementar estrategia JWT con Passport.
  - ✅ Configurar guardas de autenticación para rutas protegidas.
  - ✅ Implementar firma de token y configuración de expiración. 
- Criterios de Aceptación:
  - ✅ Credenciales correctas retornan token válido.
  - ✅ Credenciales incorrectas retornan error genérico.
  - ✅ Token usable en endpoints protegidos con Authorization: Bearer. 
- Story Points: 3

### TCK-AUTH-003 – Middleware/Guard para proteger rutas privadas ✅ COMPLETADO
- Relacionado con: US-AUTH-003
- Tipo: Backend
- Descripción:
  Crear guard global o por módulo que valide el JWT en cada petición protegida y propague req.user. 
- Tareas:
  - ✅ Implementar guard que decodifique y valide el token.
  - ✅ Integrar con NestJS en módulo común.
  - ⏳ Añadir pruebas sencillas de acceso autorizado/no autorizado. 
- Criterios de Aceptación:
  - ✅ Rutas sin token devuelven 401.
  - ✅ Rutas con token inválido devuelven 401.
  - ✅ Rutas con token válido acceden al usuario autenticado. 
- Story Points: 2

### TCK-PROFILE-001 – Endpoint actualización de perfil (PUT /users/:id) ✅ COMPLETADO
- Relacionado con: US-PROFILE-001
- Tipo: Backend
- Descripción:
  Permitir que un usuario actualice únicamente su propio perfil (nombre, password). 
  - ✅ Implementar controlador y servicio de actualización.
  - ✅ Verificar req.user.id === id del path.
  - ✅ Hashear nueva contraseña si se actualiza. 
- Criterios de Aceptación:
  - ✅ No se puede actualizar un perfil ajeno.
  - ✅ Validaciones de formato se aplican correctamente. 
- Story Points: 2

---

## EPIC-2 – Gestión de Viajes y Participantes

### TCK-TRIP-001 – Modelo y migración de Trip y TripParticipant
- Relacionado con: US-TRIP-001, US-PART-001, US-PART-002
- Tipo: Backend / DB
- Estado: ✅ Completado
- Descripción:
  Crear entidades y migraciones para viajes y sus participantes, con roles contextuales CREATOR/MEMBER. 
- Tareas:
  - Entidad Trip (id, name, currency='COP', status, code, timestamps, deleted_at).
  - Entidad TripParticipant (id, trip_id, user_id, role: CREATOR/MEMBER, timestamps, deleted_at).
  - Llaves foráneas y constraints de integridad.
- Criterios de Aceptación:
  - Un usuario puede ser CREATOR en un viaje y MEMBER en otro.
  - No existe campo isAdmin global en User. 
- Story Points: 5

### TCK-TRIP-002 – Endpoint creación de viaje (POST /trips) ✅ COMPLETADO
- Relacionado con: US-TRIP-001
- Tipo: Backend
- Estado: ✅ Completado
- Descripción:
  Permitir crear un viaje con nombre, moneda fija COP y asociar automáticamente al usuario como CREATOR, se debe poder agregar usuarios por medio de correo electronico (member). 
- Tareas:
  - ✅ Controlador y servicio de creación.
  - ✅ Generación de código alfanumérico del viaje.
  - ✅ Insert en TripParticipant como CREATOR.
  - ✅ Invitación de miembros por email en el mismo endpoint (memberEmails). 
- Criterios de Aceptación:
  - ✅ Solo usuarios autenticados pueden crear.
  - ✅ Moneda siempre COP, sin posibilidad de cambio.
  - ✅ Se pueden invitar miembros por email al crear el viaje.
- Story Points: 3

### TCK-TRIP-008 – Selección de moneda al crear viaje (COP o USD) ⏳ PENDIENTE
- Relacionado con: US-TRIP-006
- Tipo: Backend / Frontend
- Estado: ⏳ Pendiente
- Historia de Usuario:
  **As a** usuario autenticado, **I want** seleccionar la moneda (COP o USD) al crear un viaje, **so that** pueda registrar gastos en la moneda apropiada según el destino o preferencia del viaje.
- Descripción:
  Permitir que el usuario seleccione entre COP (Peso Colombiano) o USD (Dólar Estadounidense) al crear un nuevo viaje. La moneda seleccionada será fija para todo el viaje y todos sus gastos asociados.
- Tareas:
  - Crear enum TripCurrency con valores COP y USD.
  - Modificar CreateTripDto para incluir campo currency opcional (default: COP).
  - Agregar validación IsEnum para currency en CreateTripDto.
  - Actualizar servicio de creación para aceptar y validar currency.
  - Actualizar documentación Swagger del endpoint POST /trips.
  - Actualizar entidad Trip para reflejar que currency puede ser COP o USD.
  - Actualizar frontend: agregar selector de moneda en formulario de creación.
  - Actualizar componentes de visualización para mostrar moneda correcta.
  - Tests unitarios para validación de currency.
  - Tests de integración para creación con diferentes monedas.
- Criterios de Aceptación:
  - El usuario puede seleccionar COP o USD al crear un viaje.
  - Si no se especifica currency, el valor por defecto es COP (retrocompatibilidad).
  - Solo se aceptan valores COP o USD, cualquier otro valor retorna error 400.
  - La moneda seleccionada se guarda correctamente en la base de datos.
  - La moneda se muestra correctamente en todas las respuestas del API.
  - El frontend muestra un selector de moneda en el formulario de creación.
  - El frontend muestra la moneda correcta en listados y detalles de viaje.
  - Los gastos creados para el viaje usan la misma moneda del viaje.
  - La validación rechaza valores inválidos con mensaje descriptivo.
  - La documentación Swagger refleja el nuevo campo currency opcional.
- Story Points: 5

### TCK-TRIP-003 – Endpoint listado de viajes del usuario (GET /trips) ✅ COMPLETADO
- Relacionado con: US-TRIP-002
- Tipo: Backend
- Estado: ✅ Completado
- Descripción:
  Listar viajes activos e históricos donde el usuario es CREATOR o MEMBER. 
- Tareas:
  - ✅ Consulta con join Trip–TripParticipant.
  - ✅ Filtrado opcional por estado (ACTIVE/CLOSED) mediante query parameter.
  - ✅ Incluye rol del usuario (userRole) y conteo de participantes (participantCount).
- Criterios de Aceptación:
  - ✅ Devuelve solo viajes en los que el usuario participa.
  - ✅ Muestra estado del viaje.
  - ✅ Filtrado opcional por status mediante query parameter ?status=ACTIVE.
- Story Points: 2

### TCK-TRIP-004 – Invitar participantes por email (POST /trips/:id/invite) ❌ DEPRECADO
- Relacionado con: US-TRIP-003
- Tipo: Backend
- Descripción:
  Implementar invitación Strict User Policy: solo CREATOR puede invitar y solo a emails ya registrados. 
- Tareas:
  - Verificar que req.user es CREATOR en el viaje.
  - Buscar usuario por email en tabla User.
  - Si no existe, devolver error indicando que debe registrarse.
- Criterios de Aceptación:
  - No se crean usuarios “fantasma”.
  - Se crea TripParticipant con rol MEMBER.

### TCK-TRIP-005 – Unirse a viaje por código (POST /trips/join) ✅ COMPLETADO
- Relacionado con: US-TRIP-004
- Tipo: Backend
- Estado: ✅ Completado
- Descripción:
  Permitir que un usuario autenticado se asocie a un viaje existente utilizando código. 
- Tareas:
  - ✅ Código válido crea TripParticipant MEMBER.
  - ✅ Manejo de errores si el código no existe o el viaje está cerrado.
  - ✅ Validación de que el usuario no sea ya participante.
- Criterios de Aceptación:
  - ✅ Solo se puede unir a viajes activos (ACTIVE).
  - ✅ No se puede unir si ya es participante.
  - ✅ Retorna detalles del viaje al unirse exitosamente.
- Story Points: 3

### TCK-TRIP-006 – Editar configuración de viaje (PATCH /trips/:id) ⏳ PENDIENTE
- Relacionado con: US-TRIP-005
- Tipo: Backend
- Estado: ⏳ Pendiente
- Descripción:
  Permitir al CREATOR modificar datos básicos del viaje (nombre) sin afectar gastos. 
- Nota: Actualmente existe GET /trips/:id para obtener detalles del viaje, pero no existe endpoint para actualizar.
- Story Points: 2

### TCK-PART-001 – Endpoint listar participantes del viaje (GET /trips/:id/participants) ✅ COMPLETADO (Integrado)
- Relacionado con: US-PART-001, US-PART-002
- Tipo: Backend
- Estado: ✅ Completado - Integrado en GET /trips/:id
- Descripción:
  Devolver la lista de participantes con sus roles por viaje. 
- Nota: Esta funcionalidad está implementada en el endpoint GET /trips/:id, que retorna los detalles del viaje incluyendo participantes paginados mediante query parameters `participantsPage` y `participantsLimit`.
- Tareas:
  - ✅ Lista de participantes incluida en respuesta de GET /trips/:id.
  - ✅ Paginación de participantes (default: 20, max: 100).
  - ✅ Incluye roles (CREATOR/MEMBER) y datos de usuario.
- Criterios de Aceptación:
  - ✅ Solo participantes del viaje pueden ver la lista.
  - ✅ Participantes paginados con metadatos.
  - ✅ Incluye información de usuario y rol.
- Story Points: 2

### TCK-TRIP-007 – Endpoint detalle de viaje (GET /trips/:id) ✅ COMPLETADO
- Relacionado con: US-TRIP-002, US-PART-001
- Tipo: Backend
- Estado: ✅ Completado
- Descripción:
  Obtener detalles completos de un viaje incluyendo participantes paginados.
- Tareas:
  - ✅ Endpoint GET /trips/:id implementado.
  - ✅ Incluye información del viaje (nombre, código, estado, moneda).
  - ✅ Participantes paginados mediante query parameters (participantsPage, participantsLimit).
  - ✅ Incluye rol del usuario autenticado en el viaje.
  - ✅ Validación de que el usuario sea participante.
- Criterios de Aceptación:
  - ✅ Solo participantes pueden ver detalles del viaje.
  - ✅ Participantes paginados con metadatos.
  - ✅ Incluye rol del usuario autenticado.
- Story Points: 2

---

## EPIC-3 – Registro y Feed de Gastos

### TCK-EXP-001 – Modelo y migración de Expense ✅ COMPLETADO
- Relacionado con: US-EXP-001, US-EXP-004
- Tipo: Backend / DB
- Estado: ✅ Completado
- Descripción:
  Definir entidad Expense con soporte de soft delete y referencia a pagador y beneficiarios. 
- Tareas:
  - ✅ Entidad Expense (id, trip_id, payer_id, amount, title, category_id, receipt_url, expense_date, timestamps, deleted_at).
  - ✅ Tabla de relación ExpenseSplit (expense_id, user_id, amount_owed) para beneficiarios.
  - ✅ Entidad ExpenseCategory para categorías predefinidas.
  - ✅ Relaciones con Trip, User y ExpenseCategory.
- Criterios de Aceptación:
  - ✅ Soft delete implementado mediante deletedAt.
  - ✅ Relación many-to-one con Trip y User (payer).
  - ✅ Relación one-to-many con ExpenseSplit para beneficiarios.
- Story Points: 5

### TCK-EXP-002 – Endpoint crear gasto (POST /trips/:trip_id/expenses) ✅ COMPLETADO
- Relacionado con: US-EXP-001, US-EXP-002
- Tipo: Backend
- Estado: ✅ Completado
- Descripción:
  Crear gastos asociados a un viaje, con validación de que el usuario sea participante. 
- Tareas:
  - ✅ Endpoint POST /trips/:trip_id/expenses implementado.
  - ✅ Validación de participación del usuario.
  - ✅ Validación de que el viaje esté activo (ACTIVE).
  - ✅ Soporte para múltiples beneficiarios mediante array de beneficiaries.
  - ✅ Validación de categoría existente.
- Criterios de Aceptación:
  - ✅ Participants CREATOR/MEMBER pueden crear gastos.
  - ✅ Monto en COP (currency fija).
  - ✅ Categoría válida (validación contra ExpenseCategory).
  - ✅ Beneficiarios deben ser participantes del viaje.
  - ✅ Solo viajes activos permiten crear gastos.
- Story Points: 3

### TCK-EXP-003 – Subida y almacenamiento de foto de recibo
- Relacionado con: US-EXP-002
- Tipo: Backend / Infra
- Descripción:
  Implementar endpoint/módulo para subir archivo y almacenar en sistema local o servicio cloud. 
- Story Points: 3

### TCK-EXP-004 – Feed de gastos del viaje (GET /trips/:trip_id/expenses) ✅ COMPLETADO
- Relacionado con: US-EXP-003
- Tipo: Backend
- Estado: ✅ Completado
- Descripción:
  Listar gastos ordenados por fecha descendente, visibles para todos los participantes. 
- Tareas:
  - ✅ Implementar endpoint GET /trips/:trip_id/expenses con paginación
  - ✅ Implementar endpoint GET /trips/:trip_id/expenses/:expense_id para detalles
  - ✅ Validación de participación del usuario
  - ✅ Filtro opcional por categoría (query parameter category_id)
  - ✅ Ordenamiento por expense_date DESC, luego createdAt DESC
  - ✅ Exclusión de gastos eliminados (soft delete)
- Criterios de Aceptación:
  - ✅ Solo participantes pueden ver gastos
  - ✅ Gastos ordenados por fecha descendente (expense_date DESC, createdAt DESC)
  - ✅ Paginación implementada (page, limit, máximo 100)
  - ✅ Metadatos de paginación incluidos (total, page, limit, hasMore)
  - ✅ Filtro por categoría opcional mediante ?category_id=X
- Story Points: 2

### TCK-EXP-005 – Editar y eliminar gasto (solo Creador) ⏳ PENDIENTE
- Relacionado con: US-EXP-004
- Tipo: Backend
- Estado: ⏳ Pendiente
- Descripción:
  Permitir al CREATOR editar o hacer soft delete de cualquier gasto del viaje. 
- Nota: Actualmente existen endpoints para crear y consultar gastos, pero faltan PATCH /trips/:trip_id/expenses/:expense_id y DELETE /trips/:trip_id/expenses/:expense_id.
- Story Points: 3

---

## EPIC-4 – Cálculo de Saldos y Cierre

### TCK-BAL-001 – Servicio de cálculo de saldos por viaje
- Relacionado con: US-BAL-001
- Tipo: Backend (lógica de dominio)
- Descripción:
  Implementar algoritmo que calcule total gastado por usuario, cuota justa y deudas “A debe X a B”.
- Story Points: 5

### TCK-BAL-002 – Endpoint resumen personal de saldo (GET /trips/:id/balance/me) ⏳ PENDIENTE
- Relacionado con: US-BAL-002
- Tipo: Backend
- Estado: ⏳ Pendiente
- Descripción:
  Endpoint para obtener el resumen personal de saldo del usuario autenticado en un viaje específico.
- Nota: Actualmente existe GET /trips/:trip_id/balances que retorna saldos de todos los participantes. Este endpoint sería una variante que filtra solo el saldo del usuario autenticado.
- Story Points: 2

### TCK-BAL-003 – Cerrar viaje (POST /trips/:id/close) ⏳ PENDIENTE
- Relacionado con: US-BAL-003
- Tipo: Backend
- Estado: ⏳ Pendiente
- Descripción:
  Permitir al CREATOR marcar el viaje como cerrado (status=CLOSED), bloqueando nuevos gastos. 
- Nota: El enum TripStatus ya incluye CLOSED y la validación de viaje activo existe en creación de gastos, pero falta el endpoint para cambiar el status.
- Story Points: 3

---

## EPIC-5 – Notificaciones y Auditoría

### TCK-NOTIF-001 – Envío de email al agregar participante
- Relacionado con: US-NOTIF-001
- Tipo: Backend / Integración
- Descripción:
  Integrar un servicio de correo y disparar email cuando se agrega un TripParticipant. 
- Story Points: 3

### TCK-AUD-001 – Implementar soft delete transversal ✅ COMPLETADO
- Relacionado con: US-AUD-001
- Tipo: Backend / DB
- Estado: ✅ Completado
- Descripción:
  Garantizar borrado lógico en User, Trip, TripParticipant, Expense, con filtros que excluyan registros marcados. 
- Tareas:
  - ✅ BaseEntity con campo deletedAt implementado.
  - ✅ Todas las entidades extienden BaseEntity (User, Trip, TripParticipant, Expense, ExpenseSplit).
  - ✅ Filtros IsNull() aplicados en queries para excluir registros eliminados.
  - ✅ Soft delete implementado en servicios (método remove).
- Criterios de Aceptación:
  - ✅ Todas las entidades principales tienen soft delete.
  - ✅ Queries excluyen automáticamente registros con deletedAt != null.
  - ✅ Métodos de eliminación marcan deletedAt en lugar de borrar físicamente.
- Story Points: 3

---

## Frontend (React + TypeScript) – Tickets principales

### TCK-FE-001 – Pantallas de Registro y Login
- Relacionado con: US-AUTH-001, US-AUTH-002
- Tipo: Frontend
- Story Points: 3

### TCK-FE-002 – Pantalla de listado de viajes y creación de viaje
- Relacionado con: US-TRIP-001, US-TRIP-002
- Story Points: 3

### TCK-FE-003 – Gestión de participantes e invitaciones
- Relacionado con: US-TRIP-003, US-TRIP-004, US-PART-001, US-PART-002
- Story Points: 5

### TCK-FE-004 – Registro de gastos y feed
- Relacionado con: US-EXP-001, US-EXP-003, US-EXP-002
- Story Points: 5

### TCK-FE-005 – Pantallas de saldos y cierre de viaje
- Relacionado con: US-BAL-001, US-BAL-002, US-BAL-003
- Story Points: 5

### TCK-FE-006 – Pantalla de perfil de usuario
- Relacionado con: US-PROFILE-001
- Descripción:
  Formulario para ver y actualizar nombre y contraseña, consumiendo el endpoint de actualización de perfil. 

### TCK-FE-007 – Vista de detalle de viaje
- Relacionado con: US-TRIP-001, US-TRIP-002, US-PART-001, US-EXP-003, US-BAL-001, US-BAL-002
- Descripción:
  Página que muestra información del viaje, participantes, feed de gastos y accesos a registro de gasto y saldos. 

### TCK-FE-008 – Control de permisos en UI
- Relacionado con: reglas CREATOR/MEMBER y US-EXP-004, US-BAL-003
- Descripción:
  Lógica en el frontend para mostrar/ocultar acciones sensibles (editar/eliminar gasto, cerrar viaje) según rol del usuario en el viaje. 

### TCK-FE-009 – Flujo de invitación y notificación visual
- Relacionado con: US-TRIP-003, US-NOTIF-001
- Descripción:
  Formulario para invitar por email y feedback claro de errores (usuario no registrado) y éxito de invitación. 

### TCK-FE-010 – Pantalla de balances y “quién debe a quién”
- Relacionado con: US-BAL-001, US-BAL-002
- Descripción:
  Vista dedicada (o sección en el detalle) que muestre lista “X debe a Y” y resumen personal del usuario. 
