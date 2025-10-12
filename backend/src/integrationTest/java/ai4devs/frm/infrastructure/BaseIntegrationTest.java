package ai4devs.frm.infrastructure;

import org.junit.jupiter.api.Tag;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

/**
 * Base class for integration tests.
 * Provides a PostgreSQL test container and Spring Boot test context.
 * All integration tests should extend this class.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("integrationtest")
@Tag("integration")
public abstract class BaseIntegrationTest {

    @Container
    @ServiceConnection
    @SuppressWarnings("resource") // Testcontainers manages lifecycle via @Testcontainers annotation
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
            DockerImageName.parse("postgres:16-alpine")
    )
    .withDatabaseName("testdb")
    .withUsername("testuser")
    .withPassword("testpass")
    .withReuse(true);
}
