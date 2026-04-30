package com.mtl.e2e.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

/**
 * Llama al <strong>API Gateway</strong> real y valida el proxy hacia <strong>catalog-service</strong> en
 * {@code GET /api/catalog/species} y {@code GET /api/catalog/provinces}.
 *
 * <p>Requisitos: gateway y catálogo en marcha (p. ej. puertos 8080 / 8081), Keycloak accesible con la
 * misma configuración que {@code dev}, y un <strong>access token</strong> con rol {@code COLABORADOR} o
 * {@code ADMIN} (mismo JWT que aceptan gateway y catálogo).
 *
 * <p>Sin {@code MTL_E2E_ACCESS_TOKEN} la clase queda deshabilitada y {@code mvn verify} no falla.
 *
 * <p>Se asume BD con semillas de maestros (p. ej. Flyway {@code V2__seed_maestros_inicial}): las respuestas deben traer
 * al menos una fila en {@code content} y {@code totalElements} &gt; 0. Peticiones con {@code q} ejercitan la rama SQL con
 * {@code unaccent} (PostgreSQL).
 */
@Tag("e2e")
@EnabledIfEnvironmentVariable(named = "MTL_E2E_ACCESS_TOKEN", matches = ".+")
class CatalogMastersGatewayE2EIT {

  private static final String JSON_CONTENT = "content";
  private static final String JSON_TOTAL_ELEMENTS = "totalElements";
  private static final String JSON_UNPAGED = "unpaged";

  private static final ObjectMapper MAPPER = new ObjectMapper();

  private static HttpClient httpClient;
  private static String gatewayBase;
  private static String accessToken;

  @BeforeAll
  static void init() {
    httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build();
    gatewayBase =
        System.getenv()
            .getOrDefault("MTL_E2E_GATEWAY_BASE_URL", "http://127.0.0.1:8080")
            .replaceAll("/$", "");
    accessToken = System.getenv("MTL_E2E_ACCESS_TOKEN");
    assertThat(accessToken).isNotBlank();
  }

  @Test
  void speciesViaGatewayReturnsPagedMasterData() throws Exception {
    JsonNode body = getJson("/api/catalog/species?page=0&size=5");
    assertThat(body.path(JSON_CONTENT).isArray()).isTrue();
    assertThat(body.path(JSON_TOTAL_ELEMENTS).isNumber()).isTrue();
    assertThat(body.path(JSON_UNPAGED).booleanValue()).isFalse();
    assertNonEmptyMasterPage(body, "species sin filtro");
  }

  @Test
  void speciesViaGatewaySearchWithQueryReturnsAtLeastOneRow() throws Exception {
    // "cina" coincide con semilla (p. ej. Encina / Quercus ilex) y fuerza unaccent(...) en el WHERE
    JsonNode body = getJson("/api/catalog/species?page=0&size=5&q=cina");
    assertThat(body.path(JSON_UNPAGED).booleanValue()).isFalse();
    assertNonEmptyMasterPage(body, "species con q=cina");
  }

  @Test
  void provincesViaGatewayReturnsPagedMasterData() throws Exception {
    JsonNode body = getJson("/api/catalog/provinces?page=0&size=5");
    assertThat(body.path(JSON_CONTENT).isArray()).isTrue();
    assertThat(body.path(JSON_TOTAL_ELEMENTS).isNumber()).isTrue();
    assertThat(body.path(JSON_UNPAGED).booleanValue()).isFalse();
    assertNonEmptyMasterPage(body, "provinces sin filtro");
  }

  @Test
  void provincesViaGatewaySearchWithQueryReturnsAtLeastOneRow() throws Exception {
    // Código "01" en semilla (Álava); búsqueda por código pasa por unaccent en nombre/código
    JsonNode body = getJson("/api/catalog/provinces?page=0&size=5&q=01");
    assertThat(body.path(JSON_UNPAGED).booleanValue()).isFalse();
    assertNonEmptyMasterPage(body, "provinces con q=01");
  }

  private static void assertNonEmptyMasterPage(JsonNode body, String contexto) {
    JsonNode content = body.path(JSON_CONTENT);
    assertThat(content.size())
        .as("%s: content debe tener al menos un elemento (maestros sembrados)", contexto)
        .isPositive();
    assertThat(body.path(JSON_TOTAL_ELEMENTS).asLong())
        .as("%s: totalElements debe reflejar al menos una fila", contexto)
        .isGreaterThan(0);
  }

  private static JsonNode getJson(String pathAndQuery) throws Exception {
    URI uri = URI.create(gatewayBase + pathAndQuery);
    HttpRequest request =
        HttpRequest.newBuilder(uri)
            .timeout(Duration.ofSeconds(30))
            .header("Accept", "application/json")
            .header("Authorization", "Bearer " + accessToken)
            .header("X-Correlation-Id", "e2e-" + UUID.randomUUID())
            .GET()
            .build();
    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    assertThat(response.statusCode())
        .as("respuesta HTTP para %s — cuerpo: %s", uri, response.body())
        .isEqualTo(200);
    assertThat(response.headers().firstValue("Content-Type").orElse(""))
        .containsIgnoringCase("json");
    return MAPPER.readTree(response.body());
  }
}
