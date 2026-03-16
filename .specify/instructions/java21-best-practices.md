# Java 21 Best Practices — Meditation Builder

This document defines the mandatory best practices for Java 21 code in the project.
Copilot and any AI agent MUST follow these rules when generating Java code.

**Last updated:** 2026-02-19 — Synchronized with codebase after US4 (Playback BC) delivery.  
**Evidence sources:** `meditationbuilder/`, `meditation.generation/`, `playback/` BCs + CI workflows.

---

## 1. Records for Value Objects and Entities

### 1.1 General Rule
- **ALWAYS** use `record` instead of `class` for:
  - Value Objects (immutable by definition)
  - Domain Entities (with immutable API)
  - Input/Output DTOs

### 1.2 Record Structure

```java
public record RecordName(
    FieldType1 field1,
    FieldType2 field2
) {
    // Compact constructor for validation
    public RecordName {
        Objects.requireNonNull(field1, "field1 is required");
        // Additional validations
    }
    
    // Static factory methods
    public static RecordName create(FieldType1 field1) {
        return new RecordName(field1, defaultValue);
    }
}
```

### 1.3 Value Object Example

```java
public record TextContent(String value) {
    
    private static final int MAX_LENGTH = 10_000;
    
    public TextContent {
        Objects.requireNonNull(value, "Text content is required");
        if (value.isBlank()) {
            throw new IllegalArgumentException("Content cannot be empty");
        }
        if (value.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                "Content exceeds maximum of " + MAX_LENGTH + " characters"
            );
        }
    }
}
```

### 1.4 @ConfigurationProperties with Records (Java 21)

- **ALWAYS** use `record` for `@ConfigurationProperties` classes.
- Records make configuration immutable and self-documenting.
- **NEVER** use Lombok `@Data` for configuration properties: it generates unnecessary mutators.

```java
@ConfigurationProperties(prefix = "retry")
public record RetryProperties(
    int maxAttempts,
    long initialIntervalMs,
    double multiplier,
    long maxIntervalMs
) {
    public RetryProperties {
        if (maxAttempts <= 0) maxAttempts = 3;
    }
}
```

> **Evidence:** `meditationbuilder/infrastructure/config/RetryProperties.java`,
> `meditation.generation/infrastructure/config/FfmpegConfig.java`

> **⚠️ Inconsistency in codebase:** `OpenAiProperties.java` still uses Lombok `@Data`
> instead of record. Target: migrate to record in next refactor iteration.

### 1.5 Aggregate Roots Override equals/hashCode on ID Only

- For DDD Aggregate Roots, `record` provides structural equality by default (all fields).
- Override `equals`/`hashCode` to be **identity-based** (ID only) per DDD conventions.

```java
public record Meditation(UUID id, UUID userId, String title, ...) {

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        return id.equals(((Meditation) obj).id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }
}
```

> **Evidence:** `playback/domain/model/Meditation.java`

---

## 2. UUID for Identifiers

### 2.1 General Rule
- **ALWAYS** use `java.util.UUID` for entity identifiers
- **NEVER** use `String` for IDs in the domain
- Ports (interfaces) MUST use `UUID`, not `String`

### 2.2 Aggregate Root Example

```java
public record MeditationComposition(
    UUID id,                    // ✅ UUID, not String
    TextContent textContent,
    Instant createdAt,
    Instant updatedAt
) {
    public static MeditationComposition create(TextContent text, Clock clock) {
        Instant now = clock.instant();
        return new MeditationComposition(
            UUID.randomUUID(),  // Internal generation
            text,
            now,
            now
        );
    }
}
```

### 2.3 Ports Example

```java
public interface ComposeContentUseCase {
    // ✅ CORRECT: UUID
    MeditationComposition getComposition(UUID compositionId);
    
    // ❌ WRONG: String
    // MeditationComposition getComposition(String compositionId);
}
```

---

## 3. Clock Injection for Timestamps

