package com.hexagonal.meditationbuilder.contracts;

import com.atlassian.oai.validator.restassured.OpenApiValidationFilter;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Provider Contract Tests for Compose Meditation Content API
 * 
 * Validates backend implementation adheres to OpenAPI contract specification.
 * Uses Atlassian OpenAPI Validator to automatically detect:
 * - Request/Response schema violations
 * - Breaking changes in API contracts
 * - DTO structure mismatches
 * 
 * Tests all 8 core capabilities defined in compose-content.yaml:
 * 1. Create Composition (Access Meditation Builder)
 * 2. Update Text (Define Meditation Text)
 * 3. AI Text Generation/Enhancement
 * 4. AI Image Generation
 * 5. Determine Output Type - Podcast (without image)
 * 6. Determine Output Type - Video (with image)
 * 7. Preview Selected Music
 * 8. Preview Selected Image
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DisplayName("Contract Tests: Compose Meditation Content API")
class ComposeContentContractTest {

    @LocalServerPort
    private int port;

    private static OpenApiValidationFilter validationFilter;

    @BeforeAll
    static void setupValidator() {
        // Load OpenAPI specification for contract validation
        validationFilter = new OpenApiValidationFilter(
            "src/main/resources/openapi/meditationbuilder/compose-content.yaml"
        );
    }

    @BeforeEach
    void setup() {
        RestAssured.port = port;
        RestAssured.basePath = "/api";
    }

    @Test
    @DisplayName("Capability 1: Create Composition - Contract Compliance")
    void testCreateComposition_contractCompliance() {
        given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
            .body("""
                {
                  "text": "Start your meditation journey"
                }
                """)
        .when()
            .post("/v1/compositions")
        .then()
            .statusCode(201)
            .body("id", matchesPattern("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"))
            .body("textContent", notNullValue())
            .body("outputType", in(new String[]{"PODCAST", "VIDEO"}))
            .body("createdAt", notNullValue())
            .body("updatedAt", notNullValue());
    }

    @Test
    @DisplayName("Capability 2: Update Text - Contract Compliance")
    void testUpdateText_contractCompliance() {
        // Create composition first
        String compositionId = given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
            .body("""
                {
                  "text": "Start your meditation journey"
                }
                """)
        .when()
            .post("/v1/compositions")
        .then()
            .statusCode(201)
            .extract().path("id");

        // Update text with contract validation
        given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
            .body("""
                {
                  "text": "Close your eyes and breathe deeply..."
                }
                """)
        .when()
            .put("/v1/compositions/" + compositionId + "/text")
        .then()
            .statusCode(200)
            .body("id", equalTo(compositionId))
            .body("textContent", equalTo("Close your eyes and breathe deeply..."))
            .body("outputType", notNullValue());
    }

    @Test
    @DisplayName("Capability 3: AI Text Generation - Contract Compliance")
    void testAiTextGeneration_contractCompliance() {
        // Test AI text generation from scratch
        given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
            .body("""
                {
                  "existingText": null,
                  "context": "relaxation, mindfulness"
                }
                """)
        .when()
            .post("/v1/compositions/text/generate")
        .then()
            .statusCode(200)
            .body("text", notNullValue())
            .body("text", not(emptyOrNullString()));
    }

    @Test
    @DisplayName("Capability 3: AI Enhancement - Contract Compliance")
    void testAiEnhancement_contractCompliance() {
        // Test AI text enhancement
        given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
            .body("""
                {
                  "existingText": "Breathe deeply",
                  "context": "mindfulness"
                }
                """)
        .when()
            .post("/v1/compositions/text/generate")
        .then()
            .statusCode(200)
            .body("text", notNullValue())
            .body("text", not(emptyOrNullString()));
    }

    @Test
    @DisplayName("Capability 4: AI Image Generation - Contract Compliance")
    void testAiImageGeneration_contractCompliance() {
        given()
            .filter(validationFilter)
            .contentType("text/plain")
            .body("Peaceful sunset over calm ocean waters")
        .when()
            .post("/v1/compositions/image/generate")
        .then()
            .statusCode(200)
            .body("imageReference", notNullValue())
            .body("imageReference", not(emptyOrNullString()));
    }

    @Test
    @DisplayName("Capabilities 5-6: Output Type Determination - Contract Compliance")
    void testOutputTypeDetermination_contractCompliance() {
        // Create composition
        String compositionId = given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
        .when()
            .post("/v1/compositions")
        .then()
            .statusCode(201)
            .extract().path("id");

        // Capability 5: Output type PODCAST (without image)
        given()
            .filter(validationFilter)
        .when()
            .get("/v1/compositions/" + compositionId + "/output-type")
        .then()
            .statusCode(200)
            .body("outputType", equalTo("PODCAST"));

        // Add image to change output type
        given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
            .body("""
                {
                  "imageReference": "sunset-beach-001"
                }
                """)
        .when()
            .put("/v1/compositions/" + compositionId + "/image")
        .then()
            .statusCode(200);

        // Capability 6: Output type VIDEO (with image)
        given()
            .filter(validationFilter)
        .when()
            .get("/v1/compositions/" + compositionId + "/output-type")
        .then()
            .statusCode(200)
            .body("outputType", equalTo("VIDEO"));
    }

