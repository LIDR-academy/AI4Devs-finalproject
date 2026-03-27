# Work Ticket: ARF-001 — Migración: tabla OBRA con soporte a filtros Dial de Tiempo y Mood

| Campo | Valor |
|-------|-------|
| **Tipo** | Base de Datos |
| **Estimación** | 2h |
| **Dependencias** | Ninguna |

**Descripción**: Crear la migración de PostgreSQL para la entidad `OBRA` con todos los campos necesarios para el MVP, incluyendo los campos de filtrado `duracion_min` y `vibe_mood`.

**Criterios de Aceptación**:
- [x] Tabla `OBRA` creada con: `id_obra`, `titulo`, `director_artista`, `region`, `duracion_min`, `vibe_mood`, `valor_cultural` (VARCHAR 280), `id_eje_vertical` (FK), `id_estado_acceso` (FK), `id_plataforma_origen` (FK).
- [x] Índices en `duracion_min` y `vibe_mood` para optimizar los filtros.
- [x] La migración es reversible (up/down).

**Tareas Técnicas**:
1. [x] Crear tablas auxiliares: `EJE_VERTICAL`, `ESTADO_ACCESO`, `PLATAFORMA_ORIGEN` (Sincronizado vía Schema Prisma, conservando ENUMs por decisión arquitectónica).
2. [x] Crear tabla `OBRA` con claves foráneas a las anteriores.
3. [x] Crear tabla `LISTA_DESEOS` (model `Watchlist` mapeado a `watchlist`).
4. [x] Aplicar migración en entorno de desarrollo y verificar esquema.

---
**User Story de referencia (US-1)**: Como Curioso Cultural, quiero filtrar contenido por duración y mood.
