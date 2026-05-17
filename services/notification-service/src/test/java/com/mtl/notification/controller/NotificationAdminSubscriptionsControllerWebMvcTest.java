package com.mtl.notification.controller;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mtl.notification.application.SubscriptionAdminService;
import com.mtl.notification.domain.EstadoSuscripcion;
import com.mtl.notification.dto.SubscriptionAdminItemResponse;
import com.mtl.notification.dto.SubscriptionAdminPageResponse;
import com.mtl.notification.web.error.NotificationExceptionHandler;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.oauth2.server.resource.autoconfigure.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
    controllers = NotificationAdminSubscriptionsController.class,
    excludeAutoConfiguration = OAuth2ResourceServerAutoConfiguration.class)
@Import(NotificationExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class NotificationAdminSubscriptionsControllerWebMvcTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private SubscriptionAdminService subscriptionAdminService;

  @Test
  void listSubscriptions_devuelve200YJsonPaginado() throws Exception {
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
        .perform(get("/api/notifications/subscriptions").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].subscriptionId").value(1))
        .andExpect(jsonPath("$.content[0].email").value("user@example.com"))
        .andExpect(jsonPath("$.content[0].estadoSuscripcion").value("ACTIVA"))
        .andExpect(jsonPath("$.unpaged").value(false));
  }

  @Test
  void listSubscriptions_conFiltro_llamaServicio() throws Exception {
    when(subscriptionAdminService.list(anyInt(), anyInt(), eq(EstadoSuscripcion.CANCELADA), isNull()))
        .thenReturn(
            new SubscriptionAdminPageResponse(List.of(), 0, 0, 0, 20, false, true, true));

    mockMvc
        .perform(
            get("/api/notifications/subscriptions")
                .param("estadoSuscripcion", "CANCELADA")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
  }

  @Test
  void listSubscriptions_conFiltroCorreo_llamaServicio() throws Exception {
    when(subscriptionAdminService.list(eq(0), eq(20), isNull(), eq("a@b")))
        .thenReturn(
            new SubscriptionAdminPageResponse(List.of(), 0, 0, 0, 20, false, true, true));

    mockMvc
        .perform(
            get("/api/notifications/subscriptions")
                .param("email", "a@b")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());
  }

  @Test
  void patchSubscriptionEstado_devuelve200() throws Exception {
    when(subscriptionAdminService.updateEstado(eq(5L), eq(EstadoSuscripcion.CANCELADA)))
        .thenReturn(
            new SubscriptionAdminItemResponse(
                5L,
                "x@y.com",
                EstadoSuscripcion.CANCELADA,
                Instant.parse("2024-01-01T00:00:00Z"),
                Instant.parse("2024-01-01T00:00:00Z"),
                Instant.parse("2025-01-01T00:00:00Z")));

    mockMvc
        .perform(
            patch("/api/notifications/subscriptions/5")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"estadoSuscripcion\":\"CANCELADA\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.subscriptionId").value(5))
        .andExpect(jsonPath("$.estadoSuscripcion").value("CANCELADA"));
  }

  @Test
  void patchSubscriptionEstado_cuerpoInvalido_devuelve400() throws Exception {
    mockMvc
        .perform(
            patch("/api/notifications/subscriptions/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
        .andExpect(status().isBadRequest());
  }
}
