# [UNLOKD-005] Tests E2E de Autenticación

## Tipo
- [x] Feature (Testing)

## Épica
EPIC-1: Fundación - Autenticación y Usuarios

## Prioridad
- [x] P0 - High

## Sprint
Sprint 1 (06/01 - 19/01)

## Estimación
**Story Points**: 1

## Descripción
Crear suite completa de tests E2E para autenticación usando Jest + Supertest. Validar flujos completos de registro, login, rate limiting y protección de rutas.

## Historia de Usuario Relacionada
- HU-001, HU-002

## Criterios de Aceptación
- [ ] Test: registro exitoso de usuario
- [ ] Test: registro con email duplicado (debe fallar)
- [ ] Test: login exitoso con credenciales correctas
- [ ] Test: login con credenciales incorrectas (debe fallar)
- [ ] Test: bloqueo tras 5 intentos fallidos
- [ ] Test: acceso a ruta protegida sin JWT (debe fallar 401)
- [ ] Test: acceso a ruta protegida con JWT válido (debe funcionar)
- [ ] Todos los tests pasando
- [ ] Cobertura > 80%

## Tareas Técnicas
- [ ] Crear `test/e2e/auth.e2e-spec.ts`
- [ ] Setup de base de datos de prueba
- [ ] Implementar tests de registro
- [ ] Implementar tests de login
- [ ] Implementar tests de protección JWT
- [ ] Implementar tests de rate limiting
- [ ] Configurar scripts `npm run test:e2e`

## Dependencias
- UNLOKD-002: Módulo auth

## Labels
`testing`, `e2e`, `auth`, `sprint-1`

