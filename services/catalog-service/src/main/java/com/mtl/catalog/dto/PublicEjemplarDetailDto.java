package com.mtl.catalog.dto;

import java.math.BigDecimal;

public record PublicEjemplarDetailDto(
    Long treeId,
    String commonName,
    String scientificName,
    String province,
    String municipality,
    String publicationState,
    String publicMapVisibility,
    String description,
    BigDecimal latitude,
    BigDecimal longitude,
    Integer altitude) {}
