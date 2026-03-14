package com.hexagonal.playback.bdd;

import com.hexagonal.identity.domain.model.GoogleUserInfo;
import com.hexagonal.identity.domain.ports.out.ValidarCredencialGooglePort;
import com.hexagonal.meditationbuilder.MeditationBuilderApplication;
import com.hexagonal.meditationbuilder.infrastructure.config.PersistenceConfig;
import io.cucumber.java.Before;
import io.cucumber.java.After;
import io.cucumber.spring.CucumberContextConfiguration;
import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.http.ContentType;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;
import java.util.UUID;

import static io.restassured.RestAssured.given;

/**
 * Spring Boot test context configuration for Playback BDD tests.
 */
@CucumberContextConfiguration
@SpringBootTest(
    classes = MeditationBuilderApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@Import(PersistenceConfig.class)
@ActiveProfiles("test")
public class PlaybackCucumberSpringConfiguration {

    /** Mocked so BDD scenarios don't need a real Google JWKS endpoint. */
    @MockBean
    public ValidarCredencialGooglePort validarCredencialPort;

    /** Session JWT obtained in setUp() — available to step definitions. */
    public String bddJwt;

    /** userId assigned by the identity BC — used by step defs for DB inserts. */
    public UUID bddUserId;

    @LocalServerPort
    private int port;

    @Before
    public void setUp() {
        RestAssured.baseURI = "http://localhost";
        RestAssured.port = port;
        RestAssured.basePath = "/api";
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();

        // Authenticate with a mocked Google credential to obtain a real session JWT.
        // This JWT is then used as the default Authorization header for all RestAssured requests.
        Mockito.when(validarCredencialPort.validar("bdd-playback-token"))
               .thenReturn(new GoogleUserInfo(
                       "playback-bdd-sub-001",
                       "playback@bdd.test",
                       "Playback BDD",
                       null));

        var authResp = given()
                .contentType(ContentType.JSON)
                .body(Map.of("idToken", "bdd-playback-token"))
                .post("/v1/identity/auth/google")
                .then()
                .statusCode(200)
                .extract();

        bddJwt    = authResp.path("sessionToken");
        bddUserId = UUID.fromString(authResp.path("userId").toString());

        RestAssured.requestSpecification = new RequestSpecBuilder()
                .addHeader("Authorization", "Bearer " + bddJwt)
                .build();
    }

    @After
    public void tearDown() {
        RestAssured.reset();
    }
}
