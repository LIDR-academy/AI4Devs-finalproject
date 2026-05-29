package com.mtl.catalog.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Cuerpo JSON de {@code POST /api/catalog/ejemplares} (contrato OpenAPI). Nombres en inglés; mapeo a
 * columnas SQL en capa de aplicación.
 */
public record CreateEjemplarRequest(
    @NotNull Long speciesId,
    @NotNull Long provinceId,
    @NotNull BigDecimal latitude,
    @NotNull BigDecimal longitude,
    @Size(max = 255) String municipality,
    String description,
    Integer altitude,
    @Size(max = 64) String publicMapVisibility,
    @Size(max = 64) String publicationState) {}
