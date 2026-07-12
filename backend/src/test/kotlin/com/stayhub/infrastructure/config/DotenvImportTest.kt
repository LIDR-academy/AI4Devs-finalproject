package com.stayhub.infrastructure.config

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import org.springframework.boot.SpringApplication
import org.springframework.boot.WebApplicationType
import org.springframework.context.annotation.Configuration
import java.nio.file.Path
import kotlin.io.path.writeText

/**
 * Exercises Spring's `spring.config.import=file:<path>[.properties]` mechanism
 * end-to-end: writes a temp .env file, boots a context that imports it, asserts
 * the bound property surfaces in the Environment. This is the runtime
 * counterpart to ApplicationYmlConfigImportTest's static string-scan check.
 *
 * ApplicationContextRunner.withPropertyValues does NOT trigger config-data
 * import processing in Spring Boot 3.x (property resolves to null). A full
 * SpringApplication boot is required to exercise the ConfigDataEnvironmentPostProcessor
 * pipeline that actually loads `spring.config.import` sources.
 */
@Configuration
internal class DotenvImportTestEmptyConfig

class DotenvImportTest {

    @Test
    fun `properties from a dotenv file are bound into the environment`(@TempDir tempDir: Path) {
        val envFile = tempDir.resolve("sample.env")
        envFile.writeText("STAYHUB_DOTENV_TEST=hello-from-dotenv\n")

        val app = SpringApplication(DotenvImportTestEmptyConfig::class.java)
        app.webApplicationType = WebApplicationType.NONE
        app.setDefaultProperties(
            mapOf("spring.config.import" to "optional:file:${envFile.toAbsolutePath()}[.properties]"),
        )
        val context = app.run()
        try {
            assertThat(context.environment.getProperty("STAYHUB_DOTENV_TEST"))
                .isEqualTo("hello-from-dotenv")
        } finally {
            context.close()
        }
    }
}
