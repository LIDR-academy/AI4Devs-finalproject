# Implementation Plan: Compose Meditation Content with Optional AI Assistance

**Feature Branch**: `001-compose-meditation-content`  
**Created**: January 23, 2026  
**Status**: Ready for Execution  
**Source**: [spec.md](./spec.md)

---

## 📋 Plan Overview

This plan defines the **complete vertical pipeline** for implementing US2 "Compose Meditation Content" following strict adherence to:

- **Constitution 2.0.0** (`.specify/memory/constitution.md`)
- **Backend Delivery Playbook** (`.specify/instructions/delivery-playbook-backend.md`)
- **Frontend Delivery Playbook** (`.specify/instructions/delivery-playbook-frontend.md`)
- **Hexagonal Architecture** (strict layer separation)
- **DDD + TDD + API First + BDD-First**
- **CI/CD Gating** (no skips, no parallel anti-patterns)

### Key Characteristics
- **No persistence** in this US (session/UI state only)
- **AI integration** for text generation (explicit user action only)
- **Media preview** (music and image)
- **Output type indication** (podcast vs video based on image presence)

---

## 🎯 Pipeline Execution Order (IMMUTABLE)

```
1. BDD First           ← Define behavior (Cucumber .feature)
2. API First           ← Minimal OpenAPI contract
3. Domain              ← DDD + TDD (business logic)
4. Application         ← Use cases (orchestration)
5. Infrastructure      ← Adapters (AI, Media)
6. Controllers         ← REST endpoints
7. Frontend            ← UI + Client + State + Tests
8. Contracts           ← Provider/Consumer tests
9. E2E                 ← Backend + Frontend integration
10. CI/CD              ← Automated gates
```

**⚠️ CRITICAL**: No phase can start until previous phase is **GREEN**.

---

# Phase 1: BDD FIRST (Behavior Definition)

## 🎯 Objective
Define **ALL** observable behaviors in Given-When-Then scenarios using business language. This is the **single source of truth** for the entire implementation.

## 📦 Deliverables

### 1.1 Feature File
**Location**: `/backend/tests/bdd/meditationbuilder/compose-meditation-content.feature`

**Content Structure**:
```gherkin
Feature: Compose Meditation Content with Optional AI Assistance

  Background:
    Given the user is authenticated
    And the Meditation Builder is available

  # User Story 1: Manual Text Entry (P1)
  Scenario: User accesses Meditation Builder and sees mandatory text field
    Given the user is authenticated
    When the user accesses the Meditation Builder
    Then the user sees a mandatory text field for meditation content

  Scenario: User manually enters meditation text
    Given the user is in the Meditation Builder
    When the user types "Feel the calm energy flowing through your body" into the meditation text field
    Then the text is captured and displayed in the field

  Scenario: User-entered text is preserved
    Given the user has entered meditation text "Breathe deeply and relax"
    When the user reviews their input
    Then the text "Breathe deeply and relax" is preserved exactly as typed

  # User Story 2: Output Type Indication (P1)
  Scenario: System indicates podcast output when no image is selected
    Given the user has composed meditation content
    And no image is selected
    When the user reviews the composition
    Then the system indicates the output will be a podcast

  Scenario: System indicates video output when image is selected
    Given the user has composed meditation content
    And the user has selected an image
    When the user reviews the composition
    Then the system indicates the output will be a video

  Scenario: Output type changes from podcast to video when image is added
    Given the user has composed meditation content
    And no image is selected
    And the system indicates podcast output
    When the user selects an image
    Then the system immediately updates to indicate video output

  Scenario: Output type changes from video to podcast when image is removed
    Given the user has composed meditation content
    And an image is selected
    And the system indicates video output
    When the user removes the image selection
    Then the system immediately updates to indicate podcast output

  # User Story 3: AI Text Generation from Scratch (P2)
  Scenario: User requests AI generation with empty text field
    Given the user is authenticated
    And the meditation text field is empty
    When the user requests AI generation of meditation text
    Then the system populates the text field with a complete meditation script

  Scenario: AI-generated text is appropriate for meditation
    Given the meditation text field is empty
    When AI generation completes
    Then the generated text is calming, focused, and coherent

  # User Story 4: AI Text Enhancement from Existing Content (P3)
  Scenario: User requests AI generation with existing content
    Given the user has entered "mindfulness and breathing" in the text field
    When the user requests AI text generation
    Then the system generates new text that reflects or enhances "mindfulness and breathing"

  Scenario: AI incorporates themes from existing content
    Given the existing content contains themes about "ocean waves and relaxation"
    When AI generation is requested
    Then the new generated text incorporates or expands on ocean and relaxation themes

  Scenario: User can regenerate AI text multiple times
    Given the user is not satisfied with AI-generated text
    When the user requests generation again
    Then the system provides a different variation

  # User Story 5: Music Selection and Preview (P2)
  Scenario: User previews selected music
    Given the user has selected music "Calm Piano Melody"
    When the user requests to preview the music
    Then the system plays an audio preview of "Calm Piano Melody"

  Scenario: User controls music playback
    Given a music preview is playing
    When the user wants to stop it
    Then the user can pause or stop playback

  Scenario: No music selected shows appropriate state
    Given no music has been selected
    When the user is in the Meditation Builder
    Then the music preview option indicates no music is selected

  # User Story 6: Image Selection and Preview (P2)
  Scenario: User previews selected image
    Given the user has selected image "Sunset Beach"
    When the user requests to preview the image
    Then the system displays a preview of "Sunset Beach"

  Scenario: No image selected shows appropriate state
    Given no image has been selected
    When the user is in the Meditation Builder
    Then the image preview option indicates no image is selected

  # Edge Cases
  Scenario: AI service is temporarily unavailable
    Given the user requests AI text generation
    When the AI service is unavailable
    Then the system displays a user-friendly error message
    And the existing user content is preserved

  Scenario: User enters extremely long text
    Given the user enters 10000 characters of text
    When the system processes the input
    Then the text is accepted without performance degradation

  Scenario: User navigates away with unsaved content
    Given the user has composed meditation content
    When the user navigates away from the Meditation Builder
    Then the content remains in the session until explicitly cleared
```

### 1.2 Step Definitions (Pending)
**Location**: `/backend/tests/bdd/meditationbuilder/steps/ComposeMeditationSteps.java`

**Initial State**: All step definitions return `pending()` status.

```java
@Given("the user is authenticated")
public void userIsAuthenticated() {
    throw new io.cucumber.java.PendingException();
}

@When("the user accesses the Meditation Builder")
public void userAccessesMeditationBuilder() {
    throw new io.cucumber.java.PendingException();
}

@Then("the user sees a mandatory text field for meditation content")
public void userSeesMandatoryTextField() {
    throw new io.cucumber.java.PendingException();
}

// ... (all other step definitions pending)
```

### 1.3 Cucumber Configuration
**Location**: `/backend/tests/bdd/cucumber.properties`

```properties
cucumber.publish.quiet=true
cucumber.plugin=pretty,html:target/cucumber-reports/cucumber.html,json:target/cucumber-reports/cucumber.json
```

## ✅ Acceptance Criteria

- [ ] All scenarios in `.feature` file use **business language only** (no HTTP, JSON, DTOs)
- [ ] No technical implementation details in Given-When-Then
- [ ] Step definitions exist but are **pending** (throw PendingException)
- [ ] Cucumber runner executes and shows all scenarios as **PENDING** (yellow)
- [ ] Feature file reviewed and approved by PO + QA + Backend + Frontend
- [ ] No endpoints, models, or DTOs invented yet

## 🚫 Strictly Prohibited

- Implementing step definitions (they must remain pending)
- Adding HTTP calls, JSON parsing, or database queries to scenarios
- Creating OpenAPI contracts before BDD is finalized
- Writing any production code
- Mixing UI descriptions into BDD scenarios

## 🔗 Dependencies

- **None** (BDD is the starting point)

## 🛠️ Tools Required

- Cucumber JVM 7.x
- JUnit 5
- Maven Surefire Plugin

## 📊 Gate Validation

```bash
# Execute BDD tests - all should be PENDING
mvn test -Dtest=RunCucumberTest

# Expected output: X scenarios (X pending)
```

---

# Phase 2: API FIRST (Minimal Contract Definition)

## 🎯 Objective
Create the **minimum OpenAPI contract** required to support BDD scenarios. No extra endpoints, no extra fields.

## 📦 Deliverables

### 2.1 OpenAPI Specification
**Location**: `/backend/src/main/resources/openapi/meditationbuilder/compose-meditation-content.yaml`

**Endpoints Derived from BDD**:

