# US-002: Validación de errores (The Librarian)

**User Story:** Como **"The Librarian" (Agente de Proceso)**, quiero inspeccionar automáticamente cada archivo subido para verificar que cumple los estándares ISO-19650 y de integridad geométrica, rechazando los inválidos con un reporte detallado.

**Status:** 🔄 IN PROGRESS  
**Story Points:** 13 SP  
**Priority:** 🔴 CRÍTICA

---

## Documentación Técnica

### Tickets Completados

#### T-020-DB: Add Validation Report Column ✅
- **Spec:** [T-020-DB-TechnicalSpec.md](T-020-DB-TechnicalSpec.md)
- **Audit:** [AUDIT-T-020-DB-FINAL.md](AUDIT-T-020-DB-FINAL.md)
- **Status:** DONE (2026-02-11)
- **Migration:** `supabase/migrations/20260211160000_add_validation_report.sql`
- **Tests:** 4/4 passing
- **Descripción:** Migración SQL que añade columna JSONB `validation_report` a tabla `blocks` con índices GIN para búsquedas eficientes.

#### T-025-AGENT: Metadata Extractor (User Strings) 📋
- **Spec:** [T-025-AGENT-UserStrings-Spec.md](T-025-AGENT-UserStrings-Spec.md)
- **Status:** SPEC READY (pendiente implementación)
- **Descripción:** Especificación completa de 46 user strings clasificados en 9 enums (Document, Layer, Material, etc.). Incluye Pydantic schemas y TypeScript interfaces.

### Tickets Pendientes

- **T-021-DB:** Extend Block Status Enum (⏭️ NEXT)
- **T-022-INFRA:** Redis & Celery Worker Setup
- **T-023-TEST:** Create .3dm Test Fixtures
- **T-024-AGENT:** Rhino Ingestion Service
- **T-026-AGENT:** Nomenclature Validator
- **T-027-AGENT:** Geometry Auditor
- **T-028-BACK:** Validation Report Model
- **T-029-BACK:** Trigger Validation from Confirm Endpoint
- **T-030-BACK:** Get Validation Status Endpoint
- **T-031-FRONT:** Real-Time Status Listener
- **T-032-FRONT:** Validation Report Visualizer
- **T-033-INFRA:** Worker Logging & Monitoring

---

## Estructura de Archivos

```
US-002/
├── README.md (este archivo)
├── T-020-DB-TechnicalSpec.md          # Spec técnica: columna validation_report
├── AUDIT-T-020-DB-FINAL.md            # Auditoría final T-020-DB
├── T-025-AGENT-UserStrings-Spec.md    # Spec técnica: user strings extraction
└── (futuros documentos de tickets...)
```

---

## Referencias

- **Backlog:** [docs/09-mvp-backlog.md](../09-mvp-backlog.md#us-002-validación-de-errores-the-librarian)
- **Agent Design:** [docs/07-agent-design.md](../07-agent-design.md)
- **Data Model:** [docs/05-data-model.md](../05-data-model.md)
