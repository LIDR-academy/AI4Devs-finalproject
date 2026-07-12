package com.stayhub.infrastructure.config

import com.fasterxml.jackson.databind.DeserializationFeature
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

/**
 * Jackson hardening for the application-wide `ObjectMapper` (issue #132).
 *
 * This applies the security features via a [Jackson2ObjectMapperBuilderCustomizer]
 * rather than defining a standalone `@Bean ObjectMapper`. The distinction matters:
 * a hand-rolled `ObjectMapper()` bean makes Spring Boot back off its own
 * auto-configuration, producing a mapper with *no* registered modules — which
 * broke `java.time.LocalDate` (and Kotlin) (de)serialization in the WebFlux JSON
 * codecs (e.g. `CreateBookingRequest.check_in`).
 *
 * With a customizer, Boot still builds the mapper through its
 * `Jackson2ObjectMapperBuilder` — registering the Kotlin, JSR-310 (java.time),
 * Jdk8 and parameter-names modules from the classpath — and then applies the
 * hardening below on top.
 */
@Configuration
class JacksonConfig {

    @Bean
    fun securedJacksonCustomizer(): Jackson2ObjectMapperBuilderCustomizer =
        Jackson2ObjectMapperBuilderCustomizer { builder ->
            // Tolerate unknown properties in inbound JSON rather than 400-ing on
            // additive, forward-compatible payloads.
            builder.featuresToDisable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            // Reject trailing tokens after a valid JSON document (smuggling guard).
            builder.featuresToEnable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS)
        }
}