    @Test
    @DisplayName("Capability 7: Preview Music - Contract Compliance")
    void testPreviewMusic_contractCompliance() {
        // Create composition and select music
        String compositionId = given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
            .body("""
                {
                  "text": "Start your meditation journey"
                }
                """)
        .when()
            .post("/v1/compositions")
        .then()
            .statusCode(201)
            .extract().path("id");

        given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
            .body("""
                {
                  "musicReference": "calm-ocean-waves"
                }
                """)
        .when()
            .put("/v1/compositions/" + compositionId + "/music")
        .then()
            .statusCode(200);

        // Preview music with contract validation
        // Note: 501 = Not Implemented (mocked for future US)
        given()
            .filter(validationFilter)
        .when()
            .get("/v1/compositions/" + compositionId + "/preview/music")
        .then()
            .statusCode(anyOf(equalTo(200), equalTo(501)));
    }

    @Test
    @DisplayName("Capability 8: Preview Image - Contract Compliance")
    void testPreviewImage_contractCompliance() {
        // Create composition and set image
        String compositionId = given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
            .body("""
                {
                  "text": "Start your meditation journey"
                }
                """)
        .when()
            .post("/v1/compositions")
        .then()
            .statusCode(201)
            .extract().path("id");

        given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
            .body("""
                {
                  "imageReference": "sunset-beach-001"
                }
                """)
        .when()
            .put("/v1/compositions/" + compositionId + "/image")
        .then()
            .statusCode(200);

        // Preview image with contract validation
        // Note: 501 = Not Implemented (mocked for future US)
        given()
            .filter(validationFilter)
        .when()
            .get("/v1/compositions/" + compositionId + "/preview/image")
        .then()
            .statusCode(anyOf(equalTo(200), equalTo(501)));
    }

    @Test
    @DisplayName("Contract Validation: Invalid Request Body Rejected")
    void testInvalidRequestBody_contractViolation() {
        String compositionId = given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
        .when()
            .post("/v1/compositions")
        .then()
            .statusCode(201)
            .extract().path("id");

        // Invalid: missing required field 'text'
        given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
            .body("{}")
        .when()
            .put("/v1/compositions/" + compositionId + "/text")
        .then()
            .statusCode(400);
    }

    @Test
    @DisplayName("Contract Validation: Text Length Constraints Enforced")
    void testTextLengthConstraints_contractCompliance() {
        String compositionId = given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
        .when()
            .post("/v1/compositions")
        .then()
            .statusCode(201)
            .extract().path("id");

        // Text too long (> 10000 chars)
        String longText = "a".repeat(10001);
        
        given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
            .body(String.format("""
                {
                  "text": "%s"
                }
                """, longText))
        .when()
            .put("/v1/compositions/" + compositionId + "/text")
        .then()
            .statusCode(400);
    }

    @Test
    @DisplayName("Contract Validation: Full Composition Flow")
    void testFullCompositionFlow_contractCompliance() {
        // 1. Create composition
        String compositionId = given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
            .body("""
                {
                  "text": "Start your meditation journey"
                }
                """)
        .when()
            .post("/v1/compositions")
        .then()
            .statusCode(201)
            .body("outputType", equalTo("PODCAST"))  // Initially PODCAST (no image)
            .extract().path("id");

        // 2. Update text
        given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
            .body("""
                {
                  "text": "Find inner peace through mindful breathing"
                }
                """)
        .when()
            .put("/v1/compositions/" + compositionId + "/text")
        .then()
            .statusCode(200)
            .body("textContent", equalTo("Find inner peace through mindful breathing"));

        // 3. Select music
        given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
            .body("""
                {
                  "musicReference": "zen-garden-ambience"
                }
                """)
        .when()
            .put("/v1/compositions/" + compositionId + "/music")
        .then()
            .statusCode(200)
            .body("musicReference", equalTo("zen-garden-ambience"));

        // 4. Set image (changes output type to VIDEO)
        given()
            .filter(validationFilter)
            .contentType(ContentType.JSON)
            .body("""
                {
                  "imageReference": "zen-garden-rocks"
                }
                """)
        .when()
            .put("/v1/compositions/" + compositionId + "/image")
        .then()
            .statusCode(200)
            .body("imageReference", equalTo("zen-garden-rocks"))
            .body("outputType", equalTo("VIDEO"));

        // 5. Get final composition
        given()
            .filter(validationFilter)
        .when()
            .get("/v1/compositions/" + compositionId)
        .then()
            .statusCode(200)
            .body("id", equalTo(compositionId))
            .body("textContent", equalTo("Find inner peace through mindful breathing"))
            .body("musicReference", equalTo("zen-garden-ambience"))
            .body("imageReference", equalTo("zen-garden-rocks"))
            .body("outputType", equalTo("VIDEO"));

        // 6. Remove image (changes output type back to PODCAST)
        given()
            .filter(validationFilter)
        .when()
            .delete("/v1/compositions/" + compositionId + "/image")
        .then()
            .statusCode(200)
            .body("imageReference", nullValue())
            .body("outputType", equalTo("PODCAST"));
    }
}
