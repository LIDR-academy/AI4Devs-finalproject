package com.mtl.notification.controller;

import com.mtl.notification.application.SubscriptionRegistrationService;
import com.mtl.notification.dto.CreatePublicSubscriptionRequest;
import com.mtl.notification.dto.SubscriptionCreatedResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationSubscriptionsController {

  private final SubscriptionRegistrationService subscriptionRegistrationService;

  public NotificationSubscriptionsController(SubscriptionRegistrationService subscriptionRegistrationService) {
    this.subscriptionRegistrationService = subscriptionRegistrationService;
  }

  @PostMapping("/subscriptions")
  @ResponseStatus(HttpStatus.CREATED)
  public SubscriptionCreatedResponse createPublicSubscription(
      @Valid @RequestBody CreatePublicSubscriptionRequest request) {
    return subscriptionRegistrationService.register(request.email());
  }
}
