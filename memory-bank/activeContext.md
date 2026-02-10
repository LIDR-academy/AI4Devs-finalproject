# Active Context

## Current Focus
✅ **SPRINT 3: IN PROGRESS** - T-001-FRONT (UploadZone Component) completado con TDD completo (RED → GREEN → REFACTOR) ✅. Siguiente: T-001-BACK (Metadata Extraction con rhino3dm).

## Sprint Status
### ✅ Sprint 1 - CLOSED
- T-002-BACK: Upload presigned URLs ✅
- T-005-INFRA: Supabase bucket configuration ✅

### ✅ Sprint 2 - CLOSED
- T-003-FRONT: FileUploader component (4/4 tests) ✅
- T-004-BACK: Confirm Upload Webhook + Clean Architecture refactor (7/7 tests) ✅

### 🔄 Sprint 3 - IN PROGRESS
- **Completed**: T-001-FRONT (UploadZone Component) **[DONE]** ✅
  - **TDD Phases:**
    - RED (Prompt #058): 14 failing tests created
    - GREEN (Prompt #059): Implementation with react-dropzone@14.2.3, 14/14 tests passing
    - REFACTOR (Prompt #060): Constants extraction + Clean Architecture pattern, 14/14 tests still passing
  - **Quality Improvements:**
    - Extracted `UploadZone.constants.ts` (127 lines) - centralized config, styles, error messages
    - Reduced component complexity: 206 → ~160 lines (22% reduction)
    - Applied Same pattern as backend (API → Service → Constants)
  - **Coverage:** Drag & drop visual, .3dm validation, 500MB limit, accessibility
- **Next Task**: T-001-BACK (Metadata Extraction con rhino3dm)

## Active Tasks
### Completed (Sprints 1, 2, 3-partial)
- [x] **Sprint 1**: T-002-BACK (Upload endpoint) + T-005-INFRA (Bucket config) ✅
- [x] **Sprint 2**: T-003-FRONT (FileUploader 4/4 tests) + T-004-BACK (Confirm Webhook 7/7 tests) ✅
- [x] **Post-Sprint 2 Audit**: Codebase audit (81/100) + full remediation ✅
  - Docker hardening (healthcheck, localhost port binding, depends_on)
  - Constants violation fix (init_db.py)
  - Requirements locking (requirements-lock.txt)
  - Documentation expansion (techContext.md)
- [x] **T-001-FRONT**: UploadZone Component **[DONE]** ✅ (14/14 tests)
  - TDD complete: RED (failing tests) → GREEN (implementation) → REFACTOR (constants extraction)
  - Drag & drop visual con validación de .3dm y 500MB
  - Estados visuales (idle, active, error, disabled)
  - Tests simplificados enfocados en DOM observable (jsdom limitations)
  - **Refactored:** Constants extracted to `UploadZone.constants.ts` (Clean Architecture pattern)
  - Component size reduced 22% (206 → ~160 lines), improved maintainability

### Next Steps (Sprint 3)
- [ ] **T-001-BACK: Metadata Extraction** (`POST /api/metadata/extract`)
  - Integrar rhino3dm para extraer geometría y metadatos de archivos .3dm
  - Implementar validación de nombres ISO-19650
  - Seguir patrón TDD (RED → GREEN → REFACTOR)
  - Aplicar Clean Architecture (API → Service → Constants)
- [ ] End-to-end upload flow testing (Frontend → Backend → Storage → Webhook → Processing)

## Current State Checkpoint (Post-T-001-FRONT - 2026-02-10)
- **Backend**: 
  - Upload endpoint operational (`:8000/api/upload/url`)
  - Confirm webhook operational (`:8000/api/upload/confirm`)
  - Clean Architecture implemented (API → Service → Constants)
  - Events table created and operational
- **Storage**: Supabase bucket `raw-uploads` configured and validated
- **Frontend**: 
  - FileUploader component functional (4/4 tests passing)
  - **UploadZone component functional (14/14 tests passing)** ✅ NEW
    - react-dropzone@14.2.3 integrated
    - .3dm validation + 500MB size limit
    - Visual drag & drop states
- **Infrastructure**:
  - Docker hardened (healthcheck, localhost-only PostgreSQL port)
  - Requirements locked (48 dependencies in requirements-lock.txt)
- **Tests**: Backend 7/7 ✅ | Frontend 18/18 ✅ (4 FileUploader + 14 UploadZone)
- **Documentation**: Memory Bank synchronized, techContext.md expanded
- **Audit Score**: 81/100 (B+ / Good) - Codebase ready for production development-High (3D)** |
| **Type** | Tool | Algorithm | Tool | Demo | Research | Product | **Enterprise Sys** |
| **Safety** | ✅ | ✅ | ⚠️ | ❌ | ❌ | ✅ | ✅ **Safe** |
| **Demand** | High | Very High | High | Unknown | High | Very High | **Validated (Client)** |
| **Moat** | Low | High | Medium | Medium | V. High | High | **High (Custom)** |
| **Novelty** | Medium | High | High | V. High | Extreme | V. High | **High (Systems)** |
| **Ready?** | ✅ | ✅ | ⚠️ | ❌ | ❌ | ✅ | ✅ **12 weeks** |
| **Success**| 95% | 85% | 70% | 10% | 10% | 75% | **90%** |

## Final TFM Ranking (Seven Options)

### Tier 1: Top Recommendations
**🥇 #1: Sagrada Familia Parts Manager (Enterprise System)** ⭐⭐⭐⭐⭐
- ✅ **Best for Portfolio**: Demonstrates "Senior Systems Architect" skills
- ✅ **Real-World Impact**: Specific client, high stakes
- ✅ **Tech Stack**: Full-stack (React/Three.js + Python/Rhino3dm + DB)
- ✅ **High Success Rate**: 90% (Implementation challenge, not research risk)

**🥇 #1: Semantic Rhino (AI Algorithm)** ⭐⭐⭐⭐⭐
- ✅ **Best for AI Engineer**: Demonstrates Core ML/LLM skills
- ✅ **SaaS Potential**: Scalable product revenue
- ✅ **High Success Rate**: 85%

---

### Tier 2: Strong Products
**🥈 #2: GH-Copilot (RAG Variant)** ⭐⭐⭐⭐
- ✅ **Viral Potential**: "GitHub Copilot for Grasshopper"
- ✅ **Smart Compromise**: Avoids the "legal suicide" of AEC Copilot
- ⚠️ **Risk**: DAG Serialization bottleneck

**🥈 #3: SmartFabricator (MVP)** ⭐⭐⭐⭐
- ✅ **Practical**: Solves real manufacturing pain
- ⚠️ **Scope**: Must avoid RL

---

### Tier 3 & Rejected
- **🥉 #4: Smart XREF**: Safe but "boring" (Tier 3)
- **#5: AEC Copilot**: Research Demo only (Rejected for Production)
- **#6: AEC-NeuralSync**: PhD Topic (Rejected)

## Decision Recommendation

**PATH A: "The Systems Architect"** -> Choose **Sagrada Familia**
- Focus: Databases, Web 3D, Scalability, Integration.

**PATH B: "The AI Product Engineer"** -> Choose **Semantic Rhino**
- Focus: LLMs, Geometry Algorithms, SaaS metrics.

**PATH C: "The Startup Founder"** -> Choose **GH-Copilot**
- Focus: Virality, User Acquisition, VC Pitch.
