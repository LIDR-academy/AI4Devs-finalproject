package com.mtl.e2e.support;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.http.HttpResponse;
import tools.jackson.databind.JsonNode;

/** Aserciones sobre respuestas RFC 9457 (`application/problem+json`). */
public final class E2eProblemAssertions {

  private E2eProblemAssertions() {}

  public static JsonNode assertProblem(
      HttpResponse<String> response, int expectedStatus, String expectedTitle) throws Exception {
    assertThat(response.statusCode())
        .as("HTTP status — body: %s", response.body())
        .isEqualTo(expectedStatus);
    assertThat(response.headers().firstValue("Content-Type").orElse(""))
        .as("Content-Type")
        .containsIgnoringCase("application/problem+json");
    JsonNode body = E2eTestJson.MAPPER.readTree(response.body());
    assertThat(body.path("status").asInt())
        .as("problem.status")
        .isEqualTo(expectedStatus);
    assertThat(body.path("title").asString())
        .as("problem.title")
        .isEqualTo(expectedTitle);
    return body;
  }
}
