package com.mtl.e2e.integration.hu001;

import static com.mtl.e2e.integration.hu001.Hu001E2ePaths.SPECIES_PAGE;

import com.mtl.e2e.support.E2eGatewayHttpClient;
import com.mtl.e2e.support.E2eTokens;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;

/** HU-001 — Escenario 3: API protegida sin sesión válida → **401** Problem (vía gateway). */
@Tag("e2e")
@Tag("hu001")
@Tag("hu001-s03")
@EnabledIf("com.mtl.e2e.support.E2eTokens#canRunGatewaySecurityE2eTests")
class Hu001Scenario03UnauthorizedGatewayE2EIT {

  @Test
  @DisplayName("Escenario 3: GET species sin Bearer → 401 No autenticado y correlación")
  void listSpecies_withoutBearer_viaGateway_returns401ProblemWithCorrelation() throws Exception {
    E2eGatewayHttpClient.getProblem(
        SPECIES_PAGE, null, "hu001-s03-no-bearer", 401, "No autenticado");
  }

  @Test
  @DisplayName("Escenario 3: GET species con Bearer inválido → 401 Problem y correlación")
  void listSpecies_withInvalidBearer_viaGateway_returns401ProblemWithCorrelation() throws Exception {
    E2eGatewayHttpClient.getProblem(
        SPECIES_PAGE,
        E2eTokens.invalidBearerToken(),
        "hu001-s03-invalid",
        401,
        "No autenticado");
  }
}
