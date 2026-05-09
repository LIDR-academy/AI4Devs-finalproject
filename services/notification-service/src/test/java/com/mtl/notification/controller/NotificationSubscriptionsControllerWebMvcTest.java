package com.mtl.notification.controller;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mtl.notification.application.SubscriptionRegistrationService;
import com.mtl.notification.dto.SubscriptionCreatedResponse;
import com.mtl.notification.exception.NotificationException;
import com.mtl.notification.web.error.NotificationExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
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
    controllers = NotificationSubscriptionsController.class,
    excludeAutoConfiguration = OAuth2ResourceServerAutoConfiguration.class)
@Import(NotificationExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class NotificationSubscriptionsControllerWebMvcTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private SubscriptionRegistrationService subscriptionRegistrationService;

  @Test
  void createPublicSubscription_correoValido_devuelve201YEmail() throws Exception {
    when(subscriptionRegistrationService.register(anyString()))
        .thenReturn(new SubscriptionCreatedResponse("user@example.com"));

    mockMvc
        .perform(
            post("/api/notifications/subscriptions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"user@example.com\"}"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.email").value("user@example.com"));
  }

  @Test
  void createPublicSubscription_correoInvalido_devuelve400() throws Exception {
    mockMvc
        .perform(
            post("/api/notifications/subscriptions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"no-es-correo\"}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void createPublicSubscription_conflicto_devuelve409() throws Exception {
    when(subscriptionRegistrationService.register(anyString()))
        .thenThrow(
            new NotificationException(
                HttpStatus.CONFLICT,
                "Conflicto",
                "Este correo electrónico ya está suscrito a las notificaciones."));

    mockMvc
        .perform(
            post("/api/notifications/subscriptions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"dup@example.com\"}"))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.title").value("Conflicto"))
        .andExpect(jsonPath("$.status").value(409));
  }
}