### 3.1 General Rule
- **NEVER** use `Instant.now()` directly in the domain
- **ALWAYS** inject `java.time.Clock` for timestamps
- This enables deterministic tests

### 3.2 Factory Methods Pattern

```java
public record Entity(UUID id, Instant createdAt, Instant updatedAt) {
    
    // Factory with explicit Clock (for production and tests)
    public static Entity create(Clock clock) {
        Instant now = clock.instant();
        return new Entity(UUID.randomUUID(), now, now);
    }
    
    // Convenience factory (for simple use)
    public static Entity create() {
        return create(Clock.systemUTC());
    }
}
```

### 3.3 Testing with Fixed Clock

```java
@Test
void shouldCreateWithFixedTimestamp() {
    Instant fixedTime = Instant.parse("2024-01-15T10:30:00Z");
    Clock fixedClock = Clock.fixed(fixedTime, ZoneOffset.UTC);
    
    Entity entity = Entity.create(fixedClock);
    
    assertThat(entity.createdAt()).isEqualTo(fixedTime);
    assertThat(entity.updatedAt()).isEqualTo(fixedTime);
}
```

---

## 4. Immutable API with `withX()` Methods

### 4.1 General Rule
- Entities MUST be immutable
- To "modify" an entity, create a new instance
- Use `withX()` methods that return a new instance

### 4.2 withX() Pattern

```java
public record MeditationComposition(
    UUID id,
    TextContent textContent,
    MusicReference musicReference,
    Instant createdAt,
    Instant updatedAt
) {
    // Immutable mutation method
    public MeditationComposition withText(TextContent newText, Clock clock) {
        Objects.requireNonNull(newText, "textContent is required");
        return new MeditationComposition(
            this.id,
            newText,
            this.musicReference,
            this.createdAt,
            clock.instant()  // Updates updatedAt
        );
    }
    
    // For optional fields (nullable)
    public MeditationComposition withMusic(MusicReference music, Clock clock) {
        return new MeditationComposition(
            this.id,
            this.textContent,
            music,  // Can be null
            this.createdAt,
            clock.instant()
        );
    }
    
    // To remove optional fields
    public MeditationComposition withoutMusic(Clock clock) {
        return withMusic(null, clock);
    }
}
```

---

## 5. Optional for Nullable Fields

### 5.1 General Rule
- Nullable fields in records MUST have an accessor that returns `Optional`.
- Name the accessor with `Opt` suffix for clarity.
- **NEVER** declare record components as `Optional<T>` (field-level Optional is an anti-pattern).

> **⚠️ Violation in codebase:** `meditation.generation/domain/model/MeditationOutput.java`
> stores `Optional<MediaReference> imageReference` as a record component.
> This breaks serialization (Jackson), Testcontainers, and Spring's property binding.
> **Remedy:** Change fields to `@Nullable T` and expose them via `xOpt()` accessor methods.

### 5.2 Correct Pattern — Nullable fields with helper methods

Purpose: prefer `hasX()` + `xOpt()` over raw null checks in callers.

```java
public record MediaUrls(
    String audioUrl,   // nullable
    String videoUrl,   // nullable
    String subtitleUrl // nullable
) {
    public MediaUrls {
        audioUrl = (audioUrl != null && audioUrl.isBlank()) ? null : audioUrl;
        videoUrl = (videoUrl != null && videoUrl.isBlank()) ? null : videoUrl;
        if (audioUrl == null && videoUrl == null) {
            throw new IllegalArgumentException("At least one URL required");
        }
    }

    // ✅ Boolean guards
    public boolean hasAudio() { return audioUrl != null; }
    public boolean hasVideo() { return videoUrl != null; }

    // ✅ Optional accessors for callers that need Optional semantics
    public Optional<String> audioUrlOpt() { return Optional.ofNullable(audioUrl); }
    public Optional<String> videoUrlOpt() { return Optional.ofNullable(videoUrl); }
}
```

> **Evidence:** `playback/domain/model/MediaUrls.java`

