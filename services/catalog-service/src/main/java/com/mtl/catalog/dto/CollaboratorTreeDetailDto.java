package com.mtl.catalog.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record CollaboratorTreeDetailDto(
    long treeId,
    long speciesId,
    long provinceId,
    BigDecimal latitude,
    BigDecimal longitude,
    String municipality,
    String description,
    Integer altitude,
    String publicationState,
    String publicMapVisibility,
    long createdByUserId,
    String speciesLabel,
    String provinceLabel,
    Instant createdAt,
    Instant modifiedAt) {}
