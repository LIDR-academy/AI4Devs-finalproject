# Java 21 Best Practices — Meditation Builder

This document defines the mandatory best practices for Java 21 code in the project.
Copilot and any AI agent MUST follow these rules when generating Java code.

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
- Nullable fields in records MUST have an accessor that returns `Optional`
- Name the accessor with `Opt` suffix for clarity

### 5.2 Optional Accessors Pattern

```java
public record MeditationComposition(
    UUID id,
    TextContent textContent,
    MusicReference musicReference,    // Can be null
    ImageReference imageReference     // Can be null
) {
    // Accessors that return Optional
    public Optional<MusicReference> musicReferenceOpt() {
        return Optional.ofNullable(musicReference);
    }
    
    public Optional<ImageReference> imageReferenceOpt() {
        return Optional.ofNullable(imageReference);
    }
}
```

### 5.3 Client Usage

```java
composition.musicReferenceOpt()
    .ifPresent(music -> player.play(music));

String imagePath = composition.imageReferenceOpt()
    .map(ImageReference::value)
    .orElse("default-image.png");
```

---

## 6. Validation in Compact Constructor

### 6.1 General Rule
- **ALL** validation MUST go in the record's compact constructor
- Use `Objects.requireNonNull()` for required fields
- Throw `IllegalArgumentException` for business validations

### 6.2 Validation Order

```java
public record ValueObject(String value, int quantity) {
    
    public ValueObject {
        // 1. Null checks first
        Objects.requireNonNull(value, "value is required");
        
        // 2. Format/content validations
        if (value.isBlank()) {
            throw new IllegalArgumentException("value cannot be empty");
        }
        
        // 3. Range validations
        if (quantity < 0) {
            throw new IllegalArgumentException("quantity must be >= 0");
        }
        
        // 4. Complex business validations
        if (value.length() > 100 && quantity > 10) {
            throw new IllegalArgumentException(
                "value/quantity combination not allowed"
            );
        }
    }
}
```

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
    private static final Instant FIXED_TIME = 
        Instant.parse("2024-01-15T10:00:00Z");
    private static final Clock FIXED_CLOCK = 
        Clock.fixed(FIXED_TIME, ZoneOffset.UTC);
    
    @Test
    void shouldCreateWithTimestamp() {
        Entity entity = Entity.create(FIXED_CLOCK);
        
        assertThat(entity.createdAt()).isEqualTo(FIXED_TIME);
        assertThat(entity.updatedAt()).isEqualTo(FIXED_TIME);
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

---

## 9. Anti-Patterns (FORBIDDEN)

### ❌ DO NOT use mutable classes for Value Objects

```java
// ❌ FORBIDDEN
public class TextContent {
    private String value;
    public void setValue(String value) { this.value = value; }
}

// ✅ CORRECT
public record TextContent(String value) { }
```

### ❌ DO NOT use String for IDs

```java
// ❌ FORBIDDEN
public record Entity(String id) { }

// ✅ CORRECT
public record Entity(UUID id) { }
```

### ❌ DO NOT use Instant.now() directly

```java
// ❌ FORBIDDEN
public static Entity create() {
    return new Entity(UUID.randomUUID(), Instant.now());
}

// ✅ CORRECT
public static Entity create(Clock clock) {
    return new Entity(UUID.randomUUID(), clock.instant());
}
```

### ❌ DO NOT expose nullable fields without Optional

```java
// ❌ FORBIDDEN (client doesn't know it can be null)
public MusicReference musicReference() { return musicReference; }

// ✅ CORRECT (explicit that it's optional)
public Optional<MusicReference> musicReferenceOpt() {
    return Optional.ofNullable(musicReference);
}
```

### ❌ DO NOT mutate entities

```java
// ❌ FORBIDDEN
entity.setName("new");

// ✅ CORRECT
Entity updated = entity.withName("new", clock);
```

---

## 10. Review Checklist

Before approving Java code, verify:

- [ ] Value Objects are `record`
- [ ] Domain Entities are `record` with immutable API
- [ ] IDs use `UUID`, not `String`
- [ ] Timestamps use injected `Clock`, not `Instant.now()`
- [ ] Mutation methods return new instance (`withX()`)
- [ ] Nullable fields have `Optional` accessor (`xOpt()`)
- [ ] Validation in compact constructor
- [ ] Tests use `Clock.fixed()` for deterministic timestamps
- [ ] `Objects.requireNonNull()` for required fields

---

**END OF DOCUMENT**
