# Java 21 Best Practices — Meditation Builder

Este documento define las buenas prácticas obligatorias para código Java 21 en el proyecto.
Copilot y cualquier agente de IA DEBE seguir estas reglas al generar código Java.

---

## 1. Records para Value Objects y Entities

### 1.1 Regla General
- **SIEMPRE** usar `record` en lugar de `class` para:
  - Value Objects (inmutables por definición)
  - Entities del dominio (con API inmutable)
  - DTOs de entrada/salida

### 1.2 Estructura de un Record

```java
public record NombreRecord(
    TipoCampo1 campo1,
    TipoCampo2 campo2
) {
    // Compact constructor para validación
    public NombreRecord {
        Objects.requireNonNull(campo1, "campo1 es requerido");
        // Validaciones adicionales
    }
    
    // Factory methods estáticos
    public static NombreRecord create(TipoCampo1 campo1) {
        return new NombreRecord(campo1, valorDefault);
    }
}
```

### 1.3 Ejemplo Value Object

```java
public record TextContent(String value) {
    
    private static final int MAX_LENGTH = 10_000;
    
    public TextContent {
        Objects.requireNonNull(value, "El contenido de texto es requerido");
        if (value.isBlank()) {
            throw new IllegalArgumentException("El contenido no puede estar vacío");
        }
        if (value.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                "El contenido excede el máximo de " + MAX_LENGTH + " caracteres"
            );
        }
    }
}
```

---

## 2. UUID para Identificadores

### 2.1 Regla General
- **SIEMPRE** usar `java.util.UUID` para identificadores de entidades
- **NUNCA** usar `String` para IDs en el dominio
- Los puertos (interfaces) DEBEN usar `UUID`, no `String`

### 2.2 Ejemplo en Aggregate Root

```java
public record MeditationComposition(
    UUID id,                    // ✅ UUID, no String
    TextContent textContent,
    Instant createdAt,
    Instant updatedAt
) {
    public static MeditationComposition create(TextContent text, Clock clock) {
        Instant now = clock.instant();
        return new MeditationComposition(
            UUID.randomUUID(),  // Generación interna
            text,
            now,
            now
        );
    }
}
```

### 2.3 Ejemplo en Puertos

```java
public interface ComposeContentUseCase {
    // ✅ CORRECTO: UUID
    MeditationComposition getComposition(UUID compositionId);
    
    // ❌ INCORRECTO: String
    // MeditationComposition getComposition(String compositionId);
}
```

---

## 3. Clock Injection para Timestamps

### 3.1 Regla General
- **NUNCA** usar `Instant.now()` directamente en el dominio
- **SIEMPRE** inyectar `java.time.Clock` para timestamps
- Esto permite tests determinísticos

### 3.2 Patrón de Factory Methods

```java
public record Entity(UUID id, Instant createdAt, Instant updatedAt) {
    
    // Factory con Clock explícito (para producción y tests)
    public static Entity create(Clock clock) {
        Instant now = clock.instant();
        return new Entity(UUID.randomUUID(), now, now);
    }
    
    // Factory de conveniencia (para uso simple)
    public static Entity create() {
        return create(Clock.systemUTC());
    }
}
```

### 3.3 Testing con Clock Fijo

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

## 4. API Inmutable con Métodos `withX()`

### 4.1 Regla General
- Las entidades DEBEN ser inmutables
- Para "modificar" una entidad, crear una nueva instancia
- Usar métodos `withX()` que retornan nueva instancia

### 4.2 Patrón withX()

```java
public record MeditationComposition(
    UUID id,
    TextContent textContent,
    MusicReference musicReference,
    Instant createdAt,
    Instant updatedAt
) {
    // Método de mutación inmutable
    public MeditationComposition withText(TextContent newText, Clock clock) {
        Objects.requireNonNull(newText, "textContent es requerido");
        return new MeditationComposition(
            this.id,
            newText,
            this.musicReference,
            this.createdAt,
            clock.instant()  // Actualiza updatedAt
        );
    }
    
    // Para campos opcionales (nullable)
    public MeditationComposition withMusic(MusicReference music, Clock clock) {
        return new MeditationComposition(
            this.id,
            this.textContent,
            music,  // Puede ser null
            this.createdAt,
            clock.instant()
        );
    }
    
    // Para eliminar campos opcionales
    public MeditationComposition withoutMusic(Clock clock) {
        return withMusic(null, clock);
    }
}
```

---

## 5. Optional para Campos Nullable

### 5.1 Regla General
- Los campos nullable en records DEBEN tener un accessor que retorne `Optional`
- Nombrar el accessor con sufijo `Opt` para claridad

### 5.2 Patrón de Accessors Opcionales

