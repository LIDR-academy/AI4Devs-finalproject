# [UNLOKD-013] Implementar Condición PASSWORD (con Hash + Intentos)

## Tipo
- [x] Feature

## Épica
EPIC-3: Motor de Condiciones

## Sprint
Sprint 3

## Estimación
**Story Points**: 8

## Descripción
Implementar condición PASSWORD: mensajes protegidos con PIN de 4 dígitos, hash bcrypt, límite de intentos, registro de intentos fallidos.

## Historia de Usuario Relacionada
- HU-008: Enviar mensaje con contraseña

## Caso de Uso Relacionado
- UC-008: Enviar Mensaje con Contraseña

## Criterios de Aceptación
- [ ] PasswordConditionStrategy implementado
- [ ] Hash de PIN con bcrypt factor 10+
- [ ] Validación con bcrypt.compare()
- [ ] Registro de intentos en MESSAGE_UNLOCK_ATTEMPTS
- [ ] Lógica de max_attempts
- [ ] Cambio a FAILED al alcanzar límite
- [ ] Tests unitarios + E2E

## Tareas Técnicas
- [ ] Implementar `PasswordConditionStrategy`
- [ ] Hashear PIN al crear condición
- [ ] Implementar validación con bcrypt.compare()
- [ ] Contador de intentos por (messageId, userId)
- [ ] Registrar intentos en BD
- [ ] Cambiar status a FAILED si límite alcanzado
- [ ] Escribir tests

## Labels
`conditions`, `password`, `bcrypt`, `sprint-3`, `p1-high`

