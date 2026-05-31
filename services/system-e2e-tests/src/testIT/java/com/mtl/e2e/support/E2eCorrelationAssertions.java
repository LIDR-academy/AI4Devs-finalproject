package com.mtl.e2e.support;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.http.HttpResponse;
import tools.jackson.databind.JsonNode;

/** Comprobaciones de {@code X-Correlation-Id} en respuesta y en Problem JSON. */
public final class E2eCorrelationAssertions {

  public static final String HEADER_NAME = "X-Correlation-Id";

  private E2eCorrelationAssertions() {}

  public static void assertResponseHeader(HttpResponse<String> response, String expectedCorrelationId) {
    assertThat(response.headers().firstValue(HEADER_NAME))
        .as("cabecera %s en la respuesta", HEADER_NAME)
        .hasValue(expectedCorrelationId);
  }

  public static void assertProblemField(JsonNode problem, String expectedCorrelationId) {
    assertThat(problem.path("correlationId").asString())
        .as("problem.correlationId")
        .isEqualTo(expectedCorrelationId);
  }
}
