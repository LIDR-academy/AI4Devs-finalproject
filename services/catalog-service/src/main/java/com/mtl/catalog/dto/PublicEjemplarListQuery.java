package com.mtl.catalog.dto;

/**
 * Parámetros de {@code GET /api/catalog/public/trees} (contrato OpenAPI). Nombres en inglés; el
 * servicio traduce a criterios de persistencia alineados al dominio.
 */
public record PublicEjemplarListQuery(
    String species,
    String province,
    String municipality,
    String publicationState,
    String publicMapVisibility,
    String sort) {}
