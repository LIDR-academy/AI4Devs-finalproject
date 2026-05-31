package com.mtl.e2e.support;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;
import tools.jackson.databind.JsonNode;

/** Cliente HTTP mínimo para E2E contra el API Gateway (sin REST Assured). */
public final class E2eGatewayHttpClient {

  private static final HttpClient CLIENT =
      HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build();

  private E2eGatewayHttpClient() {}

  public static HttpResponse<String> get(String pathAndQuery, String bearerToken) throws Exception {
    return get(pathAndQuery, bearerToken, null);
  }

  /**
   * @param correlationId si es {@code null} o vacío, se genera {@code e2e-<uuid>}; si no, se envía tal cual
   */
  public static HttpResponse<String> get(
      String pathAndQuery, String bearerToken, String correlationId) throws Exception {
    String corr =
        correlationId == null || correlationId.isBlank()
            ? "e2e-" + UUID.randomUUID()
            : correlationId.trim();
    URI uri = URI.create(E2eGatewayConfig.baseUri() + pathAndQuery);
    HttpRequest.Builder builder =
        HttpRequest.newBuilder(uri)
            .timeout(Duration.ofSeconds(30))
            .header("Accept", "application/json")
            .header(E2eCorrelationAssertions.HEADER_NAME, corr)
            .GET();
    if (bearerToken != null && !bearerToken.isBlank()) {
      builder.header("Authorization", "Bearer " + bearerToken.trim());
    }
    return CLIENT.send(builder.build(), HttpResponse.BodyHandlers.ofString());
  }

  public static HttpResponse<String> getExpectingStatus(
      String pathAndQuery, String bearerToken, int expectedStatus) throws Exception {
    return getExpectingStatus(pathAndQuery, bearerToken, null, expectedStatus);
  }

  public static HttpResponse<String> getExpectingStatus(
      String pathAndQuery, String bearerToken, String correlationId, int expectedStatus)
      throws Exception {
    HttpResponse<String> response = get(pathAndQuery, bearerToken, correlationId);
    if (response.statusCode() != expectedStatus) {
      throw new IllegalStateException(
          "Expected HTTP "
              + expectedStatus
              + " but got "
              + response.statusCode()
              + " for "
              + pathAndQuery
              + " — body: "
              + response.body());
    }
    return response;
  }

  public static JsonNode getJson(String pathAndQuery, String bearerToken) throws Exception {
    HttpResponse<String> response = getExpectingStatus(pathAndQuery, bearerToken, 200);
    return E2eTestJson.MAPPER.readTree(response.body());
  }

  public static JsonNode getProblem(
      String pathAndQuery, String bearerToken, int expectedStatus, String expectedTitle)
      throws Exception {
    return getProblem(pathAndQuery, bearerToken, null, expectedStatus, expectedTitle);
  }

  public static JsonNode getProblem(
      String pathAndQuery,
      String bearerToken,
      String correlationId,
      int expectedStatus,
      String expectedTitle)
      throws Exception {
    HttpResponse<String> response = get(pathAndQuery, bearerToken, correlationId);
    JsonNode problem = E2eProblemAssertions.assertProblem(response, expectedStatus, expectedTitle);
    if (correlationId != null && !correlationId.isBlank()) {
      String corr = correlationId.trim();
      E2eCorrelationAssertions.assertResponseHeader(response, corr);
      E2eCorrelationAssertions.assertProblemField(problem, corr);
    }
    return problem;
  }
}
