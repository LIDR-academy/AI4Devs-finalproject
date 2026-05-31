package com.mtl.e2e.support;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;

/**
 * Ciclo de token colaborador para clases E2E que lo necesitan. Evita duplicar {@code @BeforeAll} /
 * {@code @AfterAll} en cada IT.
 */
public abstract class E2eCollaboratorTokenSupport {

  @BeforeAll
  static void acquireCollaboratorTokenForE2e() {
    E2eCollaboratorTokenLifecycle.acquireIfNeeded();
    if (E2eTokens.autoKeycloakTokenRequested() && !E2eTokens.hasEnvCollaboratorToken()) {
      assertThat(E2eTokens.collaboratorToken())
          .as("Token colaborador tras Admin API Keycloak (revisar stack e issuer localhost)")
          .isNotBlank();
    }
  }

  @AfterAll
  static void releaseCollaboratorTokenForE2e() {
    E2eCollaboratorTokenLifecycle.releaseIfNeeded();
  }
}
