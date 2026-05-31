package com.mtl.e2e.support;

/** Tokens JWT de Keycloak para E2E (variables de entorno o token obtenido en {@code @BeforeAll}). */
public final class E2eTokens {

  private static volatile String runtimeCollaboratorToken;

  private E2eTokens() {}

  /**
   * {@code MTL_E2E_TOKEN_COLABORADOR}, o {@code MTL_E2E_ACCESS_TOKEN}, o token de runtime tras
   * {@link KeycloakE2eAdminSupport}.
   */
  public static String collaboratorToken() {
    String token = System.getenv("MTL_E2E_TOKEN_COLABORADOR");
    if (token != null && !token.isBlank()) {
      return token.trim();
    }
    token = System.getenv("MTL_E2E_ACCESS_TOKEN");
    if (token != null && !token.isBlank()) {
      return token.trim();
    }
    token = runtimeCollaboratorToken;
    return token == null ? "" : token.trim();
  }

  /** Token definido solo por variables de entorno (no incluye el de runtime). */
  public static boolean hasEnvCollaboratorToken() {
    String token = System.getenv("MTL_E2E_TOKEN_COLABORADOR");
    if (token != null && !token.isBlank()) {
      return true;
    }
    token = System.getenv("MTL_E2E_ACCESS_TOKEN");
    return token != null && !token.isBlank();
  }

  /**
   * Si es {@code true}, {@code Hu001Scenario02…} activa {@code directAccessGrants} en {@code mtl-spa},
   * obtiene el token y lo restaura al finalizar la clase.
   */
  public static boolean autoKeycloakTokenRequested() {
    return "true".equalsIgnoreCase(System.getenv("MTL_E2E_AUTO_KEYCLOAK_TOKEN"));
  }

  /** Ejecutar E2E de colaborador: token en env o obtención automática vía Admin API. */
  public static boolean canRunCollaboratorE2eTests() {
    return hasEnvCollaboratorToken() || autoKeycloakTokenRequested();
  }

  /** Criterio único para habilitar cualquier `*GatewayE2EIT` del módulo (maestros o HU-001). */
  public static boolean canRunGatewayE2eTests() {
    return canRunCollaboratorE2eTests();
  }

  /**
   * Escenarios 401/403: mismo criterio que el resto, o {@code MTL_E2E_RUN_SECURITY=true} (stack arriba, sin
   * token en env).
   */
  public static boolean canRunGatewaySecurityE2eTests() {
    return canRunGatewayE2eTests()
        || "true".equalsIgnoreCase(System.getenv("MTL_E2E_RUN_SECURITY"));
  }

  /** Bearer inválido para comprobar rechazo del resource server (escenario 3). */
  public static String invalidBearerToken() {
    return "token-inexistente";
  }

  static void setRuntimeCollaboratorToken(String token) {
    runtimeCollaboratorToken = token;
  }

  static void clearRuntimeCollaboratorToken() {
    runtimeCollaboratorToken = null;
  }
}