### 5.3 Client Usage

```java
urls.audioUrlOpt().ifPresent(player::playAudio);

String path = urls.videoUrlOpt()
    .orElse("default.mp4");
```

---

## 6. Validation in Compact Constructor

### 6.1 General Rule
- **ALL** validation MUST go in the record's compact constructor.
- Use `Objects.requireNonNull()` for required fields.
- Throw `IllegalArgumentException` for business validations.
- **Extract complex validation to a private static helper** for readability.

### 6.2 Simple Validation (inline)

```java
public record ValueObject(String value, int quantity) {
    public ValueObject {
        Objects.requireNonNull(value, "value is required");
        if (value.isBlank()) throw new IllegalArgumentException("value cannot be empty");
        if (quantity < 0) throw new IllegalArgumentException("quantity must be >= 0");
    }
}
```

### 6.3 Complex Validation — Extract to Private Static Helper

When the aggregate has many fields and inter-field business rules, extract to a static helper
to keep the compact constructor clean and testable in isolation.

```java
public record Meditation(UUID id, UUID userId, String title, Instant createdAt,
                         ProcessingState processingState, MediaUrls mediaUrls) {

    public Meditation {
        validateInvariants(id, userId, title, createdAt, processingState, mediaUrls);
    }

    private static void validateInvariants(UUID id, UUID userId, String title,
                                           Instant createdAt, ProcessingState state,
                                           MediaUrls mediaUrls) {
        if (id == null) throw new IllegalArgumentException("id cannot be null");
        if (userId == null) throw new IllegalArgumentException("userId cannot be null");
        if (title == null || title.isBlank()) throw new IllegalArgumentException("title required");
        if (createdAt == null) throw new IllegalArgumentException("createdAt cannot be null");
        if (state == null) throw new IllegalArgumentException("processingState cannot be null");
        // Business Rule: COMPLETED requires mediaUrls
        if (state == ProcessingState.COMPLETED && mediaUrls == null) {
            throw new IllegalArgumentException("MediaUrls required for COMPLETED state");
        }
    }
}
```

> **Evidence:** `playback/domain/model/Meditation.java`

---

## 7. Required Imports

To follow these practices, the following imports are standard:

```java
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
```

---

## 8. Testing Patterns

### 8.1 Record Tests

```java
@Test
void shouldCreateValidRecord() {
    TextContent content = new TextContent("Valid text");
    assertThat(content.value()).isEqualTo("Valid text");
}

@Test
void shouldRejectNullValue() {
    assertThatThrownBy(() -> new TextContent(null))
        .isInstanceOf(NullPointerException.class)
        .hasMessageContaining("required");
}

@Test
void shouldRejectInvalidValue() {
    assertThatThrownBy(() -> new TextContent(""))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("empty");
}
```

### 8.2 Entity Tests with Clock

```java
class EntityTest {
    private static final Instant FIXED_TIME = Instant.parse("2024-01-15T10:00:00Z");
    private static final Clock FIXED_CLOCK = Clock.fixed(FIXED_TIME, ZoneOffset.UTC);
    
    @Test
    void shouldCreateWithTimestamp() {
        Entity entity = Entity.create(FIXED_CLOCK);
        assertThat(entity.createdAt()).isEqualTo(FIXED_TIME);
    }
    
    @Test
    void shouldUpdateTimestampOnMutation() {
        Instant laterTime = FIXED_TIME.plusHours(1);
        Clock laterClock = Clock.fixed(laterTime, ZoneOffset.UTC);
        
        Entity original = Entity.create(FIXED_CLOCK);
        Entity updated = original.withName("new", laterClock);
        
        assertThat(updated.createdAt()).isEqualTo(FIXED_TIME);
        assertThat(updated.updatedAt()).isEqualTo(laterTime);
    }
}
```

> **⚠️ Violation in codebase:** Multiple test files in `playback/application/service/` use
> `Instant.now()` directly in fixture setup. This makes time-sensitive assertions non-deterministic.
> **Rule:** Any test that asserts on timestamps MUST use `Clock.fixed()`.