```java
public record MeditationComposition(
    UUID id,
    TextContent textContent,
    MusicReference musicReference,    // Puede ser null
    ImageReference imageReference     // Puede ser null
) {
    // Accessors que retornan Optional
    public Optional<MusicReference> musicReferenceOpt() {
        return Optional.ofNullable(musicReference);
    }
    
    public Optional<ImageReference> imageReferenceOpt() {
        return Optional.ofNullable(imageReference);
    }
}
```

### 5.3 Uso en Cliente

```java
composition.musicReferenceOpt()
    .ifPresent(music -> player.play(music));

String imagePath = composition.imageReferenceOpt()
    .map(ImageReference::value)
    .orElse("default-image.png");
```

---

## 6. Validación en Compact Constructor

### 6.1 Regla General
- **TODA** validación DEBE ir en el compact constructor del record
- Usar `Objects.requireNonNull()` para campos requeridos
- Lanzar `IllegalArgumentException` para validaciones de negocio

### 6.2 Orden de Validaciones

```java
public record ValueObject(String value, int quantity) {
    
    public ValueObject {
        // 1. Null checks primero
        Objects.requireNonNull(value, "value es requerido");
        
        // 2. Validaciones de formato/contenido
        if (value.isBlank()) {
            throw new IllegalArgumentException("value no puede estar vacío");
        }
        
        // 3. Validaciones de rango
        if (quantity < 0) {
            throw new IllegalArgumentException("quantity debe ser >= 0");
        }
        
        // 4. Validaciones de negocio complejas
        if (value.length() > 100 && quantity > 10) {
            throw new IllegalArgumentException(
                "Combinación value/quantity no permitida"
            );
        }
    }
}
```

---

## 7. Imports Requeridos

Para seguir estas prácticas, los siguientes imports son estándar:

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

### 8.1 Tests de Records

```java
@Test
void shouldCreateValidRecord() {
    TextContent content = new TextContent("Texto válido");
    assertThat(content.value()).isEqualTo("Texto válido");
}

@Test
void shouldRejectNullValue() {
    assertThatThrownBy(() -> new TextContent(null))
        .isInstanceOf(NullPointerException.class)
        .hasMessageContaining("requerido");
}

@Test
void shouldRejectInvalidValue() {
    assertThatThrownBy(() -> new TextContent(""))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("vacío");
}
```

### 8.2 Tests de Entidades con Clock

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
        Entity updated = original.withName("nuevo", laterClock);
        
        assertThat(updated.createdAt()).isEqualTo(FIXED_TIME);
        assertThat(updated.updatedAt()).isEqualTo(laterTime);
    }
}
```

---

## 9. Anti-Patterns (PROHIBIDO)

### ❌ NO usar clases mutables para Value Objects

```java
// ❌ PROHIBIDO
public class TextContent {
    private String value;
    public void setValue(String value) { this.value = value; }
}

// ✅ CORRECTO
public record TextContent(String value) { }
```

### ❌ NO usar String para IDs

```java
// ❌ PROHIBIDO
public record Entity(String id) { }

// ✅ CORRECTO
public record Entity(UUID id) { }
```

### ❌ NO usar Instant.now() directamente

```java
// ❌ PROHIBIDO
public static Entity create() {
    return new Entity(UUID.randomUUID(), Instant.now());
}

// ✅ CORRECTO
public static Entity create(Clock clock) {
    return new Entity(UUID.randomUUID(), clock.instant());
}
```

### ❌ NO exponer campos nullable sin Optional

```java
// ❌ PROHIBIDO (cliente no sabe que puede ser null)
public MusicReference musicReference() { return musicReference; }

// ✅ CORRECTO (explícito que es opcional)
public Optional<MusicReference> musicReferenceOpt() {
    return Optional.ofNullable(musicReference);
}
```

### ❌ NO mutar entidades

```java
// ❌ PROHIBIDO
entity.setName("nuevo");

// ✅ CORRECTO
Entity updated = entity.withName("nuevo", clock);
```

---

## 10. Checklist de Revisión

Antes de aprobar código Java, verificar:

- [ ] Value Objects son `record`
- [ ] Entities del dominio son `record` con API inmutable
- [ ] IDs usan `UUID`, no `String`
- [ ] Timestamps usan `Clock` inyectado, no `Instant.now()`
- [ ] Métodos de mutación retornan nueva instancia (`withX()`)
- [ ] Campos nullable tienen accessor `Optional` (`xOpt()`)
- [ ] Validación en compact constructor
- [ ] Tests usan `Clock.fixed()` para timestamps determinísticos
- [ ] `Objects.requireNonNull()` para campos requeridos

---

**FIN DEL DOCUMENTO**
