package com.hexagonal.identity.bdd;

import com.hexagonal.identity.domain.ports.out.ValidarCredencialGooglePort;
import com.hexagonal.meditationbuilder.MeditationBuilderApplication;
import io.cucumber.spring.CucumberContextConfiguration;
import io.restassured.RestAssured;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import io.cucumber.java.Before;

/**
 * Spring Boot test context configuration for Identity BC Cucumber BDD tests.
 *
 * <p>Phase 6 (Controllers): Adds a {@code @MockBean} for {@link ValidarCredencialGooglePort}
 * so that BDD step definitions can configure its behaviour per scenario without
 * requiring a real Google JWKS endpoint.</p>
 *
 * <p>The mock is declared here (in the Spring context) and injected into the
 * step definition class via {@code @Autowired}.</p>
 */
@CucumberContextConfiguration
@SpringBootTest(
        classes = MeditationBuilderApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@ActiveProfiles("test")
public class IdentityCucumberSpringConfiguration {

    /**
     * Replaces {@link com.hexagonal.identity.infrastructure.out.service.google.GoogleJwksCredentialValidator}
     * in the Spring context so scenarios can control Google validation behaviour.
     */
    @MockBean
    public ValidarCredencialGooglePort validarCredencialPort;

    @LocalServerPort
    private int port;

    @Before
    public void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api";
    }
}
