package com.hexagonal.meditationbuilder.bdd;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import com.hexagonal.meditationbuilder.MeditationBuilderApplication;
import com.hexagonal.meditationbuilder.infrastructure.config.PersistenceConfig;
import io.cucumber.spring.CucumberContextConfiguration;
import io.restassured.RestAssured;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import io.cucumber.java.Before;
import io.cucumber.java.After;

import static com.github.tomakehurst.wiremock.client.WireMock.*;

/**
 * Spring Boot test context configuration for Cucumber BDD tests.
 * 
 * Sets up:
 * - Spring Boot application on random port
 * - WireMock servers for external dependencies (AI services, media catalog)
 * - RestAssured base configuration
 * - Test profile for isolated test environment
 * 
 * Architecture: BDD test infrastructure following hexagonal ports & adapters.
 * External dependencies are mocked to ensure tests are deterministic and isolated.
 */
@CucumberContextConfiguration
@SpringBootTest(
    classes = MeditationBuilderApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@Import(PersistenceConfig.class)
@ActiveProfiles("test")
public class CompositionCucumberSpringConfiguration {

    @LocalServerPort
    private int port;

    private static WireMockServer aiTextServer;
    private static WireMockServer aiImageServer;
    private static WireMockServer mediaCatalogServer;

    /**
     * Configure external service URLs dynamically for WireMock servers.
     */
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        // Start WireMock servers on same port (they can share since we're using different paths)
        aiTextServer = new WireMockServer(WireMockConfiguration.options().dynamicPort());
        
        aiTextServer.start();
        
        // Use the same server for all services but they'll have different URL paths
        aiImageServer = aiTextServer;
        mediaCatalogServer = aiTextServer;

        // Configure Spring properties to point to WireMock server
        registry.add("openai.base-url", aiTextServer::baseUrl);
        registry.add("media-catalog.base-url", aiTextServer::baseUrl);
    }

    @Before
    public void setUp() {
        // Configure RestAssured to use the random port and context path
        RestAssured.baseURI = "http://localhost";
        RestAssured.port = port;
        RestAssured.basePath = "/api";  // Context path from application.yml
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
        
        // Reset WireMock stubs before each scenario
        aiTextServer.resetAll();
        aiImageServer.resetAll();
        mediaCatalogServer.resetAll();
    }

    @After
    public void tearDown() {
        // Clean up after each scenario
        RestAssured.reset();
    }

    /**
     * Get AI text generation WireMock server for stub configuration.
     */
    public static WireMockServer getAiTextServer() {
        return aiTextServer;
    }

    /**
     * Get AI image generation WireMock server for stub configuration.
     */
    public static WireMockServer getAiImageServer() {
        return aiImageServer;
    }

    /**
     * Get Media Catalog WireMock server for stub configuration.
     */
    public static WireMockServer getMediaCatalogServer() {
        return mediaCatalogServer;
    }

    /**
     * Stop all WireMock servers (called by test framework shutdown hooks).
     */
    public static void stopServers() {
        if (aiTextServer != null && aiTextServer.isRunning()) {
            aiTextServer.stop();
        }

    }
}
