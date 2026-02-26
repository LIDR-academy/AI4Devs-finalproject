# Technical Specification: T-1003-BACK

## 1. Ticket Summary
- **Tipo:** BACK
- **Alcance:** Part Navigation API - Endpoint para obtener IDs de piezas adyacentes (prev/next) en un conjunto ordenado, permitiendo navegación modal sin recargar interfaz
- **Dependencias:** 
  - ✅ T-1002-BACK (Get Part Detail API) - DONE
  - ✅ T-0501-BACK (List Parts API) - DONE
  - Database tabla \`blocks\` con campos: \`id\`, \`created_at\`, \`status\`, \`tipologia\`, \`workshop_id\`, \`is_archived\`
  - Redis (Celery stack ya desplegado en T-022-INFRA)

## 2. Data Structures & Contracts

### Backend Schema (Pydantic)

**Location:** \`src/backend/schemas.py\` (añadir al final de la sección T-1002-BACK)

\`\`\`python
# ===== T-1003-BACK: Part Navigation API Schemas =====

class PartNavigationResponse(BaseModel):
    """
    Response for GET /api/parts/{id}/adjacent endpoint.
    
    Provides prev/next IDs for sequential navigation between parts in the 3D viewer modal.
    Order is determined by created_at ASC (oldest first), with filters applied.
    
    Contract: Must match TypeScript interface PartNavigationResponse exactly.
    Used by US-010 for Prev/Next buttons in modal footer.
    
    Attributes:
        prev_id: UUID of previous part in sequence (None if current is first)
        next_id: UUID of next part in sequence (None if current is last)
        current_index: 1-based position of current part in filtered set (e.g., 42 of 150)
        total_count: Total number of parts in filtered set
    """
    prev_id: Optional[UUID] = Field(None, description="Previous part UUID (None if first)")
    next_id: Optional[UUID] = Field(None, description="Next part UUID (None if last)")
    current_index: int = Field(..., ge=1, description="1-based index of current part")
    total_count: int = Field(..., ge=0, description="Total parts in filtered set")
    
    class Config:
        json_schema_extra = {
            "example": {
                "prev_id": "123e4567-e89b-12d3-a456-426614174000",
                "next_id": "987fcdeb-51a2-43e7-9876-543210fedcba",
                "current_index": 42,
                "total_count": 150
            }
        }
\`\`\`

### Frontend Types (TypeScript)

**Location:** \`src/frontend/src/types/navigation.ts\` (archivo nuevo)

\`\`\`typescript
/**
 * T-1003-BACK: Part Navigation API Response
 * Contract must match backend Pydantic schema PartNavigationResponse exactly
 */
export interface PartNavigationResponse {
  /** UUID of previous part (null if current is first) */
  prev_id: string | null;
  
  /** UUID of next part (null if current is last) */
  next_id: string | null;
  
  /** 1-based index of current part in filtered set */
  current_index: number;
  
  /** Total number of parts in filtered set */
  total_count: number;
}

/**
 * Query parameters for navigation API
 */
export interface PartNavigationQueryParams {
  /** Filter by workshop ID (RLS enforcement) */
  workshop_id?: string;
  
  /** Filter by status (validated, in_production, etc.) */
  status?: string;
  
  /** Filter by tipologia (capitel, columna, dovela, etc.) */
  tipologia?: string;
}
\`\`\`

### Database Changes (SQL)
**No se requieren cambios de esquema.** La funcionalidad utiliza campos existentes:
- \`blocks.id\` (UUID, PK)
- \`blocks.created_at\` (timestamp) - usado para ordenamiento ASC
- \`blocks.status\`, \`blocks.tipologia\`, \`blocks.workshop_id\` - usados para filtros
- \`blocks.is_archived\` (boolean) - siempre filtrado a \`false\`

## 3. API Interface

### Endpoint
\`\`\`
GET /api/parts/{id}/adjacent
\`\`\`

### Authentication
- **Required:** Yes
- **Header:** \`X-Workshop-Id\` (opcional - None significa superuser)

### Query Parameters
\`\`\`typescript
{
  workshop_id?: string    // UUID - opcional para filtrado RLS
  status?: string          // BlockStatus enum - opcional
  tipologia?: string       // Tipología value - opcional
}
\`\`\`

### Request Example
\`\`\`http
GET /api/parts/550e8400-e29b-41d4-a716-446655440000/adjacent?status=validated&tipologia=capitel&workshop_id=123e4567-e89b-12d3-a456-426614174000
\`\`\`

### Response 200 (Success)
\`\`\`json
{
  "prev_id": "123e4567-e89b-12d3-a456-426614174000",
  "next_id": "987fcdeb-51a2-43e7-9876-543210fedcba",
  "current_index": 42,
  "total_count": 150
}
\`\`\`

**Casos especiales:**
- **Primera pieza:** \`prev_id: null\`, \`next_id: "uuid"\`, \`current_index: 1\`
- **Última pieza:** \`prev_id: "uuid"\`, \`next_id: null\`, \`current_index: 150\`
- **Única pieza:** \`prev_id: null\`, \`next_id: null\`, \`current_index: 1\`, \`total_count: 1\`
- **Pieza no encontrada en filtros:** HTTP 404 (pieza existe pero no en conjunto filtrado)

### Response 400 (Invalid UUID)
\`\`\`json
{
  "detail": "Invalid UUID format"
}
\`\`\`

### Response 404 (Not Found)
\`\`\`json
{
  "detail": "Part not found in filtered set"
}
\`\`\`

### Response 500 (Database Error)
\`\`\`json
{
  "detail": "Database error: [error message]"
}
\`\`\`

## 4. Service Layer Design

### NavigationService Class

**Location:** \`src/backend/services/navigation_service.py\` (archivo nuevo)

**Responsibilities:**
- Fetch ordered list of part IDs with filters applied
- Find position of current part in list
- Return prev/next IDs based on position
- Apply same RLS logic as T-0501-BACK (workshop_id filtering)
- Cache results with Redis for 5 minutes

**Key Methods:**

\`\`\`python
class NavigationService:
    """
    Service for part navigation operations.
    Provides prev/next IDs for sequential navigation in 3D viewer modal (US-010).
    """
    
    def __init__(self, supabase_client, redis_client=None):
        """
        Args:
            supabase_client: Supabase client for database queries
            redis_client: Optional Redis client for caching (5min TTL)
        """
        pass
    
    def get_adjacent_parts(
        self,
        part_id: str,
        workshop_id: Optional[str] = None,
        status: Optional[str] = None,
        tipologia: Optional[str] = None
    ) -> Tuple[bool, Optional[PartNavigationResponse], Optional[str]]:
        """
        Get prev/next part IDs for navigation.
        
        Algorithm:
        1. Validate part_id UUID format (regex + UUID class)
        2. Build cache key from filters (format: "nav:{part_id}:{filters_hash}")
        3. Check Redis cache (TTL 5min)
        4. If cache miss:
           a. Query blocks table with filters + order by created_at ASC
           b. Extract list of IDs only (minimal payload)
           c. Find index of current part_id
           d. Calculate prev_id (index-1) and next_id (index+1)
           e. Store in Redis with 300s expiry
        5. Return (success=True, PartNavigationResponse, None)
        
        Returns:
            Tuple of (success: bool, data: PartNavigationResponse or None, error: str or None)
        """
        pass
    
    def _build_cache_key(self, part_id: str, filters: Dict[str, Any]) -> str:
        """
        Build deterministic cache key from part_id and filters.
        Example: "nav:550e8400-e29b-41d4-a716-446655440000:validated:capitel:workshop123"
        """
        pass
    
    def _fetch_ordered_ids(
        self,
        workshop_id: Optional[str],
        status: Optional[str],
        tipologia: Optional[str]
    ) -> List[str]:
        """
        Fetch list of part IDs with filters applied, ordered by created_at ASC.
        Reuses filter logic from PartsService (T-0501-BACK).
        """
        pass
    
    def _find_adjacent_positions(
        self,
        part_id: str,
        ordered_ids: List[str]
    ) -> Tuple[Optional[str], Optional[str], int, int]:
        """
        Find prev_id, next_id, current_index (1-based), total_count.
        
        Returns:
            (prev_id, next_id, current_index, total_count)
        
        Raises:
            ValueError: If part_id not found in ordered_ids
        """
        pass
\`\`\`

## 5. Test Cases Checklist

### Happy Path
- [ ] **NAV-01:** Part en medio de lista → retorna prev_id y next_id correctos (example: index 42 of 150)
- [ ] **NAV-02:** Primera pieza → prev_id=null, next_id existe, current_index=1
- [ ] **NAV-03:** Última pieza → prev_id existe, next_id=null, current_index=total_count
- [ ] **NAV-04:** Única pieza en conjunto filtrado → prev_id=null, next_id=null, current_index=1, total_count=1

### Edge Cases
- [ ] **NAV-05:** Part ID válido pero no en conjunto filtrado (ej: filtered por status=validated pero part tiene status=uploaded) → HTTP 404 "Part not found in filtered set"
- [ ] **NAV-06:** Filtros vacíos (sin query params) → retorna navegación en conjunto completo (is_archived=false)
- [ ] **NAV-07:** Multiple filters combined (status + tipologia + workshop_id) → retorna subset correcto ordenado por created_at ASC
- [ ] **NAV-08:** Workshop_id=null (superuser mode) → navega en todo el dataset sin restricción RLS

### Security/Errors
- [ ] **NAV-09:** Invalid UUID format → HTTP 400 "Invalid UUID format"
- [ ] **NAV-10:** Part ID no existe en DB (UUID válido pero pieza borrada) → HTTP 404 "Part not found in filtered set"
- [ ] **NAV-11:** Database error (Supabase down) → HTTP 500 "Database error: [message]"
- [ ] **NAV-12:** RLS enforcement: user con workshop_id='granollers' navega en pieza con workshop_id='sabadell' → pieza debe estar EXCLUIDA del resultado (comporta 404 o skip dependiendo de filtros)

### Integration (Cache & Performance)
- [ ] **NAV-13:** Cache hit on Redis → respuesta <50ms (no query DB)
- [ ] **NAV-14:** Cache miss → query DB + store in Redis con TTL 300s
- [ ] **NAV-15:** Cache invalidation: después de 5 minutos, cache key expira y siguiente request hace query fresh
- [ ] **NAV-16:** Query performance: Fetch 500 IDs ordered by created_at ASC → <200ms (usa índice idx_blocks_canvas_query existente)

### Contract Validation
- [ ] **NAV-17:** Response schema matches PartNavigationResponse Pydantic model exactly (all fields present, correct types)
- [ ] **NAV-18:** Frontend TypeScript interface PartNavigationResponse matches backend schema field-by-field

## 6. Files to Create/Modify

### Create:
- \`src/backend/services/navigation_service.py\` (~ 150-180 lines)
  - NavigationService class with get_adjacent_parts, cache helpers, query builder
- \`src/backend/api/parts_navigation.py\` (~ 80-100 lines)
  - APIRouter with GET /api/parts/{id}/adjacent endpoint
  - Query params validation (status, tipologia, workshop_id)
  - Error mapping (400/404/500)
  - X-Workshop-Id header extraction
- \`src/frontend/src/types/navigation.ts\` (~ 25-30 lines)
  - PartNavigationResponse interface
  - PartNavigationQueryParams interface
- \`src/frontend/src/services/navigation.service.ts\` (~ 40-50 lines)
  - fetchPartNavigation(partId, filters) → Promise<PartNavigationResponse>
  - Query string builder
- \`tests/unit/test_navigation_service.py\` (~ 200-250 lines)
  - Unit tests NAV-01 a NAV-12, NAV-17
- \`tests/integration/test_part_navigation_api.py\` (~ 250-300 lines)
  - Integration tests NAV-01 a NAV-18 (includes cache, RLS, performance)

### Modify:
- \`src/backend/main.py\` (+2 lines)
  - Import + register \`parts_navigation\` router
- \`src/backend/schemas.py\` (+35 lines)
  - Add PartNavigationResponse schema (sección T-1003-BACK)
- \`src/backend/config.py\` (verificar)
  - Confirmar REDIS_URL ya configurado (T-022-INFRA ✅)
- \`requirements.txt\` (verificar)
  - Confirmar redis>=5.0 ya instalado (T-022-INFRA ✅)

## 7. Reusable Components/Patterns

### From T-0501-BACK (List Parts API):
- **Filter application logic:** Reutilizar pattern de query builder con \`.eq()\` para status, tipologia, workshop_id
- **RLS enforcement:** Mismo pattern que PartsService.list_parts() → workshop_id filtering + is_archived=false
- **Index usage:** Query usa índice existente \`idx_blocks_canvas_query\` (status, tipologia, workshop_id) para performance

### From T-1002-BACK (Get Part Detail API):
- **UUID validation:** Reutilizar regex \`UUID_PATTERN\` y \`UUID()\` parsing de PartDetailService
- **Error handling pattern:** Return tuple \`(success, data, error)\` para service layer
- **Service class structure:** Constructor con opcional \`supabase_client\` para DI en tests

### From T-022-INFRA (Celery/Redis Stack):
- **Redis client:** Ya configurado en \`config.py\` → importar y usar para caching
- **Cache key pattern:** Usar formato determinístico con prefijo (ej: \`nav:{part_id}:{filters_hash}\`)
- **TTL strategy:** 5 minutos (300 segundos) balanceado entre freshness y performance

### Clean Architecture Pattern (Global):
- **Service layer:** Business logic puro en \`navigation_service.py\`, sin HTTP handling
- **API layer:** \`parts_navigation.py\` solo maneja HTTP (request/response, error codes)
- **Constants extraction:** Magic numbers (CACHE_TTL=300, PREFIX='nav:') en \`constants.py\`
- **Return tuples:** Service methods retornan \`(bool, data, error)\` para testing-friendly interface

## 8. Performance & Caching Strategy

### Query Optimization
- **Minimal SELECT:** Solo fetch \`id, created_at\` (no heavy fields como validation_report)
- **Index reuse:** Query usa \`idx_blocks_canvas_query\` existente → <200ms para 500 rows
- **Ordering:** \`ORDER BY created_at ASC\` aprovecha índice (no filesort)

### Redis Caching
- **Cache key format:** \`nav:{part_id}:{status}:{tipologia}:{workshop_id}\`
  - Example: \`nav:550e8400:validated:capitel:workshop123\`
  - Null values: usar string \`"null"\` (ej: \`nav:550e8400:null:null:null\`)
- **TTL:** 300 seconds (5 minutes)
- **Cache hit ratio:** Expected >80% en sesiones de navegación continua
- **Cache invalidation:** Time-based (TTL expiry), no event-driven (KISS principle for MVP)

### Performance Targets
- **Cache hit:** <50ms response time
- **Cache miss:** <250ms response time (DB query + Redis store)
- **DB query:** <200ms para ordered list de 500 IDs

## 9. Next Steps

Esta spec está lista para iniciar **TDD-Red Phase (Step 2/5)**. 

### Key Test Cases for TDD-Red:
1. **NAV-01:** Middle part navigation (prev + next exist)
2. **NAV-02:** First part (prev=null)
3. **NAV-03:** Last part (next=null)
4. **NAV-09:** Invalid UUID format → 400
5. **NAV-10:** Part not found → 404
6. **NAV-13:** Redis cache hit (mock)
7. **NAV-17:** Schema contract validation

### Implementation Order (TDD-Green):
1. NavigationService._fetch_ordered_ids() → reutiliza PartsService patterns
2. NavigationService._find_adjacent_positions() → pure function, fácil de testear
3. NavigationService._build_cache_key() → deterministic string builder
4. NavigationService.get_adjacent_parts() → orquesta 1-3 + Redis layer
5. parts_navigation router → HTTP layer thin wrapper

---

## Handoff for TDD-RED PHASE

\`\`\`
=============================================
READY FOR TDD-RED PHASE - Copy these values:
=============================================
Ticket ID:       T-1003-BACK
Feature name:    Part Navigation API (prev/next IDs for modal)
Key test cases:  
  - NAV-01: Middle part (prev+next exist, index 42/150)
  - NAV-02: First part (prev=null, index 1)
  - NAV-03: Last part (next=null, index=total)
  - NAV-09: Invalid UUID → 400
  - NAV-13: Redis cache hit
  - NAV-17: Schema contract validation
Files to create:
  - src/backend/services/navigation_service.py
  - src/backend/api/parts_navigation.py
  - src/frontend/src/types/navigation.ts
  - tests/unit/test_navigation_service.py
  - tests/integration/test_part_navigation_api.py
=============================================
\`\`\`

---

## Acceptance Criteria (from US-010)

**Este ticket contribuye a AC #1 del Scenario 1 (US-010):**
> **Footer:** Prev/Next buttons (navegación sin cerrar modal), counter "Pieza X de Y".

**Validation:**
- ✅ Endpoint retorna \`prev_id\`, \`next_id\`, \`current_index\`, \`total_count\` correctos
- ✅ Tests 18/18 passing (12 unit + 6 integration)
- ✅ Frontend puede navegar con Prev/Next buttons sin requery completo (usa IDs retornados)
- ✅ RLS enforcement: usuarios solo navegan en su workshop_id scope
- ✅ Performance: Cache Redis mantiene latencia <50ms en navegación continua

---

**Version:** 1.0  
**Created:** 2026-02-25  
**Author:** GitHub Copilot (Claude Sonnet 4.5)  
**Status:** Ready for TDD-Red Phase ✅
