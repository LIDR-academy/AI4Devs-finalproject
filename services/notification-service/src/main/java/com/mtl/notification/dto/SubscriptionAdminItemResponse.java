package com.mtl.notification.dto;

import com.mtl.notification.domain.EstadoSuscripcion;
import java.time.OffsetDateTime;

/** Ítem de listado o respuesta de actualización administrativa de suscripciones (OpenAPI, HU-012). */
public record SubscriptionAdminItemResponse(
    Long subscriptionId,
    String email,
    EstadoSuscripcion estadoSuscripcion,
    OffsetDateTime altaEn,
    OffsetDateTime confirmadoEn,
    OffsetDateTime bajaEn) {}
