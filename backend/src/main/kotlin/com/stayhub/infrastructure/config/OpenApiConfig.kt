package com.stayhub.infrastructure.config

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

/**
 * SpringDoc OpenAPI metadata (issue #84 / T083).
 *
 * The `springdoc-openapi-starter-webflux-ui` dependency auto-generates the
 * OpenAPI document from the controllers and serves it at `/v3/api-docs`, with
 * the Swagger UI at `/swagger-ui.html`. This bean adds the API info and, most
 * importantly, declares a Bearer-JWT security scheme so the Swagger UI
 * "Authorize" button can attach a token to the protected booking endpoints.
 *
 * Controllers are tagged (`@Tag`) into the three contract groups — Search,
 * Properties, Bookings — and `BookingController` carries
 * `@SecurityRequirement(name = "bearerAuth")` so its operations show the lock.
 *
 * The Swagger/api-docs paths are permitted in [SecurityConfig].
 */
@Configuration
class OpenApiConfig {

    @Bean
    fun stayHubOpenAPI(): OpenAPI =
        OpenAPI()
            .info(
                Info()
                    .title("StayHub API")
                    .version("v1")
                    .description(
                        "Guest search & booking API for StayHub. " +
                            "Public endpoints: property search and details. " +
                            "Booking endpoints require a Bearer JWT obtained from " +
                            "/api/v1/auth/login or /api/v1/auth/register — click " +
                            "\"Authorize\" and paste the token to call them.",
                    )
                    .contact(Contact().name("StayHub")),
            )
            .components(
                Components().addSecuritySchemes(
                    SECURITY_SCHEME_NAME,
                    SecurityScheme()
                        .name(SECURITY_SCHEME_NAME)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Paste the JWT only (Swagger adds the \"Bearer \" prefix)."),
                ),
            )

    companion object {
        const val SECURITY_SCHEME_NAME = "bearerAuth"
    }
}
