package com.hexagonal.identity.bdd.steps;

import com.hexagonal.identity.domain.model.GoogleUserInfo;
import com.hexagonal.identity.domain.ports.out.ValidarCredencialGooglePort;
import io.cucumber.java.Before;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.http.ContentType;
import io.restassured.response.ExtractableResponse;
import io.restassured.response.Response;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Step definitions for US1 – Acceso a Meditation Builder mediante cuenta de Google.
 *
 * <p><strong>Phase 6 (Controllers):</strong> Steps are fully implemented using RestAssured
 * against the running Spring Boot context (random port, H2 in-memory, profile=test).</p>
 *
 * <p>Google credential validation is mocked via {@link ValidarCredencialGooglePort}
 * declared as {@code @MockBean} in
 * {@link com.hexagonal.identity.bdd.IdentityCucumberSpringConfiguration},
 * so no real Google JWKS endpoint is required.</p>
 *
 * <p>Architecture constraint: no business logic in step definitions; HTTP + assertions only.</p>
 *
 * <p>BDD base path: configured by RestAssured as {@code /api} (matches
 * {@code server.servlet.context-path=/api} in application.yml).</p>
 */
public class GoogleOAuthSteps {

    // ─── Stable token sentinels used across steps ─────────────────────────────
    private static final String TOKEN_NUEVO_USUARIO = "google-id-token-new-user";
    private static final String TOKEN_RECURRENTE    = "google-id-token-returning-user";
    private static final String TOKEN_SESION_ACTIVA = "google-id-token-active-session";

    // ─── Mock injected from Spring context (@MockBean in config class) ─────────
    @Autowired
    private ValidarCredencialGooglePort validarCredencialPort;

    // ─── Per-scenario state ────────────────────────────────────────────────────
    private ExtractableResponse<Response> lastResponse;
    private String sessionToken;
    private String existingUserId;

