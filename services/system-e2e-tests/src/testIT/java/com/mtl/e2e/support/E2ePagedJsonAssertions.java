package com.mtl.e2e.support;

import static org.assertj.core.api.Assertions.assertThat;

import tools.jackson.databind.JsonNode;

/** Aserciones comunes sobre respuestas paginadas de maestros de catálogo. */
public final class E2ePagedJsonAssertions {

  private E2ePagedJsonAssertions() {}

  public static void assertNonEmptyMasterPage(JsonNode body, String contexto) {
    JsonNode content = body.path("content");
    assertThat(content.isArray()).isTrue();
    assertThat(content.size())
        .as("%s: content debe tener al menos un elemento (maestros sembrados)", contexto)
        .isPositive();
    assertThat(body.path("totalElements").asLong())
        .as("%s: totalElements debe reflejar al menos una fila", contexto)
        .isGreaterThan(0);
    assertThat(body.path("unpaged").booleanValue()).isFalse();
  }
}
