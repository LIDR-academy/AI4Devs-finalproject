package com.mtl.e2e.support;

/**
 * Obtiene un token de colaborador para E2E: respeta variables de entorno o, si
 * {@link E2eTokens#autoKeycloakTokenRequested()}, activa {@code directAccessGrants} en {@code mtl-spa} y lo
 * restaura al liberar.
 *
 * <p>No es thread-safe para ejecución paralela de varias clases; el módulo desactiva paralelismo JUnit
 * ({@code junit-platform.properties}).
 */
public final class E2eCollaboratorTokenLifecycle {

  private static final Object KEYCLOAK_LOCK = new Object();
  private static boolean directAccessGrantsToggledByTest;

  private E2eCollaboratorTokenLifecycle() {}

  public static void acquireIfNeeded() {
    if (E2eTokens.hasEnvCollaboratorToken()) {
      return;
    }
    if (!E2eTokens.autoKeycloakTokenRequested()) {
      return;
    }
    synchronized (KEYCLOAK_LOCK) {
      if (E2eTokens.hasEnvCollaboratorToken()) {
        return;
      }
      KeycloakE2eAdminSupport.enableDirectAccessGrants();
      try {
        String token = KeycloakE2eAdminSupport.fetchCollaboratorAccessToken();
        E2eTokens.setRuntimeCollaboratorToken(token);
        directAccessGrantsToggledByTest = true;
      } catch (RuntimeException e) {
        rollbackDirectAccessGrants();
        throw e;
      } catch (Exception e) {
        rollbackDirectAccessGrants();
        throw new IllegalStateException("No se pudo obtener token de colaborador para E2E", e);
      }
    }
  }

  public static void releaseIfNeeded() {
    synchronized (KEYCLOAK_LOCK) {
      if (!directAccessGrantsToggledByTest) {
        return;
      }
      try {
        KeycloakE2eAdminSupport.disableDirectAccessGrants();
      } finally {
        E2eTokens.clearRuntimeCollaboratorToken();
        directAccessGrantsToggledByTest = false;
      }
    }
  }

  private static void rollbackDirectAccessGrants() {
    try {
      KeycloakE2eAdminSupport.disableDirectAccessGrants();
    } catch (RuntimeException ignored) {
      // Mejor esfuerzo tras fallo al obtener token
    }
  }
}
