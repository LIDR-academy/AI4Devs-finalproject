package com.mtl.catalog.dto;

import java.time.OffsetDateTime;

public record CollaboratorEjemplarListItemDto(
    long treeId,
    long speciesId,
    String commonName,
    String scientificName,
    String province,
    String municipality,
    String publicationState,
    String publicMapVisibility,
    OffsetDateTime createdAt,
    OffsetDateTime modifiedAt,
    Long createdByUserId) {}