### 8.3 Testcontainers for Infrastructure Integration Tests

- Persistence adapters MUST use `@Testcontainers` + real containers, not H2.
- PostgreSQL container: `postgres:15-alpine` (matches production version).
- Label integration tests with `IT` suffix (e.g., `PostgreSqlMeditationRepositoryAdapterIT`).

```java
@SpringBootTest
@Testcontainers
class PostgreSqlRepositoryAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
        .withDatabaseName("test_db")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void overrideProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
    }
}
```

> **Evidence:** `playback/infrastructure/out/persistence/PostgreSqlMeditationRepositoryAdapterIT.java`,
> `meditation.generation/e2e/GenerateMeditationE2ETest.java` (adds LocalStack for S3)

### 8.4 BDD (Cucumber) Test Conventions

- Feature files: `src/test/resources/features/<boundedContext>/<feature>.feature`
- Language header: `# language: es` (Spanish business language per project contract)
- Steps: `src/test/java/com/hexagonal/<bc>/bdd/steps/<Feature>Steps.java`
- Step language: 100% business, no HTTP/JSON/SQL in `Given`/`When`/`Then`
- Steps must start in **YELLOW** (pending), turn **GREEN** when service is implemented

> **Evidence:** `features/playback/list-play-meditations.feature`

---

## 9. Enhanced Switch Expressions (Java 21)

### 9.1 General Rule
- **ALWAYS** use **arrow-syntax switch expressions** (`->`) instead of fall-through `case` blocks.
- Exhaustive switch on enums: omit `default` when all cases are covered; add `default` to
  handle unknown values in infrastructure mapping (e.g., from DB strings).

### 9.2 Status Mapping in Infrastructure Adapters

```java
// ✅ Infrastructure mapper: DB string → domain enum
private ProcessingState mapStatus(String dbStatus) {
    return switch (dbStatus) {
        case "PROCESSING" -> ProcessingState.PROCESSING;
        case "COMPLETED"  -> ProcessingState.COMPLETED;
        case "FAILED"     -> ProcessingState.FAILED;
        case "TIMEOUT"    -> ProcessingState.FAILED; // TIMEOUT treated as FAILED in this BC
        default           -> throw new IllegalArgumentException("Unknown status: " + dbStatus);
    };
}
```

> **Evidence:** `playback/infrastructure/out/persistence/EntityToDomainMapper.java`

### 9.3 Switch in Domain Exceptions for User-Facing Messages

```java
// ✅ Domain exception: user-facing Spanish message by state
public String getUserMessage() {
    return switch (currentState) {
        case PROCESSING -> "Esta meditación aún se está procesando.";
        case FAILED     -> "Error al generar la meditación.";
        case PENDING    -> "La meditación está en cola.";
        default         -> "Estado " + currentState.getLabel() + " no reproducible";
    };
}
```

> **Evidence:** `playback/domain/exception/MeditationNotPlayableException.java`

---

## 10. Enums with Behavior (Rich Enums)

### 10.1 General Rule
- Enums SHOULD carry their own labels and behavior methods.
- Keeps business logic in domain; controllers delegate to enum methods.

### 10.2 Pattern: State Enum with Label and Predicate

```java
public enum ProcessingState {
    PENDING("En cola"),
    PROCESSING("Generando"),
    COMPLETED("Completada"),
    FAILED("Fallida");

    private final String label;

    ProcessingState(String label) { this.label = label; }

    public String getLabel() { return label; }

    /** Business rule: only COMPLETED meditations are playable. */
    public boolean isPlayable() { return this == COMPLETED; }
}
```

Do **NOT** put state-label resolution in controllers or mappers — call `state.getLabel()`.

> **Evidence:** `playback/domain/model/ProcessingState.java`

---

## 11. JPA Entities — Cannot Be Records

