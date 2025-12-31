### HU-002: Login de Usuario y Obtención de JWT

**Como** usuario registrado en UNLOKD,
**quiero** iniciar sesión con mi email y contraseña,
**para que** pueda autenticarme y acceder a todas las funcionalidades de mensajería condicionada.

#### Criterios de Aceptación

- [ ] El sistema debe permitir ingresar email y contraseña en un formulario de login
- [ ] El sistema debe validar el formato del email antes de enviar
- [ ] El sistema debe mostrar mensajes de error genéricos para no revelar qué credencial es incorrecta ("Credenciales inválidas")
- [ ] El sistema debe usar bcrypt.compare() para verificar la contraseña de forma segura
- [ ] El sistema debe generar un JWT válido con payload {userId, email, username} tras login exitoso
- [ ] El JWT debe expirar en 24 horas para web y 30 días para móvil
- [ ] El sistema debe almacenar el JWT en cookie HttpOnly + Secure en web
- [ ] El sistema debe actualizar last_login_at en la tabla USERS
- [ ] El sistema debe mostrar mensaje de error si la cuenta está desactivada (is_active = 0)
- [ ] El sistema debe implementar rate limiting: máximo 5 intentos por IP cada 15 minutos
- [ ] El sistema debe bloquear temporalmente tras 5 intentos fallidos consecutivos
- [ ] El sistema debe redirigir automáticamente al dashboard tras login exitoso
- [ ] El login debe completarse en menos de 1 segundo

#### Notas Adicionales

- Usar mensajes de error genéricos por seguridad (no revelar si el email existe o si la contraseña es incorrecta)
- Los intentos fallidos se rastreen por IP y por email en Redis
- El contador de intentos se resetea tras login exitoso
- Considerar implementar refresh tokens en versiones futuras
- Registrar todos los intentos de login (exitosos y fallidos) para auditoría

#### Historias de Usuario Relacionadas

- HU-001: Registro de usuario (paso previo necesario)
- HU-004: Crear chat 1-a-1 (requiere estar autenticado)
- HU-005: Enviar mensaje de texto (requiere estar autenticado)

#### Detalle Técnico

**Endpoints:**
- POST `/api/v1/auth/login`

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-...",
    "email": "usuario@example.com",
    "username": "usuario",
    "displayName": "Usuario Demo"
  }
}
```

**Módulos NestJS:**
- `src/modules/auth/` (auth.controller.ts, auth.service.ts)
- `src/common/guards/` (jwt-auth.guard.ts)
- `src/common/strategies/` (jwt.strategy.ts)

**Tablas DB:**
- USERS (para verificar credenciales y actualizar last_login_at)

**Cache (Redis):**
- Clave: `login:attempts:{email}` → contador de intentos fallidos
- Clave: `login:attempts:{ip}` → contador de intentos por IP
- TTL: 15 minutos

**Validaciones:**
- `@IsEmail()` para email
- `@IsNotEmpty()` para password
- Validación de rate limit antes de procesar
- Verificación de usuario activo (is_active = 1)

**Tests:**
- **Unitarios**:
  - Generación correcta de JWT con payload esperado
  - Validación de contraseña con bcrypt.compare()
  - Lógica de rate limiting
- **Integración**:
  - Login exitoso actualiza last_login_at
  - Credenciales incorrectas incrementan contador
  - Usuario desactivado es rechazado
- **E2E**:
  - Flujo completo de login exitoso
  - Login con email incorrecto
  - Login con contraseña incorrecta
  - Bloqueo tras múltiples intentos fallidos
  - Login tras registro

**Prioridad:** P0 - Blocker (Sprint 1)
**Estimación:** 3 Story Points
**Caso de Uso Relacionado:** UC-002 - Iniciar Sesión

