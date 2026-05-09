package com.mtl.media.infrastructure.client.catalog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

import java.time.Instant;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

class RestCatalogMediaPermissionClientTest {

  private MockRestServiceServer server;
  private RestCatalogMediaPermissionClient client;

  private static final Jwt JWT =
      Jwt.withTokenValue("test-token")
          .header("alg", "none")
          .issuer("http://localhost:8180/realms/mtl")
          .subject("sub")
          .issuedAt(Instant.now())
          .expiresAt(Instant.now().plusSeconds(3600))
          .build();

  @BeforeEach
  void setUp() {
    RestClient.Builder builder = RestClient.builder();
    server = MockRestServiceServer.bindTo(builder).build();
    RestClient restClient = builder.baseUrl("http://catalog-service").build();
    client = new RestCatalogMediaPermissionClient(restClient);
  }

  @AfterEach
  void tearDown() {
    server.verify();
  }

  @Test
  void resolveActor_forbiddenFromCatalog_mapsTo403() {
    server
        .expect(
            requestTo("http://catalog-service/api/catalog/trees/99/media-submission-permission"))
        .andExpect(header("Authorization", "Bearer test-token"))
        .andRespond(withStatus(HttpStatus.FORBIDDEN).contentType(MediaType.APPLICATION_JSON).body("{}"));

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> client.resolveActorUsuarioAppIdForTree(99L, JWT));

    assertThat(ex.getStatusCode().value()).isEqualTo(403);
    assertThat(ex.getReason()).contains("permiso");
  }

  @Test
  void resolveActor_notFoundFromCatalog_mapsTo404() {
    server
        .expect(
            requestTo("http://catalog-service/api/catalog/trees/1/media-submission-permission"))
        .andExpect(header("Authorization", "Bearer test-token"))
        .andRespond(withStatus(HttpStatus.NOT_FOUND));

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> client.resolveActorUsuarioAppIdForTree(1L, JWT));

    assertThat(ex.getStatusCode().value()).isEqualTo(404);
  }

  @Test
  void resolveActor_ok_returnsActorId() {
    server
        .expect(
            requestTo("http://catalog-service/api/catalog/trees/5/media-submission-permission"))
        .andExpect(header("Authorization", "Bearer test-token"))
        .andRespond(
            withStatus(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"treeId\":5,\"actorUsuarioAppId\":42}"));

    long id = client.resolveActorUsuarioAppIdForTree(5L, JWT);

    assertThat(id).isEqualTo(42L);
  }

  @Test
  void resolveActor_emptyBody_mapsTo502() {
    server
        .expect(
            requestTo("http://catalog-service/api/catalog/trees/3/media-submission-permission"))
        .andRespond(withStatus(HttpStatus.OK).contentType(MediaType.APPLICATION_JSON).body("null"));

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> client.resolveActorUsuarioAppIdForTree(3L, JWT));

    assertThat(ex.getStatusCode().value()).isEqualTo(502);
  }
}
