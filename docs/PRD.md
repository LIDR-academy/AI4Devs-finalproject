# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Proyecto: Sistema de Gestión de Gastos de Viaje (TravelSplit MVP)
**Versión:** 1.0 | **Estado:** Aprobado para Desarrollo | **Fecha:** 29/12/2025

---

### 1. RESUMEN EJECUTIVO
* **Elevator Pitch:** Una plataforma web centralizada que elimina la fricción financiera en viajes grupales, permitiendo el rastreo transparente de gastos en COP y la liquidación de cuentas clara entre amigos registrados.
* **Problema:** Los grupos de amigos sufren para consolidar gastos dispersos, perdiendo recibos y generando tensiones por cálculos manuales erróneos.
* **Solución:** Un sistema web que obliga al registro previo para garantizar la identidad, centraliza la evidencia de gastos (fotos) y ofrece una visualización simple de saldos "quién debe a quién".

### 2. OBJETIVOS DE NEGOCIO (BUSINESS GOALS)
* **Corto Plazo (MVP):** Entregar un sistema funcional que permita el ciclo completo: Registro -> Creación Viaje -> Carga Gastos -> Visualización Saldos.
* **KPI Principal:** Tasa de finalización de viajes (Viajes donde se usa el botón "Equilibrar gastos").

### 3. STAKEHOLDERS Y ROLES

**IMPORTANTE:** El sistema NO tiene administradores globales del sistema. Los roles se manejan a nivel de viaje individual.

| Rol | Descripción | Nivel de Acceso | Contexto |
| :--- | :--- | :--- | :--- |
| **Viajero Administrador (Creador)** | Usuario que crea el viaje. | **Alto:** Crea viajes, invita usuarios, gestiona (edita/elimina) TODOS los gastos del viaje. | Rol asignado en `TripParticipant.role = 'CREATOR'` para el viaje específico |
| **Viajero Participante** | Usuario invitado al viaje. | **Medio:** Visualiza data, sube gastos propios (pero no puede editarlos tras crearlos, según regla de negocio). | Rol asignado en `TripParticipant.role = 'MEMBER'` para el viaje específico |
| **Sistema (Backend)** | NestJS API. | **N/A:** Procesa validaciones, cálculos y notificaciones. | - |

**Notas sobre Roles:**
- Los roles son **contextuales por viaje**: Un usuario puede ser CREATOR en un viaje y MEMBER en otro.
- No existe un rol de "administrador del sistema" (`isAdmin`). Todos los usuarios tienen los mismos permisos a nivel global.
- La autorización se basa en:
  - **Perfil de usuario:** Cada usuario solo puede actualizar su propio perfil.
  - **Rol en viaje:** Los permisos sobre gastos y configuración del viaje se basan en `TripParticipant.role`.

### 4. REGLAS DE NEGOCIO CRÍTICAS (SCOPE)
1.  **Strict User Policy (Opción A):** No se pueden agregar participantes a un viaje si su email no está previamente registrado en la base de datos. El sistema bloqueará la invitación.
2.  **Centralized Control:** Solo el **Creador del Viaje** (rol `CREATOR` en `TripParticipant`) tiene permisos de escritura (Edición/Eliminado) sobre los gastos y la configuración del viaje. Los participantes (`MEMBER`) solo pueden crear gastos propios, no editarlos.
3.  **Autorización de Perfil:** Cada usuario solo puede actualizar su propio perfil de usuario. No hay administradores del sistema que puedan modificar perfiles de otros usuarios.
4.  **Moneda Única:** Todo el sistema opera exclusivamente en **COP** (Pesos Colombianos).
5.  **Soft Delete:** Ningún dato se borra físicamente; se usa borrado lógico (`deleted_at`).

### 5. CARACTERÍSTICAS Y FUNCIONALIDADES (FEATURES)

#### Módulo 1: Autenticación (Auth)
* Registro (Email, Nombre, Password > 6 chars).
* Login (JWT Strategy).

#### Módulo 2: Gestión de Viajes (Trips)
* Listado de mis viajes (activos e históricos).
* Crear Viaje (Nombre, Divisa fija COP, Agregar participantes por email validado).
* Unirse a Viaje (Vía código alfanumérico generado por el sistema).

