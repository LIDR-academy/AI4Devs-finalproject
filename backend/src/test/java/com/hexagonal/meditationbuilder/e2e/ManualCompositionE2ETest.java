package com.hexagonal.meditationbuilder.e2e;

import com.github.tomakehurst.wiremock.WireMockServer;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.hamcrest.Matchers.containsString;

/**
 * End-to-End Test: Manual Composition Flow
 * 
 * Tests the complete flow of manually composing meditation content:
 * 1. Create composition with initial text
 * 2. Update text content
 * 3. Select background music
 * 4. Verify output type determination (PODCAST without image, VIDEO with image)
 * 
 * Uses real Spring Boot application with mocked external dependencies (media catalog).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DisplayName("E2E Test: Manual Composition Flow")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ManualCompositionE2ETest {

    @LocalServerPort
    private int port;

    private static WireMockServer mediaCatalogServer;

    @BeforeAll
    static void setupWireMock() {
        // Mock media catalog service
        mediaCatalogServer = new WireMockServer(wireMockConfig().dynamicPort());
        mediaCatalogServer.start();
        
        // Stub: Check if music exists in catalog
        mediaCatalogServer.stubFor(head(urlPathMatching("/api/media/music/.*"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "audio/mpeg")));
        
        // Stub: Check if image exists in catalog
        mediaCatalogServer.stubFor(head(urlPathMatching("/api/media/images/.*"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "image/jpeg")));
    }

    @AfterAll
    static void tearDownWireMock() {
        if (mediaCatalogServer != null) {
            mediaCatalogServer.stop();
        }
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        // Override Media Catalog base URL - do NOT include /api/media here, adapter adds it
        registry.add("media-catalog.base-url", () -> "http://localhost:" + mediaCatalogServer.port());
    }

    @BeforeEach
    void setup() {
        RestAssured.port = port;
        RestAssured.basePath = "/api";
    }

    @Test
    @Order(1)
    @DisplayName("E2E Flow: Create composition → Update text → Select music → Verify PODCAST output type")
    void testManualCompositionFlowWithoutImage() {
        // Step 1: Create composition with initial text
        String compositionId = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "text": "Welcome to your meditation journey"
                }
                """)
        .when()
            .post("/v1/compositions")
        .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("textContent", equalTo("Welcome to your meditation journey"))
            .body("outputType", equalTo("PODCAST"))  // No image yet
            .body("musicReference", nullValue())
            .body("imageReference", nullValue())
            .extract().path("id");

        // Step 2: Update text content
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "text": "Close your eyes. Take a deep breath. Feel the peace within."
                }
                """)
        .when()
            .put("/v1/compositions/" + compositionId + "/text")
        .then()
            .statusCode(200)
            .body("id", equalTo(compositionId))
            .body("textContent", equalTo("Close your eyes. Take a deep breath. Feel the peace within."))
            .body("outputType", equalTo("PODCAST"));  // Still PODCAST (no image)

        // Step 3: Select background music
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "musicReference": "calm-ocean-waves"
                }
                """)
        .when()
            .put("/v1/compositions/" + compositionId + "/music")
        .then()
            .statusCode(200)
            .body("id", equalTo(compositionId))
            .body("musicReference", equalTo("calm-ocean-waves"))
            .body("outputType", equalTo("PODCAST"));  // Still PODCAST (no image)

        // Step 4: Verify final composition state
        given()
        .when()
            .get("/v1/compositions/" + compositionId)
        .then()
            .statusCode(200)
            .body("id", equalTo(compositionId))
            .body("textContent", equalTo("Close your eyes. Take a deep breath. Feel the peace within."))
            .body("musicReference", equalTo("calm-ocean-waves"))
            .body("imageReference", nullValue())
            .body("outputType", equalTo("PODCAST"));

        // Step 5: Verify output type explicitly
        given()
        .when()
            .get("/v1/compositions/" + compositionId + "/output-type")
        .then()
            .statusCode(200)
            .body("outputType", equalTo("PODCAST"));
    }

    @Test
    @Order(2)
    @DisplayName("E2E Flow: Create composition → Add image → Verify VIDEO output type → Remove image → Verify PODCAST")
    void testManualCompositionFlowWithImageToggle() {
        // Step 1: Create composition
        String compositionId = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "text": "Find inner peace through mindfulness"
                }
                """)
        .when()
            .post("/v1/compositions")
        .then()
            .statusCode(201)
            .body("outputType", equalTo("PODCAST"))  // Initially PODCAST
            .extract().path("id");

        // Step 2: Add image → output type changes to VIDEO
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "imageReference": "zen-garden-sunset"
                }
                """)
        .when()
            .put("/v1/compositions/" + compositionId + "/image")
        .then()
            .statusCode(200)
            .body("imageReference", equalTo("zen-garden-sunset"))
            .body("outputType", equalTo("VIDEO"));  // Changed to VIDEO

        // Step 3: Verify output type is VIDEO
        given()
        .when()
            .get("/v1/compositions/" + compositionId + "/output-type")
        .then()
            .statusCode(200)
            .body("outputType", equalTo("VIDEO"));

        // Step 4: Remove image → output type changes back to PODCAST
        given()
        .when()
            .delete("/v1/compositions/" + compositionId + "/image")
        .then()
            .statusCode(200)
            .body("imageReference", nullValue())
            .body("outputType", equalTo("PODCAST"));  // Changed back to PODCAST

        // Step 5: Verify output type is PODCAST again
        given()
        .when()
            .get("/v1/compositions/" + compositionId + "/output-type")
        .then()
            .statusCode(200)
            .body("outputType", equalTo("PODCAST"));
    }

    @Test
    @Order(3)
    @DisplayName("E2E Flow: Full composition with music and image → Verify VIDEO output type")
    void testFullManualCompositionFlow() {
        // Complete flow: text + music + image = VIDEO output
        String compositionId = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "text": "Breathe in tranquility, breathe out stress"
                }
                """)
        .when()
            .post("/v1/compositions")
        .then()
            .statusCode(201)
            .extract().path("id");

        // Add music
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "musicReference": "tibetan-singing-bowls"
                }
                """)
        .when()
            .put("/v1/compositions/" + compositionId + "/music")
        .then()
            .statusCode(200)
            .body("outputType", equalTo("PODCAST"));  // Still PODCAST without image

        // Add image → triggers VIDEO output type
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "imageReference": "mountain-meditation"
                }
                """)
        .when()
            .put("/v1/compositions/" + compositionId + "/image")
        .then()
            .statusCode(200)
            .body("outputType", equalTo("VIDEO"));  // Now VIDEO

        // Verify complete composition
        given()
        .when()
            .get("/v1/compositions/" + compositionId)
        .then()
            .statusCode(200)
            .body("textContent", equalTo("Breathe in tranquility, breathe out stress"))
            .body("musicReference", equalTo("tibetan-singing-bowls"))
            .body("imageReference", equalTo("mountain-meditation"))
            .body("outputType", equalTo("VIDEO"))
            .body("createdAt", notNullValue())
            .body("updatedAt", notNullValue());
    }

    @Test
    @Order(4)
    @DisplayName("E2E Flow: Validate text length constraints")
    void testTextLengthValidation() {
        // Test text too long (> 10000 chars)
        String longText = "a".repeat(10001);
        
        given()
            .contentType(ContentType.JSON)
            .body(String.format("""
                {
                  "text": "%s"
                }
                """, longText))
        .when()
            .post("/v1/compositions")
        .then()
            .statusCode(400)
            .body("error", equalTo("VALIDATION_ERROR"))
            .body("message", notNullValue());  // Just verify message exists

        // Test empty text (fails @NotBlank)
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "text": ""
                }
                """)
        .when()
            .post("/v1/compositions")
        .then()
            .statusCode(400)
            .body("error", equalTo("VALIDATION_ERROR"));
    }

    @Test
    @Order(5)
    @DisplayName("E2E Flow: Handle invalid composition ID")
    void testInvalidCompositionId() {
        String nonExistentId = "00000000-0000-0000-0000-000000000000";
        
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "text": "Some text"
                }
                """)
        .when()
            .put("/v1/compositions/" + nonExistentId + "/text")
        .then()
            .statusCode(404)
            .body("error", equalTo("NOT_FOUND"));
    }
}
