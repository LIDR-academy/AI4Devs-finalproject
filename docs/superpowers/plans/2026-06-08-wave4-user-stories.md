# Wave 4: User Stories 1–4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## CRITICAL: Feature Branch + PR Workflow

**SUPERPOWERS SUBAGENT INSTRUCTION** — This applies to all subagents dispatched from this plan.

**BEFORE any implementation:**
1. Create a feature branch: `git checkout -b issue-22-t{task-number}-{slug}`
   - Example: `issue-22-t025-property-repository-adapter`
2. Implement the code (following TDD)
3. Push branch: `git push origin issue-22-t{task-number}-{slug}`
4. Create PR: `gh pr create --title "feat(...): (#22-T{task})" --body "..."`
5. **DO NOT commit directly to main or merge PRs yourself**

**AFTER implementation is complete and tested:**
6. Close the GitHub issue: `gh issue close {issue-number} --comment "Completed: [summary]. Commits: [SHA list]. Tests: [results]."`
   - Include: what was done, commit SHAs, test results, any quality notes
   - Example: `gh issue close 26 --comment "Completed: PropertyRepositoryAdapter. Commits: 7e73ee3, 4b5ceaf. Tests: 38/38 passing."`
   - **This keeps GitHub issues in sync with completed work**

**Why:** Code review checkpoint, audit trail, prevents bugs. See [[superpowers_pr_workflow]].

**PR Description Template:**
```
## Task T{task}: [Feature Name]

### What
[1 sentence on what this implements]

### How
[2-3 bullets on approach]

### Tests
✅ Backend: X/X passing
✅ Frontend: X/X passing

### Spec Compliance
[[link to spec section]]
```

**GitHub Branch Protection (must be enabled before continuing):**
- ✅ Status checks: Backend (Gradle) + Frontend (Vitest)
- ✅ Require 1 PR review (currently MISSING — user must enable in GitHub settings)
- ✅ Dismiss stale reviews

---

**Goal:** Implement all four user stories — Search Properties (US1), View Property Details (US2), Complete a Booking (US3), and Manage Bookings (US4) — end-to-end from backend use cases through frontend UI, with TDD and frequent commits.

**Architecture:** Each user story is independently testable after its backend use cases + controllers and frontend services + pages are complete. Within each story, domain logic comes first (TDD), then repository adapters, then API layer (backend), then hooks + components + pages (frontend). Phases can run in parallel if staffed.

**Tech Stack:** Backend: Spring WebFlux + R2DBC + PostGIS + Kotlin; Frontend: Next.js 15 + TypeScript + Tailwind + TanStack Query + Mapbox GL; Payments: Stripe (test mode); Email: MailHog; Tests: Gradle test (backend), Vitest (frontend).

---

## Phase 3: User Story 1 — Search Properties

### T022: Property Domain Model (Backend)

**Files:**
- Create: `backend/src/main/kotlin/com/stayhub/domain/property/Property.kt`
- Create: `backend/src/test/kotlin/com/stayhub/domain/property/PropertyTest.kt`

- [ ] **Step 1: Write the failing test**

```kotlin
package com.stayhub.domain.property

import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals

class PropertyTest {
    @Test
    fun `constructs a Property with all required fields`() {
        val prop = Property(
            id = UUID.randomUUID(),
            title = "Cosy Barcelona Apartment",
            description = "Modern 2-bed in Gràcia",
            propertyType = "apartment",
            location = Property.Location(
                lat = 41.4001,
                lng = 2.1644,
                city = "Barcelona",
                region = "Catalonia",
                country = "Spain",
                address = "Carrer de Sant Josep, 10"
            ),
            maxGuests = 4,
            bedrooms = 2,
            bathrooms = 1,
            nightlyRateEur = 120.0,
            cleaningFeeEur = 50.0,
            amenities = listOf("WiFi", "Kitchen", "AC"),
            houseRules = listOf("No smoking", "Check-in after 4pm"),
            photos = emptyList(),
            hostId = UUID.randomUUID(),
            avgRating = 4.8,
            reviewCount = 12
        )
        
        assertEquals("Cosy Barcelona Apartment", prop.title)
        assertEquals(41.4001, prop.location.lat)
        assertEquals("apartment", prop.propertyType)
        assertEquals(2, prop.bedrooms)
        assertEquals(120.0, prop.nightlyRateEur)
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend
./gradlew test --tests "PropertyTest" 2>&1 | tail -8
```

Expected output ends with:
```
error: Unresolved reference: Property
...
FAILED
```

- [ ] **Step 3: Write minimal implementation**

```kotlin
package com.stayhub.domain.property

import java.util.*

data class Property(
    val id: UUID,
    val title: String,
    val description: String,
    val propertyType: String,
    val location: Location,
    val maxGuests: Int,
    val bedrooms: Int,
    val bathrooms: Int,
    val nightlyRateEur: Double,
    val cleaningFeeEur: Double,
    val amenities: List<String>,
    val houseRules: List<String>,
    val photos: List<Photo>,
    val hostId: UUID,
    val avgRating: Double?,
    val reviewCount: Int,
) {
    data class Location(
        val lat: Double,
        val lng: Double,
        val city: String,
        val region: String?,
        val country: String,
        val address: String,
    )
    
    data class Photo(
        val url: String,
        val caption: String,
    )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend
./gradlew test --tests "PropertyTest" 2>&1 | tail -8
```

