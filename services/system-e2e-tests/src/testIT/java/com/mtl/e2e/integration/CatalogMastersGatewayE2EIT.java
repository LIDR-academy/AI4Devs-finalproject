package com.mtl.e2e.integration;

import static com.mtl.e2e.support.E2ePagedJsonAssertions.assertNonEmptyMasterPage;

import com.mtl.e2e.support.E2eCollaboratorTokenSupport;
import com.mtl.e2e.support.E2eGatewayHttpClient;
import com.mtl.e2e.support.E2eTokens;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import tools.jackson.databind.JsonNode;

/**
 * Maestros de catálogo vía gateway (especies y provincias, con y sin {@code q} / {@code unaccent}).
 *
 * <p>Estrategia: {@code docs/engineering/testing-java.md} §2.1.1.
 */
@Tag("e2e")
@EnabledIf("com.mtl.e2e.support.E2eTokens#canRunGatewayE2eTests")
class CatalogMastersGatewayE2EIT extends E2eCollaboratorTokenSupport {

  @Test
  void speciesViaGatewayReturnsPagedMasterData() throws Exception {
    assertNonEmptyMasterPage(
        getJson("/api/catalog/species?page=0&size=5"), "species sin filtro");
  }

  @Test
  void speciesViaGatewaySearchWithQueryReturnsAtLeastOneRow() throws Exception {
    assertNonEmptyMasterPage(
        getJson("/api/catalog/species?page=0&size=5&q=cina"), "species con q=cina");
  }

  @Test
  void provincesViaGatewayReturnsPagedMasterData() throws Exception {
    assertNonEmptyMasterPage(
        getJson("/api/catalog/provinces?page=0&size=5"), "provinces sin filtro");
  }

  @Test
  void provincesViaGatewaySearchWithQueryReturnsAtLeastOneRow() throws Exception {
    assertNonEmptyMasterPage(
        getJson("/api/catalog/provinces?page=0&size=5&q=01"), "provinces con q=01");
  }

  private static JsonNode getJson(String pathAndQuery) throws Exception {
    return E2eGatewayHttpClient.getJson(pathAndQuery, E2eTokens.collaboratorToken());
  }
}
