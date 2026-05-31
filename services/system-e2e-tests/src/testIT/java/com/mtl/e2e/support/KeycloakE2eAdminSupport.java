package com.mtl.e2e.support;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Objects;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ObjectNode;

/**
 * Admin API de Keycloak (solo entorno local/dev) para activar temporalmente {@code directAccessGrants} en
 * {@code mtl-spa} y obtener un access token de colaborador sin UI.
 */
public final class KeycloakE2eAdminSupport {

  private static final String REALM = "mtl";
  private static final String SPA_CLIENT_ID = "mtl-spa";
  private static final String DEFAULT_COLABORADOR_USER = "colaborador";
  private static final String DEFAULT_COLABORADOR_PASSWORD = "colaborador_dev";

  private static final HttpClient HTTP =
      HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build();

  private KeycloakE2eAdminSupport() {}

  /** Base URL de Keycloak (mismo host que {@code MTL_JWT_ISSUER_URI}, p. ej. {@code http://localhost:8180}). */
  public static String keycloakBaseUrl() {
    String base =
        System.getenv()
            .getOrDefault(
                "MTL_KEYCLOAK_BASE_URL",
                issuerBaseFromJwtUri(
                    System.getenv()
                        .getOrDefault(
                            "MTL_JWT_ISSUER_URI", "http://localhost:8180/realms/mtl")));
    return base.replaceAll("/$", "");
  }

  public static void enableDirectAccessGrants() {
    updateDirectAccessGrants(true);
  }

  public static void disableDirectAccessGrants() {
    updateDirectAccessGrants(false);
  }

  public static String fetchCollaboratorAccessToken() {
    String body =
        formBody(
            "grant_type", "password",
            "client_id", SPA_CLIENT_ID,
            "username", colaboradorUsername(),
            "password", colaboradorPassword(),
            "scope", "openid");
    JsonNode json = postForm(tokenEndpoint(REALM), body);
    String token = json.path("access_token").asString(null);
    if (token == null || token.isBlank()) {
      throw new IllegalStateException("Keycloak no devolvió access_token: " + json);
    }
    return token;
  }

  private static void updateDirectAccessGrants(boolean enabled) {
    String adminToken = fetchAdminAccessToken();
    String clientUuid = findSpaClientId(adminToken);
    ObjectNode representation = fetchClientRepresentation(adminToken, clientUuid);
    representation.put("directAccessGrantsEnabled", enabled);
    putClientRepresentation(adminToken, clientUuid, representation);
  }

  private static String fetchAdminAccessToken() {
    String body =
        formBody(
            "grant_type", "password",
            "client_id", "admin-cli",
            "username", adminUsername(),
            "password", adminPassword());
    JsonNode json = postForm(tokenEndpoint("master"), body);
    String token = json.path("access_token").asString(null);
    if (token == null || token.isBlank()) {
      throw new IllegalStateException("No se pudo obtener token de admin Keycloak: " + json);
    }
    return token;
  }

  private static String findSpaClientId(String adminToken) {
    HttpRequest request =
        HttpRequest.newBuilder(
                URI.create(
                    keycloakBaseUrl()
                        + "/admin/realms/"
                        + REALM
                        + "/clients?clientId="
                        + urlEncode(SPA_CLIENT_ID)))
            .timeout(Duration.ofSeconds(30))
            .header("Authorization", "Bearer " + adminToken)
            .header("Accept", "application/json")
            .GET()
            .build();
    JsonNode clients = sendJson(request);
    if (!clients.isArray() || clients.isEmpty()) {
      throw new IllegalStateException("Cliente " + SPA_CLIENT_ID + " no encontrado en realm " + REALM);
    }
    return clients.get(0).path("id").asString();
  }

  private static ObjectNode fetchClientRepresentation(String adminToken, String clientUuid) {
    HttpRequest request =
        HttpRequest.newBuilder(
                URI.create(
                    keycloakBaseUrl() + "/admin/realms/" + REALM + "/clients/" + clientUuid))
            .timeout(Duration.ofSeconds(30))
            .header("Authorization", "Bearer " + adminToken)
            .header("Accept", "application/json")
            .GET()
            .build();
    JsonNode node = sendJson(request);
    if (!(node instanceof ObjectNode objectNode)) {
      throw new IllegalStateException("Representación de cliente inesperada: " + node);
    }
    return objectNode;
  }