1. **GET /api/v1/meditation-builder/composition** - Get current composition state (text, music, image, output type)
2. **PATCH /api/v1/meditation-builder/composition/text** - Update meditation text
3. **POST /api/v1/meditation-builder/composition/text/generate** - Generate AI text (empty or from existing)
4. **PATCH /api/v1/meditation-builder/composition/music** - Select music
5. **DELETE /api/v1/meditation-builder/composition/music** - Remove music selection
6. **GET /api/v1/meditation-builder/composition/music/preview** - Preview music
7. **PATCH /api/v1/meditation-builder/composition/image** - Select image
8. **DELETE /api/v1/meditation-builder/composition/image** - Remove image selection
9. **GET /api/v1/meditation-builder/composition/image/preview** - Preview image

**Key DTOs**:

```yaml
components:
  schemas:
    MeditationCompositionResponse:
      type: object
      required:
        - text
        - outputType
      properties:
        text:
          type: string
          description: Meditation text content (mandatory)
          maxLength: 10000
        musicId:
          type: string
          description: Selected music identifier (optional)
          nullable: true
        imageId:
          type: string
          description: Selected image identifier (optional)
          nullable: true
        outputType:
          type: string
          enum: [PODCAST, VIDEO]
          description: Derived output type based on image presence

    UpdateTextRequest:
      type: object
      required:
        - text
      properties:
        text:
          type: string
          maxLength: 10000

    GenerateTextRequest:
      type: object
      properties:
        existingText:
          type: string
          description: Current text for enhancement (optional)
          nullable: true

    GenerateTextResponse:
      type: object
      required:
        - generatedText
      properties:
        generatedText:
          type: string
          description: AI-generated meditation text

    SelectMusicRequest:
      type: object
      required:
        - musicId
      properties:
        musicId:
          type: string

    SelectImageRequest:
      type: object
      required:
        - imageId
      properties:
        imageId:
          type: string

    MusicPreviewResponse:
      type: object
      required:
        - previewUrl
        - title
      properties:
        previewUrl:
          type: string
          format: uri
        title:
          type: string

    ImagePreviewResponse:
      type: object
      required:
        - previewUrl
        - title
      properties:
        previewUrl:
          type: string
          format: uri
        title:
          type: string

    ErrorResponse:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: string
        message:
          type: string
        details:
          type: object
          additionalProperties: true
```

### 2.2 OpenAPI Validation
**Tool**: Spectral or OpenAPI Generator CLI

```bash
# Validate OpenAPI spec
openapi-generator validate -i /backend/src/main/resources/openapi/meditationbuilder/compose-meditation-content.yaml
```

## ✅ Acceptance Criteria

- [ ] OpenAPI YAML is **valid** and **lint-free**
- [ ] Every endpoint maps to a **When** clause in BDD
- [ ] No endpoints exist that aren't in BDD scenarios
- [ ] DTOs contain **only fields** required by BDD (no extras)
- [ ] Error responses defined (400, 401, 429, 500, 503)
- [ ] Authentication security scheme defined (Bearer token)
- [ ] Response examples provided for all 2xx responses

## 🚫 Strictly Prohibited

- Adding endpoints not present in BDD
- Adding DTO fields "for future use"
- Defining persistence models in OpenAPI
- Creating overly complex nested DTOs
- Mixing domain logic into API descriptions

## 🔗 Dependencies

- **Phase 1 (BDD)** must be GREEN (pending)

## 🛠️ Tools Required

- OpenAPI Generator 7.x
- Spectral (linting)
- Swagger UI (documentation)

## 📊 Gate Validation

```bash
# Lint OpenAPI spec
spectral lint /backend/src/main/resources/openapi/meditationbuilder/compose-meditation-content.yaml

# Generate API client (validation step)
openapi-generator generate \
  -i /backend/src/main/resources/openapi/meditationbuilder/compose-meditation-content.yaml \
  -g spring \
  --dry-run
```

---

# Phase 3: DOMAIN (DDD + TDD)

## 🎯 Objective
Implement **pure business logic** using Domain-Driven Design and Test-Driven Development. No Spring, no HTTP, no infrastructure.

## 📦 Deliverables

### 3.1 Domain Model
**Location**: `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/model/`

**Entities**:

1. **MeditationComposition** (Aggregate Root)
   ```java
   public class MeditationComposition {
       private MeditationText text;
       private Optional<MusicReference> music;
       private Optional<ImageReference> image;
       
       public OutputType getOutputType() {
           return image.isPresent() ? OutputType.VIDEO : OutputType.PODCAST;
       }
       
       public void updateText(String newText) {
           // Validate and update
       }
       
       public void selectMusic(String musicId) {
           // Business rules for music selection
       }
       
       public void removeMusic() {
           // Remove music reference
       }
       
       public void selectImage(String imageId) {
           // Business rules for image selection
       }
       
       public void removeImage() {
           // Remove image reference
       }
   }
   ```

2. **MeditationText** (Value Object)
   ```java
   public record MeditationText(String content) {
       public MeditationText {
           Objects.requireNonNull(content, "Meditation text cannot be null");
           if (content.length() > 10000) {
               throw new IllegalArgumentException("Text exceeds maximum length");
           }
       }
       
       public boolean isEmpty() {
           return content == null || content.isBlank();
       }
   }
   ```

3. **MusicReference** (Value Object)
   ```java
   public record MusicReference(String musicId) {
       public MusicReference {
           Objects.requireNonNull(musicId, "Music ID cannot be null");
       }
   }
   ```

4. **ImageReference** (Value Object)
   ```java
   public record ImageReference(String imageId) {
       public ImageReference {
           Objects.requireNonNull(imageId, "Image ID cannot be null");
       }
   }
   ```

### 3.2 Domain Enums
**Location**: `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/enums/`

```java
public enum OutputType {
    PODCAST,  // Audio-only (no image)
    VIDEO     // Audio + Visual (with image)
}
```

### 3.3 Domain Ports (OUT)
**Location**: `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/ports/out/`

```java
public interface TextGenerationPort {
    String generateMeditationText(Optional<String> existingText);
}

public interface MusicCatalogPort {
    Optional<MusicMetadata> getMusicMetadata(String musicId);
    String getMusicPreviewUrl(String musicId);
}

public interface ImageCatalogPort {
    Optional<ImageMetadata> getImageMetadata(String imageId);
    String getImagePreviewUrl(String imageId);
}
```

### 3.4 Domain Ports (IN)
**Location**: `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/ports/in/`

```java
public interface ComposeMeditationUseCase {
    MeditationComposition getComposition(String sessionId);
    void updateText(String sessionId, String text);
    String generateText(String sessionId, Optional<String> existingText);
    void selectMusic(String sessionId, String musicId);
    void removeMusic(String sessionId);
    MusicPreview previewMusic(String sessionId);
    void selectImage(String sessionId, String imageId);
    void removeImage(String sessionId);
    ImagePreview previewImage(String sessionId);
}
```

### 3.5 Domain Exceptions
**Location**: `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/exception/`

```java
public class TextGenerationException extends RuntimeException { }
public class MusicNotFoundException extends RuntimeException { }
public class ImageNotFoundException extends RuntimeException { }
public class InvalidCompositionException extends RuntimeException { }
```

### 3.6 Domain Tests (TDD)
**Location**: `/backend/src/test/java/com/hexagonal/meditationbuilder/domain/`

**Test Coverage**:

1. **MeditationCompositionTest**
   - Test output type derivation (podcast when no image, video when image present)
   - Test text update validation
   - Test music selection/removal
   - Test image selection/removal
   - Test output type changes when image is added/removed

2. **MeditationTextTest**
   - Test null rejection
   - Test empty text detection
   - Test max length validation (10,000 chars)

3. **Value Object Tests**
   - MusicReference validation
   - ImageReference validation

## ✅ Acceptance Criteria

- [ ] All domain classes are **pure Java** (no Spring annotations)
- [ ] No infrastructure dependencies (no HTTP, DB, JSON libraries)
- [ ] All business rules are **testable** without external systems
- [ ] TDD: Tests written **before** implementation
- [ ] Test coverage ≥ 90% for domain model
- [ ] All invariants enforced in constructors/methods
- [ ] Immutability where appropriate (Value Objects as records)

## 🚫 Strictly Prohibited

- Using Spring annotations (@Component, @Service, @Autowired)
- Calling external services directly
- Using JSON libraries (Jackson, Gson)
- Creating database entities in domain
- Mixing application logic with domain logic
- Creating "god" objects with excessive responsibilities

## 🔗 Dependencies

- **Phase 2 (API First)** must be approved

## 🛠️ Tools Required

- JUnit 5
- AssertJ
- Mockito (only for testing ports)

## 📊 Gate Validation

