package com.mtl.media.infrastructure.client.catalog;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

import java.time.Instant;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

class CatalogPublicTreeVisibilityGuardTest {

  private MockRestServiceServer server;
  private CatalogPublicTreeVisibilityGuard guard;

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
    guard = new CatalogPublicTreeVisibilityGuard(restClient);
  }

  @AfterEach
  void tearDown() {
    server.verify();
  }

  @Test
  void assertVisible_anonymous_callsPublicTreeDetail() {
    server
        .expect(requestTo("http://catalog-service/api/catalog/public/trees/42"))
        .andRespond(withStatus(HttpStatus.OK));

    assertDoesNotThrow(() -> guard.assertVisibleInPublicCatalog(42L, null));
  }

  @Test
  void assertVisible_withJwt_forwardsBearer() {
    server
        .expect(requestTo("http://catalog-service/api/catalog/public/trees/5"))
        .andExpect(header("Authorization", "Bearer test-token"))
        .andRespond(withStatus(HttpStatus.OK));

    assertDoesNotThrow(() -> guard.assertVisibleInPublicCatalog(5L, JWT));
  }

  @Test
  void assertVisible_notFoundFromCatalog_mapsTo404() {
    server
        .expect(requestTo("http://catalog-service/api/catalog/public/trees/99"))
        .andRespond(withStatus(HttpStatus.NOT_FOUND));

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> guard.assertVisibleInPublicCatalog(99L, null));
    assert ex.getStatusCode() == HttpStatus.NOT_FOUND;
  }
}
