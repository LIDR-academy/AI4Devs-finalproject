package com.mtl.notification.controller;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mtl.notification.application.SubscriptionAdminService;
import com.mtl.notification.config.NotificationSecurityConfig;
import com.mtl.notification.domain.EstadoSuscripcion;
import com.mtl.notification.dto.SubscriptionAdminItemResponse;
import com.mtl.notification.dto.SubscriptionAdminPageResponse;
import com.mtl.notification.web.error.NotificationExceptionHandler;
import com.mtl.notification.web.error.ProblemAccessDeniedHandler;
import com.mtl.notification.web.error.ProblemAuthenticationEntryPoint;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

/**
 * Seguridad real (filtros OAuth2 + {@link NotificationSecurityConfig}) para rutas **ADMIN** de
 * suscripciones: **TASK-HU-012-04**.
 */
@WebMvcTest(controllers = NotificationAdminSubscriptionsController.class)
@Import({
  NotificationSecurityConfig.class,
  NotificationExceptionHandler.class,
  ProblemAuthenticationEntryPoint.class,
  ProblemAccessDeniedHandler.class,
  NotificationAdminSubscriptionsSecurityWebMvcTest.JsonMapperWebMvcTestConfigurationTest.class
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NotificationAdminSubscriptionsSecurityWebMvcTest {

  /** Bean {@link JsonMapper} para handlers Problem en este slice WebMvc; clase de soporte de test (sufijo {@code Test}). */
  @TestConfiguration
  static class JsonMapperWebMvcTestConfigurationTest {
    @Bean
    JsonMapper notificationSecurityTestJsonMapper() {
      return JsonMapper.builder().build();
    }
  }

  private static final String ISSUER = "http://localhost:8180/realms/mtl";

  @Autowired private MockMvc mockMvc;

  @MockitoBean private JwtDecoder jwtDecoder;

  @MockitoBean private SubscriptionAdminService subscriptionAdminService;

  private static Jwt jwtWithRealmRoles(String subject, List<String> roles) {
    Instant now = Instant.now();
    return Jwt.withTokenValue("mtl-test-" + subject)
        .header("alg", "none")
        .issuer(ISSUER)
        .issuedAt(now)
        .expiresAt(now.plusSeconds(3600))
        .subject(subject)
        .claim("realm_access", Map.of("roles", roles))
        .build();
  }

  @Test
  void get_listado_sinBearer_devuelve401() throws Exception {
    mockMvc
        .perform(get("/api/notifications/subscriptions").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.title").value("No autenticado"))
        .andExpect(jsonPath("$.status").value(401));
  }

  @Test
  void get_listado_conColaborador_devuelve403() throws Exception {
    when(jwtDecoder.decode(anyString())).thenReturn(jwtWithRealmRoles("colab-sub", List.of("COLABORADOR")));

    mockMvc
        .perform(
            get("/api/notifications/subscriptions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer colab-token")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.title").value("Prohibido"))
        .andExpect(jsonPath("$.status").value(403));
  }

  @Test
  void get_listado_conAdmin_devuelve200() throws Exception {
    when(jwtDecoder.decode(anyString())).thenReturn(jwtWithRealmRoles("admin-sub", List.of("ADMIN")));
    when(subscriptionAdminService.list(eq(0), eq(20), isNull(), isNull()))
        .thenReturn(
            new SubscriptionAdminPageResponse(
                List.of(
                    new SubscriptionAdminItemResponse(
                        1L,
                        "user@example.com",
                        EstadoSuscripcion.ACTIVA,
                        Instant.parse("2024-01-01T00:00:00Z"),
                        Instant.parse("2024-01-01T00:00:00Z"),
                        null)),
                1,
                1,
                0,
                20,
                false,
                true,
                true));

    mockMvc
        .perform(
            get("/api/notifications/subscriptions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer admin-token")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].subscriptionId").value(1));
  }

  @Test
  void patch_estado_conColaborador_devuelve403() throws Exception {
    when(jwtDecoder.decode(anyString())).thenReturn(jwtWithRealmRoles("colab-sub-2", List.of("COLABORADOR")));

    mockMvc
        .perform(
            patch("/api/notifications/subscriptions/5")
                .header(HttpHeaders.AUTHORIZATION, "Bearer colab-token-2")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"estadoSuscripcion\":\"CANCELADA\"}"))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.status").value(403));
  }

  @Test
  void patch_estado_conAdmin_devuelve200() throws Exception {
    when(jwtDecoder.decode(anyString())).thenReturn(jwtWithRealmRoles("admin-sub-2", List.of("ADMIN")));
    when(subscriptionAdminService.updateEstado(7L, EstadoSuscripcion.ACTIVA))
        .thenReturn(
            new SubscriptionAdminItemResponse(
                7L,
                "z@w.com",
                EstadoSuscripcion.ACTIVA,
                Instant.parse("2024-01-01T00:00:00Z"),
                Instant.parse("2024-01-01T00:00:00Z"),
                null));

    mockMvc
        .perform(
            patch("/api/notifications/subscriptions/7")
                .header(HttpHeaders.AUTHORIZATION, "Bearer admin-token-2")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"estadoSuscripcion\":\"ACTIVA\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.subscriptionId").value(7))
        .andExpect(jsonPath("$.estadoSuscripcion").value("ACTIVA"));
  }

  @Test
  void get_listado_conAdminYColaborador_enToken_devuelve200() throws Exception {
    when(jwtDecoder.decode(anyString()))
        .thenReturn(jwtWithRealmRoles("both-sub", List.of("COLABORADOR", "ADMIN")));
    when(subscriptionAdminService.list(anyInt(), anyInt(), isNull(), isNull()))
        .thenReturn(
            new SubscriptionAdminPageResponse(List.of(), 0, 0, 0, 20, false, true, true));

    mockMvc
        .perform(
            get("/api/notifications/subscriptions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer both-roles-token")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
  }
}
