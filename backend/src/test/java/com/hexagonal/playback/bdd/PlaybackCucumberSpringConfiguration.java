package com.hexagonal.playback.bdd;

import com.hexagonal.meditationbuilder.MeditationBuilderApplication;
import com.hexagonal.meditationbuilder.infrastructure.config.PersistenceConfig;
import io.cucumber.spring.CucumberContextConfiguration;
import io.restassured.RestAssured;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import io.cucumber.java.Before;
import io.cucumber.java.After;

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

    @LocalServerPort
    private int port;

    @Before
    public void setUp() {
        RestAssured.baseURI = "http://localhost";
        RestAssured.port = port;
        RestAssured.basePath = "/api";
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
    }

    @After
    public void tearDown() {
        RestAssured.reset();
    }
}