  private static void putClientRepresentation(
      String adminToken, String clientUuid, ObjectNode representation) {
    try {
      byte[] body = E2eTestJson.MAPPER.writeValueAsBytes(representation);
      HttpRequest request =
          HttpRequest.newBuilder(
                  URI.create(
                      keycloakBaseUrl() + "/admin/realms/" + REALM + "/clients/" + clientUuid))
              .timeout(Duration.ofSeconds(30))
              .header("Authorization", "Bearer " + adminToken)
              .header("Content-Type", "application/json")
              .PUT(HttpRequest.BodyPublishers.ofByteArray(body))
              .build();
      HttpResponse<String> response =
          HTTP.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        throw new IllegalStateException(
            "PUT cliente Keycloak falló: HTTP "
                + response.statusCode()
                + " — "
                + response.body());
      }
    } catch (IllegalStateException e) {
      throw e;
    } catch (Exception e) {
      throw new IllegalStateException("Error actualizando cliente Keycloak", e);
    }
  }

  private static JsonNode postForm(String url, String formBody) {
    try {
      HttpRequest request =
          HttpRequest.newBuilder(URI.create(url))
              .timeout(Duration.ofSeconds(30))
              .header("Content-Type", "application/x-www-form-urlencoded")
              .POST(HttpRequest.BodyPublishers.ofString(formBody))
              .build();
      HttpResponse<String> response =
          HTTP.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        throw new IllegalStateException(
            "POST " + url + " falló: HTTP " + response.statusCode() + " — " + response.body());
      }
      return E2eTestJson.MAPPER.readTree(response.body());
    } catch (IllegalStateException e) {
      throw e;
    } catch (Exception e) {
      throw new IllegalStateException("Error HTTP Keycloak: " + url, e);
    }
  }

  private static JsonNode sendJson(HttpRequest request) {
    try {
      HttpResponse<String> response =
          HTTP.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        throw new IllegalStateException(
            "HTTP "
                + response.statusCode()
                + " "
                + request.uri()
                + " — "
                + response.body());
      }
      return E2eTestJson.MAPPER.readTree(response.body());
    } catch (IllegalStateException e) {
      throw e;
    } catch (Exception e) {
      throw new IllegalStateException("Error leyendo JSON de " + request.uri(), e);
    }
  }

  private static String tokenEndpoint(String realm) {
    return keycloakBaseUrl() + "/realms/" + realm + "/protocol/openid-connect/token";
  }

  private static String issuerBaseFromJwtUri(String issuerUri) {
    int idx = issuerUri.indexOf("/realms/");
    if (idx <= 0) {
      return "http://localhost:8180";
    }
    return issuerUri.substring(0, idx);
  }

  private static String adminUsername() {
    return Objects.toString(System.getenv("KEYCLOAK_ADMIN"), "admin");
  }

  private static String adminPassword() {
    return Objects.toString(System.getenv("KEYCLOAK_ADMIN_PASSWORD"), "admin_dev_password");
  }

  private static String colaboradorUsername() {
    return Objects.toString(System.getenv("MTL_E2E_COLABORADOR_USERNAME"), DEFAULT_COLABORADOR_USER);
  }

  private static String colaboradorPassword() {
    return Objects.toString(
        System.getenv("MTL_E2E_COLABORADOR_PASSWORD"), DEFAULT_COLABORADOR_PASSWORD);
  }

  private static String formBody(String... keyValues) {
    if (keyValues.length % 2 != 0) {
      throw new IllegalArgumentException("Pares clave/valor incompletos");
    }
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < keyValues.length; i += 2) {
      if (i > 0) {
        sb.append('&');
      }
      sb.append(urlEncode(keyValues[i])).append('=').append(urlEncode(keyValues[i + 1]));
    }
    return sb.toString();
  }

  private static String urlEncode(String value) {
    return URLEncoder.encode(value, StandardCharsets.UTF_8);
  }
}