```bash
# Run domain tests
mvn test -Dtest=**/domain/**/*Test.java

# Check coverage
mvn jacoco:report
# Domain coverage must be ≥ 90%
```

---

# Phase 4: APPLICATION (Use Cases)

## 🎯 Objective
Implement **orchestration layer** that coordinates domain logic with infrastructure adapters. No business rules here.

## 📦 Deliverables

### 4.1 Use Case Implementations
**Location**: `/backend/src/main/java/com/hexagonal/meditationbuilder/application/service/`

```java
@Service
public class ComposeMeditationService implements ComposeMeditationUseCase {
    
    private final TextGenerationPort textGenerationPort;
    private final MusicCatalogPort musicCatalogPort;
    private final ImageCatalogPort imageCatalogPort;
    private final SessionStore sessionStore;
    
    @Override
    public MeditationComposition getComposition(String sessionId) {
        return sessionStore.getComposition(sessionId)
            .orElseGet(MeditationComposition::empty);
    }
    
    @Override
    public void updateText(String sessionId, String text) {
        MeditationComposition composition = getComposition(sessionId);
        composition.updateText(text);
        sessionStore.saveComposition(sessionId, composition);
    }
    
    @Override
    public String generateText(String sessionId, Optional<String> existingText) {
        String generated = textGenerationPort.generateMeditationText(existingText);
        updateText(sessionId, generated);
        return generated;
    }
    
    @Override
    public void selectMusic(String sessionId, String musicId) {
        // Validate music exists
        musicCatalogPort.getMusicMetadata(musicId)
            .orElseThrow(() -> new MusicNotFoundException(musicId));
        
        MeditationComposition composition = getComposition(sessionId);
        composition.selectMusic(musicId);
        sessionStore.saveComposition(sessionId, composition);
    }
    
    @Override
    public MusicPreview previewMusic(String sessionId) {
        MeditationComposition composition = getComposition(sessionId);
        String musicId = composition.getMusic()
            .orElseThrow(() -> new IllegalStateException("No music selected"))
            .musicId();
        
        String previewUrl = musicCatalogPort.getMusicPreviewUrl(musicId);
        MusicMetadata metadata = musicCatalogPort.getMusicMetadata(musicId).orElseThrow();
        
        return new MusicPreview(previewUrl, metadata.title());
    }
    
    // Similar implementations for image operations...
}
```

### 4.2 Application Validators
**Location**: `/backend/src/main/java/com/hexagonal/meditationbuilder/application/validator/`

```java
public class CompositionValidator {
    public void validateTextLength(String text) {
        if (text != null && text.length() > 10000) {
            throw new ValidationException("Text exceeds maximum length of 10,000 characters");
        }
    }
}
```

### 4.3 Application Mappers
**Location**: `/backend/src/main/java/com/hexagonal/meditationbuilder/application/mapper/`

```java
@Component
public class CompositionMapper {
    public MeditationCompositionResponse toResponse(MeditationComposition composition) {
        return new MeditationCompositionResponse(
            composition.getText().content(),
            composition.getMusic().map(MusicReference::musicId).orElse(null),
            composition.getImage().map(ImageReference::imageId).orElse(null),
            composition.getOutputType()
        );
    }
}
```

### 4.4 Session Store Interface
**Location**: `/backend/src/main/java/com/hexagonal/meditationbuilder/application/port/`

```java
public interface SessionStore {
    Optional<MeditationComposition> getComposition(String sessionId);
    void saveComposition(String sessionId, MeditationComposition composition);
}
```

### 4.5 Application Tests
**Location**: `/backend/src/test/java/com/hexagonal/meditationbuilder/application/`

**Test Coverage**:
- Use case orchestration (mocking ports)
- Validation logic
- Error handling and retries
- Mapper correctness

## ✅ Acceptance Criteria

- [ ] Use cases orchestrate domain + ports (no business logic)
- [ ] All external calls go through ports (no direct HTTP/DB)
- [ ] Validators only check syntax/format (not business rules)
- [ ] Mappers are bidirectional and tested
- [ ] Test coverage ≥ 80% for application layer
- [ ] All exceptions properly wrapped and propagated

## 🚫 Strictly Prohibited

- Business logic in use cases (belongs in domain)
- Direct infrastructure dependencies (use ports)
- Complex conditionals (delegate to domain)
- Creating new domain rules here

## 🔗 Dependencies

- **Phase 3 (Domain)** must be GREEN

## 🛠️ Tools Required

- Spring Context (DI only)
- Mockito (for port mocking)
- JUnit 5

## 📊 Gate Validation

```bash
# Run application tests
mvn test -Dtest=**/application/**/*Test.java

# Verify no domain logic leak
# Manual code review required
```

---

# Phase 5: INFRASTRUCTURE (Adapters)

## 🎯 Objective
Implement **external integrations** (AI, media catalogs, session storage) that fulfill domain ports.

## 📦 Deliverables

### 5.1 AI Text Generation Adapter
**Location**: `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/out/ai/`

```java
@Component
public class TextGenerationAiAdapter implements TextGenerationPort {
    
    private final RestClient aiClient;
    private final CircuitBreaker circuitBreaker;
    
    @Override
    public String generateMeditationText(Optional<String> existingText) {
        try {
            return circuitBreaker.executeSupplier(() -> {
                // Call external AI service (e.g., OpenAI, Claude, custom LLM)
                AIRequest request = buildRequest(existingText);
                AIResponse response = aiClient.post()
                    .uri("/generate")
                    .body(request)
                    .retrieve()
                    .body(AIResponse.class);
                
                return response.generatedText();
            });
        } catch (HttpClientErrorException.TooManyRequests ex) {
            throw new TextGenerationException("AI service rate limit exceeded", ex);
        } catch (HttpServerErrorException ex) {
            throw new TextGenerationException("AI service temporarily unavailable", ex);
        }
    }
    
    private AIRequest buildRequest(Optional<String> existingText) {
        String prompt = existingText.isPresent()
            ? "Enhance this meditation text: " + existingText.get()
            : "Generate a calming meditation script";
        
        return new AIRequest(prompt, 2000, 0.7);
    }
}
```

**Configuration**:
```java
@Configuration
public class AiClientConfig {
    @Bean
    public RestClient aiClient(@Value("${ai.service.url}") String baseUrl) {
        return RestClient.builder()
            .baseUrl(baseUrl)
            .requestInterceptor((request, body, execution) -> {
                request.getHeaders().setBearerAuth(getApiKey());
                return execution.execute(request, body);
            })
            .build();
    }
    
    @Bean
    public CircuitBreaker textGenerationCircuitBreaker() {
        return CircuitBreaker.of("ai-text-generation",
            CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofSeconds(30))
                .build());
    }
}
```

### 5.2 Music Catalog Adapter
**Location**: `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/out/media/`

```java
@Component
public class MusicCatalogAdapter implements MusicCatalogPort {
    
    private final RestClient mediaCatalogClient;
    
    @Override
    public Optional<MusicMetadata> getMusicMetadata(String musicId) {
        try {
            MusicDTO music = mediaCatalogClient.get()
                .uri("/music/{id}", musicId)
                .retrieve()
                .body(MusicDTO.class);
            
            return Optional.of(new MusicMetadata(music.id(), music.title(), music.duration()));
        } catch (HttpClientErrorException.NotFound ex) {
            return Optional.empty();
        }
    }
    
    @Override
    public String getMusicPreviewUrl(String musicId) {
        return mediaCatalogClient.get()
            .uri("/music/{id}/preview-url", musicId)
            .retrieve()
            .body(String.class);
    }
}
```

### 5.3 Image Catalog Adapter
**Location**: `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/out/media/`

```java
@Component
public class ImageCatalogAdapter implements ImageCatalogPort {
    
    private final RestClient mediaCatalogClient;
    
    @Override
    public Optional<ImageMetadata> getImageMetadata(String imageId) {
        try {
            ImageDTO image = mediaCatalogClient.get()
                .uri("/images/{id}", imageId)
                .retrieve()
                .body(ImageDTO.class);
            
            return Optional.of(new ImageMetadata(image.id(), image.title(), image.resolution()));
        } catch (HttpClientErrorException.NotFound ex) {
            return Optional.empty();
        }
    }
    
    @Override
    public String getImagePreviewUrl(String imageId) {
        return mediaCatalogClient.get()
            .uri("/images/{id}/preview-url", imageId)
            .retrieve()
            .body(String.class);
    }
}
```

### 5.4 Session Storage Adapter
**Location**: `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/out/session/`

