package com.hexagonal.meditation.generation.infrastructure.in.rest.controller;

import com.atlassian.oai.validator.restassured.OpenApiValidationFilter;
import com.hexagonal.meditation.generation.domain.enums.GenerationStatus;
import com.hexagonal.meditation.generation.domain.ports.in.GenerateMeditationContentUseCase;
import com.hexagonal.meditation.generation.domain.ports.in.GenerateMeditationContentUseCase.GenerationRequest;
import com.hexagonal.meditation.generation.domain.ports.in.GenerateMeditationContentUseCase.GenerationResponse;
import com.hexagonal.meditation.generation.domain.ports.out.ContentRepositoryPort;
import com.hexagonal.meditation.generation.infrastructure.in.rest.dto.GenerateMeditationRequest;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Contract tests for BC Generation to ensure OpenAPI compliance.
 * Uses Atlassian OpenAPI Validator with RestAssured.
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    classes = GenerateMeditationContractTest.TestConfig.class
)
@ActiveProfiles("test")
@DisplayName("Generate Meditation Contract Tests")
public class GenerateMeditationContractTest {

    @Configuration
    @EnableAutoConfiguration(exclude = {
            org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class,
            org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration.class,
            org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration.class,
            org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration.class
    })
    @ComponentScan(basePackageClasses = {
            com.hexagonal.meditation.generation.infrastructure.in.rest.controller.MeditationGenerationController.class,
            com.hexagonal.meditation.generation.infrastructure.in.rest.mapper.MeditationOutputDtoMapper.class
    })
    public static class TestConfig {
    }

    @LocalServerPort
    private int port;

    @MockBean
    private GenerateMeditationContentUseCase generateMeditationContentUseCase;

    @MockBean
    private com.hexagonal.meditation.generation.domain.ports.out.ContentRepositoryPort contentRepositoryPort;

    @MockBean
    private com.hexagonal.meditation.generation.infrastructure.out.persistence.repository.JpaMeditationOutputRepository jpaMeditationOutputRepository;

    @MockBean
    private com.hexagonal.meditation.generation.domain.ports.out.MediaStoragePort mediaStoragePort;

    private static final String OPENAPI_SPEC = "openapi/generation/generate-meditation.yaml";
    private final OpenApiValidationFilter validationFilter = new OpenApiValidationFilter(OPENAPI_SPEC);

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api";
    }

    @Test
    @DisplayName("POST /v1/generation/meditations should comply with OpenAPI spec")
    void shouldComplyWithOpenApiSpec() {
        UUID userId = UUID.randomUUID();
        UUID compositionId = UUID.randomUUID();
        UUID meditationId = UUID.randomUUID();

        GenerateMeditationRequest request = new GenerateMeditationRequest(
                "Short text for contract test",
                "music-ref",
                "image-ref"
        );

        GenerationResponse domainResponse = new GenerationResponse(
                meditationId,
                compositionId,
                userId,
                GenerationStatus.COMPLETED,
                com.hexagonal.meditation.generation.domain.enums.MediaType.VIDEO,
                Optional.of("https://s3.amazonaws.com/meditation-outputs/video.mp4"),
                Optional.of("https://s3.amazonaws.com/meditation-outputs/subs.srt"),
                Optional.of(10),
                Instant.now(),
                Optional.of(Instant.now())
        );

        when(generateMeditationContentUseCase.generate(any(GenerationRequest.class)))
                .thenReturn(domainResponse);

        given()
                .filter(validationFilter)
                .contentType(ContentType.JSON)
                .header("X-User-ID", userId.toString())
                .header("X-Composition-ID", compositionId.toString())
                .body(request)
        .when()
                .post("/v1/generation/meditations")
        .then()
                .statusCode(200);
    }
}
