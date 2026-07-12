package com.stayhub.infrastructure.config

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.core.io.ClassPathResource

/**
 * Asserts the production application.yml declares the dotenv config import.
 *
 * The line `spring.config.import: optional:file:./.env[.properties]` is what
 * makes `backend/.env` load when developers run `./gradlew bootRun` per the
 * documented quickstart. Removing it would silently break local auth flows
 * again — this test is the regression guard.
 */
class ApplicationYmlConfigImportTest {

    @Test
    fun `application yml imports backend dotenv as optional properties file`() {
        val yaml = ClassPathResource("application.yml")
            .inputStream
            .bufferedReader()
            .use { it.readText() }

        assertThat(yaml)
            .`as`("application.yml must declare spring.config.import for backend/.env")
            .contains("optional:file:./.env[.properties]")
    }
}
