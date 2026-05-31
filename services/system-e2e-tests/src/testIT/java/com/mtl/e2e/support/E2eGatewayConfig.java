package com.mtl.e2e.support;

/** Configuración de entorno para E2E HTTP contra el API Gateway. */
public final class E2eGatewayConfig {

  private E2eGatewayConfig() {}

  public static String baseUri() {
    return System.getenv()
        .getOrDefault("MTL_E2E_GATEWAY_BASE_URL", "http://127.0.0.1:8080")
        .replaceAll("/$", "");
  }
}
