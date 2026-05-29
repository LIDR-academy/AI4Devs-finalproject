package com.mtl.catalog.dto;

import java.time.OffsetDateTime;

public record CollaboratorEjemplarListItemDto(
    long ejemplarId,
    long speciesId,
    String nombreComun,
    String nombreCientifico,
    String provincia,
    String municipio,
    String publicationState,
    String publicMapVisibility,
    OffsetDateTime createdAt,
    OffsetDateTime modifiedAt,
    Long createdByUserId) {}
