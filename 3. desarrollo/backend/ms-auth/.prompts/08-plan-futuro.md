# 08 - Plan de Trabajo Futuro

## Pendientes inmediatos
1) Documentar y/o ejecutar pruebas (unit/integration/E2E) y publicar cobertura.
2) Verificar migraciones y seeds en pipelines (admin user + perfiles + horarios de prueba).
3) Revisar políticas de contraseña y hashing contra `PerfilModel` en entornos reales.
4) Confirmar paridad REST/NATS con la colección Postman actualizada.

## Mejoras técnicas
- Validar manejo de refresh tokens por familia (token reuse) y revocación consistente.
- Enriquecer auditoría (ip/userAgent/device) en todos los flujos si falta.
- Centralizar validaciones de horario/autorización temporal en un servicio compartido.

## Ajustes de diseño previstos
- Mantener sesión única configurable por perfil; revisar expiración y timeout.
- Alinear DTOs/Responses con ApiResponse/ApiResponses para contratos uniformes.

## Consideraciones para próximos sprints
- Automatizar seeds de datos mínimos (perfiles, usuario admin, horarios) para ambientes.
- Añadir smoke/E2E en pipeline con BD de prueba.
- Evaluar MFA/TOTP en producción si se requiere (hay campos `totpSecret` y `requiereMFA`).

## Criterios de cierre del sprint
- Tests documentados y ejecutándose en CI con cobertura ≥80%.
- Migraciones/seeds automatizadas en integración.
- Paridad REST/NATS validada y reflejada en Postman.
- Política de contraseña verificada contra perfil y aplicada en cambio/reset.