```java
@Component
public class InMemorySessionStore implements SessionStore {
    
    private final Map<String, MeditationComposition> sessions = new ConcurrentHashMap<>();
    
    @Override
    public Optional<MeditationComposition> getComposition(String sessionId) {
        return Optional.ofNullable(sessions.get(sessionId));
    }
    
    @Override
    public void saveComposition(String sessionId, MeditationComposition composition) {
        sessions.put(sessionId, composition);
    }
    
    @Scheduled(fixedDelay = 3600000) // Clean up every hour
    public void cleanupExpiredSessions() {
        // Remove sessions older than 24 hours
    }
}
```

### 5.5 Infrastructure Tests
**Location**: `/backend/src/test/java/com/hexagonal/meditationbuilder/infrastructure/`

**Test Strategy**:
- Use **Testcontainers** for external service mocking (WireMock for REST APIs)
- Test retry logic, circuit breakers, timeout handling
- Test error mapping (429 → rate limit, 503 → unavailable)
- Test session expiration and cleanup

**Example**:
```java
@Testcontainers
class TextGenerationAiAdapterIntegrationTest {
    
    @Container
    static WireMockContainer wireMock = new WireMockContainer("wiremock/wiremock:latest");
    
    @Test
    void shouldGenerateTextSuccessfully() {
        // Stub AI service response
        wireMock.stubFor(post("/generate")
            .willReturn(ok()
                .withHeader("Content-Type", "application/json")
                .withBody("{\"generatedText\": \"Feel the calm...\"}")));
        
        TextGenerationPort adapter = new TextGenerationAiAdapter(buildClient());
        
        String result = adapter.generateMeditationText(Optional.empty());
        
        assertThat(result).contains("Feel the calm");
    }
    
    @Test
    void shouldHandleRateLimitGracefully() {
        wireMock.stubFor(post("/generate")
            .willReturn(status(429)));
        
        assertThatThrownBy(() -> adapter.generateMeditationText(Optional.empty()))
            .isInstanceOf(TextGenerationException.class)
            .hasMessageContaining("rate limit");
    }
}
```

## ✅ Acceptance Criteria

- [ ] All adapters implement domain ports
- [ ] No business logic in adapters (pure translation)
- [ ] Circuit breakers configured for external calls
- [ ] Retries with exponential backoff for transient failures
- [ ] Error codes properly mapped (429 → RateLimitException, 503 → ServiceUnavailableException)
- [ ] Integration tests use Testcontainers (no real external services)
- [ ] Test coverage ≥ 70% for infrastructure layer
- [ ] Observability: logs include correlation IDs, metrics for external calls

## 🚫 Strictly Prohibited

- Business logic in adapters
- Direct domain model manipulation
- Hardcoded credentials (use environment variables)
- Logging sensitive data (AI prompts, user tokens)
- Synchronous blocking calls without timeouts

## 🔗 Dependencies

- **Phase 4 (Application)** must be GREEN

## 🛠️ Tools Required

- Spring RestClient
- Resilience4j (Circuit Breaker)
- Testcontainers
- WireMock
- Micrometer (metrics)

## 📊 Gate Validation

```bash
# Run infrastructure integration tests
mvn verify -Dtest=**/infrastructure/**/*IntegrationTest.java

# Verify circuit breakers work
# Manual testing with service disruption
```

---

# Phase 6: CONTROLLERS (REST Adapters)

## 🎯 Objective
Expose domain use cases via **REST endpoints** strictly adhering to OpenAPI contract.

## 📦 Deliverables

### 6.1 Controller Implementation
**Location**: `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/in/rest/controller/`

```java
@RestController
@RequestMapping("/api/v1/meditation-builder/composition")
@Validated
public class MeditationCompositionController {
    
    private final ComposeMeditationUseCase composeMeditationUseCase;
    private final CompositionMapper mapper;
    
    @GetMapping
    public ResponseEntity<MeditationCompositionResponse> getComposition(
            @RequestHeader("X-Session-Id") String sessionId) {
        
        MeditationComposition composition = composeMeditationUseCase.getComposition(sessionId);
        return ResponseEntity.ok(mapper.toResponse(composition));
    }
    
    @PatchMapping("/text")
    public ResponseEntity<Void> updateText(
            @RequestHeader("X-Session-Id") String sessionId,
            @Valid @RequestBody UpdateTextRequest request) {
        
        composeMeditationUseCase.updateText(sessionId, request.text());
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/text/generate")
    public ResponseEntity<GenerateTextResponse> generateText(
            @RequestHeader("X-Session-Id") String sessionId,
            @RequestBody GenerateTextRequest request) {
        
        String generated = composeMeditationUseCase.generateText(
            sessionId,
            Optional.ofNullable(request.existingText())
        );
        
        return ResponseEntity.ok(new GenerateTextResponse(generated));
    }
    
    @PatchMapping("/music")
    public ResponseEntity<Void> selectMusic(
            @RequestHeader("X-Session-Id") String sessionId,
            @Valid @RequestBody SelectMusicRequest request) {
        
        composeMeditationUseCase.selectMusic(sessionId, request.musicId());
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/music")
    public ResponseEntity<Void> removeMusic(
            @RequestHeader("X-Session-Id") String sessionId) {
        
        composeMeditationUseCase.removeMusic(sessionId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/music/preview")
    public ResponseEntity<MusicPreviewResponse> previewMusic(
            @RequestHeader("X-Session-Id") String sessionId) {
        
        MusicPreview preview = composeMeditationUseCase.previewMusic(sessionId);
        return ResponseEntity.ok(new MusicPreviewResponse(
            preview.previewUrl(),
            preview.title()
        ));
    }
    
    // Similar methods for image operations...
}
```

### 6.2 Request/Response DTOs
**Location**: `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/in/rest/dto/`

```java
public record UpdateTextRequest(
    @NotNull @Size(max = 10000) String text
) {}

public record GenerateTextRequest(
    @Size(max = 10000) String existingText
) {}

public record GenerateTextResponse(
    @NotNull String generatedText
) {}

public record SelectMusicRequest(
    @NotNull String musicId
) {}

public record SelectImageRequest(
    @NotNull String imageId
) {}

public record MeditationCompositionResponse(
    @NotNull String text,
    String musicId,
    String imageId,
    @NotNull OutputType outputType
) {}

public record MusicPreviewResponse(
    @NotNull String previewUrl,
    @NotNull String title
) {}

public record ImagePreviewResponse(
    @NotNull String previewUrl,
    @NotNull String title
) {}
```

### 6.3 Global Exception Handler
**Location**: `/backend/src/main/java/com/hexagonal/shared/errorhandler/`

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(TextGenerationException.class)
    public ResponseEntity<ErrorResponse> handleTextGeneration(TextGenerationException ex) {
        if (ex.getMessage().contains("rate limit")) {
            return ResponseEntity.status(429)
                .body(new ErrorResponse("RATE_LIMIT_EXCEEDED", ex.getMessage()));
        }
        return ResponseEntity.status(503)
            .body(new ErrorResponse("AI_SERVICE_UNAVAILABLE", ex.getMessage()));
    }
    
    @ExceptionHandler(MusicNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleMusicNotFound(MusicNotFoundException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse("MUSIC_NOT_FOUND", ex.getMessage()));
    }
    
    @ExceptionHandler(ImageNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleImageNotFound(ImageNotFoundException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse("IMAGE_NOT_FOUND", ex.getMessage()));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("VALIDATION_ERROR", "Invalid request"));
    }
}
```

### 6.4 Controller Tests
**Location**: `/backend/src/test/java/com/hexagonal/meditationbuilder/infrastructure/in/rest/controller/`

```java
@WebMvcTest(MeditationCompositionController.class)
class MeditationCompositionControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private ComposeMeditationUseCase useCase;
    
    @Test
    void shouldGetComposition() throws Exception {
        MeditationComposition composition = createTestComposition();
        when(useCase.getComposition("session-123")).thenReturn(composition);
        
        mockMvc.perform(get("/api/v1/meditation-builder/composition")
                .header("X-Session-Id", "session-123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.text").exists())
            .andExpect(jsonPath("$.outputType").value("PODCAST"));
    }
    
    @Test
    void shouldUpdateText() throws Exception {
        mockMvc.perform(patch("/api/v1/meditation-builder/composition/text")
                .header("X-Session-Id", "session-123")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"text\": \"New meditation text\"}"))
            .andExpect(status().isNoContent());
        
        verify(useCase).updateText("session-123", "New meditation text");
    }
    
    @Test
    void shouldReturn429WhenRateLimited() throws Exception {
        when(useCase.generateText(any(), any()))
            .thenThrow(new TextGenerationException("rate limit exceeded"));
        
        mockMvc.perform(post("/api/v1/meditation-builder/composition/text/generate")
                .header("X-Session-Id", "session-123")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isTooManyRequests())
            .andExpect(jsonPath("$.code").value("RATE_LIMIT_EXCEEDED"));
    }
}
```

## ✅ Acceptance Criteria

- [ ] All endpoints exactly match OpenAPI specification
- [ ] No business logic in controllers (only delegation)
- [ ] Request validation uses Bean Validation annotations
- [ ] HTTP status codes match OpenAPI (200, 204, 400, 401, 404, 429, 500, 503)
- [ ] Error responses follow standard ErrorResponse schema
- [ ] Authentication enforced via Spring Security (Bearer token)
- [ ] Test coverage ≥ 80% for controllers
- [ ] OpenAPI contract tests pass (Pact/Spring Cloud Contract)

## 🚫 Strictly Prohibited

- Business logic in controllers
- Direct database or external service calls
- Complex conditionals (if/else chains)
- Creating domain objects (use mappers)
- Returning domain objects directly (use DTOs)

## 🔗 Dependencies

- **Phase 5 (Infrastructure)** must be GREEN

## 🛠️ Tools Required

- Spring Web MVC
- Spring Validation
- MockMvc (testing)
- RestAssured (contract testing)

## 📊 Gate Validation

```bash
# Run controller tests
mvn test -Dtest=**/controller/**/*Test.java

