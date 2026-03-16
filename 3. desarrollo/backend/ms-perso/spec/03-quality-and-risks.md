# Calidad, Seguridad y Riesgos

## SLOs
- Disponibilidad 99.9% (mensual)
- p99 API < 300ms
- Error rate < 0.1%

## Seguridad
- Cifrado en tránsito (TLS1.2+), en reposo (KMS)
- Gestión de secretos (Vault/SSM)
- PII minimizada y masked logs
- Política de contraseñas y MFA

## Cumplimiento
- Evidencia de cambios: PRs ligadas a Spec e Issues
- Retención de logs ≥ 90 días
- Backups y pruebas de restauración

## Riesgos
- Cambios de esquema sin backward compatibility
- Fugas de PII
- Degradación por picos de tráfico

## Controles
- Migration tests + rollback
- Sanitización de logs
- Stress tests programados
