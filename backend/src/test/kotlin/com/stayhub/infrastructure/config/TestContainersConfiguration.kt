package com.stayhub.infrastructure.config

import com.stayhub.domain.property.GeocodeService
import com.stayhub.infrastructure.geocoding.MapboxGeocodeAdapter
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.utility.DockerImageName

@TestConfiguration
class TestContainersConfiguration {
    companion object {
        // Pin the JVM timezone to UTC so that the r2dbc-postgresql driver, which
        // sets the Postgres session `TimeZone` to the JVM default, won't drift
        // out of sync with the LocalDateTime + ZoneOffset.UTC mapping the
        // adapters use for TIMESTAMP (no-zone) columns. Must run before any
        // database connection is opened.
        init {
            System.setProperty("user.timezone", "UTC")
            java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("UTC"))
        }

        private val postgresImage = DockerImageName
            .parse("postgis/postgis:16-3.4")
            .asCompatibleSubstituteFor("postgres")

        private val postgresContainer = PostgreSQLContainer(postgresImage)
            .withDatabaseName("testdb")
            .withUsername("testuser")
            .withPassword("testpass")
            .apply {
                start()
            }

        init {
            // Force the Postgres session timezone to UTC so TIMESTAMP (no-zone)
            // columns round-trip cleanly via LocalDateTime + ZoneOffset.UTC,
            // regardless of the JVM/host's local timezone. Production runs against
            // a UTC-configured cluster; this matches that. The r2dbc-postgresql
            // driver accepts startup parameters as `?options=-c%20key%3Dvalue`
            // syntax, but in this version we use the safer per-connection variant
            // by appending to the URL via `?TimeZone=UTC` is not supported either,
            // so we rely on the JVM's user.timezone instead.
            System.setProperty("user.timezone", "UTC")
            java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("UTC"))
            System.setProperty("spring.r2dbc.url", "r2dbc:postgresql://${postgresContainer.host}:${postgresContainer.firstMappedPort}/testdb")
            System.setProperty("spring.r2dbc.username", "testuser")
            System.setProperty("spring.r2dbc.password", "testpass")
            System.setProperty("spring.flyway.enabled", "true")
            System.setProperty("spring.flyway.url", "jdbc:postgresql://${postgresContainer.host}:${postgresContainer.firstMappedPort}/testdb")
            System.setProperty("spring.flyway.user", "testuser")
            System.setProperty("spring.flyway.password", "testpass")
        }
    }

    @Bean
    fun postgresContainer() = postgresContainer

    @Bean
    fun geocodeService(): GeocodeService = MapboxGeocodeAdapter("test-token")
}
