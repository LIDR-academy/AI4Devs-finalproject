package com.mtl.notification.controller;

import com.mtl.notification.application.SubscriptionAdminService;
import com.mtl.notification.domain.EstadoSuscripcion;
import com.mtl.notification.dto.SubscriptionAdminItemResponse;
import com.mtl.notification.dto.SubscriptionAdminPageResponse;
import com.mtl.notification.dto.UpdateSubscriptionEstadoRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications/subscriptions")
@Validated
public class NotificationAdminSubscriptionsController {

  private final SubscriptionAdminService subscriptionAdminService;

  public NotificationAdminSubscriptionsController(SubscriptionAdminService subscriptionAdminService) {
    this.subscriptionAdminService = subscriptionAdminService;
  }

  @GetMapping
  public SubscriptionAdminPageResponse listSubscriptions(
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
      @RequestParam(required = false) EstadoSuscripcion estadoSuscripcion,
      @RequestParam(required = false) @Size(max = 320) String email) {
    return subscriptionAdminService.list(page, size, estadoSuscripcion, email);
  }

  @PatchMapping("/{subscriptionId}")
  public SubscriptionAdminItemResponse patchSubscriptionEstado(
      @PathVariable long subscriptionId, @Valid @RequestBody UpdateSubscriptionEstadoRequest body) {
    return subscriptionAdminService.updateEstado(subscriptionId, body.estadoSuscripcion());
  }
}
