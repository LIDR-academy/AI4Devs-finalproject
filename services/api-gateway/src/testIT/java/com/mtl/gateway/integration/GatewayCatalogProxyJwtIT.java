package com.mtl.gateway.integration;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.equalTo;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo;
import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import com.mtl.gateway.integration.support.JwtTestTokens;
import com.mtl.gateway.integration.support.LocalRsaReactiveJwtDecoderConfig;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * Integración: JWT validado con clave RSA local + proxy hacia catálogo simulado (WireMock),
 * comprobando token relay hacia el upstream.
 */
@Tag("integration")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(LocalRsaReactiveJwtDecoderConfig.class)
class GatewayCatalogProxyJwtIT {

  private static volatile WireMockServer wireMock;

  @LocalServerPort private int port;

  private WebTestClient webTestClient;

  @DynamicPropertySource
  static void registerUpstreamUris(DynamicPropertyRegistry registry) {
    if (wireMock == null || !wireMock.isRunning()) {
      wireMock = new WireMockServer(WireMockConfiguration.wireMockConfig().dynamicPort());
      wireMock.start();
    }
    String base = "http://127.0.0.1:" + wireMock.port();
    registry.add("mtl.catalog.uri", () -> base);
    registry.add("mtl.media.uri", () -> base);
  }

  @AfterAll
  static void stopWireMock() {
    if (wireMock != null) {
      wireMock.stop();
      wireMock = null;
    }
  }

  @BeforeEach
  void setUp() {
    wireMock.resetAll();
    webTestClient = WebTestClient.bindToServer().baseUrl("http://127.0.0.1:" + port).build();
  }

  @Test
  void protectedCatalogRoute_withoutBearer_returnsUnauthorized() {
    webTestClient.get().uri("/api/catalog/trees").exchange().expectStatus().isEqualTo(UNAUTHORIZED);
  }

  @Test
  void protectedCatalogRoute_species_withBearer_forwardsTokenAndReturnsUpstreamBody() {
    String token = JwtTestTokens.accessTokenWithRealmRoles("it-user", List.of("COLABORADOR"));
    wireMock.stubFor(
        get(urlPathEqualTo("/api/catalog/species"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody("{\"content\":[],\"totalElements\":0,\"unpaged\":false}")));

    webTestClient
        .get()
        .uri("/api/catalog/species?q=cina")
        .headers(h -> h.setBearerAuth(token))
        .exchange()
        .expectStatus()
        .isOk()
        .expectBody(String.class)
        .isEqualTo("{\"content\":[],\"totalElements\":0,\"unpaged\":false}");

    wireMock.verify(
        1,
        getRequestedFor(urlPathEqualTo("/api/catalog/species"))
            .withHeader(AUTHORIZATION, equalTo("Bearer " + token)));
  }

  @Test
  void protectedCatalogRoute_withBearer_forwardsTokenAndReturnsUpstreamBody() {
    String token = JwtTestTokens.accessTokenWithRealmRoles("it-user", List.of("COLABORADOR"));
    wireMock.stubFor(
        get(urlPathEqualTo("/api/catalog/trees"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody("[{\"id\":1}]")));

    webTestClient
        .get()
        .uri("/api/catalog/trees")
        .headers(h -> h.setBearerAuth(token))
        .exchange()
        .expectStatus()
        .isOk()
        .expectBody(String.class)
        .isEqualTo("[{\"id\":1}]");

    wireMock.verify(
        1,
        getRequestedFor(urlPathEqualTo("/api/catalog/trees"))
            .withHeader(AUTHORIZATION, equalTo("Bearer " + token)));
  }

  @Test
  void protectedMediaRoute_withBearer_forwardsTokenAndReturnsUpstreamBody() {
    String token = JwtTestTokens.accessTokenWithRealmRoles("it-user", List.of("COLABORADOR"));
    wireMock.stubFor(
        get(urlPathEqualTo("/api/media/photos/1"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody("{\"photoId\":1,\"treeId\":42}")));

    webTestClient
        .get()
        .uri("/api/media/photos/1")
        .headers(h -> h.setBearerAuth(token))
        .exchange()
        .expectStatus()
        .isOk()
        .expectBody(String.class)
        .isEqualTo("{\"photoId\":1,\"treeId\":42}");

    wireMock.verify(
        1,
        getRequestedFor(urlPathEqualTo("/api/media/photos/1"))
            .withHeader(AUTHORIZATION, equalTo("Bearer " + token)));
  }
}