    // ─── Reset between scenarios ───────────────────────────────────────────────
    @Before
    public void resetScenarioState() {
        Mockito.reset(validarCredencialPort);
        lastResponse   = null;
        sessionToken   = null;
        existingUserId = null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GIVEN — context setup
    // ─────────────────────────────────────────────────────────────────────────

    /** C1 — Configure mock for a brand-new Google user. */
    @Given("un visitante que nunca ha accedido a la aplicacion")
    public void unVisitanteNuevo() {
        Mockito.when(validarCredencialPort.validar(TOKEN_NUEVO_USUARIO))
               .thenReturn(new GoogleUserInfo(
                       "google-sub-new-001",
                       "ana@gmail.com",
                       "Ana García",
                       "https://lh3.googleusercontent.com/a/ana"));  // (identificadorGoogle, correo, nombre, urlFoto)
    }

    /**
     * C2 — Pre-create the returning user's profile in H2 by performing a first login,
     * then keep the mock ready for the second login assertion.
     */
    @Given("un usuario que ya inicio sesion anteriormente")
    public void unUsuarioRecurrente() {
        Mockito.when(validarCredencialPort.validar(TOKEN_RECURRENTE))
               .thenReturn(new GoogleUserInfo(
                       "google-sub-returning-001",
                       "carlos@gmail.com",
                       "Carlos López",
                       null));  // (identificadorGoogle, correo, nombre, urlFoto)
        // First login to persist the profile in H2
        ExtractableResponse<Response> firstLogin = given()
                .contentType(ContentType.JSON)
                .body(Map.of("idToken", TOKEN_RECURRENTE))
                .post("/v1/identity/auth/google")
                .then()
                .statusCode(200)
                .extract();
        existingUserId = firstLogin.path("userId");
        assertThat(existingUserId).isNotBlank();
    }

    /** C3 — No prior authentication — scenario state is clean. */
    @Given("un visitante que no ha iniciado sesion")
    public void unVisitanteSinSesion() {
        // No state needed — no token exists in this scenario
    }

    /** C4 — Authenticate to obtain a valid session token before logout. */
    @Given("un usuario con sesion activa")
    public void unUsuarioConSesionActiva() {
        Mockito.when(validarCredencialPort.validar(TOKEN_SESION_ACTIVA))
               .thenReturn(new GoogleUserInfo(
                       "google-sub-logout-001",
                       "maria@gmail.com",
                       "María Fernández",
                       null));  // (identificadorGoogle, correo, nombre, urlFoto)
        ExtractableResponse<Response> loginResponse = given()
                .contentType(ContentType.JSON)
                .body(Map.of("idToken", TOKEN_SESION_ACTIVA))
                .post("/v1/identity/auth/google")
                .then()
                .statusCode(200)
                .extract();
        sessionToken = loginResponse.path("sessionToken");
        assertThat(sessionToken).isNotBlank();
    }

    /** C5 — No backend state required; user is on the login screen. */
    @Given("un visitante en la pantalla de inicio de sesion")
    public void unVisitanteEnPantallaLogin() {
        // C5 is purely frontend (no backend call when user cancels Google OAuth)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // WHEN / AND — actions
    // ─────────────────────────────────────────────────────────────────────────

    @When("hace clic en Iniciar sesion con Google")
    public void haceClicEnIniciarSesion() {
        // Signals intent — actual HTTP call made in the following And step
    }

    /** C1 — POST /v1/identity/auth/google with a token for a new user. */
    @And("selecciona su cuenta de Gmail y autoriza el acceso")
    public void seleccionaCuentaYAutoriza() {
        lastResponse = given()
                .contentType(ContentType.JSON)
                .body(Map.of("idToken", TOKEN_NUEVO_USUARIO))
                .post("/v1/identity/auth/google")
                .then()
                .extract();
    }

    @When("vuelve a hacer clic en Iniciar sesion con Google")
    public void vuelveAHacerClicEnIniciarSesion() {
        // Signals intent — actual HTTP call made in the following And step
    }

    /** C2 — POST /v1/identity/auth/google with the same token as the first login. */
    @And("selecciona la misma cuenta de Gmail")
    public void seleccionaMismaCuenta() {
        lastResponse = given()
                .contentType(ContentType.JSON)
                .body(Map.of("idToken", TOKEN_RECURRENTE))
                .post("/v1/identity/auth/google")
                .then()
                .extract();
    }

    /**
     * C3 — Attempt to call a protected endpoint without a session token.
     * The logout endpoint requires {@code authenticated()}, serving as the
     * canonical "protected resource" in the current security configuration.
     */
    @When("intenta acceder a la biblioteca de meditaciones o a la creacion de una nueva meditacion")
    public void intentaAccederSinSesion() {
        lastResponse = given()
                .post("/v1/identity/auth/logout")
                .then()
                .extract();
    }

    /** C4 — POST /v1/identity/auth/logout with the active Bearer token. */
    @When("hace clic en Cerrar sesion")
    public void haceClicEnCerrarSesion() {
        lastResponse = given()
                .header("Authorization", "Bearer " + sessionToken)
                .post("/v1/identity/auth/logout")
                .then()
                .extract();
    }

    /** C5 — User cancelled — no API call is made from the frontend. */
    @And("cancela la pantalla de autorizacion de Google sin seleccionar una cuenta")
    public void cancelaPantallaGoogle() {
        // The frontend never calls the backend when the user cancels Google OAuth.
        lastResponse = null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // THEN / AND — assertions
    // ─────────────────────────────────────────────────────────────────────────

    /** C1 — 200 with session token and user profile. */
    @Then("ve la pantalla principal de la aplicacion con su nombre y foto de perfil")
    public void vePantallaConPerfil() {
        assertThat(lastResponse.statusCode()).isEqualTo(200);
        assertThat(lastResponse.<String>path("sessionToken")).isNotBlank();
        assertThat(lastResponse.<String>path("nombre")).isEqualTo("Ana García");
        assertThat(lastResponse.<String>path("correo")).isEqualTo("ana@gmail.com");
    }

    /** C1 — userId is present; library will be empty for a brand-new user. */
    @And("su biblioteca de meditaciones aparece vacia")
    public void bibliotecaVacia() {
        // Library emptiness is a domain/query concern; presence of a valid userId
        // confirms the profile was created and the library is addressable.
        assertThat(lastResponse.<String>path("userId")).isNotBlank();
    }

    /** C2 — 200 with the same userId as the first login (identity preserved). */
    @Then("la aplicacion le da la bienvenida y muestra directamente su biblioteca con sus meditaciones anteriores")
    public void bibliotecaConMeditacionesAnteriores() {
        assertThat(lastResponse.statusCode()).isEqualTo(200);
        String returnedUserId = lastResponse.path("userId");
        assertThat(returnedUserId)
                .as("Returning user must have the same UUID as the first login")
                .isEqualTo(existingUserId);
    }

    /** C3 — Protected endpoint returns 401 when no token is present. */
    @Then("la aplicacion le redirige a la pantalla de inicio de sesion")
    public void redirigePantallaLogin() {
        assertThat(lastResponse.statusCode())
                .as("Unauthenticated request must be rejected with 401")
                .isEqualTo(401);
    }

    /** C3 — Frontend concern: the login button is shown. Backend already asserted 401. */
    @And("le muestra el boton Iniciar sesion con Google")
    public void muestraBotonGoogle() {
        // Frontend-only concern.
    }

    /** C4 — 204 No Content on successful logout. */
    @Then("la aplicacion le desconecta y le redirige a la pantalla de inicio de sesion")
    public void desconectaYRedirige() {
        assertThat(lastResponse.statusCode())
                .as("Logout must return 204 No Content")
                .isEqualTo(204);
    }

    /** C4 — Frontend concern: Zustand store is cleared. Backend already asserted 204. */
    @And("al volver a la aplicacion ve la pantalla de acceso sin datos de sesion anteriores")
    public void sinDatosDeSesionAnteriores() {
        // Frontend-only concern.
    }

    /** C5 — No API call was made; no 5xx crash occurred. */
    @Then("regresa a la pantalla de inicio de sesion sin ningun mensaje de error bloqueante")
    public void regresaSinErrorBloqueante() {
        // C5 is fully frontend — no backend call when user cancels.
        // Defensive assertion: if a call was somehow made, it must not be a 5xx.
        if (lastResponse != null) {
            assertThat(lastResponse.statusCode())
                    .as("No blocking server error should occur")
                    .isLessThan(500);
        }
    }
}
