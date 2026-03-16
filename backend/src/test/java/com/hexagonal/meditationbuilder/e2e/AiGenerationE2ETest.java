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
import static org.hamcrest.Matchers.*;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.startsWith;

/**
 * End-to-End Test: AI Generation Flows
 * 
 * Tests the complete flow of AI-powered content generation:
 * 1. AI text generation from scratch (no existing text)
 * 2. AI text enhancement (improving existing text)
 * 3. AI image generation from text prompt
 * 4. Integration: Create composition → Generate AI text → Generate AI image → Verify VIDEO output
 * 
 * Uses real Spring Boot application with mocked AI services (text and image generation).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DisplayName("E2E Test: AI Generation Flows")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AiGenerationE2ETest {

    @LocalServerPort
    private int port;

    private static WireMockServer aiServer;  // Single WireMock server for both text and image

    @BeforeAll
    static void setupWireMock() {
        // Mock AI Service (handles both text and image generation)
        aiServer = new WireMockServer(wireMockConfig().dynamicPort());
        aiServer.start();
        
        // Stub: OpenAI Chat Completions API (text generation/enhancement)
        aiServer.stubFor(post(urlEqualTo("/v1/chat/completions"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("""
                    {
                      "choices": [{
                        "message": {
                          "content": "Welcome to your meditation journey. Close your eyes and breathe deeply. Feel the peace within you growing with each breath."
                        }
                      }]
                    }
                    """)));

        // Stub: OpenAI Image Generations API  
        aiServer.stubFor(post(urlEqualTo("/v1/images/generations"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("""
                    {
                      "data": [{
                        "url": "http://localhost/generated/ai-generated-peaceful-sunset-12345.png"
                      }]
                    }
                    """)));
    }

    @AfterAll
    static void tearDownWireMock() {
        if (aiServer != null) {
            aiServer.stop();
        }
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        // Override OpenAI base URL to point to WireMock server (both text and image adapters use this)
        registry.add("openai.base-url", () -> "http://localhost:" + aiServer.port());
    }

    @BeforeEach
    void setup() {
        RestAssured.port = port;
        RestAssured.basePath = "/api";
    }

    @Test
    @Order(1)
    @DisplayName("E2E Flow: Generate AI text from scratch (no existing text)")
    void testAiTextGenerationFromScratch() {
        // Generate AI text without existing text (only context)
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "context": "relaxation, mindfulness, breathing"
                }
                """)
        .when()
            .post("/v1/compositions/text/generate")
        .then()
            .statusCode(200)
            .body("text", notNullValue())
            .body("text", containsString("meditation"))
            .body("text", not(emptyOrNullString()));
    }

    @Test
    @Order(2)
    @DisplayName("E2E Flow: Enhance existing text with AI")
    void testAiTextEnhancement() {
        // Enhance existing text with AI
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "existingText": "Breathe deeply",
                  "context": "mindfulness meditation"
                }
                """)
        .when()
            .post("/v1/compositions/text/generate")
        .then()
            .statusCode(200)
            .body("text", notNullValue())
            .body("text", containsString("breathe"))
            .body("text", not(equalTo("Breathe deeply")));  // Text should be enhanced/different
    }

    @Test
    @Order(3)
    @DisplayName("E2E Flow: Generate AI image from text prompt")
    void testAiImageGeneration() {
        // Generate AI image from text prompt
        given()
            .contentType("text/plain")
            .body("Peaceful sunset over calm ocean waters with golden light")
        .when()
            .post("/v1/compositions/image/generate")
        .then()
            .statusCode(200)
            .body("imageReference", notNullValue())
            .body("imageReference", not(emptyOrNullString()))
            .body("imageReference", containsString("ai-generated-"));
    }

    @Test
    @Order(4)
    @DisplayName("E2E Flow: Complete AI-powered composition → Verify VIDEO output type")
    void testCompleteAiGenerationFlow() {
        // Step 1: Generate AI text from scratch (only context)
        String aiGeneratedText = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "context": "peaceful meditation, inner calm"
                }
                """)
        .when()
            .post("/v1/compositions/text/generate")
        .then()
            .statusCode(200)
            .body("text", notNullValue())
            .extract().path("text");

        // Step 2: Create composition with AI-generated text
        String compositionId = given()
            .contentType(ContentType.JSON)
            .body(String.format("""
                {
                  "text": "%s"
                }
                """, aiGeneratedText))
        .when()
            .post("/v1/compositions")
        .then()
            .statusCode(201)
            .body("textContent", equalTo(aiGeneratedText))
            .body("outputType", equalTo("PODCAST"))  // Initially PODCAST (no image)
            .extract().path("id");

        // Step 3: Generate AI image from the meditation text
        String aiImageReference = given()
            .contentType("text/plain")
            .body(aiGeneratedText)
        .when()
            .post("/v1/compositions/image/generate")
        .then()
            .statusCode(200)
            .body("imageReference", notNullValue())
            .extract().path("imageReference");

        // Step 4: Set AI-generated image to composition
        given()
            .contentType(ContentType.JSON)
            .body(String.format("""
                {
                  "imageReference": "%s"
                }
                """, aiImageReference))
        .when()
            .put("/v1/compositions/" + compositionId + "/image")
        .then()
            .statusCode(200)
            .body("imageReference", equalTo(aiImageReference))
            .body("outputType", equalTo("VIDEO"));  // Changed to VIDEO with image

        // Step 5: Verify final composition state
        given()
        .when()
            .get("/v1/compositions/" + compositionId)
        .then()
            .statusCode(200)
            .body("textContent", equalTo(aiGeneratedText))
            .body("imageReference", equalTo(aiImageReference))
            .body("outputType", equalTo("VIDEO"));
    }

    @Test
    @Order(5)
    @DisplayName("E2E Flow: Create manually → Enhance with AI → Add AI image → Verify VIDEO")
    void testHybridManualAndAiFlow() {
        // Step 1: Create composition manually
        String compositionId = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "text": "Breathe in, breathe out"
                }
                """)
        .when()
            .post("/v1/compositions")
        .then()
            .statusCode(201)
            .body("outputType", equalTo("PODCAST"))
            .extract().path("id");

        // Step 2: Enhance text with AI
        String enhancedText = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "existingText": "Breathe in, breathe out",
                  "context": "mindful breathing meditation"
                }
                """)
        .when()
            .post("/v1/compositions/text/generate")
        .then()
            .statusCode(200)
            .body("text", not(equalTo("Breathe in, breathe out")))
            .extract().path("text");

        // Step 3: Update composition with enhanced text
        given()
            .contentType(ContentType.JSON)
            .body(String.format("""
                {
                  "text": "%s"
                }
                """, enhancedText))
        .when()
            .put("/v1/compositions/" + compositionId + "/text")
        .then()
            .statusCode(200)
            .body("textContent", equalTo(enhancedText));

        // Step 4: Generate AI image
        String imageRef = given()
            .contentType("text/plain")
            .body(enhancedText)
        .when()
            .post("/v1/compositions/image/generate")
        .then()
            .statusCode(200)
            .extract().path("imageReference");

        // Step 5: Add AI image to composition
        given()
            .contentType(ContentType.JSON)
            .body(String.format("""
                {
                  "imageReference": "%s"
                }
                """, imageRef))
        .when()
            .put("/v1/compositions/" + compositionId + "/image")
        .then()
            .statusCode(200)
            .body("outputType", equalTo("VIDEO"));
    }

    @Test
    @Order(6)
    @DisplayName("E2E Flow: Empty text prompt to AI image generation")
    void testAiImageWithMinimalPrompt() {
        // AI should handle minimal/short prompts gracefully
        given()
            .contentType("text/plain")
            .body("meditation")
        .when()
            .post("/v1/compositions/image/generate")
        .then()
            .statusCode(200)
            .body("imageReference", notNullValue());
    }

    @Test
    @Order(7)
    @DisplayName("E2E Flow: Very long text prompt to AI image generation")
    void testAiImageWithLongPrompt() {
        // AI should handle long prompts (within max limit)
        String longPrompt = "A serene meditation scene with ".repeat(100) + "peaceful atmosphere";
        
        given()
            .contentType("text/plain")
            .body(longPrompt)
        .when()
            .post("/v1/compositions/image/generate")
        .then()
            .statusCode(200)
            .body("imageReference", notNullValue());
    }
}