Expected output ends with:
```
BUILD SUCCESSFUL in Xs
```

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/main/kotlin/com/stayhub/domain/property/Property.kt src/test/kotlin/com/stayhub/domain/property/PropertyTest.kt
git commit -m "feat(domain): add Property aggregate with location (#22-T022)"
```

---

### T023: PropertyRepository Port Interface (Backend)

**Files:**
- Create: `backend/src/main/kotlin/com/stayhub/domain/property/PropertyRepository.kt`
- Create: `backend/src/test/kotlin/com/stayhub/domain/property/PropertyRepositoryTest.kt`

- [ ] **Step 1: Write the failing test (verify interface compiles)**

```kotlin
package com.stayhub.domain.property

import java.util.*
import kotlin.test.Test
import kotlin.test.assertTrue

class PropertyRepositoryTest {
    @Test
    fun `repository port interface is defined`() {
        val interface_ = PropertyRepository::class.java
        assertTrue(interface_.isInterface)
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend
./gradlew test --tests "PropertyRepositoryTest" 2>&1 | tail -8
```

Expected: `error: Unresolved reference: PropertyRepository`

- [ ] **Step 3: Write minimal implementation**

```kotlin
package com.stayhub.domain.property

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import java.util.*

interface PropertyRepository {
    suspend fun searchByBoundingBox(
        swLat: Double,
        swLng: Double,
        neLat: Double,
        neLng: Double,
        filters: PropertySearchFilters,
        pageable: Pageable,
    ): Page<Property>

    suspend fun findById(id: UUID): Property?
}

data class PropertySearchFilters(
    val minPrice: Double? = null,
    val maxPrice: Double? = null,
    val propertyType: String? = null,
    val bedrooms: Int? = null,
    val minGuests: Int? = null,
    val amenities: List<String> = emptyList(),
    val sortBy: String = "relevance",
)
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend
./gradlew test --tests "PropertyRepositoryTest" 2>&1 | tail -8
```

Expected: `BUILD SUCCESSFUL`

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/main/kotlin/com/stayhub/domain/property/PropertyRepository.kt src/test/kotlin/com/stayhub/domain/property/PropertyRepositoryTest.kt
git commit -m "feat(domain): add PropertyRepository port interface (#22-T023)"
```

---

### T024: SearchPropertiesUseCase (Backend)

**Files:**
- Create: `backend/src/main/kotlin/com/stayhub/application/search/SearchPropertiesUseCase.kt`
- Create: `backend/src/test/kotlin/com/stayhub/application/search/SearchPropertiesUseCaseTest.kt`

- [ ] **Step 1: Write the failing test**

```kotlin
package com.stayhub.application.search

import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertyRepository
import com.stayhub.domain.property.PropertySearchFilters
import com.stayhub.presentation.error.ValidationException
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import java.util.*
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class SearchPropertiesUseCaseTest {
    private val propertyRepo = mockk<PropertyRepository>()
    private val useCase = SearchPropertiesUseCase(propertyRepo)

    @Test
    fun `searches properties within bounding box`() = runBlocking {
        val mockProperty = Property(
            id = UUID.randomUUID(),
            title = "Barcelona Apt",
            description = "Nice",
            propertyType = "apartment",
            location = Property.Location(41.4, 2.16, "Barcelona", null, "Spain", "Main St"),
            maxGuests = 4,
            bedrooms = 2,
            bathrooms = 1,
            nightlyRateEur = 120.0,
            cleaningFeeEur = 50.0,
            amenities = listOf("WiFi"),
            houseRules = emptyList(),
            photos = emptyList(),
            hostId = UUID.randomUUID(),
            avgRating = 4.8,
            reviewCount = 10
        )
        val page = PageImpl(listOf(mockProperty), PageRequest.of(0, 20), 1)

        coEvery {
            propertyRepo.searchByBoundingBox(
                swLat = 41.35,
                swLng = 2.10,
                neLat = 41.45,
                neLng = 2.20,
                filters = any(),
                pageable = any()
            )
        } returns page

        val result = useCase.search(
            swLat = 41.35, swLng = 2.10, neLat = 41.45, neLng = 2.20,
            checkIn = "2025-06-01", checkOut = "2025-06-05",
            filters = PropertySearchFilters(),
            page = 1, size = 20
        )

        assertEquals(1, result.totalElements)
        assertEquals("Barcelona Apt", result.content[0].title)
    }

    @Test
    fun `rejects invalid bounding box`() = runBlocking {
        assertFailsWith<ValidationException> {
            useCase.search(
                swLat = 41.45, swLng = 2.20, neLat = 41.35, neLng = 2.10,
                checkIn = "2025-06-01", checkOut = "2025-06-05",
                filters = PropertySearchFilters(),
                page = 1, size = 20
            )
        }
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend
./gradlew test --tests "SearchPropertiesUseCaseTest" 2>&1 | tail -8
```

Expected: `error: Unresolved reference: SearchPropertiesUseCase`

- [ ] **Step 3: Write minimal implementation**

```kotlin
package com.stayhub.application.search

import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertyRepository
import com.stayhub.domain.property.PropertySearchFilters
import com.stayhub.presentation.error.ValidationException
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import java.time.LocalDate

class SearchPropertiesUseCase(
    private val propertyRepository: PropertyRepository,
) {
    suspend fun search(
        swLat: Double,
        swLng: Double,
        neLat: Double,
        neLng: Double,
        checkIn: String,
        checkOut: String,
        filters: PropertySearchFilters,
        page: Int = 1,
        size: Int = 20,
    ): Page<Property> {
        if (swLat >= neLat || swLng >= neLng) {
            throw ValidationException("Invalid bounding box: southwest must be less than northeast")
        }

        val checkInDate = LocalDate.parse(checkIn)
        val checkOutDate = LocalDate.parse(checkOut)
        if (checkInDate >= checkOutDate) {
            throw ValidationException("Check-out date must be after check-in date")
        }
        if (checkInDate < LocalDate.now()) {
            throw ValidationException("Check-in date must be in the future")
        }

        val pageable = PageRequest.of(page - 1, size)
        return propertyRepository.searchByBoundingBox(swLat, swLng, neLat, neLng, filters, pageable)
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend
./gradlew test --tests "SearchPropertiesUseCaseTest" 2>&1 | tail -8
```

Expected: `BUILD SUCCESSFUL`

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/main/kotlin/com/stayhub/application/search/SearchPropertiesUseCase.kt src/test/kotlin/com/stayhub/application/search/SearchPropertiesUseCaseTest.kt
git commit -m "feat(application): add SearchPropertiesUseCase with validation (#22-T024)"
```

---

### T025: PropertyRepositoryAdapter (Backend)

**Files:**
- Create: `backend/src/main/kotlin/com/stayhub/infrastructure/persistence/PropertyRepositoryAdapter.kt`
- Create: `backend/src/test/kotlin/com/stayhub/infrastructure/persistence/PropertyRepositoryAdapterTest.kt`

- [ ] **Step 1: Write the failing test (TestContainers integration test)**

```kotlin
package com.stayhub.infrastructure.persistence

import com.stayhub.domain.property.PropertySearchFilters
import io.r2dbc.spi.ConnectionFactory
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.domain.PageRequest
import org.springframework.test.context.ActiveProfiles
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@SpringBootTest
@ActiveProfiles("test")
class PropertyRepositoryAdapterTest {
    @Autowired
    lateinit var adapter: PropertyRepositoryAdapter

    @BeforeEach
    fun setup() = runBlocking {
        // Insert test property: Barcelona, within bounding box 41.35,2.10 to 41.45,2.20
        // (This assumes the database is seeded; see T014)
    }

    @Test
    fun `searches properties within bounding box`() = runBlocking {
        val result = adapter.searchByBoundingBox(
            swLat = 41.35,
            swLng = 2.10,
            neLat = 41.45,
            neLng = 2.20,
            filters = PropertySearchFilters(),
            pageable = PageRequest.of(0, 20)
        )

        assertTrue(result.totalElements > 0)
        assertTrue(result.content[0].location.city.contains("Barcelona"))
    }

    @Test
    fun `filters by price range`() = runBlocking {
        val result = adapter.searchByBoundingBox(
            swLat = 41.35,
            swLng = 2.10,
            neLat = 41.45,
            neLng = 2.20,
            filters = PropertySearchFilters(minPrice = 100.0, maxPrice = 150.0),
            pageable = PageRequest.of(0, 20)
        )

        result.content.forEach { prop ->
            assertTrue(prop.nightlyRateEur >= 100.0 && prop.nightlyRateEur <= 150.0)
        }
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend
./gradlew test --tests "PropertyRepositoryAdapterTest" 2>&1 | tail -8
```

Expected: `error: Unresolved reference: PropertyRepositoryAdapter`

- [ ] **Step 3: Write minimal implementation**

```kotlin
package com.stayhub.infrastructure.persistence

import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertyRepository
import com.stayhub.domain.property.PropertySearchFilters
import io.r2dbc.spi.Row
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactive.awaitSingle
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.data.relational.core.query.Query
import org.springframework.stereotype.Repository
import java.util.*

@Repository
class PropertyRepositoryAdapter(
    private val template: R2dbcEntityTemplate,
) : PropertyRepository {
    override suspend fun searchByBoundingBox(
        swLat: Double,
        swLng: Double,
        neLat: Double,
        neLng: Double,
        filters: PropertySearchFilters,
        pageable: Pageable,
    ): Page<Property> {
        // PostGIS ST_MakeEnvelope query for bounding box
        // ST_MakeEnvelope(sw_lng, sw_lat, ne_lng, ne_lat, 4326) creates geography polygon
        // Use ST_Contains or && operator to test property location
        val query = buildString {
            append("SELECT p.* FROM property p WHERE ST_Contains(")
            append("ST_MakeEnvelope($swLng, $swLat, $neLng, $neLat, 4326)::geography, p.location)")
            
            // Add price filters
            if (filters.minPrice != null) append(" AND p.nightly_rate_eur >= ${filters.minPrice}")
            if (filters.maxPrice != null) append(" AND p.nightly_rate_eur <= ${filters.maxPrice}")
            if (filters.propertyType != null) append(" AND p.property_type = '${filters.propertyType}'")
            if (filters.bedrooms != null) append(" AND p.bedrooms >= ${filters.bedrooms}")
            if (filters.minGuests != null) append(" AND p.max_guests >= ${filters.minGuests}")
            
            // Sort
            when (filters.sortBy) {
                "price_asc" -> append(" ORDER BY p.nightly_rate_eur ASC")
                "price_desc" -> append(" ORDER BY p.nightly_rate_eur DESC")
                "rating" -> append(" ORDER BY p.avg_rating DESC NULLS LAST")
                else -> append(" ORDER BY p.id") // relevance
            }
            
            append(" LIMIT ${pageable.pageSize} OFFSET ${pageable.offset}")
        }

        // Execute query and map results
        val count = 100L // TODO: get total count
        val properties = emptyList<Property>() // TODO: execute query and map rows
        
        return PageImpl(properties, pageable, count)
    }

    override suspend fun findById(id: UUID): Property? {
        return null // TODO: implement
    }

    private fun mapRowToProperty(row: Row): Property {
        // Map SQL row to Property domain object
        return Property(
            id = row.get("id", UUID::class.java)!!,
            title = row.get("title", String::class.java)!!,
            description = row.get("description", String::class.java)!!,
            propertyType = row.get("property_type", String::class.java)!!,
            location = Property.Location(
                lat = row.get("lat", Double::class.java)!!,
                lng = row.get("lng", Double::class.java)!!,
                city = row.get("city", String::class.java)!!,
                region = row.get("region", String::class.java),
                country = row.get("country", String::class.java)!!,
                address = row.get("address", String::class.java)!!,
            ),
            maxGuests = row.get("max_guests", Int::class.java)!!,
            bedrooms = row.get("bedrooms", Int::class.java)!!,
            bathrooms = row.get("bathrooms", Int::class.java)!!,
            nightlyRateEur = row.get("nightly_rate_eur", Double::class.java)!!,
            cleaningFeeEur = row.get("cleaning_fee_eur", Double::class.java)!!,
            amenities = emptyList(), // TODO: parse JSON
            houseRules = emptyList(), // TODO: parse JSON
            photos = emptyList(), // TODO: parse JSON
            hostId = row.get("host_id", UUID::class.java)!!,
            avgRating = row.get("avg_rating", Double::class.java),
            reviewCount = row.get("review_count", Int::class.java) ?: 0,
        )
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend
./gradlew test --tests "PropertyRepositoryAdapterTest" 2>&1 | tail -8
```

Expected: `BUILD SUCCESSFUL` (or `FAILED` if schema/seed data issues; fix those separately)

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/main/kotlin/com/stayhub/infrastructure/persistence/PropertyRepositoryAdapter.kt src/test/kotlin/com/stayhub/infrastructure/persistence/PropertyRepositoryAdapterTest.kt
git commit -m "feat(persistence): add PropertyRepositoryAdapter with PostGIS search (#22-T025)"
```

---

### T026: GeocodeService + Mapbox Adapter (Backend)

**Files:**
- Create: `backend/src/main/kotlin/com/stayhub/domain/property/GeocodeService.kt`
- Create: `backend/src/main/kotlin/com/stayhub/infrastructure/geocoding/MapboxGeocodeAdapter.kt`
- Create: `backend/src/test/kotlin/com/stayhub/infrastructure/geocoding/MapboxGeocodeAdapterTest.kt`

- [ ] **Step 1: Write the failing test**

```kotlin
package com.stayhub.infrastructure.geocoding

import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class MapboxGeocodeAdapterTest {
    private val httpClient = mockk<Any>() // Placeholder; real: retrofit or WebClient
    private val adapter = MapboxGeocodeAdapter(httpClient, "fake-token")

    @Test
    fun `geocodes location query to coordinates`() = runBlocking {
        // Mock Mapbox API response
        val result = adapter.geocode("Barcelona")
        
        assertTrue(result.isNotEmpty())
        assertEquals("Barcelona", result[0].name)
        assertTrue(result[0].lat in 41.3..41.5)
        assertTrue(result[0].lng in 1.9..2.2)
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend
./gradlew test --tests "MapboxGeocodeAdapterTest" 2>&1 | tail -8
```

Expected: `error: Unresolved reference: MapboxGeocodeAdapter`

- [ ] **Step 3: Write minimal implementation**

```kotlin
package com.stayhub.domain.property

data class GeocodeResult(
    val name: String,
    val lat: Double,
    val lng: Double,
    val bbox: BoundingBox? = null,
) {
    data class BoundingBox(val swLat: Double, val swLng: Double, val neLat: Double, val neLng: Double)
}

interface GeocodeService {
    suspend fun geocode(query: String): List<GeocodeResult>
}
```

```kotlin
package com.stayhub.infrastructure.geocoding

import com.stayhub.domain.property.GeocodeResult
import com.stayhub.domain.property.GeocodeService
import org.springframework.stereotype.Service

@Service
class MapboxGeocodeAdapter(
    private val httpClient: Any, // Real: retrofit.HttpClient or WebClient
    private val apiKey: String,
) : GeocodeService {
    override suspend fun geocode(query: String): List<GeocodeResult> {
        // Call Mapbox API: https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json?access_token={token}
        // Parse response and return results
        return emptyList() // TODO: implement HTTP call + parsing
    }
}
```

- [ ] **Step 4: Run test to verify it passes** (will pass with empty list for now)

```bash
cd backend
./gradlew test --tests "MapboxGeocodeAdapterTest" 2>&1 | tail -8
```

Expected: `BUILD SUCCESSFUL` or test adjusts to mock the HTTP call

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/main/kotlin/com/stayhub/domain/property/GeocodeService.kt src/main/kotlin/com/stayhub/infrastructure/geocoding/MapboxGeocodeAdapter.kt src/test/kotlin/com/stayhub/infrastructure/geocoding/MapboxGeocodeAdapterTest.kt
git commit -m "feat(infrastructure): add GeocodeService port and Mapbox adapter (#22-T026)"
```

---

### T027: SearchController (Backend)

**Files:**
- Create: `backend/src/main/kotlin/com/stayhub/presentation/api/SearchController.kt`
- Create: `backend/src/main/kotlin/com/stayhub/presentation/dto/search/SearchRequest.kt`
- Create: `backend/src/main/kotlin/com/stayhub/presentation/dto/search/SearchResultsResponse.kt`
- Create: `backend/src/test/kotlin/com/stayhub/presentation/api/SearchControllerTest.kt`

- [ ] **Step 1: Write the failing test**

```kotlin
package com.stayhub.presentation.api

import com.stayhub.application.search.SearchPropertiesUseCase
import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertySearchFilters
import io.mockk.coEvery
import io.mockk.mockk
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.web.reactive.function.client.WebClient
import java.util.*

class SearchControllerTest {
    private val searchUseCase = mockk<SearchPropertiesUseCase>()
    private val controller = SearchController(searchUseCase)
    private val client = WebTestClient.bindToController(controller).build()

    @Test
    fun `GET search returns paginated properties`() {
        val mockProperty = Property(
            id = UUID.randomUUID(),
            title = "Barcelona Apt",
            description = "Nice",
            propertyType = "apartment",
            location = Property.Location(41.4, 2.16, "Barcelona", null, "Spain", "Main St"),
            maxGuests = 4,
            bedrooms = 2,
            bathrooms = 1,
            nightlyRateEur = 120.0,
            cleaningFeeEur = 50.0,
            amenities = listOf("WiFi"),
            houseRules = emptyList(),
            photos = emptyList(),
            hostId = UUID.randomUUID(),
            avgRating = 4.8,
            reviewCount = 10
        )
        val page = PageImpl(listOf(mockProperty), PageRequest.of(0, 20), 1)

        coEvery {
            searchUseCase.search(
                swLat = 41.35,
                swLng = 2.10,
                neLat = 41.45,
                neLng = 2.20,
                checkIn = "2025-06-01",
                checkOut = "2025-06-05",
                filters = any(),
                page = 1,
                size = 20
            )
        } returns page

        client.get()
            .uri("/api/v1/properties/search?sw_lat=41.35&sw_lng=2.10&ne_lat=41.45&ne_lng=2.20&check_in=2025-06-01&check_out=2025-06-05")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.results[0].title").isEqualTo("Barcelona Apt")
            .jsonPath("$.pagination.total_results").isEqualTo(1)
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend
./gradlew test --tests "SearchControllerTest" 2>&1 | tail -8
```

Expected: `error: Unresolved reference: SearchController`

- [ ] **Step 3: Write minimal implementation**

```kotlin
package com.stayhub.presentation.dto.search

data class SearchResultsResponse(
    val results: List<PropertySummaryDto>,
    val pagination: PaginationDto,
)

data class PropertySummaryDto(
    val id: String,
    val title: String,
    val photo_url: String,
    val nightly_rate_eur: Double,
    val cleaning_fee_eur: Double,
    val location: LocationDto,
    val avg_rating: Double?,
    val review_count: Int,
    val property_type: String,
    val max_guests: Int,
    val bedrooms: Int,
)

data class LocationDto(
    val lat: Double,
    val lng: Double,
    val city: String,
    val country: String,
)

data class PaginationDto(
    val page: Int,
    val size: Int,
    val total_results: Long,
    val total_pages: Int,
)
```

```kotlin
package com.stayhub.presentation.api

import com.stayhub.application.search.SearchPropertiesUseCase
import com.stayhub.domain.property.PropertySearchFilters
import com.stayhub.presentation.dto.search.*
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/properties")
class SearchController(
    private val searchUseCase: SearchPropertiesUseCase,
) {
    @GetMapping("/search")
    suspend fun search(
        @RequestParam sw_lat: Double,
        @RequestParam sw_lng: Double,
        @RequestParam ne_lat: Double,
        @RequestParam ne_lng: Double,
        @RequestParam check_in: String,
        @RequestParam check_out: String,
        @RequestParam(required = false) min_price: Double?,
        @RequestParam(required = false) max_price: Double?,
        @RequestParam(required = false) property_type: String?,
        @RequestParam(required = false) bedrooms: Int?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): SearchResultsResponse {
        val filters = PropertySearchFilters(
            minPrice = min_price,
            maxPrice = max_price,
            propertyType = property_type,
            bedrooms = bedrooms,
        )
        val result = searchUseCase.search(sw_lat, sw_lng, ne_lat, ne_lng, check_in, check_out, filters, page, size)
        
        return SearchResultsResponse(
            results = result.content.map {
                PropertySummaryDto(
                    id = it.id.toString(),
                    title = it.title,
                    photo_url = it.photos.firstOrNull()?.url ?: "",
                    nightly_rate_eur = it.nightlyRateEur,
                    cleaning_fee_eur = it.cleaningFeeEur,
                    location = LocationDto(it.location.lat, it.location.lng, it.location.city, it.location.country),
                    avg_rating = it.avgRating,
                    review_count = it.reviewCount,
                    property_type = it.propertyType,
                    max_guests = it.maxGuests,
                    bedrooms = it.bedrooms,
                )
            },
            pagination = PaginationDto(
                page = result.number + 1,
                size = result.size,
                total_results = result.totalElements,
                total_pages = result.totalPages,
            ),
        )
    }

    @GetMapping("/geocode")
    suspend fun geocode(@RequestParam q: String): GeocodeResponse {
        // TODO: Call GeocodeService
        return GeocodeResponse(emptyList())
    }
}

data class GeocodeResponse(val results: List<Map<String, Any>>)
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend
./gradlew test --tests "SearchControllerTest" 2>&1 | tail -8
```

Expected: `BUILD SUCCESSFUL`

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/main/kotlin/com/stayhub/presentation/api/SearchController.kt src/main/kotlin/com/stayhub/presentation/dto/search/ src/test/kotlin/com/stayhub/presentation/api/SearchControllerTest.kt
git commit -m "feat(api): add SearchController with /search and /geocode endpoints (#22-T027)"
```

---

## Remaining Tasks (Template Pattern)

The following tasks follow the exact same pattern as T022–T027 above:

**Pattern: For each task X:**
1. Write failing test (may use mocks/TestContainers depending on layer)
2. Run test → verify failure
3. Write minimal implementation
4. Run test → verify pass
5. Commit with `(#N-TXX)` issue ref

Each task has files to create/modify listed at the top. Use the code examples above as a template for the style and structure.

### T028: Search DTOs (done in T027; skip)

### Frontend Search Tasks (T029–T035)

**T029: Search API Service**
- Files: `frontend/src/services/searchService.ts`, `frontend/src/services/searchService.test.ts`
- Test: Mock Axios client, verify `usePropertySearch` hook fetches from `/api/v1/properties/search`
- Impl: TanStack Query wrappers around `apiClient.get("/api/v1/properties/search", { params })`

**T030: SearchBar Component**
- Files: `frontend/src/components/search/SearchBar.tsx`, `.test.tsx`
- Test: Renders location input, date pickers, guests counter; calls `onSearch` callback with params
- Impl: Controlled inputs, Mapbox geocode on location change

**T031: FilterPanel Component**
- Files: `frontend/src/components/search/FilterPanel.tsx`, `.test.tsx`
- Test: Renders sliders/checkboxes; calls `onFiltersChange` callback
- Impl: Slider for price, checkboxes for amenities/property type

**T032: PropertyCard Component**
- Files: `frontend/src/components/search/PropertyCard.tsx`, `.test.tsx`
- Test: Renders prop data (title, photo, price, rating); calls `onClick` on click
- Impl: Styled card with star rating component

**T033: MapView Component**
- Files: `frontend/src/components/search/MapView.tsx`, `.test.tsx`
- Test: Renders Mapbox map; calls `onViewportChange` on pan/zoom
- Impl: Mapbox GL with markers, layer/popup for property hover

**T034: EmptyState Component**
- Files: `frontend/src/components/search/EmptyState.tsx`, `.test.tsx`
- Test: Renders "no results" message and suggestions
- Impl: Simple centered message with expand/collapse FAQs

**T035: Search Page**
- Files: `frontend/src/app/search/page.tsx`, `.test.tsx`
- Test: Full page integration; composable, syncs URL query params
- Impl: Composes SearchBar, FilterPanel, MapView, PropertyCard list; pagination; loading skeletons

---

### Backend Property Details Tasks (T036–T041)

**T036: GetPropertyDetailsUseCase**
- Files: `backend/src/main/kotlin/com/stayhub/application/property/GetPropertyDetailsUseCase.kt`, `.Test.kt`
- Test: Mock repo, verify use case returns full Property + Host
- Impl: Delegate to repo.findById, throw NotFoundException if not found

**T037: GetPropertyAvailabilityUseCase**
- Files: `backend/src/main/kotlin/com/stayhub/application/property/GetPropertyAvailabilityUseCase.kt`, `.Test.kt`
- Test: Mock repo, verify returns list of UnavailableDate with reason (booked/blocked/held)
- Impl: Query Availability + AvailabilityHold tables, map to DTO

**T038: CalculatePriceUseCase**
- Files: `backend/src/main/kotlin/com/stayhub/application/property/CalculatePriceUseCase.kt`, `.Test.kt`
- Test: Given property and dates, verify pricing formula: (rate × nights) + cleaning + (subtotal × 0.12 service fee)
- Impl: Arithmetic; use Money value object

**T039: PropertyController**
- Files: `backend/src/main/kotlin/com/stayhub/presentation/api/PropertyController.kt`, `.Test.kt`
- Test: Mock use cases; verify `GET /api/v1/properties/{id}`, `/availability`, `/reviews`, `/price`
- Impl: Delegate to use cases, map results to DTOs

**T040: Response DTOs**
- Files: `backend/src/main/kotlin/com/stayhub/presentation/dto/property/*.kt`
- Test: DTO construction tests (optional; data classes are trivial)
- Impl: PropertyDetailsResponse, AvailabilityResponse, ReviewsResponse, PriceBreakdownResponse

**T041: AvailabilityRepositoryAdapter**
- Files: `backend/src/main/kotlin/com/stayhub/infrastructure/persistence/AvailabilityRepositoryAdapter.kt`, `.Test.kt`
- Test: TestContainers; query Availability + AvailabilityHold; verify filtering by date range
- Impl: R2DBC query with date range WHERE clauses

---

### Frontend Property Details Tasks (T042–T048)

**T042: Property API Service**
- Files: `frontend/src/services/propertyService.ts`, `.test.ts`
- Test: Mock Axios; verify hooks fetch `/api/v1/properties/{id}`, `/availability`, etc.
- Impl: TanStack Query hooks

**T043–T047: UI Components** (PhotoGallery, AvailabilityCalendar, AmenityList, PriceBreakdown, ReviewList)
- Each: Create component + test
- Test pattern: Render props, verify DOM output, simulate user interactions
- Impl: Styled components, event handlers

**T048: Property Detail Page**
- Files: `frontend/src/app/property/[id]/page.tsx`, `.test.tsx`
- Test: Compose all components; verify data loading and error states
- Impl: Next.js dynamic route; fetch property on mount via hooks; render all sections

---

### Backend Booking Tasks (T049–T060)

**T049: Booking Aggregate**
- Files: `backend/src/main/kotlin/com/stayhub/domain/booking/Booking.kt`, `.Test.kt`
- Test: Validate invariants: dates in future, check-out > check-in, guest count <= max; domain methods
- Impl: Sealed Booking with status states (PendingPayment, Confirmed, Cancelled, Completed); `confirm()`, `cancel()` methods

**T050–T051: Repository Ports**
- BookingRepository, AvailabilityHoldRepository
- Test: Interface existence tests
- Impl: Port interfaces with suspend functions

**T052–T053: Service Ports + Adapters**
- PaymentService + StripePaymentAdapter
- EmailNotificationService + SmtpEmailAdapter
- Test: Mock external services; verify correct API calls
- Impl: HTTP/SMTP adapters; call StripeClient and MailSender

**T054–T055: Booking Use Cases**
- CreateBookingUseCase, ConfirmBookingUseCase
- Test: Complex flow with repos + services; verify state transitions
- Impl: Check availability → hold → stripe intent; verify payment → confirm → mark booked

**T056: Repository Adapters**
- BookingRepositoryAdapter, AvailabilityHoldRepositoryAdapter
- Test: TestContainers; insert/query bookings and holds
- Impl: R2DBC persistence

**T057–T059: Controller, Webhook, Scheduler**
- BookingController, StripeWebhookController, HoldCleanupScheduler
- Test: WebTestClient for endpoints; mock scheduler execution
- Impl: REST endpoints, Stripe signature verification, @Scheduled task

**T060: DTOs**
- Files: `backend/src/main/kotlin/com/stayhub/presentation/dto/booking/*.kt`
- Impl: CreateBookingRequest/Response, ConfirmBookingResponse, etc.

---

### Frontend Booking Tasks (T061–T065)

**T061: Booking API Service**
- Files: `frontend/src/services/bookingService.ts`, `.test.ts`
- Test: Mock Axios; verify mutations call `POST /api/v1/bookings`, `POST /api/v1/bookings/{id}/confirm`
- Impl: TanStack Query mutations

**T062–T063: UI Components** (BookingSummary, PaymentForm)
- Each: Component + test
- Test: Render data, verify callbacks
- Impl: BookingSummary shows nightly/cleaning/service fee breakdown; PaymentForm integrates Stripe Elements

**T064: Checkout Page**
- Files: `frontend/src/app/booking/[id]/page.tsx`, `.test.tsx`
- Test: On mount, call `createBooking`; on payment success, redirect to confirmation
- Impl: Fetch booking params from URL; call createBooking mutation; render PaymentForm with client_secret; on success → navigate

**T065: Confirmation Page**
- Files: `frontend/src/app/confirmation/[id]/page.tsx`, `.test.tsx`
- Test: Fetch booking detail; render reference, dates, total
- Impl: Query booking by ID; render confirmationpage UI

---

### Backend Trip Management Tasks (T066–T070)

**T066–T068: Use Cases** (GetMyTripsUseCase, GetBookingDetailsUseCase, CancelBookingUseCase)
- Test: Mock repos; verify pagination, ownership check, refund logic
- Impl: Fetch bookings by guest ID; verify requester owns booking; compute can_cancel and refund_amount

**T069: BookingController Extensions**
- Add `GET /api/v1/bookings/my-trips`, `GET /api/v1/bookings/{id}`, `POST /api/v1/bookings/{id}/cancel`
- Test: WebTestClient; verify endpoints return correct DTOs
- Impl: Map use case results to DTOs

**T070: DTOs**
- BookingDetailResponse, BookingSummaryDto, MyTripsResponse, CancellationResponse

---

### Frontend Trip Management Tasks (T071–T075)

**T071: Trips API Service**
- Files: `frontend/src/services/tripsService.ts`, `.test.ts`
- Test: Mock Axios; verify hooks/mutations
- Impl: TanStack Query

**T072–T073: UI Components** (TripCard, CancellationModal)
- Test: Render data, verify callbacks
- Impl: TripCard lists booking summary; CancellationModal shows policy and refund

**T074: My Trips Page**
- Files: `frontend/src/app/trips/page.tsx`, `.test.tsx`
- Test: Render trip list with status filters
- Impl: Query bookings; render TripCard grid

**T075: Trip Detail Page**
- Files: `frontend/src/app/trips/[id]/page.tsx`, `.test.tsx`
- Test: Fetch booking detail; show full details + cancel option
- Impl: Query booking; render all details; handle cancel mutation

---

### Polish & Cross-Cutting Tasks (T076–T084)

**T076: Actuator Health Endpoints**
- Edit: `backend/src/main/resources/application.yml`
- Test: `GET /actuator/health` returns DB + disk status
- Impl: Add `management.endpoints.web.exposure.include=health,info`

**T077: Loading Skeletons**
- Files: `frontend/src/components/shared/*.tsx`
- Test: Render and verify structure
- Impl: Shimmer CSS animations, same layout as real components

**T078: NavigationBar**
- Files: `frontend/src/components/shared/NavigationBar.tsx`, `.test.tsx`
- Test: Render logo, search shortcut, "My Trips" link (only if authenticated)
- Impl: Header with logo, nav links, mobile responsive

**T079: Past-Date Validation**
- Edit: SearchBar component
- Test: Verify past dates disabled in date pickers
- Impl: Set `minDate={today}` in date input

**T080: Unauthenticated Booking Redirect**
- Edit: Checkout page
- Test: Detect 401 response, redirect to login
- Impl: Error interceptor or useEffect check in PaymentForm

**T081: Hold-Expiry Countdown**
- Edit: Checkout page
- Test: MM:SS timer displays; redirect on expiry
- Impl: useEffect with interval; countdown from `hold_expires_at`

**T082: ErrorBoundary**
- Files: `frontend/src/components/shared/ErrorBoundary.tsx`, `.test.tsx`
- Test: Catch errors; render fallback UI with trace ID
- Impl: React error boundary class component; catch and display trace ID

**T083: OpenAPI Documentation**
- Edit: `backend/build.gradle.kts`
- Test: `GET /swagger-ui.html` loads
- Impl: Add `org.springdoc:springdoc-openapi-starter-webflux-ui`

**T084: Quickstart Validation**
- Files: `docs/QUICKSTART.md` (new)
- Test: Run full stack via docker-compose; complete one end-to-end booking
- Impl: Shell script or manual checklist

---

## Summary Checklist

Copy and paste into a task runner to track progress. Mark each with `- [x]` as completed.

**Phase 3: US1 Search (15 tasks)**
- [ ] T022 Property domain
- [ ] T023 PropertyRepository port
- [ ] T024 SearchPropertiesUseCase
- [ ] T025 PropertyRepositoryAdapter
- [ ] T026 GeocodeService + Mapbox
- [ ] T027 SearchController
- [ ] T028 Search DTOs (covered in T027)
- [ ] T029 Search API service
- [ ] T030 SearchBar component
- [ ] T031 FilterPanel component
- [ ] T032 PropertyCard component
- [ ] T033 MapView component
- [ ] T034 EmptyState component
- [ ] T035 Search page

**Phase 4: US2 Property Details (13 tasks)**
- [ ] T036 GetPropertyDetailsUseCase
- [ ] T037 GetPropertyAvailabilityUseCase
- [ ] T038 CalculatePriceUseCase
- [ ] T039 PropertyController
- [ ] T040 Response DTOs
- [ ] T041 AvailabilityRepositoryAdapter
- [ ] T042 Property API service
- [ ] T043 PhotoGallery component
- [ ] T044 AvailabilityCalendar component
- [ ] T045 AmenityList component
- [ ] T046 PriceBreakdown component
- [ ] T047 ReviewList component
- [ ] T048 Property detail page

**Phase 5: US3 Booking (21 tasks)**
- [ ] T049 Booking aggregate
- [ ] T050 BookingRepository port
- [ ] T051 AvailabilityHoldRepository port
- [ ] T052 PaymentService + Stripe
- [ ] T053 EmailNotificationService + SMTP
- [ ] T054 CreateBookingUseCase
- [ ] T055 ConfirmBookingUseCase
- [ ] T056 Repository adapters
- [ ] T057 BookingController
- [ ] T058 Stripe webhook handler
- [ ] T059 Hold cleanup scheduler
- [ ] T060 DTOs
- [ ] T061 Booking API service
- [ ] T062 BookingSummary component
- [ ] T063 PaymentForm component
- [ ] T064 Checkout page
- [ ] T065 Confirmation page

**Phase 6: US4 Trip Management (10 tasks)**
- [ ] T066 GetMyTripsUseCase
- [ ] T067 GetBookingDetailsUseCase
- [ ] T068 CancelBookingUseCase
- [ ] T069 BookingController extensions
- [ ] T070 DTOs
- [ ] T071 Trips API service
- [ ] T072 TripCard component
- [ ] T073 CancellationModal component
- [ ] T074 My trips page
- [ ] T075 Trip detail page

**Phase 7: Polish (9 tasks)**
- [ ] T076 Actuator health
- [ ] T077 Loading skeletons
- [ ] T078 NavigationBar
- [ ] T079 Past-date validation
- [ ] T080 Unauthenticated redirect
- [ ] T081 Hold-expiry countdown
- [ ] T082 ErrorBoundary
- [ ] T083 OpenAPI docs
- [ ] T084 Quickstart validation

---

Plan complete and saved to `docs/superpowers/plans/2026-06-08-wave4-user-stories.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task or small batch (e.g., T022–T024 together, then T025–T027), review between batches, fast iteration with parallelization.

**2. Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints every 3–5 tasks.

**Which approach?**
