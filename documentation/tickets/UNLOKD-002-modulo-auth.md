# [UNLOKD-002] Implementar Módulo de Autenticación (Registro + Login + JWT)

## Tipo
- [x] Feature

## Épica
EPIC-1: Fundación - Autenticación y Usuarios

## Prioridad
- [x] P0 - Blocker

## Sprint
Sprint 1 (06/01 - 19/01)

## Estimación
**Story Points**: 8

## Descripción
Implementar el módulo de autenticación completo que permita a usuarios registrarse con email/contraseña y hacer login obteniendo un JWT válido. Incluye hash seguro de contraseñas con bcrypt, validación de credenciales, rate limiting y guards de protección.

## Historia de Usuario Relacionada
- HU-001: Registro de usuario
- HU-002: Login de usuario y obtención de JWT

## Caso de Uso Relacionado
- UC-001: Registrar Cuenta
- UC-002: Iniciar Sesión

## Criterios de Aceptación
- [ ] Endpoint `POST /api/v1/auth/register` implementado y funcional
- [ ] Endpoint `POST /api/v1/auth/login` implementado y funcional
- [ ] Validación de email formato correcto con `class-validator`
- [ ] Hash de contraseña con bcrypt factor 10+ antes de almacenar
- [ ] Generación de JWT con payload `{userId, email, username}` y expiración 24h
- [ ] JwtAuthGuard implementado para proteger rutas autenticadas
- [ ] JwtStrategy configurada para validar JWT en requests
- [ ] Rate limiting: máximo 5 intentos login por IP cada 15min (Redis)
- [ ] Mensajes de error genéricos ("Credenciales inválidas") para no revelar qué falló
- [ ] Tests unitarios con cobertura > 80%
- [ ] Tests E2E del flujo completo registro → login

## Tareas Técnicas
- [ ] Crear módulo `auth/` con controller, service
- [ ] Implementar `register(email, password)` en AuthService
- [ ] Implementar `login(email, password)` en AuthService
- [ ] Configurar JwtModule con secret y expiración
- [ ] Crear JwtStrategy para Passport
- [ ] Crear JwtAuthGuard usando `@nestjs/passport`
- [ ] Implementar rate limiting con Redis (clave: `login:attempts:{ip}`)
- [ ] Crear DTOs: RegisterDto, LoginDto, AuthResponseDto
- [ ] Agregar validaciones con `class-validator`
- [ ] Escribir tests unitarios (AuthService)
- [ ] Escribir tests E2E (auth.e2e-spec.ts)

## Dependencias
- UNLOKD-001: Setup proyecto

## Endpoints API
- POST `/api/v1/auth/register` → `{userId, username, email}`
- POST `/api/v1/auth/login` → `{accessToken, user: {id, email, username}}`

## Tablas DB
- USERS (usado por UsersRepository)

## Tests
```typescript
// Unit test ejemplo
describe('AuthService', () => {
  it('should hash password before storing', async () => {
    const password = 'test123';
    const hash = await authService.hashPassword(password);
    expect(hash).not.toBe(password);
    expect(await bcrypt.compare(password, hash)).toBe(true);
  });
});

// E2E test ejemplo
it('POST /auth/register should create user', () => {
  return request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send({email: 'test@example.com', password: 'password123'})
    .expect(201);
});
```

## Labels
`auth`, `backend`, `nestjs`, `jwt`, `sprint-1`, `p0-blocker`

