# ADR-002: Base de Datos Relacional (PostgreSQL)

Fecha: 2025-09-23

## Estado
Aceptado

## Contexto
El dominio requiere integridad referencial (Servicio -> Slots -> Reservas) y queries relacionales (filtrar próximos slots abiertos, reservas pendientes). Se requieren transacciones atómicas al aprobar reservas (actualizar reserva + slot + registrar id de evento calendario).

## Decisión
Usaremos PostgreSQL como base de datos relacional principal.

## Consecuencias
Positivas:
- Integridad referencial nativa.
- Capacidades de indexing avanzadas (btree, partial indexes) para queries de disponibilidad.
- Extensiones útiles (uuid-ossp, pgcrypto) para generación de identificadores.

Negativas:
- Escalado horizontal requerirá partición futura si el tráfico crece.
- Más rigidez ante cambios de esquema (se mitigará con migraciones).

## Estrategia de Migraciones
Inicialmente Flyway por simplicidad.

## Alternativas Consideradas
- NoSQL (Document / Dynamo / Mongo): descartado por naturaleza fuertemente relacional del modelo.
- SQLite: descartado para producción por concurrencia y escalabilidad limitadas.

## Métricas Clave
- Tiempo medio de consulta para lista de slots futuros.
- Latencia de operación de aprobación de reserva.
