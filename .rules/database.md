# Database Rules for latearte

Este documento establece las normas estrictas para la persistencia de datos y el manejo de contenedores en el proyecto **latearte**.

## 1. La Regla de Oro (Prisma ORM)
- **Definición Única**: Toda definición de tablas, relaciones, campos o tipos debe realizarse **exclusivamente** en el archivo `backend/prisma/schema.prisma`.
- **Sincronización**: No se permiten alteraciones manuales a la base de datos (Direct SQL). Todo cambio debe aplicarse mediante comandos de Prisma (`npx prisma db push` o `npx prisma migrate dev`).
- **Nomenclatura**:
    - Modelos en **PascalCase** y en singular (ej. `User`, `Obra`).
    - Campos y relaciones en **snake_case** (ej. `duracion_min`, `vibe_mood`).
    - Tablas mapeadas a plural en minúsculas (ej. `@@map("obras")`).

## 2. Infraestructura y Docker
- **Aislamiento**: Los servicios de base de datos **PostgreSQL** y el servicio de caché **Redis** deben operar obligatoriamente dentro de los contenedores definidos en el archivo `backend/docker-compose.yml`.
- **Puertos**: 
    - PostgreSQL: Interno `5432`, Externo `5433` (para evitar conflictos locales).
    - Redis: Interno `6379`, Externo `6379`.
- **Persistencia**: Todos los contenedores de bases de datos deben montar volúmenes (`volumes`) para que los datos no se pierdan al reiniciar los contenedores.

## 3. Integridad Referencial y Modelo MVP
Se debe garantizar la integridad referencial estricta entre las entidades núcleo del sistema:

### A. Núcleo Artístico
- **OBRA**: Entidad central. Debe incluir obligatoriamente `duracion_min` (para el Dial de Tiempo) y `vibe_mood`.
- **HITOS**: Cada obra puede tener múltiples hitos (premios/nominaciones). Relación `1:N` obligatoria.
- **DATOS_CONTEXTO**: Información sincronizada por `marca_tiempo` para el Modo Contexto. Relación `1:N` obligatoria con integridad de borrado en cascada (`onDelete: Cascade`) si la obra desaparece.

### B. Acceso e Integración
- **PLATAFORMA_ORIGEN**: Debe definir el campo `permite_iframe` para orquestar la lógica de *Smart Embedding* vs *Deep Linking*.
- **ESTADO_ACCESO**: Clasificación estricta por colores (Verde: Abierto, Amarillo: Suscripción, Azul: VOD).

## 4. Auditoría y Rendimiento
- **Soft Delete**: Aunque el MVP es simplificado, se recomienda el uso de un campo `activo: Boolean` para desactivar contenido sin eliminarlo físicamente.
- **Caché**: El uso de **Redis** es obligatorio para almacenar metadatos de APIs de terceros y evitar el agotamiento de cuotas (Rate Limiting).

---
**Fuente**: [Modelo de datos arteflujo.md](file:///c:/Documentos/Cursos/Lidr/IA4Devs/AI4Devs-finalproject/documentacion/Modelo%20de%20datos%20arteflujo.md)
