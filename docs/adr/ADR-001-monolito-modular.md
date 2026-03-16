# ADR-001: Arquitectura Monolito Modular

Fecha: 2025-09-23

## Estado
Aceptado

## Contexto
Necesitamos entregar rápidamente un MVP con un dominio que aún está en cambio (servicios, slots, reservas, sincronización calendario). El equipo es pequeño y la complejidad operativa debe mantenerse baja.

## Decisión
Implementaremos un monolito modular en Kotlin (Spring Boot), separando por módulos lógicos internos (Gradle subprojects o paquetes) con límites definidos (catálogo, reservas, sincronización, notificaciones, API). 

Los módulos compartirán una única base de datos relacional (PostgreSQL). Se expondrá una única aplicación desplegable (imagen Docker).

## Consecuencias
Positivas:
- Simplicidad de despliegue y observabilidad.
- Refactors rápidos mientras el dominio evoluciona.
- Comunicación interna sin latencia de red.
- Facilita consistencia transaccional (mismo commit DB).

Negativas:
- Riesgo de erosión de límites si no se aplican convenciones.
- Escalado granular de infraestructura más difícil (no se puede escalar solo reservas).
- Migrar a microservicios luego requerirá extraer módulos cuidadosamente.

## Medidas de Mitigación
- Convención: Ningún módulo accede a entidades de otro directamente; usar servicios de aplicación / interfaces.
- Reglas de importación al pasar CI (ej. ArchUnit / jDepend) futuras.
- DTOs / Facades para comunicación entre capas.

## Alternativas Consideradas
- Microservicios tempranos: descartado por sobrecarga (infra, observabilidad, despliegue) y dominio inestable.
- Arquitectura serverless: descartado por necesidad de transacciones multi-entidad y complejidad en sincronización calendar.

## Futuras Re-evaluaciones
Revisar si:
- Carga de trabajo > 500 RPS sostenidos con picos conflictivos de reservas.
- Nuevos bounded contexts (pagos, multi-tenant) crecen y requieren independencia.
