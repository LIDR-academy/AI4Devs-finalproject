# Constitución del Proyecto (Spec-Driven Development)

## Propósito
Alinear a todo el equipo (negocio, TI, QA, seguridad) alrededor de una **Especificación central (Spec)** que gobierna diseño, construcción, pruebas y despliegue.

## Alcance
- Dominios: Core Financiero, Canales Digitales, Scoring y Backoffice.
- Stacks principales: **NestJS**, **Angular**, **PostgreSQL**.
- Reglas: Cumplimiento SEPS (auditoría, trazabilidad, seguridad, retención).

## Principios
1. **La spec es la fuente de verdad**. Todo cambio debe reflejarse primero aquí.
2. **Trazabilidad completa**: Spec → Plan → Tareas → PR → Release.
3. **Seguridad por defecto**: cifrado, PII mínima, logs con correlación, least privilege.
4. **Calidad medible**: SLOs, cobertura de pruebas, p99, MTTR.
5. **Observabilidad**: métricas, logs y trazas con OpenTelemetry.

## Stakeholders
- Product Owner (Negocio)
- Arquitectura/Seguridad
- Equipo de Desarrollo
- QA
- Operaciones/DevOps

## Definición de Terminado (DoD)
- Criterios de aceptación verificados (unit + e2e)
- Documentación actualizada (este repo + ADRs)
- Monitoreo/alertas configuradas
- Mig/rollback probados en ambiente de staging
