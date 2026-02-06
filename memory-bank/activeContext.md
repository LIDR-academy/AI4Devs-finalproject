# Active Context

## Current Focus
🚀 **SPRINT 2: FRONTEND DEVELOPMENT** - T-003-FRONT (FileUploader) VERDE. Alcanzada fase de tests passing (4/4) con alineación backend-frontend completada.

## Active Tasks
### Completed (Sprint 1)
- [x] T-002-BACK: Upload endpoint con presigned URLs (FastAPI + Supabase Storage) ✅
- [x] T-005-INFRA: Bucket configuration y tests de integración ✅
- [x] Documentation sync: README.md, prompts.md, Memory Bank

### In Progress (Sprint 2 - Frontend Track)
- [x] ✅ **T-003-FRONT [VERDE]**: FileUploader component
  - Component implementation (validation, upload flow, progress tracking)
  - TypeScript interfaces aligned with backend schemas (file_id, filename)
  - Minimal test suite passing (4/4 tests)
  - Fixed Docker environment (Alpine→Debian for jsdom stability)
- [ ] **T-003-FRONT [REFACTOR]**: Code cleanup
  - Extract constants (MAX_FILE_SIZE, ACCEPTED_EXTENSIONS)
  - Add JSDoc comments
  - Ensure accessibility attributes complete
  - Consider optimizing full test suite (14 tests currently backed up)

### Next Steps
- [ ] T-004-BACK: Confirm Upload Webhook (`POST /api/upload/confirm`)
  - Verify file existence in S3
  - Launch Celery Task for metadata extraction
  - TDD implementation following same pattern as T-002
- [ ] T-001-BACK: Metadata Extraction (rhino3dm integration)
- [ ] End-to-end upload flow testing (Frontend → Backend → Storage → Webhook)

## Current State Checkpoint
- **Backend**: Upload endpoint operational (:8000/api/upload/url)
- **Storage**: Supabase bucket `raw-uploads` configured and validated
- **Frontend**: FileUploader component functional with tests passing
- **Docker**: Stable environment (node:20-bookworm, FastAPI, PostgreSQL)
- **Tests**: Backend integration tests green, Frontend minimal suite green (4/4)

## The Seven-Way Comparison Matrix

| Criteria | Smart XREF | Semantic Rhino | SmartFabricator | Copilot | NeuralSync | GH-Copilot | **Sagrada Familia** |
|----------|------------|----------------|-----------------|---------|------------|------------|---------------------|
| **Tech Risk** | Low | Medium | Med-High | V. High | Extreme | Med-High | **Med-High (3D)** |
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
