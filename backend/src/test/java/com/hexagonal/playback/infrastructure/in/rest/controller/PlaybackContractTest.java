package com.hexagonal.playback.infrastructure.in.rest.controller;

import com.atlassian.oai.validator.restassured.OpenApiValidationFilter;
import com.hexagonal.playback.domain.exception.MeditationNotFoundException;
import com.hexagonal.playback.domain.exception.MeditationNotPlayableException;
import com.hexagonal.playback.domain.model.MediaUrls;
import com.hexagonal.playback.domain.model.Meditation;
import com.hexagonal.playback.domain.model.ProcessingState;
import com.hexagonal.playback.domain.ports.in.GetPlaybackInfoUseCase;
import com.hexagonal.playback.domain.ports.in.ListMeditationsUseCase;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ActiveProfiles;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.mockito.Mockito.when;

/**
 * Contract tests for BC Playback to ensure OpenAPI compliance.
 * Uses Atlassian OpenAPI Validator with RestAssured.
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    classes = PlaybackContractTest.TestConfig.class
)
@ActiveProfiles("test")
@DisplayName("Playback Contract Tests")
public class PlaybackContractTest {

    @Configuration
    @EnableAutoConfiguration(exclude = {
            org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class,
            org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration.class,
            org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration.class,
            org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration.class
    })
    @ComponentScan(basePackageClasses = {
            com.hexagonal.playback.infrastructure.in.rest.controller.PlaybackController.class,
            com.hexagonal.playback.infrastructure.in.rest.mapper.DtoMapper.class,
            com.hexagonal.playback.infrastructure.in.rest.exception.PlaybackExceptionHandler.class
    })
    public static class TestConfig {
        @Bean
        public Clock clock() {
            return Clock.systemUTC();
        }
    }

    @LocalServerPort
    private int port;

    @MockBean
    private ListMeditationsUseCase listMeditationsUseCase;

    @MockBean
    private GetPlaybackInfoUseCase getPlaybackInfoUseCase;

    private static final String OPENAPI_SPEC = "openapi/playback/list-play-meditations.yaml";
    private final OpenApiValidationFilter validationFilter = new OpenApiValidationFilter(OPENAPI_SPEC);

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID MEDITATION_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api";
    }

    @Test
    @DisplayName("GET /v1/playback/meditations should comply with OpenAPI spec (200 OK)")
    void shouldComplyWithListOpenApiSpec() {
        Meditation meditation = new Meditation(
                MEDITATION_ID,
                USER_ID,
                "Contract Test Meditation",
                Instant.now(),
                ProcessingState.COMPLETED,
                new MediaUrls("https://s3.aws.com/audio.mp3", "https://s3.aws.com/video.mp4", null)
        );

        when(listMeditationsUseCase.execute(USER_ID)).thenReturn(List.of(meditation));

        given()
                .filter(validationFilter)
                .contentType(ContentType.JSON)
                .header("X-User-ID", USER_ID.toString())
        .when()
                .get("/v1/playback/meditations")
        .then()
                .statusCode(200);
    }

    @Test
    @DisplayName("GET /v1/playback/meditations/{id} should comply with OpenAPI spec (200 OK)")
    void shouldComplyWithGetOpenApiSpec() {
        Meditation meditation = new Meditation(
                MEDITATION_ID,
                USER_ID,
                "Playback Contract Test",
                Instant.now(),
                ProcessingState.COMPLETED,
                new MediaUrls("https://s3.aws.com/audio.mp3", null, "https://s3.aws.com/subs.srt")
        );

        when(getPlaybackInfoUseCase.execute(MEDITATION_ID, USER_ID)).thenReturn(meditation);

        given()
                .filter(validationFilter)
                .contentType(ContentType.JSON)
                .header("X-User-ID", USER_ID.toString())
        .when()
                .get("/v1/playback/meditations/{id}", MEDITATION_ID)
        .then()
                .statusCode(200);
    }

    @Test
    @DisplayName("GET /v1/playback/meditations/{id} should comply with OpenAPI spec (404 NOT FOUND)")
    void shouldComplyWith404OpenApiSpec() {
        UUID nonExistentId = UUID.randomUUID();
        when(getPlaybackInfoUseCase.execute(nonExistentId, USER_ID))
                .thenThrow(new MeditationNotFoundException(nonExistentId, USER_ID));

        given()
                .filter(validationFilter)
                .contentType(ContentType.JSON)
                .header("X-User-ID", USER_ID.toString())
        .when()
                .get("/v1/playback/meditations/{id}", nonExistentId)
        .then()
                .statusCode(404);
    }

    @Test
    @DisplayName("GET /v1/playback/meditations/{id} should comply with OpenAPI spec (409 CONFLICT)")
    void shouldComplyWith409OpenApiSpec() {
        when(getPlaybackInfoUseCase.execute(MEDITATION_ID, USER_ID))
                .thenThrow(new MeditationNotPlayableException(MEDITATION_ID, ProcessingState.PROCESSING));

        given()
                .filter(validationFilter)
                .contentType(ContentType.JSON)
                .header("X-User-ID", USER_ID.toString())
        .when()
                .get("/v1/playback/meditations/{id}", MEDITATION_ID)
        .then()
                .statusCode(409);
    }
}