### 11.1 General Rule
- JPA entities MUST be **mutable classes** with a no-arg constructor.
- `record` cannot be used for JPA entities (no no-arg constructor, final fields).
- Use conventional `class` with `protected` default constructor.

### 11.2 Entity Pattern

```java
@Entity
@Table(name = "meditation_output", schema = "generation")
public class MeditationEntity {

    @Id
    @Column(name = "meditation_id")
    private UUID meditationId;

    @Column(name = "status", length = 50)
    private String status;

    protected MeditationEntity() { }   // Required by JPA

    public MeditationEntity(UUID id, String status, ...) { ... }

    public UUID getMeditationId() { return meditationId; }
    public String getStatus() { return status; }
    // setters only if the entity is mutable post-construction
}
```

- Map JPA entities to domain records in a dedicated **mapper** class (e.g., `EntityToDomainMapper`).
- Use a **read-only cross-BC access pattern** for shared schemas:
  `@Table(schema = "generation")` in Playback BC for read-only queries on Generation data.

> **Evidence:** `playback/infrastructure/out/persistence/MeditationEntity.java`,
> `playback/infrastructure/out/persistence/EntityToDomainMapper.java`

---

## 12. Hexagonal Architecture Practices

### 12.1 Dependency Direction (Law)
```
domain ← application ← infrastructure (in/out)
```
- Domain has **zero** Spring and **zero** infrastructure imports.
- Application services are plain Java classes; Spring wiring belongs in `@Configuration`.
- Infrastructure adapters declare `@Component` / `@Service` / `@Repository`.

### 12.2 Spring Wiring via @Configuration

Wire use cases (application services) as Spring `@Bean` in a dedicated `*Config` class:

```java
@Configuration
public class PlaybackConfig {

    @Bean
    public ListMeditationsUseCase listMeditationsUseCase(MeditationRepositoryPort port) {
        return new ListMeditationsService(port);
    }

    @Bean
    public GetPlaybackInfoUseCase getPlaybackInfoUseCase(MeditationRepositoryPort port,
                                                         PlaybackValidator validator) {
        return new GetPlaybackInfoService(port, validator);
    }
}
```

> **Evidence:** `playback/infrastructure/config/PlaybackConfig.java`

### 12.3 Port Naming Convention

| Direction | Package | Naming |
|-----------|---------|--------|
| In (Driving) | `domain/ports/in/` | `<Verb><Noun>UseCase` (e.g., `ListMeditationsUseCase`) |
| Out (Driven) | `domain/ports/out/` | `<Noun><Role>Port` (e.g., `MeditationRepositoryPort`) |

> **⚠️ Violation in codebase:** `meditation.generation` BC has **both** `domain/port/out/` (legacy,
> unused) and `domain/ports/out/` (canonical, in use). Delete the `domain/port/out/` directory.

### 12.4 Constructor-Only Injection in Application Services

Application services MUST validate their dependencies at construction time:

```java
public class GetPlaybackInfoService implements GetPlaybackInfoUseCase {

    private final MeditationRepositoryPort repository;
    private final PlaybackValidator validator;

    public GetPlaybackInfoService(MeditationRepositoryPort repository,
                                   PlaybackValidator validator) {
        this.repository = Objects.requireNonNull(repository, "repository cannot be null");
        this.validator  = Objects.requireNonNull(validator, "validator cannot be null");
    }
}
```

### 12.5 Exception Handling Boundaries

| Origin | Exception type | Handling |
|--------|---------------|----------|
| Domain | `DomainException extends RuntimeException` | Propagates through application, mapped in controller |
| Application | `IllegalArgumentException` | Mapped to 400 in `@RestControllerAdvice` |
| Infrastructure (JPA, S3) | Checked/infra exceptions | Wrapped in domain exception before bubbling up |

> **Evidence:**
> - `MeditationNotFoundException`, `MeditationNotPlayableException` in `playback/domain/exception/`
> - `PlaybackExceptionHandler` in `playback/infrastructure/in/rest/exception/`
> - `GlobalExceptionHandler` in `meditationbuilder/infrastructure/in/rest/controller/`

