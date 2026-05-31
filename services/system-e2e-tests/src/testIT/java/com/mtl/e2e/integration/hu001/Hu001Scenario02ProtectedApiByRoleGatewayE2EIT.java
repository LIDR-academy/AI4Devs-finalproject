package com.mtl.e2e.integration.hu001;

import static com.mtl.e2e.integration.hu001.Hu001E2ePaths.SPECIES_PAGE;
import static com.mtl.e2e.support.E2ePagedJsonAssertions.assertNonEmptyMasterPage;
import static org.assertj.core.api.Assertions.assertThat;

import com.mtl.e2e.support.E2eCollaboratorTokenSupport;
import com.mtl.e2e.support.E2eCorrelationAssertions;
import com.mtl.e2e.support.E2eGatewayHttpClient;
import com.mtl.e2e.support.E2eTokens;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import tools.jackson.databind.JsonNode;

/** HU-001 — Escenario 2: acceso protegido con JWT y rol {@code COLABORADOR} vía gateway. */
@Tag("e2e")
@Tag("hu001")
@Tag("hu001-s02")
@EnabledIf("com.mtl.e2e.support.E2eTokens#canRunGatewayE2eTests")
class Hu001Scenario02ProtectedApiByRoleGatewayE2EIT extends E2eCollaboratorTokenSupport {

  @Test
  @DisplayName("Escenario 2: COLABORADOR con Bearer accede a GET /api/catalog/species vía gateway")
  void listSpecies_withCollaboratorToken_viaGateway_returns200() throws Exception {
    JsonNode body =
        E2eGatewayHttpClient.getJson(SPECIES_PAGE, E2eTokens.collaboratorToken());
    assertNonEmptyMasterPage(body, "species COLABORADOR vía gateway");
  }

  @Test
  @DisplayName("Escenario 2: el gateway devuelve el X-Correlation-Id del cliente en respuesta 200")
  void listSpecies_withClientCorrelationId_echoesHeaderOnSuccess() throws Exception {
    String correlationId = "hu001-s02-corr";
    HttpResponse<String> response =
        E2eGatewayHttpClient.getExpectingStatus(
            SPECIES_PAGE, E2eTokens.collaboratorToken(), correlationId, 200);
    E2eCorrelationAssertions.assertResponseHeader(response, correlationId);
    assertThat(response.body()).isNotBlank();
  }
}
