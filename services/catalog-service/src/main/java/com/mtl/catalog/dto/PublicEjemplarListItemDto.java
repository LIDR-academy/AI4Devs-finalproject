package com.mtl.catalog.dto;

public record PublicEjemplarListItemDto(
    Long treeId,
    String commonName,
    String scientificName,
    String province,
    String municipality,
    String publicationState,
    String publicMapVisibility) {}
