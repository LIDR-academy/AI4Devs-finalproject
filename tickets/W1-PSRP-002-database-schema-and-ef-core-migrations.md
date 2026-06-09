## PSRP-002: feat(data): database-schema-and-ef-core-migrations

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W1
**Dependencies:** PSRP-001

## Resumen de Funcionalidad
Implementar las 13 entidades de dominio como modelos EF Core con configuraciones completas de tipo entidad, crear la migración inicial de PostgreSQL, y seedear las 3 plantillas preestablecidas de boda. Esto cubre el modelo de datos completo según la documentación, incluyendo todas las columnas, constraints, índices, foreign keys, soft delete filters, computed columns, y encriptación PII vía Value Converters.

## Requisitos
- [ ] Crear los 13 modelos de entidad de dominio en Aura.Core/Models/: User, UserConsent, Event, Template, Guest, Invitation, Rsvp, Accomplice, MessageTemplate, LiveMessage, Payment, DataRetentionJob, DeliveryLog
- [ ] Crear EntityTypeConfigurations de EF Core para todas las entidades en Aura.Infrastructure/Data/Configurations/
- [ ] Configurar todas las columnas, tipos, constraints (CHECK, UNIQUE, NOT NULL), y defaults según especificación del modelo de datos
- [ ] Configurar todas las relaciones de foreign key y reglas de cascade según especificación del modelo de datos
- [ ] Configurar los más de 32 índices según estrategia de indexación en modelo de datos
- [ ] Configurar global query filters para soft delete en Guest, Invitation, MessageTemplate
- [ ] Configurar columna calculada para Event.EventEndDate (EventDate + 1 day)
- [ ] Configurar encriptación PII vía EF Core Value Converters para: Guest.Email, Guest.Phone, Rsvp.DietaryRestrictions, Rsvp.Message, Accomplice.Email
- [ ] Seedear 3 plantillas preestablecidas de boda (Classic Elegance, Modern Minimal, Rustic Charm) con LayoutJson
- [ ] Crear ApplicationDbContext con todos los DbSets y configuraciones de OnModelCreating
- [ ] Generar migración inicial de EF Core `InitialSchema`
- [ ] Crear interfaces de repositorio en Aura.Core/Interfaces/Repositories/ para todas las entidades
- [ ] Crear implementaciones de repositorio en Aura.Infrastructure/Repositories/ para todas las entidades

## Notas Técnicas
- **Backend:** Todos los modelos de entidad usan `Guid` para Id (PostgreSQL uuid). File-scoped namespaces, primary constructors, collection expressions (C# 12+)
- **Frontend:** N/A
- **Database:** PostgreSQL 16 con extensión `uuid-ossp`, `timestamptz` para todos los timestamps, `jsonb` para Permissions y LayoutJson, `decimal(10,2)` para payments, `decimal(9,6)` para coordinates
- **Integrations:** N/A
- **Key files:**
  - `backend/src/Aura.Core/Models/User.cs`
  - `backend/src/Aura.Core/Models/Event.cs`
  - `backend/src/Aura.Core/Models/Guest.cs`
  - `backend/src/Aura.Core/Models/Invitation.cs`
  - `backend/src/Aura.Core/Models/Rsvp.cs`
  - `backend/src/Aura.Core/Models/Accomplice.cs`
  - `backend/src/Aura.Core/Models/MessageTemplate.cs`
  - `backend/src/Aura.Core/Models/LiveMessage.cs`
  - `backend/src/Aura.Core/Models/Payment.cs`
  - `backend/src/Aura.Core/Models/Template.cs`
  - `backend/src/Aura.Core/Models/DataRetentionJob.cs`
  - `backend/src/Aura.Core/Models/UserConsent.cs`
  - `backend/src/Aura.Core/Models/DeliveryLog.cs`
  - `backend/src/Aura.Infrastructure/Data/ApplicationDbContext.cs`
  - `backend/src/Aura.Infrastructure/Data/Configurations/*.cs`
  - `backend/src/Aura.Infrastructure/Migrations/*_InitialSchema.cs`
  - `backend/src/Aura.Core/Interfaces/Repositories/I*Repository.cs`
  - `backend/src/Aura.Infrastructure/Repositories/*Repository.cs`

## Criterios de Aceptación
- [ ] AC1: Dado que la solución construye, cuando se ejecuta `dotnet ef migrations add InitialSchema`, entonces la migración se genera con las 13 tablas, todos los índices, todas las foreign keys, y todos los CHECK constraints
- [ ] AC2: Dado que la migración está aplicada a PostgreSQL, cuando se ejecuta `dotnet ef database update`, entonces todas las tablas se crean y 3 filas de seed de plantillas se insertan
- [ ] AC3: Dado que la aplicación está corriendo, cuando un nuevo Guest es creado y luego soft-deleted (IsDeleted = true), entonces `context.Guests.ToListAsync()` no devuelve el guest eliminado (global query filter works)
- [ ] AC4: Dado un Guest con Email "test@example.com", cuando la entidad se guarda y se vuelve a leer de la base de datos, entonces el valor almacenado en la columna está encriptado (no plaintext) pero la propiedad de la entidad devuelve "test@example.com" (Value Converter works)
- [ ] AC5: Dado un Event se crea con EventDate, cuando la entidad se lee de la base de datos, entonces EventEndDate equals EventDate + 1 day (computed column works)
- [ ] AC6: Dado que la migración ha corrido, cuando se ejecuta `SELECT * FROM "Templates"`, entonces existen 3 filas con Name "Classic Elegance", "Modern Minimal", "Rustic Charm"

## Elementos Relacionados
- **PRD section:** 06-mvp-features.md (todas las funcionalidades referencian estas entidades)
- **Architecture:** 03-project-structure.md (Aura.Core/Models, Aura.Infrastructure/Data)
- **Data model:** README.md (ER diagram, entity definitions, indexing strategy, GDPR strategy, soft delete pattern, token security), entities.md (todas las especificaciones de las 13 entidades)

## Bloqueadores
Bloqueado por: PSRP-001

## Branch Name
`feature/PSRP-002-database-schema-and-ef-core-migrations`