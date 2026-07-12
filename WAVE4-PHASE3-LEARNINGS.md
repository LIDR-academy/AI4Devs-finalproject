# Wave 4 Phase 3 Learnings: Why Tests Didn't Catch Integration Issues

## Executive Summary

Wave 4 Phase 3 had **4 critical bugs that all passed unit tests but failed at runtime**:

1. ❌ QueryClientProvider missing from root layout (React)
2. ❌ @Service annotation missing (Spring wiring)
3. ❌ @ConditionalOnBean blocking bean creation (startup ordering)
4. ❌ PostGIS spatial query syntax error (database integration)

**All passed tests. All failed at app startup.**

This document explains why tests didn't catch them and how to prevent this in future tickets.

---

## The Problem: Unit Tests vs. Integration Reality

### Unit Tests Don't Verify...

| What Tests Pass | What Actually Fails | Why |
|---|---|---|
| Mocked QueryClientProvider works | App won't render without real provider at root | Tests mock dependencies; don't verify where they're required |
| SearchPropertiesUseCase can be instantiated | Spring can't autowire it without @Service | Tests use `@MockBean` or manual setup; don't test auto-discovery |
| Bean manually created in test setup | Bean creation fails in real Spring boot order | Tests don't verify actual bean dependency graph |
| Mocked database returns data | Real SQL syntax is invalid | Tests mock the DB; real queries never execute |

### Why This Happened

1. **Tests were isolated** — each layer tested independently with mocks
2. **No integration tests** — nothing verified layers work together
3. **No manual verification** — code marked "done" based on CI green
4. **TDD cycle incomplete** — tests written to pass, not to verify real behavior

---

## Specific Bugs & Patterns

### Bug #1: QueryClientProvider Missing from Root Layout

**Symptom at runtime:**
```
Error: No QueryClient set, use QueryClientProvider to set one
```

**Why tests passed:**
```typescript
// Tests manually wrapped component:
render(
  <QueryClientProvider client={queryClient}>
    <SearchPage />
  </QueryClientProvider>
);
// ✅ Test passed (provider exists in test)
// ❌ App failed (provider wasn't at root)
```

**Prevention:**
- Integration test must render `<SearchPage />` WITHOUT manual wrapping
- Must show that provider exists somewhere in the tree
- Or actually run dev server and navigate to page

### Bug #2: @Service Annotation Missing

**Symptom at runtime:**
```
UnsatisfiedDependencyException: 
Error creating bean with name 'searchController': 
No qualifying bean of type 'com.stayhub.application.search.SearchPropertiesUseCase' 
available
```

**Why tests passed:**
```kotlin
// Tests manually instantiated:
val useCase = SearchPropertiesUseCase(mockRepository)
// ✅ Test passed (manually created)
// ❌ App failed (Spring couldn't autowire)
```

**Prevention:**
- Integration test must use `@Autowired SearchPropertiesUseCase`
- Must rely on Spring auto-discovery, not manual setup
- Run `./gradlew bootRun` and watch for startup errors

### Bug #3: @ConditionalOnBean Blocking Creation

**Symptom at runtime:**
```
Parameter 0 of constructor in SearchPropertiesUseCase required a bean of 
type 'PropertyRepository' that could not be found
```

**Why tests passed:**
- Spring boot tests auto-configured everything
- Never tested exact bean creation ordering
- Conditional bean didn't prevent creation in test context

**Prevention:**
- Avoid `@ConditionalOnBean` unless absolutely necessary
- If used, test bean boot order explicitly
- Manual startup verification catches this

### Bug #4: PostGIS Spatial Query Syntax

**Symptom at runtime:**
```sql
ERROR: function st_contains(geography, geography) does not exist
```

**Why tests passed:**
```kotlin
// Tests mocked the repository:
@MockBean
private lateinit var repository: PropertyRepository
// ✅ Test passed (mock returned data)
// ❌ App failed (real PostgreSQL rejected SQL)
```

