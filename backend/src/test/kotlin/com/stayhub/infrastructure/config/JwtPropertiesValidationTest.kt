package com.stayhub.infrastructure.config

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.boot.autoconfigure.context.PropertyPlaceholderAutoConfiguration
import org.springframework.boot.context.properties.ConfigurationPropertiesBindException
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.test.context.runner.ApplicationContextRunner
import org.springframework.context.annotation.Configuration

/**
 * Verifies that JwtProperties refuses to bind a blank or short secret, so the
 * Spring context fails fast at boot rather than 500-ing on the first /auth
 * request. Symmetric with the validator-side defensiveness already present in
 * JwtAuthFilter.
 */
class JwtPropertiesValidationTest {

    private val runner = ApplicationContextRunner()
        .withConfiguration(
            org.springframework.boot.autoconfigure.AutoConfigurations.of(
                PropertyPlaceholderAutoConfiguration::class.java,
            ),
        )
        .withUserConfiguration(EnableJwtPropertiesConfig::class.java)

    @Configuration
    @EnableConfigurationProperties(JwtProperties::class)
    class EnableJwtPropertiesConfig

    @Test
    fun `context fails when secret is blank`() {
        runner
            .withPropertyValues("stayhub.jwt.secret=")
            .run { context ->
                assertThat(context).hasFailed()
                val rootCause = generateSequence(context.startupFailure) { it.cause }.last()
                assertThat(rootCause.message).contains("secret")
            }
    }

    @Test
    fun `context fails when secret is shorter than 32 characters`() {
        runner
            .withPropertyValues("stayhub.jwt.secret=too-short-secret")
            .run { context ->
                assertThat(context).hasFailed()
                assertThat(context.startupFailure).isInstanceOf(ConfigurationPropertiesBindException::class.java)
                val rootCause = generateSequence(context.startupFailure) { it.cause }.last()
                assertThat(rootCause.message).contains("secret")
            }
    }

    @Test
    fun `context starts and binds properties when secret is valid`() {
        runner
            .withPropertyValues(
                "stayhub.jwt.secret=test-secret-test-secret-test-secret-test-secret-0123456789",
                "stayhub.jwt.issuer=stayhub",
            )
            .run { context ->
                assertThat(context).hasNotFailed()
                val props = context.getBean(JwtProperties::class.java)
                assertThat(props.issuer).isEqualTo("stayhub")
                assertThat(props.secret).hasSizeGreaterThanOrEqualTo(32)
            }
    }
}
