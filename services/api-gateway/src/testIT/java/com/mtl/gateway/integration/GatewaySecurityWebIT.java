package com.mtl.gateway.integration;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathMatching;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;
import static org.springframework.http.HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS;
import static org.springframework.http.HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS;
import static org.springframework.http.HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import com.mtl.gateway.integration.support.StubReactiveJwtDecoderConfig;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;

@Tag("integration")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(StubReactiveJwtDecoderConfig.class)
class GatewaySecurityWebIT {

  private static final String HEADER_CONTENT_TYPE = "Content-Type";
  private static final String APPLICATION_JSON = "application/json";

  private static volatile WireMockServer upstream;

  @LocalServerPort private int port;

  private WebTestClient webTestClient;

  @DynamicPropertySource
  static void registerUpstreamUris(DynamicPropertyRegistry registry) {
    if (upstream == null || !upstream.isRunning()) {
      upstream = new WireMockServer(WireMockConfiguration.wireMockConfig().dynamicPort());
      upstream.start();
    }
    String base = "http://127.0.0.1:" + upstream.port();
    registry.add("mtl.catalog.uri", () -> base);
    registry.add("mtl.media.uri", () -> base);
    registry.add("mtl.notification.uri", () -> base);
  }

  @AfterAll
  static void stopUpstream() {
    if (upstream != null) {
      upstream.stop();
      upstream = null;
    }
  }

  @BeforeEach
  void setUp() {
    upstream.resetAll();
    upstream.stubFor(
        get(urlPathEqualTo("/api/catalog/public/trees"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader(HEADER_CONTENT_TYPE, APPLICATION_JSON)
                    .withBody("[]")));
    upstream.stubFor(
        get(urlPathEqualTo("/api/catalog/public/trees/42"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader(HEADER_CONTENT_TYPE, APPLICATION_JSON)
                    .withBody("{\"treeId\":42}")));
    upstream.stubFor(
        post(urlPathEqualTo("/api/notifications/subscriptions"))
            .willReturn(
                aResponse()
                    .withStatus(201)
                    .withHeader(HEADER_CONTENT_TYPE, APPLICATION_JSON)
                    .withBody("{}")));
    webTestClient = WebTestClient.bindToServer().baseUrl("http://127.0.0.1:" + port).build();
  }

  @Test
  void actuatorHealthPermitAll() {
    webTestClient.get().uri("/actuator/health").exchange().expectStatus().isOk();
  }

  @Test
  void protectedCatalogRouteWithoutTokenReturnsUnauthorized() {
    webTestClient.get().uri("/api/catalog/trees").exchange().expectStatus().isEqualTo(UNAUTHORIZED);
  }

  @Test
  void publicCatalogRouteWithoutTokenDoesNotReturnUnauthorized() {
    webTestClient
        .get()
        .uri("/api/catalog/public/trees")
        .exchange()
        .expectStatus()
        .value(status -> assertNotEquals(UNAUTHORIZED.value(), status, "ruta pública no debe exigir JWT"));
  }

  @Test
  void publicCatalogDetailRouteWithoutTokenDoesNotReturnUnauthorized() {
    webTestClient
        .get()
        .uri("/api/catalog/public/trees/42")
        .exchange()
        .expectStatus()
        .value(
            status ->
                assertNotEquals(UNAUTHORIZED.value(), status, "detalle público no debe exigir JWT"));
  }

  @Test
  void publicMediaPrimaryPhotoRouteWithoutTokenDoesNotReturnUnauthorized() {
    upstream.stubFor(
        get(urlPathMatching("/api/media/public/trees/[0-9]+/primary-photo"))
            .willReturn(aResponse().withStatus(404)));
    webTestClient
        .get()
        .uri("/api/media/public/trees/1/primary-photo")
        .exchange()
        .expectStatus()
        .value(
            status ->
                assertNotEquals(
                    UNAUTHORIZED.value(),
                    status,
                    "foto principal pública no debe exigir JWT (código aguas arriba puede ser 404)"));
  }

  @Test
  void publicSubscriptionPostWithoutTokenDoesNotReturnUnauthorized() {
    webTestClient
        .method(HttpMethod.POST)
        .uri("/api/notifications/subscriptions")
        .bodyValue("{}")
        .exchange()
        .expectStatus()
        .value(
            status ->
                assertNotEquals(
                    UNAUTHORIZED.value(), status, "alta suscripción pública no debe exigir JWT"));
  }

  @Test
  void nonApiDenied() {
    webTestClient
        .get()
        .uri("/")
        .exchange()
        .expectStatus()
        .value(
            status ->
                assertTrue(
                    status == UNAUTHORIZED.value() || status == FORBIDDEN.value(),
                    "fuera de /api/** debe quedar bloqueado (401 o 403); recibido: " + status));
  }

  @Test
  void mediaPreflightCors_allowsSpaOriginAndHeaders() {
    webTestClient
        .method(HttpMethod.OPTIONS)
        .uri("/api/media/uploads/presign")
        .header("Origin", "http://localhost:5173")
        .header("Access-Control-Request-Method", "POST")
        .header("Access-Control-Request-Headers", "Authorization,Content-Type")
        .exchange()
        .expectStatus()
        .isOk()
        .expectHeader()
        .valueEquals(ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173")
        .expectHeader()
        .valueMatches(ACCESS_CONTROL_ALLOW_METHODS, ".*POST.*")
        .expectHeader()
        .valueMatches(ACCESS_CONTROL_ALLOW_HEADERS, ".*Authorization.*");
  }
}