# Validate against OpenAPI spec
# (OpenAPI Generator plugin validation)
```

---

# Phase 7: FRONTEND (UI + Client + State + Tests)

## 🎯 Objective
Build **React UI** that consumes backend API via autogenerated client, manages state with React Query + Zustand, and provides user-friendly meditation composition experience.

## 📦 Deliverables

### 7.1 OpenAPI Client Generation
**Location**: `/frontend/src/api/generated/`

```bash
# Generate TypeScript client from backend OpenAPI spec
npm run generate:api

# Command defined in package.json:
# "generate:api": "openapi-generator-cli generate -i ../backend/src/main/resources/openapi/meditationbuilder/compose-meditation-content.yaml -g typescript-fetch -o src/api/generated"
```

### 7.2 API Client Wrapper
**Location**: `/frontend/src/api/meditation-composer-client.ts`

```typescript
import { Configuration, MeditationCompositionApi } from './generated';

const config = new Configuration({
  basePath: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${getAuthToken()}`,
    'X-Session-Id': getSessionId(),
  },
});

export const meditationComposerApi = new MeditationCompositionApi(config);

// Helper functions
export async function getComposition() {
  return meditationComposerApi.getComposition();
}

export async function updateText(text: string) {
  return meditationComposerApi.updateText({ text });
}

export async function generateText(existingText?: string) {
  return meditationComposerApi.generateText({ existingText });
}

// ... other API methods
```

### 7.3 React Query Hooks
**Location**: `/frontend/src/hooks/useMeditationComposition.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meditationComposerApi } from '@/api/meditation-composer-client';

export function useMeditationComposition() {
  return useQuery({
    queryKey: ['meditation-composition'],
    queryFn: () => meditationComposerApi.getComposition(),
    staleTime: 30000, // 30 seconds
  });
}

export function useUpdateText() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (text: string) => meditationComposerApi.updateText({ text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meditation-composition'] });
    },
  });
}

export function useGenerateText() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (existingText?: string) => 
      meditationComposerApi.generateText({ existingText }),
    onSuccess: (response) => {
      // Update composition with generated text
      queryClient.setQueryData(['meditation-composition'], (old: any) => ({
        ...old,
        text: response.generatedText,
      }));
    },
  });
}

export function useSelectMusic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (musicId: string) => meditationComposerApi.selectMusic({ musicId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meditation-composition'] });
    },
  });
}

// Similar hooks for removeMusic, selectImage, removeImage, previewMusic, previewImage
```

### 7.4 Zustand Store (UI State)
**Location**: `/frontend/src/state/composer-ui-store.ts`

```typescript
import { create } from 'zustand';

interface ComposerUIState {
  isGeneratingText: boolean;
  isMusicPreviewPlaying: boolean;
  showImagePreview: boolean;
  
  setGeneratingText: (isGenerating: boolean) => void;
  setMusicPreviewPlaying: (isPlaying: boolean) => void;
  setShowImagePreview: (show: boolean) => void;
}

export const useComposerUIStore = create<ComposerUIState>((set) => ({
  isGeneratingText: false,
  isMusicPreviewPlaying: false,
  showImagePreview: false,
  
  setGeneratingText: (isGenerating) => set({ isGeneratingText: isGenerating }),
  setMusicPreviewPlaying: (isPlaying) => set({ isMusicPreviewPlaying: isPlaying }),
  setShowImagePreview: (show) => set({ showImagePreview: show }),
}));
```

### 7.5 Main Page Component
**Location**: `/frontend/src/pages/MeditationBuilderPage.tsx`

```typescript
import React from 'react';
import { TextSection } from '@/components/TextSection';
import { MusicSection } from '@/components/MusicSection';
import { ImageSection } from '@/components/ImageSection';
import { OutputTypeIndicator } from '@/components/OutputTypeIndicator';
import { useMeditationComposition } from '@/hooks/useMeditationComposition';

export function MeditationBuilderPage() {
  const { data: composition, isLoading, error } = useMeditationComposition();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className="meditation-builder">
      <h1>Meditation Builder</h1>
      
      <TextSection initialText={composition?.text} />
      
      <MusicSection selectedMusicId={composition?.musicId} />
      
      <ImageSection selectedImageId={composition?.imageId} />
      
      <OutputTypeIndicator 
        outputType={composition?.outputType} 
        hasImage={!!composition?.imageId}
      />
    </div>
  );
}
```

### 7.6 Text Section Component
**Location**: `/frontend/src/components/TextSection.tsx`

```typescript
import React, { useState } from 'react';
import { useUpdateText, useGenerateText } from '@/hooks/useMeditationComposition';
import { useComposerUIStore } from '@/state/composer-ui-store';

interface TextSectionProps {
  initialText?: string;
}

export function TextSection({ initialText = '' }: TextSectionProps) {
  const [text, setText] = useState(initialText);
  const updateTextMutation = useUpdateText();
  const generateTextMutation = useGenerateText();
  const { isGeneratingText, setGeneratingText } = useComposerUIStore();
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    updateTextMutation.mutate(newText);
  };
  
  const handleGenerateText = async () => {
    setGeneratingText(true);
    try {
      const result = await generateTextMutation.mutateAsync(text || undefined);
      setText(result.generatedText);
    } finally {
      setGeneratingText(false);
    }
  };
  
  return (
    <section className="text-section">
      <label htmlFor="meditation-text">
        Meditation Text <span className="required">*</span>
      </label>
      
      <textarea
        id="meditation-text"
        value={text}
        onChange={handleTextChange}
        maxLength={10000}
        placeholder="Enter your meditation text here..."
        disabled={isGeneratingText}
      />
      
      <button
        onClick={handleGenerateText}
        disabled={isGeneratingText}
      >
        {isGeneratingText ? 'Generating...' : 'Generate with AI'}
      </button>
      
      {generateTextMutation.error && (
        <ErrorMessage error={generateTextMutation.error} />
      )}
    </section>
  );
}
```

### 7.7 Output Type Indicator Component
**Location**: `/frontend/src/components/OutputTypeIndicator.tsx`

```typescript
import React from 'react';
import { OutputType } from '@/api/generated';

interface OutputTypeIndicatorProps {
  outputType?: OutputType;
  hasImage: boolean;
}

export function OutputTypeIndicator({ outputType, hasImage }: OutputTypeIndicatorProps) {
  const label = hasImage ? 'Generate Video' : 'Generate Podcast';
  const icon = hasImage ? '🎬' : '🎙️';
  
  return (
    <div className="output-type-indicator">
      <div className="output-type-display">
        <span className="icon">{icon}</span>
        <span className="label">{label}</span>
      </div>
      
      <p className="output-type-description">
        {hasImage 
          ? 'Your meditation will be generated as a video with the selected image.'
          : 'Your meditation will be generated as an audio-only podcast.'}
      </p>
    </div>
  );
}
```

### 7.8 Unit Tests (RTL)
**Location**: `/frontend/tests/unit/components/TextSection.spec.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TextSection } from '@/components/TextSection';
import { vi } from 'vitest';

describe('TextSection', () => {
  it('should render text area with initial text', () => {
    render(<TextSection initialText="Initial text" />, { wrapper: createWrapper() });
    
    const textarea = screen.getByLabelText(/Meditation Text/);
    expect(textarea).toHaveValue('Initial text');
  });
  
  it('should show required indicator', () => {
    render(<TextSection />, { wrapper: createWrapper() });
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });
  
  it('should update text on user input', async () => {
    const { container } = render(<TextSection />, { wrapper: createWrapper() });
    
    const textarea = screen.getByLabelText(/Meditation Text/);
    fireEvent.change(textarea, { target: { value: 'New text' } });
    
    await waitFor(() => {
      expect(textarea).toHaveValue('New text');
    });
  });
  
  it('should disable textarea while generating AI text', async () => {
    render(<TextSection />, { wrapper: createWrapper() });
    
    const generateButton = screen.getByText(/Generate with AI/);
    fireEvent.click(generateButton);
    
    const textarea = screen.getByLabelText(/Meditation Text/);
    expect(textarea).toBeDisabled();
  });
});
```

### 7.9 Integration Tests (RTL + MSW)
**Location**: `/frontend/tests/integration/MeditationBuilder.integration.spec.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { MeditationBuilderPage } from '@/pages/MeditationBuilderPage';

const server = setupServer(
  rest.get('/api/v1/meditation-builder/composition', (req, res, ctx) => {
    return res(ctx.json({
      text: 'Initial meditation text',
      musicId: null,
      imageId: null,
      outputType: 'PODCAST',
    }));
  }),
  
  rest.post('/api/v1/meditation-builder/composition/text/generate', (req, res, ctx) => {
    return res(ctx.json({
      generatedText: 'AI generated meditation: Feel the calm...',
    }));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Meditation Builder Integration', () => {
  it('should load composition and display output type as podcast', async () => {
    render(<MeditationBuilderPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Generate Podcast/)).toBeInTheDocument();
    });
  });
  
  it('should change output type to video when image is selected', async () => {
    server.use(
      rest.patch('/api/v1/meditation-builder/composition/image', (req, res, ctx) => {
        return res(ctx.status(204));
      }),
      rest.get('/api/v1/meditation-builder/composition', (req, res, ctx) => {
        return res(ctx.json({
          text: 'Text',
          musicId: null,
          imageId: 'img-123',
          outputType: 'VIDEO',
        }));
      }),
    );
    
    render(<MeditationBuilderPage />);
    
    const selectImageButton = await screen.findByText(/Select Image/);
    fireEvent.click(selectImageButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Generate Video/)).toBeInTheDocument();
    });
  });
});
```

## ✅ Acceptance Criteria

- [ ] OpenAPI client successfully generated from backend spec
- [ ] All API calls use autogenerated client (no manual fetch/axios)
- [ ] React Query manages all server state
- [ ] Zustand manages only UI state (no server data duplication)
- [ ] Components are presentational (no business logic)
- [ ] Output type indicator updates immediately when image is added/removed
- [ ] Error states handled gracefully (AI failures, rate limits)
- [ ] Loading states visible for async operations
- [ ] Unit test coverage ≥ 70%
- [ ] Integration test coverage ≥ 60%

## 🚫 Strictly Prohibited

- Manual HTTP calls (must use generated client)
- Business logic in components (if/else chains with rules)
- Storing server data in Zustand (use React Query)
- Direct manipulation of DOM
- Hardcoded API URLs (use environment variables)

## 🔗 Dependencies

- **Phase 6 (Controllers)** must be GREEN and deployed to test environment

## 🛠️ Tools Required

- OpenAPI Generator (TypeScript Fetch)
- React Query (TanStack Query)
- Zustand
- Vitest + RTL (Testing Library)
- MSW (Mock Service Worker)

## 📊 Gate Validation

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Check coverage
npm run test:coverage
# Unit ≥ 70%, Integration ≥ 60%
```

---

# Phase 8: CONTRACTS (Provider/Consumer Tests)

## 🎯 Objective
Ensure **backend fulfills OpenAPI contract** and **frontend consumes it correctly**. Prevent breaking changes.

## 📦 Deliverables

### 8.1 Provider Contract Tests (Backend)
**Location**: `/backend/tests/contracts/MeditationCompositionContractTest.java`

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class MeditationCompositionContractTest {
    
    @LocalServerPort
    private int port;
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void shouldConformToOpenAPISpecForGetComposition() {
        ResponseEntity<String> response = restTemplate.exchange(
            "/api/v1/meditation-builder/composition",
            HttpMethod.GET,
            createRequestWithSession(),
            String.class
        );
        
        // Validate against OpenAPI schema
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        
        // JSON Schema validation
        JsonSchemaValidator.validate(response.getBody(), 
            "schemas/MeditationCompositionResponse.json");
    }
    
    @Test
    void shouldReturn429WhenRateLimitExceeded() {
        // Trigger rate limit
        for (int i = 0; i < 100; i++) {
            restTemplate.postForEntity(
                "/api/v1/meditation-builder/composition/text/generate",
                new GenerateTextRequest(null),
                String.class
            );
        }
        
        ResponseEntity<String> response = restTemplate.postForEntity(
            "/api/v1/meditation-builder/composition/text/generate",
            new GenerateTextRequest(null),
            String.class
        );
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        assertThat(response.getBody()).contains("RATE_LIMIT_EXCEEDED");
    }
    
    @Test
    void shouldValidateAllErrorResponsesMatchSchema() {
        // Test 400, 401, 404, 429, 500, 503 all return ErrorResponse schema
    }
}
```

### 8.2 Consumer Contract Tests (Frontend)
**Location**: `/frontend/tests/contracts/api-contract.spec.ts`

```typescript
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { meditationComposerApi } from '@/api/meditation-composer-client';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API Contract - Consumer Side', () => {
  it('should handle successful composition retrieval', async () => {
    server.use(
      rest.get('/api/v1/meditation-builder/composition', (req, res, ctx) => {
        // Response must match OpenAPI schema
        return res(ctx.json({
          text: 'Sample meditation text',
          musicId: null,
          imageId: null,
          outputType: 'PODCAST',
        }));
      })
    );
    
    const composition = await meditationComposerApi.getComposition();
    
    expect(composition).toHaveProperty('text');
    expect(composition).toHaveProperty('outputType');
    expect(['PODCAST', 'VIDEO']).toContain(composition.outputType);
  });
  
  it('should handle rate limit error correctly', async () => {
    server.use(
      rest.post('/api/v1/meditation-builder/composition/text/generate', (req, res, ctx) => {
        return res(
          ctx.status(429),
          ctx.json({
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
          })
        );
      })
    );
    
    await expect(
      meditationComposerApi.generateText({})
    ).rejects.toThrow(/429/);
  });
});
```

### 8.3 OpenAPI Schema Validation
**Tool**: OpenAPI Schema Validator

```bash
# Validate all responses against OpenAPI spec
npm run test:contracts

# Backend validation
mvn verify -Dtest=**/*ContractTest.java
```

## ✅ Acceptance Criteria

- [ ] Provider tests validate all endpoints return responses matching OpenAPI schemas
- [ ] Consumer tests verify frontend can parse all backend responses
- [ ] All error codes (400, 401, 404, 429, 500, 503) tested
- [ ] OpenAPI spec changes trigger contract test failures
- [ ] Contract tests run in CI pipeline before integration tests

## 🚫 Strictly Prohibited

- Skipping contract tests ("we'll test manually")
- Modifying OpenAPI without updating contract tests
- Allowing breaking changes without version increment

## 🔗 Dependencies

- **Phase 7 (Frontend)** must be completed

## 🛠️ Tools Required

- JSON Schema Validator
- Spring REST Docs (optional, for documentation)
- Pact (alternative to custom contract tests)
- MSW (frontend mocking)

## 📊 Gate Validation

```bash
# Backend contract tests
mvn verify -Dtest=**/*ContractTest.java

# Frontend contract tests
npm run test:contracts

# Both must pass before E2E
```

---

# Phase 9: E2E (End-to-End Testing)

## 🎯 Objective
Validate **complete user journeys** from UI through backend to external services (mocked if necessary).

## 📦 Deliverables

### 9.1 Playwright E2E Tests (Frontend)
**Location**: `/frontend/tests/e2e/meditation-builder.e2e.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Meditation Builder E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/auth/**', route => route.fulfill({
      status: 200,
      body: JSON.stringify({ token: 'mock-token' }),
    }));
    
    await page.goto('/meditation-builder');
  });
  
  test('User can manually enter meditation text', async ({ page }) => {
    const textarea = page.locator('textarea[id="meditation-text"]');
    await expect(textarea).toBeVisible();
    
    await textarea.fill('Feel the calm energy flowing through your body');
    await expect(textarea).toHaveValue('Feel the calm energy flowing through your body');
    
    // Verify output type shows podcast (no image)
    await expect(page.locator('text=Generate Podcast')).toBeVisible();
  });
  
  test('Output type changes from podcast to video when image is selected', async ({ page }) => {
    // Initially shows podcast
    await expect(page.locator('text=Generate Podcast')).toBeVisible();
    
    // Select an image
    await page.click('button:has-text("Select Image")');
    await page.click('[data-testid="image-sunset-beach"]');
    
    // Output type changes to video immediately
    await expect(page.locator('text=Generate Video')).toBeVisible();
    await expect(page.locator('text=Generate Podcast')).not.toBeVisible();
  });
  
  test('User can generate AI text from scratch', async ({ page }) => {
    const textarea = page.locator('textarea[id="meditation-text"]');
    const generateButton = page.locator('button:has-text("Generate with AI")');
    
    await generateButton.click();
    
    // Show loading state
    await expect(generateButton).toBeDisabled();
    await expect(page.locator('text=Generating...')).toBeVisible();
    
    // Wait for AI generation
    await expect(textarea).toHaveValue(/Feel the calm/, { timeout: 10000 });
    await expect(generateButton).toBeEnabled();
  });
  
  test('User can preview selected music', async ({ page }) => {
    // Select music
    await page.click('button:has-text("Select Music")');
    await page.click('[data-testid="music-calm-piano"]');
    
    // Preview button appears
    const previewButton = page.locator('button:has-text("Preview Music")');
    await expect(previewButton).toBeVisible();
    
    await previewButton.click();
    
    // Audio player controls visible
    await expect(page.locator('audio')).toBeVisible();
    await expect(page.locator('button:has-text("Stop")')).toBeVisible();
  });
  
  test('AI service failure shows user-friendly error', async ({ page }) => {
    // Mock AI service failure
    await page.route('**/composition/text/generate', route => route.fulfill({
      status: 503,
      body: JSON.stringify({
        code: 'AI_SERVICE_UNAVAILABLE',
        message: 'AI service is temporarily unavailable',
      }),
    }));
    
    await page.click('button:has-text("Generate with AI")');
    
    // Error message shown
    await expect(page.locator('text=AI service is temporarily unavailable')).toBeVisible();
    
    // Existing content preserved
    const textarea = page.locator('textarea[id="meditation-text"]');
    await textarea.fill('My existing text');
    await page.click('button:has-text("Generate with AI")');
    await expect(textarea).toHaveValue('My existing text');
  });
  
  test('Session persists content across page refreshes', async ({ page }) => {
    const textarea = page.locator('textarea[id="meditation-text"]');
    await textarea.fill('Persistent content');
    
    await page.reload();
    
    await expect(textarea).toHaveValue('Persistent content');
  });
});
```

### 9.2 Cucumber E2E Tests (Backend)
**Location**: `/backend/tests/e2e/compose-meditation.e2e.feature`

```gherkin
Feature: Compose Meditation E2E

  @e2e
  Scenario: Complete meditation composition flow
    Given the user is authenticated with session "e2e-session-123"
    When the user accesses the Meditation Builder
    Then the system returns an empty composition
    And the output type is "PODCAST"
    
    When the user enters meditation text "Breathe deeply and relax"
    Then the composition text is "Breathe deeply and relax"
    
    When the user selects music "calm-piano-melody"
    Then the composition includes music "calm-piano-melody"
    And the output type is still "PODCAST"
    
    When the user selects image "sunset-beach"
    Then the composition includes image "sunset-beach"
    And the output type changes to "VIDEO"
    
    When the user removes the image
    Then the composition no longer includes an image
    And the output type reverts to "PODCAST"
```

**Step Definitions**:
```java
@Given("the user is authenticated with session {string}")
public void authenticatedWithSession(String sessionId) {
    this.sessionId = sessionId;
    this.headers = new HttpHeaders();
    headers.set("X-Session-Id", sessionId);
    headers.setBearerAuth(getTestToken());
}

@When("the user enters meditation text {string}")
public void userEntersText(String text) {
    HttpEntity<UpdateTextRequest> request = new HttpEntity<>(
        new UpdateTextRequest(text), headers);
    
    ResponseEntity<Void> response = restTemplate.exchange(
        baseUrl + "/api/v1/meditation-builder/composition/text",
        HttpMethod.PATCH,
        request,
        Void.class
    );
    
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
}

@Then("the output type changes to {string}")
public void outputTypeChangesTo(String expectedType) {
    ResponseEntity<MeditationCompositionResponse> response = 
        restTemplate.exchange(
            baseUrl + "/api/v1/meditation-builder/composition",
            HttpMethod.GET,
            new HttpEntity<>(headers),
            MeditationCompositionResponse.class
        );
    
    assertThat(response.getBody().outputType().toString())
        .isEqualTo(expectedType);
}
```

## ✅ Acceptance Criteria

- [ ] All BDD scenarios from Phase 1 have corresponding E2E tests
- [ ] E2E tests run against real backend (not mocked)
- [ ] External services (AI, media catalog) can be mocked in E2E environment
- [ ] Tests verify complete user journeys (multi-step flows)
- [ ] Performance validated (text entry < 2s, AI generation < 8s, previews < 2s)
- [ ] Error scenarios tested (AI failures, rate limits, invalid data)
- [ ] E2E tests pass in CI environment

## 🚫 Strictly Prohibited

- Using production external services in E2E tests
- Skipping E2E for "time constraints"
- Hardcoding test data that couples tests together

## 🔗 Dependencies

- **Phase 8 (Contracts)** must be GREEN
- Backend deployed to test environment
- Frontend built and served

## 🛠️ Tools Required

- Playwright (frontend E2E)
- Cucumber JVM (backend E2E)
- Testcontainers (for external service mocking)
- WireMock (for AI service mocking)

## 📊 Gate Validation

```bash
# Frontend E2E
npm run test:e2e

# Backend E2E
mvn verify -Dtest=**/*E2ETest.java

# Both must pass for deployment approval
```

---

# Phase 10: CI/CD (Continuous Integration & Deployment)

## 🎯 Objective
Automate **build, test, and deployment pipeline** with strict quality gates.

## 📦 Deliverables

### 10.1 GitHub Actions Workflow
**Location**: `.github/workflows/meditation-builder-pipeline.yml`

```yaml
name: Meditation Builder CI/CD

on:
  push:
    branches: [main, develop, 'feature/**']
  pull_request:
    branches: [main, develop]

env:
  JAVA_VERSION: '21'
  NODE_VERSION: '20'

jobs:
  # Gate 1: BDD
  bdd:
    name: BDD Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: 'temurin'
      
      - name: Run BDD Tests
        working-directory: ./backend
        run: mvn test -Dtest=RunCucumberTest
      
      - name: Upload BDD Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: bdd-report
          path: backend/target/cucumber-reports/

  # Gate 2: API Validation
  api-validation:
    name: OpenAPI Validation
    runs-on: ubuntu-latest
    needs: bdd
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate OpenAPI Specs
        run: |
          npm install -g @stoplight/spectral-cli
          spectral lint backend/src/main/resources/openapi/**/*.yaml

  # Gate 3: Backend Unit Tests
  backend-unit:
    name: Backend Unit Tests
    runs-on: ubuntu-latest
    needs: api-validation
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: 'temurin'
      
      - name: Run Unit Tests
        working-directory: ./backend
        run: mvn test -Dtest=**/domain/**/*Test.java,**/application/**/*Test.java
      
      - name: Check Coverage
        run: |
          mvn jacoco:report
          mvn jacoco:check -Drules.coverage.minimum=0.80

  # Gate 4: Backend Integration Tests
  backend-integration:
    name: Backend Integration Tests
    runs-on: ubuntu-latest
    needs: backend-unit
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: testdb
          POSTGRES_PASSWORD: testpass
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: 'temurin'
      
      - name: Run Integration Tests
        working-directory: ./backend
        run: mvn verify -Dtest=**/infrastructure/**/*IntegrationTest.java

  # Gate 5: Contract Tests
  contract-tests:
    name: Contract Tests (Provider & Consumer)
    runs-on: ubuntu-latest
    needs: backend-integration
    steps:
      - uses: actions/checkout@v4
      
      - name: Backend Contract Tests
        working-directory: ./backend
        run: mvn verify -Dtest=**/*ContractTest.java
      
      - name: Frontend Contract Tests
        working-directory: ./frontend
        run: |
          npm ci
          npm run test:contracts

  # Gate 6: Frontend Unit & Integration
  frontend-tests:
    name: Frontend Unit & Integration Tests
    runs-on: ubuntu-latest
    needs: contract-tests
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Install Dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run Unit Tests
        working-directory: ./frontend
        run: npm run test:unit -- --coverage
      
      - name: Run Integration Tests
        working-directory: ./frontend
        run: npm run test:integration
      
      - name: Check Coverage
        run: |
          # Unit coverage ≥ 70%, Integration ≥ 60%
          npm run test:coverage:check

  # Gate 7: E2E Tests
  e2e-tests:
    name: E2E Tests (Backend + Frontend)
    runs-on: ubuntu-latest
    needs: [backend-integration, frontend-tests]
    steps:
      - uses: actions/checkout@v4
      
      - name: Start Backend
        working-directory: ./backend
        run: |
          mvn spring-boot:run &
          ./scripts/wait-for-backend.sh
      
      - name: Start Frontend
        working-directory: ./frontend
        run: |
          npm run build
          npm run preview &
          ./scripts/wait-for-frontend.sh
      
      - name: Run Backend E2E
        working-directory: ./backend
        run: mvn verify -Dtest=**/*E2ETest.java
      
      - name: Install Playwright
        working-directory: ./frontend
        run: npx playwright install --with-deps
      
      - name: Run Frontend E2E
        working-directory: ./frontend
        run: npm run test:e2e
      
      - name: Upload Playwright Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: frontend/playwright-report/

  # Gate 8: Build Artifacts
  build:
    name: Build & Package
    runs-on: ubuntu-latest
    needs: e2e-tests
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Backend JAR
        working-directory: ./backend
        run: mvn clean package -DskipTests
      
      - name: Build Frontend
        working-directory: ./frontend
        run: |
          npm ci
          npm run build
      
      - name: Upload Backend Artifact
        uses: actions/upload-artifact@v4
        with:
          name: backend-jar
          path: backend/target/*.jar
      
      - name: Upload Frontend Artifact
        uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: frontend/dist/

  # Gate 9: Deploy to Staging
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.meditation-builder.example.com
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: backend-jar
      
      - uses: actions/download-artifact@v4
        with:
          name: frontend-dist
      
      - name: Deploy Backend to Staging
        run: |
          # Deploy to K8s, AWS ECS, Azure App Service, etc.
          echo "Deploying backend to staging..."
      
      - name: Deploy Frontend to Staging
        run: |
          # Deploy to S3, Netlify, Vercel, etc.
          echo "Deploying frontend to staging..."
      
      - name: Run Smoke Tests
        run: |
          curl -f https://staging-api.meditation-builder.example.com/health
          curl -f https://staging.meditation-builder.example.com

  # Gate 10: Deploy to Production
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://meditation-builder.example.com
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: backend-jar
      
      - uses: actions/download-artifact@v4
        with:
          name: frontend-dist
      
      - name: Deploy Backend to Production
        run: |
          echo "Deploying backend to production..."
      
      - name: Deploy Frontend to Production
        run: |
          echo "Deploying frontend to production..."
      
      - name: Run Production Smoke Tests
        run: |
          curl -f https://api.meditation-builder.example.com/health
          curl -f https://meditation-builder.example.com
```

### 10.2 Quality Gate Configuration
**Location**: `.github/workflows/quality-gates.yml`

```yaml
quality-gates:
  bdd:
    required: true
    failure-action: block
  
  api-validation:
    required: true
    failure-action: block
  
  unit-tests:
    required: true
    coverage:
      domain: 90%
      application: 80%
      controllers: 80%
      frontend: 70%
    failure-action: block
  
  integration-tests:
    required: true
    coverage: 70%
    failure-action: block
  
  contract-tests:
    required: true
    failure-action: block
  
  e2e-tests:
    required: true
    failure-action: block
  
  security-scan:
    required: true
    tools: [snyk, trivy]
    failure-action: warn
  
  performance-tests:
    required: false
    thresholds:
      p95-latency: 500ms
      error-rate: 1%
    failure-action: warn
```

### 10.3 Observability Configuration
**Backend** (`application.yml`):
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
  tracing:
    sampling:
      probability: 1.0

logging:
  level:
    com.hexagonal.meditationbuilder: INFO
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg - traceId=%X{traceId} - sessionId=%X{sessionId}%n"
```

**Frontend** (error tracking):
```typescript
// Sentry integration
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

## ✅ Acceptance Criteria

- [ ] All 10 gates configured and enforced
- [ ] No gate can be bypassed or disabled without approval
- [ ] Failed gates block PR merges
- [ ] Artifacts built once, deployed to multiple environments
- [ ] Observability metrics collected (logs, traces, metrics)
- [ ] Security scanning integrated (Snyk, Trivy)
- [ ] Deployment rollback capability exists
- [ ] Smoke tests validate successful deployments

## 🚫 Strictly Prohibited

- Skipping any gate "to save time"
- Deploying untested code
- Manual deployments (must go through CI/CD)
- Hardcoded secrets in code or workflows

## 🔗 Dependencies

- **All previous phases (1-9)** must be GREEN

## 🛠️ Tools Required

- GitHub Actions
- Docker (containerization)
- Kubernetes / AWS ECS / Azure App Service (deployment)
- Prometheus + Grafana (monitoring)
- Sentry (error tracking)
- Snyk / Trivy (security scanning)

## 📊 Gate Validation

```bash
# Local simulation of CI pipeline
./scripts/run-all-gates.sh

# Expected output:
# ✅ BDD: PASSED
# ✅ API: PASSED
# ✅ Unit: PASSED (coverage: 85%)
# ✅ Integration: PASSED
# ✅ Contracts: PASSED
# ✅ E2E: PASSED
# ✅ Build: PASSED
# ✅ Security: PASSED
# 🚀 Ready for deployment
```

---

# 📊 Final Checklist: Definition of Done

A User Story is **DONE** and **deployable** only when:

## Technical Completeness
- [ ] BDD scenarios GREEN (all pending steps implemented)
- [ ] OpenAPI contract validated and versioned
- [ ] Domain logic implemented with TDD (≥90% coverage)
- [ ] Application layer tested (≥80% coverage)
- [ ] Infrastructure adapters tested with Testcontainers (≥70% coverage)
- [ ] Controllers comply with OpenAPI (≥80% coverage)
- [ ] Frontend UI implemented with React Query + Zustand
- [ ] Frontend tests: unit ≥70%, integration ≥60%
- [ ] Contract tests GREEN (provider & consumer)
- [ ] E2E tests GREEN (backend Cucumber + frontend Playwright)

## Quality Gates
- [ ] All CI/CD gates passed
- [ ] No critical security vulnerabilities (Snyk/Trivy)
- [ ] Performance thresholds met (SC-001 to SC-013)
- [ ] Error handling validated (AI failures, rate limits)
- [ ] Observability configured (logs, metrics, traces)

## Architecture Compliance
- [ ] Hexagonal architecture preserved (no layer violations)
- [ ] No business logic outside domain
- [ ] No persistence logic in this US (session-only)
- [ ] No endpoints beyond BDD scope
- [ ] DDD principles followed (entities, VOs, aggregates)

## Documentation
- [ ] OpenAPI documentation generated and published
- [ ] README updated with feature description
- [ ] Deployment instructions documented
- [ ] Known limitations documented

## Operational Readiness
- [ ] Deployed to staging and validated
- [ ] Smoke tests passed in staging
- [ ] Rollback procedure tested
- [ ] Monitoring dashboards configured
- [ ] Error alerting configured

---

# 🚨 Critical Reminders

## What This US Does NOT Include
- ❌ Persistent storage of meditation compositions
- ❌ Actual podcast/video generation (future US)
- ❌ User authentication (assumed external dependency)
- ❌ Music/image upload (uses existing catalog)
- ❌ Multi-language support
- ❌ Collaboration features

## Architectural Constraints
- ✅ Session-based state only (no database writes)
- ✅ AI calls must be explicit user actions (no auto-generation)
- ✅ Output type derived from image presence (no manual override)
- ✅ All media previews are read-only (no editing)

## Non-Negotiable Quality Standards
- ✅ Zero business logic in controllers or infrastructure
- ✅ Zero hardcoded values (use configuration)
- ✅ Zero production external services in tests
- ✅ Zero skipped gates for "emergency" deploys

---

# 📚 References

- [Constitution 2.0.0](../../.specify/memory/constitution.md)
- [Backend Delivery Playbook](../../.specify/instructions/delivery-playbook-backend.md)
- [Frontend Delivery Playbook](../../.specify/instructions/delivery-playbook-frontend.md)
- [Specification](./spec.md)
- [Requirements Checklist](./checklists/requirements.md)

---

**Plan Status**: ✅ **READY FOR EXECUTION**  
**Estimated Effort**: 8-10 developer days (following TDD/BDD strictly)  
**Risk Level**: Medium (AI service dependency, session management)  
**Deployment Strategy**: Blue-Green with smoke tests

---

**END OF IMPLEMENTATION PLAN**
