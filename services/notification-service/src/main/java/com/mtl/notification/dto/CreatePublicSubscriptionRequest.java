package com.mtl.notification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePublicSubscriptionRequest(
    @NotBlank @Email @Size(max = 320) String email) {}
