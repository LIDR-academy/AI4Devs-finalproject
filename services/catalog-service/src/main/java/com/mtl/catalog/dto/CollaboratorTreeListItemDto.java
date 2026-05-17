package com.mtl.catalog.dto;

import java.time.Instant;

public record CollaboratorTreeListItemDto(
    long treeId,
    long speciesId,
    String nombreComun,
    String nombreCientifico,
    String provincia,
    String municipio,
    String publicationState,
    String publicMapVisibility,
    Instant createdAt,
    Instant modifiedAt,
    Long createdByUserId) {}