### 12.6 BDD-First and API-First Derivation

- **Step 1:** Feature file in **YELLOW** (Pending), BDD scenarios name use cases.
- **Step 2:** OpenAPI specification `<bc>/<feature>.yaml` derived from `When` clauses.
- **Step 3:** Port method signatures derived from OpenAPI before any implementation.
- **Step 4:** Domain TDD → Application TDD → Infra IT → Controller MockMvc → Contract → E2E.

The Use Case method name MUST trace to a BDD `When` step:
```gherkin
Cuando solicita ver el listado de sus meditaciones   ← listMeditationsUseCase.execute(userId)
Cuando selecciona reproducir esa meditación          ← getPlaybackInfoUseCase.execute(id, userId)
```

---

## 13. Anti-Patterns (FORBIDDEN)

### ❌ Mutable classes for Value Objects

```java
// ❌ FORBIDDEN
public class TextContent { private String value; public void setValue(String v) { ... } }

// ✅ CORRECT
public record TextContent(String value) { }
```

### ❌ String for UUID-based IDs in domain

```java
// ❌ FORBIDDEN — meditationbuilder.generation uses String userId; fix in BC evolution
public record MeditationOutput(String userId, ...) { }

// ✅ CORRECT — followed by playback BC
public record Meditation(UUID userId, ...) { }
```

> **⚠️ Violation in codebase:** `meditation.generation` BC uses `String userId` in
> `MeditationOutput`. `playback` BC correctly uses `UUID userId`. Standardize on UUID.

### ❌ `Instant.now()` in production or test code

```java
// ❌ FORBIDDEN in domain or application
Instant.now()

// ❌ ALSO FORBIDDEN in test fixtures (makes assertions non-deterministic)
new Meditation(..., Instant.now(), ...)

// ✅ CORRECT — use Clock injection in production; Clock.fixed() in tests
public static Meditation create(Clock clock) { ... clock.instant() ... }
```

> **⚠️ Violation in codebase:** `ErrorResponse.java` uses `Instant.now()` in its convenience
> constructors. Multiple test files in playback BC use `Instant.now()` in fixtures.

### ❌ `Optional<T>` as record field type

```java
// ❌ FORBIDDEN — breaks Jackson serialization, Spring binding, equals/hashCode
public record MeditationOutput(Optional<MediaReference> imageReference, ...) { }

// ✅ CORRECT — store null, expose Optional via accessor
public record MeditationOutput(MediaReference imageReference, ...) {
    public Optional<MediaReference> imageReferenceOpt() {
        return Optional.ofNullable(imageReference);
    }
}
```

> **⚠️ Violation in codebase:** `meditation.generation/domain/model/MeditationOutput.java`
> stores `Optional<MediaReference>`, `Optional<String>`, `Optional<Integer>` as field types.

### ❌ Spring annotations in domain or application classes

```java
// ❌ FORBIDDEN — Spring in application service breaks hexagonal isolation
@Service
public class ListMeditationsService implements ListMeditationsUseCase { }

// ✅ CORRECT — plain class; wired in @Configuration
public class ListMeditationsService implements ListMeditationsUseCase { }
```

### ❌ Lombok @Data on configuration classes (when records available)

```java
// ❌ FORBIDDEN — mutable, not self-documenting
@ConfigurationProperties("openai")
@Data
public class OpenAiProperties { private String apiKey; private String baseUrl; }

// ✅ CORRECT
@ConfigurationProperties("openai")
public record OpenAiProperties(String apiKey, String baseUrl) { }
```

> **⚠️ Violation in codebase:** `OpenAiProperties.java` uses Lombok `@Data` + mutable class.

### ❌ Duplicate port directories in the same BC

