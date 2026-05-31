package com.mtl.notification.dto;

import com.mtl.notification.domain.EstadoSuscripcion;
import jakarta.validation.constraints.NotNull;

public record UpdateSubscriptionEstadoRequest(@NotNull EstadoSuscripcion estadoSuscripcion) {}