**Correct Query Pattern:**
```sql
-- ❌ Wrong
WHERE ST_Contains(
  ST_MakeEnvelope(:swLng, :swLat, :neLng, :neLat, 4326)::geography,
  p.location
)

-- ✅ Correct
WHERE ST_Contains(
  ST_MakeEnvelope(:swLng, :swLat, :neLng, :neLat, 4326),
  p.location::geometry
)
```

**Prevention:**
- Integration tests with `@Testcontainers` (real PostgreSQL)
- All SQL must execute against real database
- Never mock the persistence layer for queries

### Bug #5: Mapbox Validation at Startup

**Symptom at runtime:**
```
Mapbox API key is not configured. Please set 'mapbox.api-key' in application properties.
```

**Prevention:**
- Provide dummy values that pass validation in dev/test
- Configuration validation happens at `@PostConstruct` (Spring startup)
- Unit tests don't exercise `@PostConstruct` if bean is mocked

---

## Updated Definition of Done

### Current (Insufficient)
- ✅ Unit tests pass
- ✅ CI is green

### Required (Complete)
- ✅ Unit tests pass
- ✅ Integration tests pass (new)
- ✅ `./gradlew bootRun` succeeds (new)
- ✅ Manual verification works (new)
- ✅ CI is green

### Manual Verification Checklist

**For Backend:**
```bash
# In terminal
cd backend
./gradlew bootRun

# In another terminal, after "app started"
curl http://localhost:8080/actuator/health
# Should return: {"status":"UP"}

# Try a real endpoint
curl "http://localhost:8080/api/v1/properties/search?sw_lat=41&sw_lng=2&ne_lat=42&ne_lng=3&check_in=2027-07-01&check_out=2027-07-10"
# Should return results, not errors
```

**For Frontend:**
```bash
# In terminal
cd frontend
npm run dev

# Open browser
# http://localhost:3000/search
# Should render without console errors
# Should show SearchBar, FilterPanel, PropertyCard components
```

**Do NOT mark task done until both manual verifications pass.**

---

## Integration Test Template

### Backend (@SpringBootTest + @Testcontainers)

```kotlin
@SpringBootTest
@Testcontainers
class PropertySearchIntegrationTest {
  @Autowired
  private lateinit var searchController: SearchController
  
  @Autowired
  private lateinit var propertyRepository: PropertyRepository
  
  @Test
  fun shouldAutowireAllBeansSuccessfully() {
    // Verifies Spring bean discovery works
    assertNotNull(searchController)
    assertNotNull(propertyRepository)
  }
  
  @Test
  fun shouldExecuteSearchAgainstRealDatabase() {
    // Verifies SQL works against real PostgreSQL
    val results = propertyRepository.searchByBoundingBox(
      swLat = 41.0,
      swLng = 2.0,
      neLat = 42.0,
      neLng = 3.0,
      filters = PropertySearchFilters(),
      pageable = PageRequest.of(0, 20)
    )
    assertThat(results.totalElements).isGreaterThan(0)
  }
}
```

### Frontend (with real providers)

```typescript
describe('SearchPage Integration', () => {
  it('should render with real QueryClientProvider', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SearchPage />
      </QueryClientProvider>
    );
    // Verifies page renders with actual provider setup
    expect(screen.getByText(/Where/i)).toBeInTheDocument();
  });
});
```

---

## Next Steps

1. **Update CONTRIBUTING.md** — add integration test requirement to DoD
2. **Update ticket template** — add "Integration test + manual verification" checklist
3. **Code review checklist** — add "Did you run the app locally?" 
4. **Next ticket** — follow this checklist before marking done

---

## Key Insight

> **"Tests passed, but the app didn't start"** is the most common reason production features fail on first deploy. Integration tests and manual verification catch these issues before code review, not after.

The TDD cycle is incomplete without: **test → code → verify app runs**.