```
// ❌ FORBIDDEN — found in meditation.generation
domain/port/out/AudioRenderingPort.java     ← legacy, unused
domain/ports/out/AudioRenderingPort.java    ← canonical

// ✅ CORRECT — single canonical location
domain/ports/in/   (use cases)
domain/ports/out/  (repository + service ports)
```

---

## 14. Review Checklist (PR Gate)

Before approving any Java code, verify all items:

### Domain Layer
- [ ] Value Objects and Entities are `record` (not mutable classes)
- [ ] IDs use `UUID`, not `String`
- [ ] Timestamps use injected `Clock`, not `Instant.now()`
- [ ] Mutation methods return a new instance (`withX()`)
- [ ] Nullable fields have `Optional` accessor (`xOpt()`) — NOT stored as `Optional<T>` field
- [ ] Validation in compact constructor (or delegated to private static helper)
- [ ] `Objects.requireNonNull()` for all required fields
- [ ] Aggregate Root overrides `equals`/`hashCode` on ID only
- [ ] Enums carry labels and behaviour methods (e.g., `isPlayable()`, `getLabel()`)
- [ ] Zero Spring and zero infrastructure imports

### Application Layer
- [ ] Application service is a plain Java class (no Spring annotations)
- [ ] Constructor validates dependencies with `Objects.requireNonNull()`
- [ ] No business logic — only orchestration via port calls
- [ ] Wired as Spring `@Bean` in a `*Config` class in the infrastructure layer

### Infrastructure Layer
- [ ] JPA entities use mutable class, not record
- [ ] Mapper class between JPA entity and domain model exists
- [ ] Integration tests use real containers (`@Testcontainers`) — not H2
- [ ] Controllers depend only on domain ports (in), never on infra adapters directly
- [ ] Exception handler (`@RestControllerAdvice`) maps domain exceptions to HTTP

### Test Quality
- [ ] Tests use `Clock.fixed()` for timestamp assertions
- [ ] No `Instant.now()` in fixtures where timestamp is asserted
- [ ] BDD feature files: 100% business language, no HTTP/JSON/SQL
- [ ] Infrastructure IT tests suffixed `IT` (e.g., `RepositoryAdapterIT`)

### Top-5 Quick Remediation (most common fixes)
1. Replace `Instant.now()` in test fixtures → `Clock.fixed(FIXED_TIME, ZoneOffset.UTC)`
2. Replace `Optional<T>` field in record → nullable field + `xOpt()` accessor
3. Replace Lombok `@Data` config class → `record` + `@ConfigurationProperties`
4. Delete `domain/port/out/` legacy dir in `meditation.generation` BC
5. Replace `String userId` in `MeditationOutput` → `UUID userId` (match playback BC)

---

## 15. Detected Conflicts and Inconsistencies

> This section documents deviations from conventions found between BCs.
> Do NOT modify other documents for these; fix the source code iteratively.

| # | Location | Issue | Rule Violated | Severity |
|---|----------|-------|--------------|----------|
| 1 | `meditation.generation` domain | `domain/port/out/` (legacy) AND `domain/ports/out/` (canonical) exist simultaneously | Single canonical port directory | High |
| 2 | `meditation.generation` domain | `MeditationOutput` stores `Optional<T>` as record component fields | Never store Optional as field type | High |
| 3 | `meditation.generation` domain | `MeditationOutput.userId` is `String`, not `UUID` | Always use UUID for IDs | Medium |
| 4 | `meditationbuilder` infra | `OpenAiProperties` uses Lombok `@Data` instead of `record` | Use record for ConfigurationProperties | Low |
| 5 | `meditationbuilder` infra | `ErrorResponse` uses `Instant.now()` in convenience constructors | Never use Instant.now() in production | Low |
| 6 | Playback BC tests | Multiple test fixtures use `Instant.now()` for non-asserted timestamps | Use Clock.fixed() in tests | Low |

---

## 16. Required Imports (Reference)

```java
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
```

---

**END OF DOCUMENT v2.0.0**  
*Updated 2026-02-19 — Evidence-driven sync post US4 (Playback BC) delivery.*
