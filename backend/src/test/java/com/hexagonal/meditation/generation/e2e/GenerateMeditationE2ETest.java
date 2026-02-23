package com.hexagonal.meditation.generation.e2e;

import com.hexagonal.meditation.generation.domain.enums.GenerationStatus;
import com.hexagonal.meditation.generation.infrastructure.in.rest.dto.GenerateMeditationRequest;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.localstack.LocalStackContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.testcontainers.containers.localstack.LocalStackContainer.Service.S3;

/**
 * End-to-End test for Generate Meditation Content.
 * Uses Testcontainers for real PostgreSQL and LocalStack S3.
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    classes = com.hexagonal.meditationbuilder.MeditationBuilderApplication.class
)
@ActiveProfiles("test-e2e")
@Testcontainers
@DisplayName("Generate Meditation E2E Tests")
public class GenerateMeditationE2ETest {

    @LocalServerPort
    private int port;

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("meditation")
            .withUsername("test")
            .withPassword("test");

    @Container
    static LocalStackContainer localstack = new LocalStackContainer(DockerImageName.parse("localstack/localstack:latest"))
            .withServices(S3);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "update");
        
        registry.add("aws.s3.endpoint", () -> localstack.getEndpointOverride(S3).toString());
        registry.add("aws.region", localstack::getRegion);
        registry.add("aws.credentials.access-key", localstack::getAccessKey);
        registry.add("aws.credentials.secret-key", localstack::getSecretKey);
        registry.add("aws.s3.bucket-name", () -> "meditation-outputs");
    }

    @BeforeAll
    static void setupS3() throws Exception {
        localstack.execInContainer("awslocal", "s3", "mb", "s3://meditation-outputs");
    }

    @BeforeEach
    void setUp() throws java.io.IOException {
        RestAssured.port = port;
        RestAssured.basePath = "/api";

        // Pre-create some physical files for the catalog mock to work
        // These mimic the files expected by the sync adapters (ffprobe/ffmpeg)
        java.nio.file.Files.createDirectories(java.nio.file.Path.of("music-catalog"));
        java.nio.file.Files.createDirectories(java.nio.file.Path.of("image-catalog"));
        
        java.nio.file.Files.write(java.nio.file.Path.of("music-catalog/ambient-01.mp3"), new byte[100]);
        java.nio.file.Files.write(java.nio.file.Path.of("music-catalog/zen-02.mp3"), new byte[100]);
        java.nio.file.Files.write(java.nio.file.Path.of("music-catalog/music-123"), new byte[100]);
        java.nio.file.Files.write(java.nio.file.Path.of("image-catalog/forest-01.jpg"), new byte[100]);
    }

    @Test
    @DisplayName("Complete flow: Request -> Generate -> Store -> Persist (VIDEO)")
    void shouldCompleteFullFlowForVideo() {
        UUID userId = UUID.randomUUID();
        UUID compositionId = UUID.randomUUID();

        GenerateMeditationRequest request = new GenerateMeditationRequest(
                "Inhale peace, exhale stress. Focus on your breath as you drift away. This is a longer text to satisfy the validation rules of the meditation builder service.",
                "music-catalog/ambient-01.mp3",
                "image-catalog/forest-01.jpg"
        );

        given()
                .contentType(ContentType.JSON)
                .header("X-User-ID", userId.toString())
                .header("X-Composition-ID", compositionId.toString())
                .body(request)
        .when()
                .post("/v1/generation/meditations")
        .then()
                .statusCode(200)
                .body("status", is("COMPLETED"))
                .body("type", is("VIDEO"))
                .body("mediaUrl", containsString("meditation-outputs"))
                .body("mediaUrl", containsString(".mp4"))
                .body("subtitleUrl", notNullValue())
                .body("durationSeconds", greaterThan(0));
    }

    @Test
    @DisplayName("Complete flow: Request -> Generate -> Store -> Persist (AUDIO)")
    void shouldCompleteFullFlowForAudio() {
        UUID userId = UUID.randomUUID();
        UUID compositionId = UUID.randomUUID();

        GenerateMeditationRequest request = new GenerateMeditationRequest(
                "Focus on the sound of your breath. Let go of all your worries and just be present in this moment. This is a longer text for audio generation testing.",
                "music-catalog/zen-02.mp3",
                null
        );

        given()
                .contentType(ContentType.JSON)
                .header("X-User-ID", userId.toString())
                .header("X-Composition-ID", compositionId.toString())
                .body(request)
        .when()
                .post("/v1/generation/meditations")
        .then()
                .statusCode(200)
                .body("status", is("COMPLETED"))
                .body("type", is("AUDIO"))
                .body("mediaUrl", containsString(".mp3"))
                .body("durationSeconds", greaterThan(0));
    }

    @Test
    @DisplayName("Idempotency: Repeated request should return same meditation ID")
    void shouldBeIdempotent() {
        UUID userId = UUID.randomUUID();
        UUID compositionId = UUID.randomUUID();

        GenerateMeditationRequest request = new GenerateMeditationRequest(
                "Idempotent meditation text. This text is long enough to pass the validation check for minimum duration in the meditation builder.",
                "music-catalog/music-123",
                null
        );

        String firstMeditationId = given()
                .contentType(ContentType.JSON)
                .header("X-User-ID", userId.toString())
                .header("X-Composition-ID", compositionId.toString())
                .body(request)
        .when()
                .post("/v1/generation/meditations")
        .then()
                .statusCode(200)
                .extract().path("meditationId");

        given()
                .contentType(ContentType.JSON)
                .header("X-User-ID", userId.toString())
                .header("X-Composition-ID", compositionId.toString())
                .body(request)
        .when()
                .post("/v1/generation/meditations")
        .then()
                .statusCode(200)
                .body("meditationId", is(firstMeditationId));
    }
}
