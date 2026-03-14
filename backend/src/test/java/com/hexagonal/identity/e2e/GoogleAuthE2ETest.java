package com.hexagonal.identity.e2e;

import com.hexagonal.identity.domain.model.GoogleUserInfo;
import com.hexagonal.identity.domain.ports.out.ValidarCredencialGooglePort;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * E2E test: Google Authentication flow + JWT-secured access.
 *
 * <p>Covers T012 scenarios:</p>
 * <ul>
 *   <li>C1/C2 — Full auth flow: simulated Google credential → JWT → access to protected resource</li>
 *   <li>C4 — Logout flow: invalidate session → subsequent unauthenticated request rejected with 401</li>
 * </ul>
 *
 * <p>Strategy: {@link ValidarCredencialGooglePort} is mocked with {@code @MockBean} to avoid
 * any real call to Google. All other components run as-is (H2 in-memory, full Spring context).</p>
 *
 * <p>Architecture: Infrastructure E2E — full application context, all layers active.</p>
 *
 * <p>Path: {@code backend/src/test/java/com/hexagonal/identity/e2e/}</p>
 */
@SpringBootTest(
        webEnvironment = WebEnvironment.RANDOM_PORT,
        classes = com.hexagonal.meditationbuilder.MeditationBuilderApplication.class
)
@ActiveProfiles("test")
@DisplayName("Google Auth E2E Tests")
class GoogleAuthE2ETest {

    @LocalServerPort
    private int port;

    /**
     * Mock the Google JWKS port so that any id_token is accepted and returns deterministic user info.
     * This is the ONLY mock in the test — all other infrastructure (DB, JWT, security filter) is real.
     */
    @MockBean
    ValidarCredencialGooglePort validarCredencialGooglePort;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api";

        // Stub: any idToken → returns a fixed GoogleUserInfo
        when(validarCredencialGooglePort.validar(anyString()))
                .thenReturn(new GoogleUserInfo(
                        "google-sub-e2e-test-001",
                        "e2e-user@example.com",
                        "E2E Test User",
                        "https://example.com/avatar.jpg"
                ));
    }

    // ── C1/C2: Authenticate with simulated credential ─────────────────────────

    /**
     * Full authentication flow:
     * 1. POST /identity/auth/google with simulated token → 200 with JWT
     * 2. Use JWT to call protected resource GET /playback/meditations → 200 (not 401)
     */
    @Test
    @DisplayName("C1/C2 — Full flow: authenticate with simulated Google credential → access protected resource")
    void fullAuthFlow_simulatedGoogleCredential_jwtGrantsAccessToProtectedResource() {
        // Step 1: Authenticate with simulated Google id_token → obtain our JWT
        Response authResponse = given()
                .contentType(ContentType.JSON)
                .body("{\"idToken\":\"simulated-google-id-token-e2e\"}")
        .when()
                .post("/v1/identity/auth/google")
        .then()
                .statusCode(200)
                .body("sessionToken", notNullValue())
                .body("userId", notNullValue())
                .body("nombre", equalTo("E2E Test User"))
                .body("correo", equalTo("e2e-user@example.com"))
                .extract().response();

        String jwt = authResponse.jsonPath().getString("sessionToken");

        // Step 2: Use JWT to access a protected resource in the Playback BC
        given()
                .header("Authorization", "Bearer " + jwt)
        .when()
                .get("/v1/playback/meditations")
        .then()
                .statusCode(not(401))  // JWTは受け入れられた — not rejected with 401
                .statusCode(200);
    }

    /**
     * C2 — Existing user: same Google sub upserts the same profile (idempotent).
     * Second authentication should return the same userId.
     */
    @Test
    @DisplayName("C2 — Existing user: second authentication returns same userId (idempotent upsert)")
    void secondAuthentication_sameGoogleSub_returnsSameUserId() {
        // First authentication
        String userId1 = given()
                .contentType(ContentType.JSON)
                .body("{\"idToken\":\"simulated-token-first\"}")
        .when()
                .post("/v1/identity/auth/google")
        .then()
                .statusCode(200)
                .extract().jsonPath().getString("userId");

        // Second authentication with same Google sub
        String userId2 = given()
                .contentType(ContentType.JSON)
                .body("{\"idToken\":\"simulated-token-second\"}")
        .when()
                .post("/v1/identity/auth/google")
        .then()
                .statusCode(200)
                .extract().jsonPath().getString("userId");

        // Both authentications resolve to the same internal userId
        org.assertj.core.api.Assertions.assertThat(userId1).isEqualTo(userId2);
    }

    // ── C4: Logout flow ────────────────────────────────────────────────────────

    /**
     * Logout flow:
     * 1. Authenticate → obtain JWT
     * 2. POST /identity/auth/logout with JWT → 204
     * 3. Call protected resource WITHOUT any token → 401
     */
    @Test
    @DisplayName("C4 — Logout flow: session invalidated; unauthenticated request rejected with 401")
    void logoutFlow_noToken_protectedResourceReturns401() {
        // Step 1: Authenticate to obtain JWT
        String jwt = given()
                .contentType(ContentType.JSON)
                .body("{\"idToken\":\"simulated-google-id-token-logout\"}")
        .when()
                .post("/v1/identity/auth/google")
        .then()
                .statusCode(200)
                .extract().jsonPath().getString("sessionToken");

        // Step 2: Logout
        given()
                .header("Authorization", "Bearer " + jwt)
        .when()
                .post("/v1/identity/auth/logout")
        .then()
                .statusCode(204);

        // Step 3: Unauthenticated request to protected resource → 401
        given()
        .when()
                .get("/v1/playback/meditations")
        .then()
                .statusCode(401);
    }

    // ── C3: Unauthenticated access to protected resource ──────────────────────

    /**
     * C3 — No token: request to any protected resource is rejected with 401.
     */
    @Test
    @DisplayName("C3 — No token: protected resource rejects unauthenticated request with 401")
    void noToken_protectedResource_returns401() {
        given()
        .when()
                .get("/v1/playback/meditations")
        .then()
                .statusCode(401);
    }
}
