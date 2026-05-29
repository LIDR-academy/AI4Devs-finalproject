package com.mtl.catalog.infrastructure.client.media;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

import com.mtl.catalog.exception.CatalogBadGatewayException;
import com.mtl.catalog.exception.CatalogForbiddenException;
import com.mtl.catalog.exception.CatalogNotFoundException;
import java.time.Instant;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class RestMediaEjemplarPhotosClientTest {

  private MockRestServiceServer server;
  private RestMediaEjemplarPhotosClient client;

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
    RestClient restClient = builder.baseUrl("http://media-service").build();
    client = new RestMediaEjemplarPhotosClient(restClient);
  }

  @AfterEach
  void tearDown() {
    server.verify();
  }

  @Test
  void deleteAllPhotosForEjemplar_ok_invocaDeleteConBearer() {
    server
        .expect(requestTo("http://media-service/api/media/ejemplares/5/photos"))
        .andExpect(method(HttpMethod.DELETE))
        .andExpect(header("Authorization", "Bearer test-token"))
        .andRespond(withStatus(HttpStatus.NO_CONTENT));

    client.deleteAllPhotosForEjemplar(5L, JWT);
  }

  @Test
  void deleteAllPhotosForEjemplar_forbidden_mapsTo403() {
    server
        .expect(requestTo("http://media-service/api/media/ejemplares/9/photos"))
        .andRespond(withStatus(HttpStatus.FORBIDDEN));

    assertThatThrownBy(() -> client.deleteAllPhotosForEjemplar(9L, JWT))
        .isInstanceOf(CatalogForbiddenException.class);
  }

  @Test
  void deleteAllPhotosForEjemplar_notFound_mapsTo404() {
    server
        .expect(requestTo("http://media-service/api/media/ejemplares/1/photos"))
        .andRespond(withStatus(HttpStatus.NOT_FOUND));

    assertThatThrownBy(() -> client.deleteAllPhotosForEjemplar(1L, JWT))
        .isInstanceOf(CatalogNotFoundException.class);
  }

  @Test
  void deleteAllPhotosForEjemplar_badGateway_mapsTo502() {
    server
        .expect(requestTo("http://media-service/api/media/ejemplares/3/photos"))
        .andRespond(withStatus(HttpStatus.BAD_GATEWAY));

    CatalogBadGatewayException ex =
        assertThrows(
            CatalogBadGatewayException.class, () -> client.deleteAllPhotosForEjemplar(3L, JWT));

    assertThat(ex.getDetail()).contains("medios");
  }
}
