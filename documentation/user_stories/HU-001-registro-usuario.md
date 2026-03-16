### HU-001: Registro de Usuario con Email y Contraseña

**Como** usuario nuevo sin cuenta en UNLOKD,
**quiero** registrarme proporcionando mi email y contraseña,
**para que** pueda crear mi cuenta y acceder a la aplicación de mensajería condicionada.

#### Criterios de Aceptación

- [ ] El sistema debe permitir ingresar un email válido en un formulario de registro
- [ ] El sistema debe validar que el email tenga formato correcto (contiene @ y dominio válido)
- [ ] El sistema debe permitir ingresar una contraseña con mínimo 8 caracteres
- [ ] El sistema debe solicitar confirmar la contraseña para evitar errores de tipeo
- [ ] El sistema debe validar que ambas contraseñas coinciden antes de enviar
- [ ] El sistema debe mostrar indicador visual de fortaleza de contraseña en tiempo real
- [ ] El sistema debe mostrar mensaje de error claro si el email ya está registrado
- [ ] El sistema debe hashear la contraseña con bcrypt antes de almacenarla (nunca texto plano)
- [ ] El sistema debe generar automáticamente un username único basado en el email
- [ ] El sistema debe crear el registro en la tabla USERS con is_active = 1
- [ ] El sistema debe mostrar mensaje de éxito tras registro exitoso
- [ ] El sistema debe redirigir automáticamente a la pantalla de login tras registro exitoso
- [ ] El sistema debe completar el registro en menos de 2 segundos

#### Notas Adicionales

- Para el MVP no se requiere verificación de email por correo electrónico
- El username se genera automáticamente tomando la parte antes de @ del email
- Si el username ya existe, se agrega sufijo numérico secuencial (ej: usuario, usuario2, usuario3)
- Implementar rate limiting: máximo 5 intentos de registro por IP por minuto
- La contraseña debe almacenarse con bcrypt factor 10 o superior
- Considerar agregar captcha si se detecta abuso en el futuro

#### Historias de Usuario Relacionadas

- HU-002: Login de usuario y obtención de JWT (siguiente paso tras registro)
- HU-003: Actualizar perfil de usuario (permite personalizar información post-registro)

#### Detalle Técnico

**Endpoints:**
- POST `/api/v1/auth/register`

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123",
  "passwordConfirm": "contraseña123"
}
```

**Response:**
```json
{
  "userId": "uuid-...",
  "username": "usuario",
  "email": "usuario@example.com",
  "message": "Registro exitoso"
}
```

**Módulos NestJS:**
- `src/modules/auth/` (auth.controller.ts, auth.service.ts)
- `src/modules/users/` (users.service.ts, users.repository.ts)

**Tablas DB:**
- USERS (id, email, username, password_hash, display_name, is_active, created_at)

**Validaciones (class-validator):**
- `@IsEmail()` para email
- `@MinLength(8)` para password
- `@Matches()` para confirmar contraseñas coinciden
- Validación personalizada para email único en la base de datos

**Tests:**
- **Unitarios**: 
  - Validación de formato de email
  - Validación de longitud de contraseña
  - Generación correcta de username
  - Hash de contraseña con bcrypt
- **Integración**:
  - Creación exitosa de usuario en DB
  - Rechazo de email duplicado
  - Manejo de errores de conexión a DB
- **E2E**:
  - Flujo completo de registro exitoso
  - Intento de registro con email duplicado
  - Contraseñas que no coinciden
  - Email con formato inválido

**Prioridad:** P0 - Blocker (Sprint 1)
**Estimación:** 3 Story Points
**Caso de Uso Relacionado:** UC-001 - Registrar Cuenta

