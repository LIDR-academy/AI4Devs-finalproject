package com.hexagonal.identity.infrastructure.in.rest.controller;

import com.hexagonal.identity.domain.ports.in.AutenticarConGoogleUseCase;
import com.hexagonal.identity.domain.ports.in.CerrarSesionUseCase;
import com.hexagonal.identity.infrastructure.in.rest.dto.AuthResponse;
import com.hexagonal.identity.infrastructure.in.rest.dto.GoogleAuthRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for Identity BC — Authentication and session management.
 *
 * <p>Implements capabilities C1/C2 (authenticate with Google) and C4 (logout)
 * as defined in {@code openapi/identity/US1.yaml} and BDD {@code US1.feature}.</p>
 *
 * <p>Architecture rules:</p>
 * <ul>
 *   <li>Translates HTTP protocol ↔ use cases only. Zero business logic.</li>
 *   <li>Delegates entirely to {@link AutenticarConGoogleUseCase} and {@link CerrarSesionUseCase}.</li>
 *   <li>Exception mapping is handled by {@link com.hexagonal.identity.infrastructure.in.rest.exception.IdentityExceptionHandler}.</li>
 * </ul>
 *
 * <p>Base path: {@code /v1/identity/auth} (within servlet context-path {@code /api}).<br>
 * Full URLs: {@code POST /api/v1/identity/auth/google} and {@code POST /api/v1/identity/auth/logout}.</p>
 */
@RestController
@RequestMapping("/v1/identity/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AutenticarConGoogleUseCase autenticarUseCase;
    private final CerrarSesionUseCase cerrarSesionUseCase;

    public AuthController(AutenticarConGoogleUseCase autenticarUseCase,
                          CerrarSesionUseCase cerrarSesionUseCase) {
        this.autenticarUseCase = autenticarUseCase;
        this.cerrarSesionUseCase = cerrarSesionUseCase;
    }

    // ─── C1 / C2 — Authenticate with Google ───────────────────────────────────

    /**
     * POST /v1/identity/auth/google
     *
     * <p>Validates the Google {@code id_token} and returns a backend-issued session JWT
     * together with the user's profile. Creates a new profile on first access (C1) or
     * recovers the existing one on subsequent accesses (C2).</p>
     *
     * <p>No authentication required — this IS the login endpoint.</p>
     *
     * @param request body containing the Google {@code id_token}
     * @return 200 with {@link AuthResponse} on success
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> authenticateWithGoogle(
            @Valid @RequestBody GoogleAuthRequest request) {
        log.info("Authentication request received");
        AutenticarConGoogleUseCase.ResultadoAutenticacion result =
                autenticarUseCase.autenticar(request.idToken());
        AuthResponse response = AuthResponse.from(result.sesionToken(), result.perfil());
        log.info("Authentication successful for userId={}", response.userId());
        return ResponseEntity.ok(response);
    }

    // ─── C4 — Logout ──────────────────────────────────────────────────────────

    /**
     * POST /v1/identity/auth/logout
     *
     * <p>Invalidates the current session. Requires a valid Bearer JWT in the Authorization header.</p>
     *
     * <p>MVP implementation: stateless JWT — the token is validated by the security filter before
     * reaching this endpoint; the use case performs a safe no-op invalidation.</p>
     *
     * @param httpRequest used to extract the Bearer token from the Authorization header
     * @return 204 No Content on success
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest) {
        String authHeader = httpRequest.getHeader("Authorization");
        String token = (authHeader != null && authHeader.startsWith("Bearer "))
                ? authHeader.substring(7)
                : "";
        cerrarSesionUseCase.cerrarSesion(token);
        log.info("Logout completed");
        return ResponseEntity.noContent().build();
    }
}
