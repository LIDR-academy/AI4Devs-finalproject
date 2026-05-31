package com.mtl.e2e.integration.hu001;

import static com.mtl.e2e.integration.hu001.Hu001E2ePaths.FAMILIES_PAGE;
import static com.mtl.e2e.integration.hu001.Hu001E2ePaths.SPECIES_BY_ID_1;

import com.mtl.e2e.support.E2eCollaboratorTokenSupport;
import com.mtl.e2e.support.E2eGatewayHttpClient;
import com.mtl.e2e.support.E2eTokens;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;

/**
 * HU-001 — Escenario 4: COLABORADOR en rutas solo {@code ADMIN} → **403** Problem. {@code species/1} asume
 * semilla Flyway con id {@code 1}.
 */
@Tag("e2e")
@Tag("hu001")
@Tag("hu001-s04")
@EnabledIf("com.mtl.e2e.support.E2eTokens#canRunGatewayE2eTests")
class Hu001Scenario04ForbiddenByRoleGatewayE2EIT extends E2eCollaboratorTokenSupport {

  @Test
  @DisplayName("Escenario 4: COLABORADOR en GET /api/catalog/families → 403 Prohibido")
  void listFamilies_asCollaborator_viaGateway_returns403Problem() throws Exception {
    E2eGatewayHttpClient.getProblem(
        FAMILIES_PAGE, E2eTokens.collaboratorToken(), 403, "Prohibido");
  }

  @Test
  @DisplayName("Escenario 4: COLABORADOR en GET /api/catalog/species/1 → 403 Prohibido")
  void getSpeciesById_asCollaborator_viaGateway_returns403Problem() throws Exception {
    E2eGatewayHttpClient.getProblem(
        SPECIES_BY_ID_1, E2eTokens.collaboratorToken(), 403, "Prohibido");
  }
}
