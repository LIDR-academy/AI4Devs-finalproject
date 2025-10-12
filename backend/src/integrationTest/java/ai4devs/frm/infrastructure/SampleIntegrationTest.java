package ai4devs.frm.infrastructure;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Sample integration test to verify the test infrastructure is working.
 */
class SampleIntegrationTest extends BaseIntegrationTest {

    @Test
    void contextLoads() {
        // Verify that the Spring context loads successfully with Testcontainers
        assertTrue(BaseIntegrationTest.postgres.isRunning(), "PostgreSQL container should be running");
    }
}
