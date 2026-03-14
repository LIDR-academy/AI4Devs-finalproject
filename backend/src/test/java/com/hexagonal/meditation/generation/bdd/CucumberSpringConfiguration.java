package com.hexagonal.meditation.generation.bdd;

import com.hexagonal.identity.domain.model.GoogleUserInfo;
import com.hexagonal.identity.domain.ports.out.ValidarCredencialGooglePort;
import com.hexagonal.meditationbuilder.MeditationBuilderApplication;
import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.spring.CucumberContextConfiguration;
import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.http.ContentType;
import org.mockito.Mockito;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.localstack.LocalStackContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import jakarta.annotation.PostConstruct;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.testcontainers.containers.localstack.LocalStackContainer.Service.S3;

/**
 * Cucumber Spring integration configuration.
 * Uses Testcontainers for Postgres and LocalStack (S3).
 */
@CucumberContextConfiguration
@SpringBootTest(classes = MeditationBuilderApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers
public class CucumberSpringConfiguration {

    /** Mocked so BDD scenarios can authenticate without a real Google JWKS endpoint. */
    @MockBean
    public ValidarCredencialGooglePort validarCredencialPort;
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("meditation_builder_test")
            .withUsername("testuser")
            .withPassword("testpass");

    @Container
    static LocalStackContainer localstack = new LocalStackContainer(DockerImageName.parse("localstack/localstack:3.0.0"))
            .withServices(S3);

    static {
        postgres.start();
        localstack.start();
    }

    @LocalServerPort
    private int port;

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
        registry.add("spring.jpa.show-sql", () -> "true");
        registry.add("spring.jpa.properties.hibernate.format_sql", () -> "true");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.PostgreSQLDialect");
        registry.add("spring.flyway.enabled", () -> "true");

        registry.add("aws.s3.endpoint", () -> localstack.getEndpointOverride(S3).toString());
        registry.add("aws.region", localstack::getRegion);
        registry.add("aws.credentials.access-key", localstack::getAccessKey);
        registry.add("aws.credentials.secret-key", localstack::getSecretKey);
        registry.add("aws.s3.bucket-name", () -> "meditation-outputs");
    }

    @PostConstruct
    public void setup() throws Exception {
        RestAssured.port = port;
        RestAssured.basePath = "/api";
        
        // Create bucket in LocalStack
        localstack.execInContainer("awslocal", "s3", "mb", "s3://meditation-outputs");
    }

    /**
     * Authenticate before each scenario: mock the Google credential port, call the
     * identity auth endpoint, and set the resulting JWT as the default Authorization header.
     */
    @Before
    public void authenticateForBDD() {
        Mockito.when(validarCredencialPort.validar("bdd-gen-token"))
               .thenReturn(new GoogleUserInfo(
                       "gen-bdd-sub-001",
                       "gen@bdd.test",
                       "Gen BDD",
                       null));

        String jwt = given()
                .contentType(ContentType.JSON)
                .body(Map.of("idToken", "bdd-gen-token"))
                .post("/v1/identity/auth/google")
                .then()
                .statusCode(200)
                .extract()
                .path("sessionToken");

        RestAssured.requestSpecification = new RequestSpecBuilder()
                .addHeader("Authorization", "Bearer " + jwt)
                .build();
    }

    /** Reset RestAssured static state so subsequent BDD test classes start clean. */
    @After
    public void tearDownRestAssured() {
        RestAssured.reset();
    }
}
