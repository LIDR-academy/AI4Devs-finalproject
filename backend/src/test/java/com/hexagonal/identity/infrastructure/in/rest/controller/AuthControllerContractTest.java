package com.hexagonal.identity.infrastructure.in.rest.controller;

import com.atlassian.oai.validator.restassured.OpenApiValidationFilter;
import com.hexagonal.identity.domain.exception.CredencialGoogleInvalidaException;
import com.hexagonal.identity.domain.model.PerfilDeUsuario;
import com.hexagonal.identity.domain.model.SesionToken;
import com.hexagonal.identity.domain.ports.in.AutenticarConGoogleUseCase;
import com.hexagonal.identity.domain.ports.in.AutenticarConGoogleUseCase.ResultadoAutenticacion;
import com.hexagonal.identity.domain.ports.in.CerrarSesionUseCase;
import com.hexagonal.identity.infrastructure.in.rest.exception.IdentityExceptionHandler;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

import jakarta.servlet.Filter;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Contract tests for {@link AuthController} against the OpenAPI spec {@code openapi/identity/US1.yaml}.
 *
 * <p>Verifies that the controller honours exactly the contract for:</p>
 * <ul>
 *   <li>C1/C2 — {@code POST /identity/auth/google}: happy path 200, invalid token 401, missing body 400</li>
 *   <li>C4 — {@code POST /identity/auth/logout}: Bearer present 204</li>
 * </ul>
 *
 * <p>Architecture: test-only; in {@code backend/src/test/contracts/} conceptually but placed under
 * the infrastructure package so Spring component-scan picks up the controller under test.</p>
 */
@SpringBootTest(
        webEnvironment = WebEnvironment.RANDOM_PORT,
        classes = AuthControllerContractTest.TestConfig.class
)
@ActiveProfiles("test")
class AuthControllerContractTest {

    private static final String OPENAPI_SPEC = "openapi/identity/US1.yaml";
    private static final UUID FIXED_USER_ID = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");

    // ── Inner test configuration ──────────────────────────────────────────────

    @Configuration
    @EnableAutoConfiguration(exclude = {
            DataSourceAutoConfiguration.class,
            DataSourceTransactionManagerAutoConfiguration.class,
            HibernateJpaAutoConfiguration.class,
            FlywayAutoConfiguration.class,
            SecurityAutoConfiguration.class,
            UserDetailsServiceAutoConfiguration.class,
            org.springframework.boot.actuate.autoconfigure.security.servlet.ManagementWebSecurityAutoConfiguration.class
    })
    @ComponentScan(basePackageClasses = {AuthController.class, IdentityExceptionHandler.class})
    static class TestConfig {

        /**
         * Injects a fixed authenticated principal into the {@link SecurityContextHolder} for every
         * request, so the tested controller can read it when needed (e.g. logout token extraction
         * does not rely on SecurityContextHolder, but keeping consistent with other contract tests).
         */
        @Bean
        FilterRegistrationBean<Filter> testAuthFilter() {
            FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>();
            registration.setFilter((request, response, chain) -> {
                var auth = new UsernamePasswordAuthenticationToken(
                        FIXED_USER_ID.toString(), null, List.of());
                SecurityContextHolder.getContext().setAuthentication(auth);
                chain.doFilter(request, response);
            });
            registration.setOrder(-101);
            registration.addUrlPatterns("/*");
            return registration;
        }
    }

    // ── MockBeans ─────────────────────────────────────────────────────────────

    @MockBean
    AutenticarConGoogleUseCase autenticarUseCase;

    @MockBean
    CerrarSesionUseCase cerrarSesionUseCase;

    // ── Test setup ────────────────────────────────────────────────────────────

    @LocalServerPort
    int port;

    OpenApiValidationFilter validationFilter;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";
        RestAssured.basePath = "/api/v1";
        validationFilter = new OpenApiValidationFilter(OPENAPI_SPEC);
    }

    // ── C1/C2: POST /identity/auth/google ─────────────────────────────────────

    /**
     * C1/C2 — Valid Google id_token: backend returns 200 with full AuthResponse.
     * Validates response shape against OpenAPI {@code AuthResponse} schema.
     */
    @Test
    void googleLogin_validToken_returns200WithAuthResponse() {
        var userId = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        var sesionToken = new SesionToken("test.jwt.token", userId);
        var perfil = new PerfilDeUsuario(
                userId,
                "google-sub-123",
                "user@example.com",
                "John Doe",
                "https://example.com/photo.jpg",
                Instant.now()
        );
        var resultado = new ResultadoAutenticacion(sesionToken, perfil);
        when(autenticarUseCase.autenticar("valid-google-id-token")).thenReturn(resultado);

        given()
                .filter(validationFilter)
                .contentType(ContentType.JSON)
                .body("{\"idToken\":\"valid-google-id-token\"}")
        .when()
                .post("/identity/auth/google")
        .then()
                .statusCode(200)
                .body("sessionToken", equalTo("test.jwt.token"))
                .body("userId", equalTo(userId.toString()))
                .body("nombre", equalTo("John Doe"))
                .body("correo", equalTo("user@example.com"));
    }

    /**
     * C1 error path — Invalid or expired Google id_token: backend returns 401.
     * Validates that {@link CredencialGoogleInvalidaException} is translated to
     * HTTP 401 with {@code ErrorResponse} containing {@code code} and {@code message}.
     */
    @Test
    void googleLogin_invalidGoogleToken_returns401() {
        when(autenticarUseCase.autenticar(anyString()))
                .thenThrow(new CredencialGoogleInvalidaException("Token expired"));

        given()
                .filter(validationFilter)
                .contentType(ContentType.JSON)
                .body("{\"idToken\":\"expired-google-token\"}")
        .when()
                .post("/identity/auth/google")
        .then()
                .statusCode(401)
                .body("code", equalTo("INVALID_GOOGLE_TOKEN"))
                .body("message", notNullValue());
    }

    /**
     * C1 validation — Missing required {@code idToken} field: backend returns 400.
     * The OpenAPI filter is deliberately omitted here: the request is intentionally
     * malformed (missing required field), so we only verify the response shape.
     */
    @Test
    void googleLogin_missingIdToken_returns400() {
        given()
                .contentType(ContentType.JSON)
                .body("{}")
        .when()
                .post("/identity/auth/google")
        .then()
                .statusCode(400)
                .body("code", equalTo("BAD_REQUEST"))
                .body("message", notNullValue());
    }

    // ── C4: POST /identity/auth/logout ────────────────────────────────────────

    /**
     * C4 — Logout with a valid Bearer token: backend returns 204 No Content.
     * Validates that the Authorization header is forwarded to the use case.
     */
    @Test
    void logout_withValidBearer_returns204() {
        doNothing().when(cerrarSesionUseCase).cerrarSesion(anyString());

        given()
                .filter(validationFilter)
                .header("Authorization", "Bearer test.jwt.token")
        .when()
                .post("/identity/auth/logout")
        .then()
                .statusCode(204);

        verify(cerrarSesionUseCase).cerrarSesion("test.jwt.token");
    }
}