#### Módulo 3: Gestión de Gastos (Expenses)
* Registro de Gasto: Título, Monto, Pagador, Beneficiarios (Split), Categoría, Foto (Opcional).
* **Categorías:** Comida, Transporte, Alojamiento, Entretenimiento, Varios.
* Feed de Gastos: Orden descendente por fecha.

#### Módulo 4: Saldos (Balances)
* Cálculo matemático directo: Total gastado por usuario vs. Cuota justa (Fair share).
* Visualización: Lista simple de deudas (Ej: "Juan debe $50.000 a Pedro").

### 6. HISTORIAS DE USUARIO CLAVE
1.  *Como Creador*, quiero invitar a mis amigos por correo, para que el sistema me alerte si alguno no se ha registrado aún y así pedirle que lo haga.
2.  *Como Participante*, quiero subir una foto del recibo de la cena, para que exista evidencia del monto cobrado.
3.  *Como Creador*, quiero poder editar un gasto mal ingresado por otro amigo, para mantener las cuentas claras (Permiso exclusivo).
4.  *Como Usuario*, quiero ver un gráfico o lista simple que me diga cuánto debo en total, para transferir el dinero y cerrar el viaje.
5.  *Como Sistema*, quiero enviar una alerta por email cuando alguien es agregado a un viaje, para que se enteren inmediatamente.

### 7. REQUISITOS TÉCNICOS (ALTO NIVEL)
* **Frontend:** React (TypeScript) + TailwindCSS. Diseño Responsive full pautas WCAG.
* **Backend:** NestJS (Node.js). Estructura modular estricta.
* **Patrón de Diseño:** CSED (Controller-Service-Entity-DTO)
* **Arquitectura:** Layered Architecture (Arquitectura en Capas)
El sistema no es un bloque de código desordenado; está dividido en "estratos" horizontales. Cada capa tiene una responsabilidad única y solo puede comunicarse con la capa inmediatamente inferior.

- Principio: Separation of Concerns (Separación de Responsabilidades).

- Regla de Oro: El Controlador nunca habla directamente con la Base de Datos; debe pasar por el Servicio.
* **Base de Datos:** PostgreSQL(Relacional obligatoria para integridad financiera).
* **Almacenamiento:** Sistema de archivos local o servicio Cloud (S3/Cloudinary) para las fotos de recibos.

### 8. AUTENTICACIÓN Y AUTORIZACIÓN

#### 8.1 Autenticación
* **Método:** JWT (JSON Web Tokens) usando Passport Strategy
* **Implementación:** `JwtAuthGuard` y `JwtStrategy` en `Backend/src/common/`
* **Token Payload:** `{ sub: user.id, email: user.email }`
* **Validación:** Token extraído del header `Authorization: Bearer <token>`

#### 8.2 Autorización y Control de Acceso

**Principios:**
- **No hay administradores del sistema:** Todos los usuarios tienen los mismos permisos a nivel global.
- **Roles contextuales por viaje:** Los permisos se basan en el rol del usuario en cada viaje específico (`TripParticipant.role`).

**Reglas de Autorización:**

1. **Gestión de Perfil de Usuario:**
   - Cada usuario solo puede actualizar su propio perfil (`PUT /users/:id`).
   - Verificación: `req.user.id === id` (usuario autenticado debe coincidir con el ID del perfil).

2. **Gestión de Viajes:**
   - **Crear viaje:** Cualquier usuario autenticado puede crear un viaje.
   - **Invitar participantes:** Solo el usuario con rol `CREATOR` en el viaje puede invitar participantes.
   - **Editar/eliminar viaje:** Solo el usuario con rol `CREATOR` en el viaje puede modificar la configuración del viaje.

3. **Gestión de Gastos:**
   - **Crear gasto:** Cualquier participante del viaje (CREATOR o MEMBER) puede crear gastos.
   - **Editar/eliminar gasto:** Solo el usuario con rol `CREATOR` en el viaje puede editar o eliminar cualquier gasto del viaje.
   - **Nota:** Los MEMBER no pueden editar sus propios gastos después de crearlos (regla de negocio).

4. **Visualización:**
   - Todos los participantes del viaje pueden ver los gastos y saldos del viaje.

**Implementación Técnica:**
- Los roles se almacenan en la tabla `TripParticipant` con el campo `role` (Enum: `CREATOR`, `MEMBER`).
- La verificación de roles se realiza consultando `TripParticipant` para el viaje específico.
- No se usa un campo `isAdmin` en la entidad `User` ni en el token JWT.

---